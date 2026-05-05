"""Seed script: populates the music database with sample data.

Run with:  python -m src.dispatch.music.seed
"""

from datetime import date

from sqlmodel import Session, select

from src.dispatch.database import engine
from src.dispatch.music.models import Album, Artist, MusicEvent, Track

ARTISTS: list[dict] = [
    {
        "name": "Кино",
        "genre": "rock",
        "country": "СССР / Россия",
        "bio": "Советская рок-группа, основана Виктором Цоем в 1982 году. Один из ключевых коллективов русского рока.",
        "albums": [
            {
                "title": "45",
                "year": 1982,
                "tracks": ["Я объявляю свой дом", "Бездельник", "Когда-то ты был битником"],
            },
            {
                "title": "Группа крови",
                "year": 1988,
                "tracks": ["Группа крови", "Закрой за мной дверь", "Война"],
            },
            {
                "title": "Звезда по имени Солнце",
                "year": 1989,
                "tracks": ["Звезда по имени Солнце", "Муравейник", "Пачка сигарет"],
            },
        ],
    },
    {
        "name": "Земфира",
        "genre": "rock",
        "country": "Россия",
        "bio": "Российская певица и автор песен, одна из самых известных рок-исполнительниц постсоветского пространства.",
        "albums": [
            {
                "title": "Земфира",
                "year": 1999,
                "tracks": ["Ариведерчи", "Почему", "Хочешь?"],
            },
            {
                "title": "Прости меня моя любовь",
                "year": 2000,
                "tracks": ["Прости меня моя любовь", "Небо Лондона", "Rendez-Vous"],
            },
        ],
    },
    {
        "name": "Ария",
        "genre": "metal",
        "country": "Россия",
        "bio": "Российская рок-группа, основана в 1985 году. Считается «русским Iron Maiden».",
        "albums": [
            {
                "title": "Мегаполис",
                "year": 1987,
                "tracks": ["Воля и разум", "Игра с огнём", "Паранойя"],
            },
            {
                "title": "Герой асфальта",
                "year": 1987,
                "tracks": ["Герой асфальта", "Улица роз", "Бесился"],
            },
        ],
    },
    {
        "name": "Би-2",
        "genre": "indie",
        "country": "Беларусь / Австралия",
        "bio": "Российско-белорусская рок-группа, основана в Минске в 1988 году. Расцвет — конец 1990-х.",
        "albums": [
            {
                "title": "Би-2",
                "year": 1999,
                "tracks": ["Полночь", "Варвара", "Компромисс"],
            },
            {
                "title": "Мяу-мяу",
                "year": 2002,
                "tracks": ["Мяу-мяу", "Серебро", "Лётчик"],
            },
        ],
    },
    {
        "name": "The Beatles",
        "genre": "rock",
        "country": "Великобритания",
        "bio": "Британская рок-группа из Ливерпуля. Самая влиятельная группа в истории популярной музыки.",
        "albums": [
            {
                "title": "Abbey Road",
                "year": 1969,
                "tracks": ["Come Together", "Something", "Here Comes the Sun", "Let It Be"],
            },
            {
                "title": "Sgt. Pepper's Lonely Hearts Club Band",
                "year": 1967,
                "tracks": ["Lucy in the Sky with Diamonds", "With a Little Help from My Friends", "A Day in the Life"],
            },
        ],
    },
    {
        "name": "Led Zeppelin",
        "genre": "rock",
        "country": "Великобритания",
        "bio": "Британская хард-рок группа, один из основоположников тяжёлого рока и хэви-метала.",
        "albums": [
            {
                "title": "Led Zeppelin IV",
                "year": 1971,
                "tracks": ["Stairway to Heaven", "Rock and Roll", "Black Dog", "When the Levee Breaks"],
            },
        ],
    },
    {
        "name": "Miles Davis",
        "genre": "jazz",
        "country": "США",
        "bio": "Американский джазовый трубач. Один из самых влиятельных музыкантов XX века, пионер кул-джаза и джаз-фьюжн.",
        "albums": [
            {
                "title": "Kind of Blue",
                "year": 1959,
                "tracks": ["So What", "Freddie Freeloader", "Blue in Green", "All Blues"],
            },
            {
                "title": "Bitches Brew",
                "year": 1970,
                "tracks": ["Pharaoh's Dance", "Bitches Brew", "Spanish Key"],
            },
        ],
    },
    {
        "name": "Моцарт",
        "genre": "classical",
        "country": "Австрия",
        "bio": "Вольфганг Амадей Моцарт (1756–1791) — австрийский композитор эпохи классицизма. Автор более 600 произведений.",
        "albums": [
            {
                "title": "Симфонии №40 и №41",
                "year": 1788,
                "tracks": ["Симфония №40 соль минор — I. Molto allegro", "Симфония №41 до мажор — IV. Molto allegro"],
            },
            {
                "title": "Реквием ре минор",
                "year": 1791,
                "tracks": ["Introitus", "Kyrie", "Dies irae", "Lacrimosa"],
            },
        ],
    },
    {
        "name": "Чайковский",
        "genre": "classical",
        "country": "Россия",
        "bio": "Пётр Ильич Чайковский (1840–1893) — российский композитор эпохи романтизма. Автор балетов и симфоний.",
        "albums": [
            {
                "title": "Лебединое озеро",
                "year": 1876,
                "tracks": ["Вальс", "Адажио", "Па-де-де"],
            },
            {
                "title": "Симфония №6 «Патетическая»",
                "year": 1893,
                "tracks": ["I. Adagio – Allegro non troppo", "II. Allegro con grazia", "IV. Finale: Adagio lamentoso"],
            },
        ],
    },
    {
        "name": "Eminem",
        "genre": "hip_hop",
        "country": "США",
        "bio": "Американский рэпер, один из самых продаваемых музыкантов в истории. Известен своей скоростью и провокационными текстами.",
        "albums": [
            {
                "title": "The Slim Shady LP",
                "year": 1999,
                "tracks": ["My Name Is", "Role Model", "Guilty Conscience"],
            },
            {
                "title": "The Marshall Mathers LP",
                "year": 2000,
                "tracks": ["Stan", "The Way I Am", "Kim"],
            },
        ],
    },
    {
        "name": "Daft Punk",
        "genre": "electronic",
        "country": "Франция",
        "bio": "Французский электронный дуэт, основан в 1993 году. Один из символов электронной музыки.",
        "albums": [
            {
                "title": "Discovery",
                "year": 2001,
                "tracks": ["One More Time", "Digital Love", "Harder, Better, Faster, Stronger", "Instant Crush"],
            },
            {
                "title": "Random Access Memories",
                "year": 2013,
                "tracks": ["Get Lucky", "Lose Yourself to Dance", "Instant Crush"],
            },
        ],
    },
    {
        "name": "Нора Джонс",
        "genre": "jazz",
        "country": "США",
        "bio": "Американская джазовая певица и пианистка. Обладательница Grammy за альбом «Come Away with Me».",
        "albums": [
            {
                "title": "Come Away with Me",
                "year": 2002,
                "tracks": ["Don't Know Why", "Come Away with Me", "Feelin' the Same Way"],
            },
        ],
    },
    {
        "name": "Radiohead",
        "genre": "indie",
        "country": "Великобритания",
        "bio": "Британская рок-группа, известна экспериментальным подходом к музыке.",
        "albums": [
            {
                "title": "OK Computer",
                "year": 1997,
                "tracks": ["Paranoid Android", "Karma Police", "No Surprises"],
            },
            {
                "title": "Kid A",
                "year": 2000,
                "tracks": ["Everything in Its Right Place", "How to Disappear Completely", "Idioteque"],
            },
        ],
    },
    {
        "name": "Bob Dylan",
        "genre": "folk",
        "country": "США",
        "bio": "Американский певец-автор песен, лауреат Нобелевской премии по литературе 2016 года.",
        "albums": [
            {
                "title": "The Freewheelin' Bob Dylan",
                "year": 1963,
                "tracks": ["Blowin' in the Wind", "Girl from the North Country", "Masters of War"],
            },
        ],
    },
    {
        "name": "Michael Jackson",
        "genre": "pop",
        "country": "США",
        "bio": "«Король поп-музыки». Один из самых продаваемых музыкантов в мире.",
        "albums": [
            {
                "title": "Thriller",
                "year": 1982,
                "tracks": ["Thriller", "Billie Jean", "Beat It", "Wanna Be Startin' Somethin'"],
            },
            {
                "title": "Bad",
                "year": 1987,
                "tracks": ["Bad", "The Way You Make Me Feel", "Man in the Mirror", "Smooth Criminal"],
            },
        ],
    },
]

