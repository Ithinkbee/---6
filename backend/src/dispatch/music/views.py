"""REST API endpoints for the Music domain."""

from fastapi import APIRouter, Query

from src.dispatch.database import SessionDep
from src.dispatch.music import service as music_service
from src.dispatch.music.models import ArtistDetailRead, ArtistRead, MusicEventRead
from src.dispatch.exceptions import NotFoundError

router = APIRouter(prefix="/music", tags=["music"])


@router.get("/artists", response_model=list[ArtistRead])
def search_artists(
    db_session: SessionDep,
    name: str = Query(default=""),
    genre: str = Query(default=""),
):
    artists = music_service.search_artists(db_session, name=name, genre=genre)
    return [ArtistRead(id=a.id, name=a.name, genre=a.genre, country=a.country, bio=a.bio) for a in artists]


@router.get("/artists/{artist_id}", response_model=ArtistDetailRead)
def get_artist(artist_id: int, db_session: SessionDep):
    from sqlmodel import select
    from src.dispatch.music.models import Artist, Album, Track
    from src.dispatch.music.models import AlbumRead, TrackRead

    artist = db_session.get(Artist, artist_id)
    if not artist:
        raise NotFoundError("Artist not found")

    albums_raw = db_session.exec(
        select(Album).where(Album.artist_id == artist_id).order_by(Album.year)
    ).all()

    albums = []
    for alb in albums_raw:
        tracks_raw = db_session.exec(
            select(Track).where(Track.album_id == alb.id).order_by(Track.track_number)
        ).all()
        albums.append(AlbumRead(
            id=alb.id,
            title=alb.title,
            year=alb.year,
            genre=alb.genre,
            tracks=[TrackRead(id=t.id, title=t.title, duration_seconds=t.duration_seconds, track_number=t.track_number) for t in tracks_raw],
        ))

    return ArtistDetailRead(
        id=artist.id,
        name=artist.name,
        genre=artist.genre,
        country=artist.country,
        bio=artist.bio,
        albums=albums,
    )


@router.get("/events", response_model=list[MusicEventRead])
def get_events(
    db_session: SessionDep,
    city: str = Query(default=""),
    genre: str = Query(default=""),
):
    events = music_service.get_events(db_session, city=city, genre=genre)
    return [
        MusicEventRead(id=e.id, title=e.title, city=e.city, date=e.date, genre=e.genre, venue=e.venue)
        for e in events
    ]


@router.get("/recommend", response_model=list[ArtistRead])
def recommend(
    db_session: SessionDep,
    genre: str = Query(default=""),
    mood: str = Query(default=""),
):
    artists = music_service.recommend_artists(db_session, genre=genre, mood=mood)
    return [ArtistRead(id=a.id, name=a.name, genre=a.genre, country=a.country, bio=a.bio) for a in artists]
