from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.models.models import User, PlayerProfile, PlayerInventory
from app.schemas.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_current_user(token: str = "", db: AsyncSession = Depends(get_db)) -> User:
    """Dependency helper to resolve JWT user."""
    # Support bearer token header
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authentication token")
    
    user_id = decode_access_token(token.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check username existence
    res = await db.execute(select(User).where(User.username == req.username))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        username=req.username,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        is_guest=False
    )
    db.add(user)
    
    # Create associated player profile
    profile = PlayerProfile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        account_level=1,
        aether_shards=500,
        void_fragments=50,
        active_hero_id="hero_kaelen"
    )
    db.add(profile)
    
    # Seed Starter Weapon and Weave-Core
    starter_blade = PlayerInventory(
        id=str(uuid.uuid4()),
        user_id=user_id,
        item_id="wpn_aether_blade_01",
        item_type="WEAPON",
        tier=1,
        quality="COMMON",
        attributes={"base_damage": 75, "cadence": 1.2, "element": "PYRO"},
        is_equipped=True
    )
    starter_core = PlayerInventory(
        id=str(uuid.uuid4()),
        user_id=user_id,
        item_id="core_gale_vortex",
        item_type="WEAVE_CORE",
        tier=1,
        quality="UNCOMMON",
        attributes={"element": "GALE", "synergy_proc": "VORTEX_SUCTION", "bonus_crit": 5},
        is_equipped=True
    )
    db.add(starter_blade)
    db.add(starter_core)
    
    await db.commit()
    token = create_access_token(user_id)
    return TokenResponse(access_token=token, user_id=user_id, username=user.username)

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.username == req.username))
    user = res.scalars().first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id, username=user.username)

@router.post("/guest", response_model=TokenResponse)
async def guest_login(db: AsyncSession = Depends(get_db)):
    """Fast-track zero-friction onboarding for new players."""
    rand_suffix = str(uuid.uuid4())[:6].upper()
    guest_username = f"Riftweaver_{rand_suffix}"
    user_id = str(uuid.uuid4())
    
    user = User(
        id=user_id,
        username=guest_username,
        email=None,
        hashed_password=get_password_hash(str(uuid.uuid4())),
        is_guest=True
    )
    db.add(user)
    
    profile = PlayerProfile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        account_level=1,
        aether_shards=750,
        void_fragments=50,
        active_hero_id="hero_kaelen"
    )
    db.add(profile)
    
    starter_blade = PlayerInventory(
        id=str(uuid.uuid4()),
        user_id=user_id,
        item_id="wpn_aether_blade_01",
        item_type="WEAPON",
        tier=1,
        quality="COMMON",
        attributes={"base_damage": 75, "cadence": 1.2, "element": "PYRO"},
        is_equipped=True
    )
    db.add(starter_blade)
    
    await db.commit()
    token = create_access_token(user_id)
    return TokenResponse(access_token=token, user_id=user_id, username=guest_username)
