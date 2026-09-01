from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import uuid
import random

from app.core.database import get_db
from app.models.models import User, PlayerProfile, PlayerInventory, RiftRunSession
from app.api.v1.player import get_current_user_from_header
from app.schemas.schemas import (
    RiftStartRequest, RiftStartResponse,
    FloorCompleteRequest, FloorCompleteResponse,
    RiftExtractRequest, RiftExtractResponse
)
from app.core.anticheat import AntiCheatVerifier
from app.services.combat_engine import CombatEngine

router = APIRouter(prefix="/rift", tags=["Rift Simulation & Anti-Cheat"])

@router.post("/start", response_model=RiftStartResponse)
async def start_rift_run(
    req: RiftStartRequest,
    user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    seed = random.randint(10000000, 99999999)
    session_id = str(uuid.uuid4())
    
    run_session = RiftRunSession(
        id=session_id,
        user_id=user.id,
        seed=seed,
        hero_id=req.hero_id,
        tier=req.rift_tier,
        status="IN_PROGRESS",
        floors_cleared=0,
        total_damage_dealt=0,
        total_damage_taken=0,
        resonances_triggered=0,
        aether_harvested=0,
        void_fragments_harvested=0,
        run_duration_ms=0,
        final_score=0
    )
    db.add(run_session)
    await db.commit()
    
    layout = CombatEngine.generate_floor_layout(seed, 1)
    
    return RiftStartResponse(
        session_id=session_id,
        seed=seed,
        hero_id=req.hero_id,
        rift_tier=req.rift_tier,
        initial_floor=1,
        biome=layout["biome"],
        starting_health=600,
        floor_hazards=layout["hazards"]
    )

@router.post("/floor/complete", response_model=FloorCompleteResponse)
async def complete_floor(
    req: FloorCompleteRequest,
    user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(RiftRunSession).where(RiftRunSession.id == req.session_id))
    session = res.scalars().first()
    if not session or session.user_id != user.id or session.status != "IN_PROGRESS":
        raise HTTPException(status_code=404, detail="Active rift session not found")

    # Anti-cheat verification
    is_valid, reason, score_delta = AntiCheatVerifier.validate_floor_combat(
        hero_id=session.hero_id,
        weapon_tier=session.tier,
        floor_number=req.floor_number,
        combat_metrics=req.combat_metrics.model_dump()
    )

    if not is_valid:
        session.status = "FLAGGED_SUSPICIOUS"
        session.verification_notes = reason
        await db.commit()
        raise HTTPException(status_code=400, detail=f"Anti-cheat violation: {reason}")

    # Accumulate run metrics
    session.floors_cleared = req.floor_number
    session.total_damage_dealt += req.combat_metrics.damage_dealt
    session.total_damage_taken += req.combat_metrics.damage_taken
    session.resonances_triggered += req.combat_metrics.resonances_triggered
    session.run_duration_ms += req.combat_metrics.clear_time_ms
    session.final_score += score_delta
    
    # Calculate floor yield
    floor_aether = 150 + (req.floor_number * 50) + (req.combat_metrics.resonances_triggered * 25)
    floor_void = 5 if (req.floor_number % 2 == 0) else 0
    session.aether_harvested += floor_aether
    session.void_fragments_harvested += floor_void

    await db.commit()

    # Generate next risk node choices
    risk_options = [
        {"type": "SAFE_HARVEST", "risk_level": "LOW", "description": "Guaranteed stabilization and basic augment", "multiplier": 1.0},
        {"type": "OVERCHARGED_BREACH", "risk_level": "HIGH", "description": "Elite Void Behemoths. +250% Aether and Epic Blueprint", "multiplier": 2.5}
    ]

    return FloorCompleteResponse(
        validated=True,
        status_message="Floor cleared and verified by Citadel telemetry.",
        next_floor=req.floor_number + 1,
        score_delta=score_delta,
        total_score=session.final_score,
        pending_aether=session.aether_harvested,
        pending_void_fragments=session.void_fragments_harvested,
        risk_options=risk_options
    )

@router.post("/extract", response_model=RiftExtractResponse)
async def extract_rift_run(
    req: RiftExtractRequest,
    user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(RiftRunSession).where(RiftRunSession.id == req.session_id))
    session = res.scalars().first()
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="Rift session not found")

    session.status = "EXTRACTED"
    session.ended_at = datetime.utcnow()

    # Credit player profile
    res_prof = await db.execute(select(PlayerProfile).where(PlayerProfile.user_id == user.id))
    profile = res_prof.scalars().first()

    xp_gained = session.final_score // 10
    profile.aether_shards += session.aether_harvested
    profile.void_fragments += session.void_fragments_harvested
    profile.mastery_xp += xp_gained
    profile.total_runs_completed += 1
    profile.current_season_score += session.final_score

    # Check level up
    new_level = 1 + int(profile.mastery_xp // 2500)
    profile.account_level = new_level

    await db.commit()

    return RiftExtractResponse(
        success=True,
        status="EXTRACTED_SUCCESSFULLY",
        final_score=session.final_score,
        floors_cleared=session.floors_cleared,
        aether_awarded=session.aether_harvested,
        void_fragments_awarded=session.void_fragments_harvested,
        mastery_xp_gained=xp_gained,
        new_account_level=profile.account_level
    )
