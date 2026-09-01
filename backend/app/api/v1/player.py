from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User, PlayerProfile, PlayerInventory
from app.schemas.schemas import ProfileResponse, InventoryItemResponse

router = APIRouter(prefix="/player", tags=["Player & Inventory"])

async def get_current_user_from_header(authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = authorization.replace("Bearer ", "")
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user_from_header), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PlayerProfile).where(PlayerProfile.user_id == user.id))
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return ProfileResponse(
        user_id=user.id,
        username=user.username,
        account_level=profile.account_level,
        mastery_xp=profile.mastery_xp,
        aether_shards=profile.aether_shards,
        void_fragments=profile.void_fragments,
        astral_cores=profile.astral_cores,
        world_contribution_points=profile.world_contribution_points,
        active_hero_id=profile.active_hero_id,
        current_season_score=profile.current_season_score,
        title=profile.title,
        avatar_frame_id=profile.avatar_frame_id
    )

@router.get("/inventory", response_model=List[InventoryItemResponse])
async def get_inventory(user: User = Depends(get_current_user_from_header), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PlayerInventory).where(PlayerInventory.user_id == user.id))
    items = res.scalars().all()
    return [
        InventoryItemResponse(
            id=item.id,
            item_id=item.item_id,
            item_type=item.item_type,
            tier=item.tier,
            quality=item.quality,
            attributes=item.attributes or {},
            quantity=item.quantity,
            is_equipped=item.is_equipped
        ) for item in items
    ]
