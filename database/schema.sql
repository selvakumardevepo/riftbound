-- ============================================================================
-- RIFTBOUND: ECHOES OF THE AETHER - COMPLETE RELATIONAL DATABASE SCHEMA (DDL)
-- PostgreSQL / SQLite Compatible Schema
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_guest BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Player Profiles Table
CREATE TABLE IF NOT EXISTS player_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_level INT DEFAULT 1,
    mastery_xp BIGINT DEFAULT 0,
    aether_shards BIGINT DEFAULT 500,
    void_fragments INT DEFAULT 50,
    astral_cores INT DEFAULT 0,
    world_contribution_points INT DEFAULT 0,
    active_hero_id VARCHAR(64) DEFAULT 'hero_kaelen',
    current_season_score BIGINT DEFAULT 0,
    highest_rift_tier_cleared INT DEFAULT 0,
    total_runs_completed INT DEFAULT 0,
    avatar_frame_id VARCHAR(64) DEFAULT 'frame_vanguard_initiate',
    title VARCHAR(64) DEFAULT 'Rift Initiate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON player_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_season_score ON player_profiles(current_season_score DESC);

-- 3. Hero Progressions Table
CREATE TABLE IF NOT EXISTS hero_progressions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hero_id VARCHAR(64) NOT NULL,
    hero_level INT DEFAULT 1,
    hero_xp BIGINT DEFAULT 0,
    skill_tree_allocations JSONB DEFAULT '{}',
    is_unlocked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_hero UNIQUE (user_id, hero_id)
);

-- 4. Player Inventory Table
CREATE TABLE IF NOT EXISTS player_inventory (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL,
    item_type VARCHAR(32) NOT NULL, -- WEAPON, WEAVE_CORE, BLUEPRINT, COSMETIC
    tier INT DEFAULT 1,
    quality VARCHAR(32) DEFAULT 'COMMON', -- COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC
    attributes JSONB DEFAULT '{}',
    quantity INT DEFAULT 1,
    is_equipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON player_inventory(user_id);

-- 5. Guilds Table
CREATE TABLE IF NOT EXISTS guilds (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    tag VARCHAR(8) UNIQUE NOT NULL,
    description TEXT,
    citadel_level INT DEFAULT 1,
    total_beacon_aether BIGINT DEFAULT 0,
    leader_id VARCHAR(64) NOT NULL REFERENCES users(id),
    max_members INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Guild Members Table
CREATE TABLE IF NOT EXISTS guild_members (
    id VARCHAR(64) PRIMARY KEY,
    guild_id VARCHAR(64) NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) DEFAULT 'VANGUARD', -- LEADER, OFFICER, VANGUARD
    weekly_aether_donated BIGINT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON guild_members(guild_id);

-- 7. Rift Run Sessions Table (For Audit & Anti-Cheat Replay)
CREATE TABLE IF NOT EXISTS rift_run_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seed BIGINT NOT NULL,
    hero_id VARCHAR(64) NOT NULL,
    tier INT NOT NULL,
    status VARCHAR(32) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, EXTRACTED, FAILED, FLAGGED_SUSPICIOUS
    floors_cleared INT DEFAULT 0,
    total_damage_dealt BIGINT DEFAULT 0,
    total_damage_taken BIGINT DEFAULT 0,
    resonances_triggered INT DEFAULT 0,
    aether_harvested BIGINT DEFAULT 0,
    void_fragments_harvested INT DEFAULT 0,
    run_duration_ms INT DEFAULT 0,
    final_score BIGINT DEFAULT 0,
    client_signature_hash VARCHAR(255),
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rift_runs_user ON rift_run_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rift_runs_score ON rift_run_sessions(final_score DESC);

-- 8. Global World Events Table
CREATE TABLE IF NOT EXISTS world_events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    sector_name VARCHAR(64) NOT NULL,
    current_progress BIGINT DEFAULT 0,
    target_progress BIGINT NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, ARCHIVED
    active_modifiers JSONB DEFAULT '[]',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP
);

-- 9. Competitive Leaderboard Snapshots
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    season_id VARCHAR(32) NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(32) NOT NULL,
    rank_position INT NOT NULL,
    score BIGINT NOT NULL,
    hero_id VARCHAR(64) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_season_rank ON leaderboard_snapshots(season_id, rank_position ASC);
