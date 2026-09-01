from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    email: Optional[str] = None
    password: str = Field(..., min_length=6)

class UserLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str

# --- Profile & Inventory Schemas ---
class ProfileResponse(BaseModel):
    user_id: str
    username: str
    account_level: int
    mastery_xp: int
    aether_shards: int
    void_fragments: int
    astral_cores: int
    world_contribution_points: int
    active_hero_id: str
    current_season_score: int
    title: str
    avatar_frame_id: str

class InventoryItemResponse(BaseModel):
    id: str
    item_id: str
    item_type: str
    tier: int
    quality: str
    attributes: Dict[str, Any]
    quantity: int
    is_equipped: bool

class ForgeUpgradeRequest(BaseModel):
    item_id: str
    upgrade_type: str = "ENHANCE_TIER" # ENHANCE_TIER, SOCKET_CORE, MERGE_CORES

# --- Rift Run Schemas ---
class RiftStartRequest(BaseModel):
    hero_id: str = "hero_kaelen"
    rift_tier: int = 1
    selected_weapon_id: Optional[str] = None

class RiftStartResponse(BaseModel):
    session_id: str
    seed: int
    hero_id: str
    rift_tier: int
    initial_floor: int
    biome: str
    starting_health: int
    floor_hazards: List[str]

class CombatMetricsPayload(BaseModel):
    enemies_slain: int
    damage_dealt: int
    damage_taken: int
    resonances_triggered: int
    clear_time_ms: int
    client_signature_hash: Optional[str] = None

class FloorCompleteRequest(BaseModel):
    session_id: str
    floor_number: int
    combat_metrics: CombatMetricsPayload
    selected_augment_id: Optional[str] = None

class FloorCompleteResponse(BaseModel):
    validated: bool
    status_message: str
    next_floor: int
    score_delta: int
    total_score: int
    pending_aether: int
    pending_void_fragments: int
    risk_options: List[Dict[str, Any]]

class RiftExtractRequest(BaseModel):
    session_id: str

class RiftExtractResponse(BaseModel):
    success: bool
    status: str
    final_score: int
    floors_cleared: int
    aether_awarded: int
    void_fragments_awarded: int
    mastery_xp_gained: int
    new_account_level: int

# --- Guild & LiveOps Schemas ---
class GuildCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=32)
    tag: str = Field(..., min_length=2, max_length=6)
    description: Optional[str] = None

class GuildContributeRequest(BaseModel):
    aether_amount: int = Field(..., gt=0)

class WorldEventResponse(BaseModel):
    id: str
    title: str
    sector_name: str
    current_progress: int
    target_progress: int
    completion_percentage: float
    status: str
    active_modifiers: List[Dict[str, Any]]

class LeaderboardEntryResponse(BaseModel):
    rank: int
    user_id: str
    username: str
    score: int
    hero_id: str
    title: str
