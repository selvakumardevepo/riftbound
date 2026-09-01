from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any

from app.core.database import get_db
from app.models.models import User, PlayerProfile, PlayerInventory
from app.api.v1.player import get_current_user_from_header
from app.schemas.schemas import ForgeUpgradeRequest

router = APIRouter(prefix="/forge", tags=["Forge & Armory"])

@router.post("/upgrade")
async def upgrade_weapon(
    req: ForgeUpgradeRequest,
    user: User = Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    # Fetch player inventory item
    res = await db.execute(
        select(PlayerInventory).where(
            PlayerInventory.user_id == user.id,
            PlayerInventory.item_id == req.item_id
        )
    )
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in player armory")
    
    # Fetch profile to check currencies
    res_prof = await db.execute(select(PlayerProfile).where(PlayerProfile.user_id == user.id))
    profile = res_prof.scalars().first()
    
    # Tier upgrade cost
    aether_cost = item.tier * 250
    void_cost = item.tier * 10
    
    if profile.aether_shards < aether_cost:
        raise HTTPException(status_code=400, detail=f"Insufficient Aether Shards (Requires {aether_cost})")
    
    # Apply deduction & upgrade
    profile.aether_shards -= aether_cost
    if profile.void_fragments >= void_cost:
        profile.void_fragments -= void_cost
        
    item.tier += 1
    attrs = dict(item.attributes or {})
    attrs["base_damage"] = int(attrs.get("base_damage", 75) * 1.3)
    item.attributes = attrs
    
    await db.commit()
    return {
        "success": True,
        "message": f"Successfully upgraded {item.item_id} to Tier {item.tier}!",
        "new_tier": item.tier,
        "new_attributes": item.attributes,
        "remaining_aether": profile.aether_shards,
        "remaining_void_fragments": profile.void_fragments
    }
