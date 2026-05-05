from fastapi import APIRouter

from src.dispatch.auth.views import router as auth_router
from src.dispatch.chat.views import router as chat_router
from src.dispatch.music.views import router as music_router
from src.dispatch.user.views import router as user_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(music_router)
api_router.include_router(chat_router)
