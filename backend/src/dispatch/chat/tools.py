"""LangGraph agent tools for the Music AI assistant."""

import json

from langchain_core.tools import tool
from sqlmodel import Session

from src.dispatch.music import service as music_service


def create_assistant_tools(db_session: Session, user_id: int):
    """Create tool implementations with injected db_session for the music assistant."""

    @tool
    def search_artists(name: str = "", genre: str = "") -> str:
        """Search music artists by name or genre.

        Args:
            name: Partial or full artist/band name to search for
            genre: Genre filter (rock, pop, jazz, classical, hip_hop, electronic, folk, rnb, metal, indie)
        """
        artists = music_service.search_artists(db_session, name=name, genre=genre)
        if not artists:
            return json.dumps({"result": "Исполнители не найдены. Попробуйте другой запрос."})
        return json.dumps([
            {"id": a.id, "name": a.name, "genre": a.genre, "country": a.country, "bio": a.bio}
            for a in artists
        ], ensure_ascii=False)

    @tool
    def get_artist_info(artist_name: str) -> str:
        """Get detailed information about an artist including their albums and tracks.

        Args:
            artist_name: Name of the artist or band
        """
        data = music_service.get_artist_with_albums(db_session, artist_name)
        if not data:
            return json.dumps({"result": f"Исполнитель '{artist_name}' не найден в базе данных."}, ensure_ascii=False)
        return json.dumps(data, ensure_ascii=False)

    @tool
    def search_tracks(title: str = "", artist: str = "") -> str:
        """Search tracks by title or artist name.

        Args:
            title: Partial or full track title
            artist: Partial or full artist name
        """
        tracks = music_service.search_tracks(db_session, title=title, artist_name=artist)
        if not tracks:
            return json.dumps({"result": "Треки не найдены. Попробуйте другой запрос."}, ensure_ascii=False)
        return json.dumps(tracks, ensure_ascii=False)

    @tool
    def recommend_music(genre: str = "", mood: str = "") -> str:
        """Recommend artists based on genre and/or mood.

        Args:
            genre: Music genre (rock, pop, jazz, classical, hip_hop, electronic, folk, rnb, metal, indie)
            mood: User's mood or desired atmosphere (happy, sad, energetic, calm, romantic, aggressive)
        """
        artists = music_service.recommend_artists(db_session, genre=genre, mood=mood)
        if not artists:
            return json.dumps({"result": "Не удалось подобрать рекомендации. Попробуйте указать другой жанр или настроение."}, ensure_ascii=False)
        return json.dumps([
            {"name": a.name, "genre": a.genre, "country": a.country, "bio": a.bio}
            for a in artists
        ], ensure_ascii=False)

    @tool
    def get_events(city: str = "", genre: str = "") -> str:
        """Get upcoming music events, optionally filtered by city or genre.

        Args:
            city: City name to filter events
            genre: Genre filter for events
        """
        events = music_service.get_events(db_session, city=city, genre=genre)
        if not events:
            return json.dumps({"result": "Мероприятия не найдены по указанным параметрам."}, ensure_ascii=False)
        return json.dumps([
            {
                "title": e.title,
                "city": e.city,
                "date": e.date.isoformat(),
                "genre": e.genre,
                "venue": e.venue,
            }
            for e in events
        ], ensure_ascii=False)

    @tool
    def get_genre_info(genre_name: str) -> str:
        """Get information about a music genre: description, history, key artists.

        Args:
            genre_name: Name of the genre (e.g. jazz, rock, classical, hip_hop)
        """
        info = music_service.get_genre_info(genre_name)
        return json.dumps(info, ensure_ascii=False)

    return [search_artists, get_artist_info, search_tracks, recommend_music, get_events, get_genre_info]
