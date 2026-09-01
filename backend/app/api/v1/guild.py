from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
import uuid

from app.core.database import get_db
from app.models.models import User, PlayerProfile, Guild, GuildMember
from app.api.v1.player import get_current_user_from_header
from app.schemas.schemas import GuildCreateRequest, GuildContributeRequest

router = APIRouter(prefix="/guild", tags=["Guild Citadel"])

@router.get("/my-guild")
async def get_my_guild(user: User = Depends(get_current_user_from_header), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(GuildMember).where(GuildMember.user_id == user.id))
    membership = res.scalars().first()
    if not membership:
        return {"has_guild": False, "guild": None}
    
    res_g = await db.execute(select(Guild).where(Guild.id == membership.guild_id))
    guild = res_g.scalars().first()
    
    return {
        "has_guild": True,
        "guild": {
            "id": guild.id,
            "name": guild.name,
            "tag": guild.tag,
            "description": guild.description,
            "citadel_level": guild.citadel_level,
            "total_beacon_aether": guild.total_beacon_aether,
            "my_role": membership.role,
            "my_weekly_donation": membership.weekly_aether_donated
        }
    }

@router.post("/create")
async def create_guild(
    req: GuildCreateRequest,
    user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    # Check if user already in guild
    res_m = await db.execute(select(GuildMember).where(GuildMember.user_id == user.id))
    if res_m.scalars().first():
        raise HTTPException(status_code=400, detail="You are already a member of a guild")
    
    # Check profile balance (Creating guild costs 500 Aether)
    res_p = await db.execute(select(PlayerProfile).where(PlayerProfile.user_id == user.id))
    profile = res_p.scalars().first()
    if profile.aether_shards < 500:
        raise HTTPException(status_code=400, detail="Guild founding requires 500 Aether Shards")
    
    profile.aether_shards -= 500
    guild_id = str(uuid.uuid4())
    guild = Guild(
        id=guild_id,
        name=req.name,
        tag=req.tag.upper(),
        description=req.description,
        citadel_level=1,
        total_beacon_aether=0,
        leader_id=user.id
    )
    db.add(guild)
    
    member = GuildMember(
        id=str(uuid.uuid4()),
        guild_id=guild_id,
        user_id=user.id,
        role="LEADER",
        weekly_aether_donated=0
    )
    db.add(member)
    await db.commit()
    
    return {"success": True, "guild_id": guild_id, "name": guild.name, "tag": guild.tag}

@router.post("/contribute")
async def contribute_aether(
    req: GuildContributeRequest,
    user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    res_m = await db.execute(select(GuildMember).where(GuildMember.user_id == user.id))
    membership = res_m.scalars().first()
    if not membership:
        raise HTTPException(status_code=404, detail="You are not a member of any guild")
    
    res_p = await db.execute(select(PlayerProfile).where(PlayerProfile.user_id == user.id))
    profile = res_p.scalars().first()
    if profile.aether_shards < req.aether_amount:
        raise HTTPException(status_code=400, detail="Insufficient Aether Shards for contribution")
    
    profile.aether_shards -= req.aether_amount
    profile.world_contribution_points += req.aether_amount
    membership.weekly_aether_donated += req.aether_amount
    
    res_g = await db.execute(select(Guild).where(Guild.id == membership.guild_id))
    guild = res_g.scalars().first()
    guild.total_beacon_aether += req.aether_amount
    
    # Check Citadel level up (every 50,000 Aether)
    guild.citadel_level = 1 + int(guild.total_beacon_aether // 50000)
    
    await db.commit()
    return {
        "success": True,
        "contributed": req.aether_amount,
        "guild_total_beacon_aether": guild.total_beacon_aether,
        "citadel_level": guild.citadel_level
    }
