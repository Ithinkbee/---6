"""User models adapted for the Music domain."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlmodel import JSON, Column, Field, Relationship, SQLModel


# ── SQLModel Tables ──────────────────────────────────────────────────────────

class User(SQLModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    firebase_uid: str = Field(unique=True, index=True)
    email: str
    display_name: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    profile: Optional["UserProfile"] = Relationship(back_populates="user")


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profile"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    favorite_genres: list[str] = Field(default=[], sa_column=Column(JSON))
    favorite_artists: list[str] = Field(default=[], sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="profile")


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class UserRead(BaseModel):
    id: int
    firebase_uid: str
    email: str
    display_name: str | None
    created_at: datetime
    has_profile: bool = False


class UserProfileCreate(BaseModel):
    favorite_genres: list[str] = []
    favorite_artists: list[str] = []


class UserProfileUpdate(BaseModel):
    favorite_genres: list[str] | None = None
    favorite_artists: list[str] | None = None


class UserProfileRead(BaseModel):
    id: int
    user_id: int
    favorite_genres: list[str]
    favorite_artists: list[str]
    updated_at: datetime