EVENTS: list[dict] = [
    {"title": "Рок-фестиваль «Живые» 2025", "city": "Минск", "date": date(2025, 7, 12), "genre": "rock", "venue": "Стадион «Динамо»"},
    {"title": "Jazz в Парке", "city": "Минск", "date": date(2025, 8, 3), "genre": "jazz", "venue": "Центральный ботанический сад"},
    {"title": "Фестиваль электронной музыки VOLT", "city": "Москва", "date": date(2025, 6, 21), "genre": "electronic", "venue": "Парк «Горького»"},
    {"title": "Классика под открытым небом", "city": "Санкт-Петербург", "date": date(2025, 7, 18), "genre": "classical", "venue": "Дворцовая площадь"},
    {"title": "Indie Weekend", "city": "Вильнюс", "date": date(2025, 9, 5), "genre": "indie", "venue": "Культурный центр «Лофт»"},
    {"title": "Hip-Hop Nation", "city": "Москва", "date": date(2025, 10, 4), "genre": "hip_hop", "venue": "Олимпийский стадион"},
    {"title": "Metal Battle", "city": "Минск", "date": date(2025, 11, 15), "genre": "metal", "venue": "Клуб «Rockstar»"},
    {"title": "Folk Gathering", "city": "Киев", "date": date(2025, 8, 24), "genre": "folk", "venue": "Площадь Независимости"},
    {"title": "Pop Stars Live", "city": "Москва", "date": date(2025, 12, 20), "genre": "pop", "venue": "Лужники"},
    {"title": "Фестиваль авторской песни", "city": "Санкт-Петербург", "date": date(2025, 9, 13), "genre": "folk", "venue": "Парк «Елагин остров»"},
    {"title": "R&B Night", "city": "Минск", "date": date(2025, 10, 25), "genre": "rnb", "venue": "Клуб «Re:public»"},
    {"title": "Electronic Beats", "city": "Рига", "date": date(2025, 7, 30), "genre": "electronic", "venue": "Arena Riga"},
]


def seed():
    with Session(engine) as db:
        existing = db.exec(select(Artist)).first()
        if existing:
            print("Database already seeded, skipping.")
            return

        print("Seeding music database...")

        for a_data in ARTISTS:
            artist = Artist(
                name=a_data["name"],
                genre=a_data["genre"],
                country=a_data["country"],
                bio=a_data.get("bio"),
            )
            db.add(artist)
            db.flush()

            for alb_data in a_data.get("albums", []):
                album = Album(
                    artist_id=artist.id,
                    title=alb_data["title"],
                    year=alb_data["year"],
                    genre=a_data["genre"],
                )
                db.add(album)
                db.flush()

                for idx, track_title in enumerate(alb_data.get("tracks", []), start=1):
                    track = Track(
                        album_id=album.id,
                        title=track_title,
                        track_number=idx,
                    )
                    db.add(track)

        for ev in EVENTS:
            db.add(MusicEvent(**ev))

        db.commit()
        print(f"Seeded {len(ARTISTS)} artists and {len(EVENTS)} events.")


if __name__ == "__main__":
    seed()
