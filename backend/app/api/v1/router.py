from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.player import router as player_router
from app.api.v1.forge import router as forge_router
from app.api.v1.rift import router as rift_router
from app.api.v1.guild import router as guild_router
from app.api.v1.leaderboards import router as leaderboards_router
from app.api.v1.liveops import router as liveops_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(player_router)
api_router.include_router(forge_router)
api_router.include_router(rift_router)
api_router.include_router(guild_router)
api_router.include_router(leaderboards_router)
api_router.include_router(liveops_router)
