from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.models import PlayerProfile, User
from app.schemas.schemas import LeaderboardEntryResponse

router = APIRouter(prefix="/leaderboards", tags=["Competitive Leaderboards"])

@router.get("/chrono-trials", response_model=List[LeaderboardEntryResponse])
async def get_chrono_trials_leaderboard(db: AsyncSession = Depends(get_db)):
    """Fetch Top 50 global competitive scores."""
    stmt = (
        select(PlayerProfile, User.username)
        .join(User, PlayerProfile.user_id == User.id)
        .where(User.is_banned == False)
        .order_by(PlayerProfile.current_season_score.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    entries = []
    for rank, (profile, username) in enumerate(rows, start=1):
        entries.append(
            LeaderboardEntryResponse(
                rank=rank,
                user_id=profile.user_id,
                username=username,
                score=profile.current_season_score,
                hero_id=profile.active_hero_id,
                title=profile.title
            )
        )
    return entries
