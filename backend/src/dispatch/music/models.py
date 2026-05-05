"""SQLModel tables and Pydantic schemas for the Music domain."""

from datetime import date
from typing import Optional

from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


# ── SQLModel Tables ──────────────────────────────────────────────────────────

class Artist(SQLModel, table=True):
    __tablename__ = "artist"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    genre: str
    country: str
    bio: str | None = None

    albums: list["Album"] = Relationship(back_populates="artist")


class Album(SQLModel, table=True):
    __tablename__ = "album"

    id: int | None = Field(default=None, primary_key=True)
    artist_id: int = Field(foreign_key="artist.id", index=True)
    title: str
    year: int
    genre: str | None = None

    artist: Optional[Artist] = Relationship(back_populates="albums")
    tracks: list["Track"] = Relationship(back_populates="album")


class Track(SQLModel, table=True):
    __tablename__ = "track"

    id: int | None = Field(default=None, primary_key=True)
    album_id: int = Field(foreign_key="album.id", index=True)
    title: str
    duration_seconds: int | None = None
    track_number: int | None = None

    album: Optional[Album] = Relationship(back_populates="tracks")


class MusicEvent(SQLModel, table=True):
    __tablename__ = "music_event"

    id: int | None = Field(default=None, primary_key=True)
    title: str
    city: str
    date: date
    genre: str | None = None
    venue: str | None = None


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class TrackRead(BaseModel):
    id: int
    title: str
    duration_seconds: int | None
    track_number: int | None


class AlbumRead(BaseModel):
    id: int
    title: str
    year: int
    genre: str | None
    tracks: list[TrackRead] = []


class ArtistRead(BaseModel):
    id: int
    name: str
    genre: str
    country: str
    bio: str | None


class ArtistDetailRead(BaseModel):
    id: int
    name: str
    genre: str
    country: str
    bio: str | None
    albums: list[AlbumRead] = []


class MusicEventRead(BaseModel):
    id: int
    title: str
    city: str
    date: date
    genre: str | None
    venue: str | None
