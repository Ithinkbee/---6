"""CRUD and query operations for the Music domain."""

from sqlmodel import Session, select

from src.dispatch.music.models import Album, Artist, MusicEvent, Track

# Static genre descriptions (Russian)
GENRE_INFO: dict[str, dict] = {
    "rock": {
        "name": "Рок",
        "description": "Жанр, зародившийся в 1950-х на основе рок-н-ролла. Характерны электрогитары, бас и ударные.",
        "key_artists": ["The Beatles", "Led Zeppelin", "Pink Floyd", "Nirvana"],
    },
    "pop": {
        "name": "Поп",
        "description": "Популярная музыка с акцентом на запоминающихся мелодиях и куплетно-припевной структуре.",
        "key_artists": ["Michael Jackson", "Madonna", "Beyoncé"],
    },
    "jazz": {
        "name": "Джаз",
        "description": "Жанр, возникший в начале XX века в США. Основа — импровизация, синкопированный ритм.",
        "key_artists": ["Miles Davis", "John Coltrane", "Louis Armstrong"],
    },
    "classical": {
        "name": "Классическая музыка",
        "description": "Европейская академическая музыка XVII–XIX веков. Строгие формы: соната, симфония, опера.",
        "key_artists": ["Моцарт", "Бетховен", "Чайковский", "Шопен"],
    },
    "hip_hop": {
        "name": "Хип-хоп",
        "description": "Жанр, возникший в 1970-х в Нью-Йорке. Включает рэп, диджеинг, брейк-данс.",
        "key_artists": ["Eminem", "Jay-Z", "Kendrick Lamar"],
    },
    "electronic": {
        "name": "Электронная музыка",
        "description": "Создаётся с помощью электронных инструментов и синтезаторов. Включает техно, хаус, drum and bass.",
        "key_artists": ["Daft Punk", "Aphex Twin", "Kraftwerk"],
    },
    "folk": {
        "name": "Фолк",
        "description": "Народная музыка, передающая традиции и культуру. Акустические инструменты, песенные истории.",
        "key_artists": ["Bob Dylan", "Joni Mitchell", "Земфира"],
    },
    "metal": {
        "name": "Метал",
        "description": "Тяжёлый жанр с мощными гитарными риффами, быстрым темпом и агрессивным вокалом.",
        "key_artists": ["Ария", "Black Sabbath", "Metallica", "Iron Maiden"],
    },
    "indie": {
        "name": "Инди",
        "description": "Независимая музыка, выпускаемая без поддержки крупных лейблов. Широкий спектр стилей.",
        "key_artists": ["Би-2", "Arctic Monkeys", "Radiohead"],
    },
    "rnb": {
        "name": "R&B",
        "description": "Ритм-энд-блюз — жанр, объединяющий элементы блюза, джаза и соула.",
        "key_artists": ["Marvin Gaye", "Aretha Franklin", "Beyoncé"],
    },
}

# Mood-to-genre mapping for recommendations
MOOD_GENRES: dict[str, list[str]] = {
    "happy":      ["pop", "indie", "folk"],
    "sad":        ["indie", "folk", "classical"],
    "energetic":  ["rock", "metal", "hip_hop", "electronic"],
    "calm":       ["jazz", "classical", "folk"],
    "romantic":   ["pop", "jazz", "classical", "rnb"],
    "aggressive": ["metal", "rock", "hip_hop"],
}


def search_artists(
    db: Session,
    name: str = "",
    genre: str = "",
    limit: int = 10,
) -> list[Artist]:
    stmt = select(Artist)
    if name:
        stmt = stmt.where(Artist.name.ilike(f"%{name}%"))
    if genre:
        stmt = stmt.where(Artist.genre == genre)
    return list(db.exec(stmt.limit(limit)).all())


def get_artist_with_albums(db: Session, artist_name: str) -> dict | None:
    artist = db.exec(
        select(Artist).where(Artist.name.ilike(f"%{artist_name}%"))
    ).first()
    if not artist:
        return None

    albums_raw = db.exec(
        select(Album).where(Album.artist_id == artist.id).order_by(Album.year)
    ).all()

    albums_data = []
    for alb in albums_raw:
        tracks_raw = db.exec(
            select(Track).where(Track.album_id == alb.id).order_by(Track.track_number)
        ).all()
        albums_data.append({
            "title": alb.title,
            "year": alb.year,
            "genre": alb.genre,
            "tracks": [
                {"title": t.title, "duration_seconds": t.duration_seconds, "number": t.track_number}
                for t in tracks_raw
            ],
        })

    return {
        "name": artist.name,
        "genre": artist.genre,
        "country": artist.country,
        "bio": artist.bio,
        "albums": albums_data,
    }


def search_tracks(
    db: Session,
    title: str = "",
    artist_name: str = "",
    limit: int = 10,
) -> list[dict]:
    stmt = select(Track, Album, Artist).join(Album, Track.album_id == Album.id).join(Artist, Album.artist_id == Artist.id)
    if title:
        stmt = stmt.where(Track.title.ilike(f"%{title}%"))
    if artist_name:
        stmt = stmt.where(Artist.name.ilike(f"%{artist_name}%"))
    rows = db.exec(stmt.limit(limit)).all()
    return [
        {
            "track": t.title,
            "album": a.title,
            "year": a.year,
            "artist": ar.name,
            "duration_seconds": t.duration_seconds,
        }
        for t, a, ar in rows
    ]


def get_events(
    db: Session,
    city: str = "",
    genre: str = "",
    limit: int = 20,
) -> list[MusicEvent]:
    stmt = select(MusicEvent).order_by(MusicEvent.date)
    if city:
        stmt = stmt.where(MusicEvent.city.ilike(f"%{city}%"))
    if genre:
        stmt = stmt.where(MusicEvent.genre == genre)
    return list(db.exec(stmt.limit(limit)).all())


def get_genre_info(genre: str) -> dict:
    key = genre.lower().replace(" ", "_").replace("-", "_")
    return GENRE_INFO.get(key, {
        "name": genre,
        "description": "Информация о данном жанре не найдена.",
        "key_artists": [],
    })


def recommend_artists(
    db: Session,
    genre: str = "",
    mood: str = "",
    limit: int = 5,
) -> list[Artist]:
    genres_to_search: list[str] = []

    if genre:
        genres_to_search.append(genre.lower())
    if mood:
        genres_to_search.extend(MOOD_GENRES.get(mood.lower(), []))

    stmt = select(Artist)
    if genres_to_search:
        from sqlmodel import or_
        stmt = stmt.where(or_(*[Artist.genre == g for g in genres_to_search]))

    return list(db.exec(stmt.limit(limit)).all())
