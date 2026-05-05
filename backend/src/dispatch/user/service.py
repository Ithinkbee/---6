from datetime import datetime

from sqlmodel import Session, select

from src.dispatch.exceptions import NotFoundError
from src.dispatch.user.models import User, UserProfile, UserProfileCreate, UserProfileUpdate


def get(*, db_session: Session, user_id: int) -> User:
    user = db_session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    return user


def get_profile(*, db_session: Session, user_id: int) -> UserProfile | None:
    return db_session.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()


def create_profile(*, db_session: Session, user_id: int, profile_in: UserProfileCreate) -> UserProfile:
    profile = UserProfile(user_id=user_id, **profile_in.model_dump())
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)
    return profile


def update_profile(*, db_session: Session, user_id: int, profile_in: UserProfileUpdate) -> UserProfile:
    profile = get_profile(db_session=db_session, user_id=user_id)
    if not profile:
        raise NotFoundError("Profile not found. Complete onboarding first.")

    for key, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    profile.updated_at = datetime.utcnow()
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)
    return profile
