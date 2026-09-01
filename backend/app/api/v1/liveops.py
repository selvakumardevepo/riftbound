from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.models import WorldEvent
from app.schemas.schemas import WorldEventResponse
from app.services.liveops_engine import LiveOpsEngine

router = APIRouter(prefix="/liveops", tags=["Live-Ops & Planetary Frontier"])

@router.get("/world-state", response_model=WorldEventResponse)
async def get_planetary_world_state(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(WorldEvent).where(WorldEvent.status == "ACTIVE"))
    event = res.scalars().first()
    
    if not event:
        # Fallback default active event
        return WorldEventResponse(
            id="event_shattered_core_s01",
            title="Operation Aegis Crucible: Purge the Obsidian Fracture",
            sector_name="Sector IV - Volcanic Riftlands",
            current_progress=3420500,
            target_progress=10000000,
            completion_percentage=34.2,
            status="ACTIVE",
            active_modifiers=[
                {"id": "mod_pyro_surge", "name": "Pyro Flare Surge", "description": "+20% Fire Damage, +10% Enemy Aggro"},
                {"id": "mod_aether_rich", "name": "Aether Influx", "description": "+25% Extraction Yield"}
            ]
        )
    
    pct = round((event.current_progress / max(event.target_progress, 1)) * 100, 2)
    return WorldEventResponse(
        id=event.id,
        title=event.title,
        sector_name=event.sector_name,
        current_progress=event.current_progress,
        target_progress=event.target_progress,
        completion_percentage=pct,
        status=event.status,
        active_modifiers=event.active_modifiers or []
    )

@router.get("/daily-surge")
async def get_daily_planetary_surge() -> Dict[str, Any]:
    return LiveOpsEngine.get_current_planetary_cycle()
