from sqlalchemy import Column, String, Integer, BigInteger, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    username = Column(String(32), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_guest = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("PlayerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    inventory = relationship("PlayerInventory", back_populates="user", cascade="all, delete-orphan")
    runs = relationship("RiftRunSession", back_populates="user", cascade="all, delete-orphan")
    guild_membership = relationship("GuildMember", back_populates="user", uselist=False)

class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    account_level = Column(Integer, default=1)
    mastery_xp = Column(BigInteger, default=0)
    aether_shards = Column(BigInteger, default=500)
    void_fragments = Column(Integer, default=50)
    astral_cores = Column(Integer, default=0)
    world_contribution_points = Column(Integer, default=0)
    active_hero_id = Column(String(64), default="hero_kaelen")
    current_season_score = Column(BigInteger, default=0)
    highest_rift_tier_cleared = Column(Integer, default=0)
    total_runs_completed = Column(Integer, default=0)
    avatar_frame_id = Column(String(64), default="frame_vanguard_initiate")
    title = Column(String(64), default="Rift Initiate")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class PlayerInventory(Base):
    __tablename__ = "player_inventory"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    item_id = Column(String(64), nullable=False)
    item_type = Column(String(32), nullable=False) # WEAPON, WEAVE_CORE, BLUEPRINT, COSMETIC
    tier = Column(Integer, default=1)
    quality = Column(String(32), default="COMMON")
    attributes = Column(JSON, default={})
    quantity = Column(Integer, default=1)
    is_equipped = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="inventory")

class RiftRunSession(Base):
    __tablename__ = "rift_run_sessions"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    seed = Column(BigInteger, nullable=False)
    hero_id = Column(String(64), nullable=False)
    tier = Column(Integer, default=1)
    status = Column(String(32), default="IN_PROGRESS") # IN_PROGRESS, EXTRACTED, FAILED, FLAGGED_SUSPICIOUS
    floors_cleared = Column(Integer, default=0)
    total_damage_dealt = Column(BigInteger, default=0)
    total_damage_taken = Column(BigInteger, default=0)
    resonances_triggered = Column(Integer, default=0)
    aether_harvested = Column(BigInteger, default=0)
    void_fragments_harvested = Column(Integer, default=0)
    run_duration_ms = Column(Integer, default=0)
    final_score = Column(BigInteger, default=0)
    client_signature_hash = Column(String(255), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="runs")

class Guild(Base):
    __tablename__ = "guilds"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(64), unique=True, nullable=False)
    tag = Column(String(8), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    citadel_level = Column(Integer, default=1)
    total_beacon_aether = Column(BigInteger, default=0)
    leader_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    max_members = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("GuildMember", back_populates="guild", cascade="all, delete-orphan")

class GuildMember(Base):
    __tablename__ = "guild_members"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    guild_id = Column(String(64), ForeignKey("guilds.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    role = Column(String(32), default="VANGUARD")
    weekly_aether_donated = Column(BigInteger, default=0)
    joined_at = Column(DateTime, default=datetime.utcnow)

    guild = relationship("Guild", back_populates="members")
    user = relationship("User", back_populates="guild_membership")

class WorldEvent(Base):
    __tablename__ = "world_events"

    id = Column(String(64), primary_key=True)
    title = Column(String(128), nullable=False)
    sector_name = Column(String(64), nullable=False)
    current_progress = Column(BigInteger, default=0)
    target_progress = Column(BigInteger, nullable=False)
    status = Column(String(32), default="ACTIVE")
    active_modifiers = Column(JSON, default=[])
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
