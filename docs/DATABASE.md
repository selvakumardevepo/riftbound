# DATABASE ARCHITECTURE & SCHEMA SPECIFICATION
# RIFTBOUND: ECHOES OF THE AETHER

## 1. Relational Schema Design (PostgreSQL / SQLite Compatible)

```
┌──────────────────┐       1:1       ┌──────────────────┐
│      users       ├─────────────────┤  player_profiles │
└─────────┬────────┘                 └────────┬─────────┘
          │ 1:N                               │ 1:N
          ▼                                   ▼
┌──────────────────┐                 ┌──────────────────┐
│   auth_tokens    │                 │ hero_progressions│
└──────────────────┘                 └────────┬─────────┘
                                              │ 1:N
┌──────────────────┐                 ┌────────▼─────────┐
│      guilds      │                 │ player_inventory │
└─────────┬────────┘                 └────────┬─────────┘
          │ 1:N                               │ 1:N
          ▼                                   ▼
┌──────────────────┐                 ┌──────────────────┐
│  guild_members   │                 │ rift_run_sessions│
└──────────────────┘                 └────────┬─────────┘
                                              │ 1:N
┌──────────────────┐                 ┌────────▼─────────┐
│   world_events   │                 │   leaderboards   │
└──────────────────┘                 └──────────────────┘
```

---

## 2. Key Entities & Integrity Constraints

### 2.1 `users` Table
- `id` (UUID / String, PK): Unique system identifier.
- `username` (VARCHAR(32), UNIQUE, INDEX): Display handle.
- `email` (VARCHAR(255), UNIQUE): Contact address (nullable for guest accounts).
- `hashed_password` (VARCHAR(255)): PBKDF2/Bcrypt hash.
- `is_guest` (BOOLEAN): Flag for quick-play guest accounts.
- `created_at`, `updated_at` (TIMESTAMP).

### 2.2 `player_profiles` Table
- `id` (UUID, PK, FK -> `users.id`).
- `account_level` (INT, DEFAULT 1): Account mastery level.
- `mastery_xp` (BIGINT, DEFAULT 0): Accumulated mastery experience.
- `aether_shards` (BIGINT, DEFAULT 500): Core soft currency for forging and upgrading.
- `void_fragments` (INT, DEFAULT 50): Rare crafting material earned from high-risk breaches.
- `astral_cores` (INT, DEFAULT 0): Premium cosmetic tokens (earned in-game or purchased).
- `world_contribution_points` (INT, DEFAULT 0): Lifetime planetary stabilization points.
- `active_hero_id` (VARCHAR(64), DEFAULT 'hero_kaelen').

### 2.3 `player_inventory` Table
- `id` (UUID, PK).
- `user_id` (UUID, FK -> `users.id`, INDEX).
- `item_id` (VARCHAR(64)): Catalog item reference (e.g. `wpn_blade_01`).
- `item_type` (ENUM: `WEAPON`, `WEAVE_CORE`, `BLUEPRINT`, `COSMETIC`).
- `tier` (INT, DEFAULT 1): Level/Tier of the item.
- `quality` (ENUM: `COMMON`, `UNCOMMON`, `RARE`, `EPIC`, `LEGENDARY`, `MYTHIC`).
- `attributes` (JSONB): Dynamic rolls, socketed cores, imprint stats.
- `quantity` (INT, DEFAULT 1).

### 2.4 `rift_run_sessions` Table
- `id` (UUID, PK).
- `user_id` (UUID, FK -> `users.id`, INDEX).
- `seed` (BIGINT): Procedural generation seed for deterministic verification.
- `hero_id` (VARCHAR(64)): Chosen hero archetype.
- `tier` (INT): Rift difficulty tier.
- `status` (ENUM: `IN_PROGRESS`, `COMPLETED`, `EXTRACTED`, `FAILED`, `FLAGGED_SUSPICIOUS`).
- `floors_cleared` (INT, DEFAULT 0).
- `total_damage_dealt` (BIGINT, DEFAULT 0).
- `total_damage_taken` (BIGINT, DEFAULT 0).
- `resonances_triggered` (INT, DEFAULT 0).
- `run_duration_ms` (INT, DEFAULT 0).
- `final_score` (BIGINT, DEFAULT 0).
- `created_at`, `ended_at` (TIMESTAMP).

### 2.5 `guilds` & `guild_members` Table
- `guilds.id`, `guilds.name`, `guilds.tag`, `guilds.citadel_level`, `guilds.total_beacon_aether`.
- `guild_members.guild_id`, `guild_members.user_id`, `guild_members.role` (`LEADER`, `OFFICER`, `VANGUARD`).

### 2.6 `world_events` Table
- `id` (VARCHAR(64), PK): e.g., `event_shattered_core_01`.
- `title` (VARCHAR(128)).
- `current_progress` (BIGINT): Aggregate contributions by all vanguard players.
- `target_progress` (BIGINT): Threshold to unlock the next planetary biome.
- `status` (ENUM: `ACTIVE`, `COMPLETED`, `ARCHIVED`).
- `active_modifiers` (JSONB): Global buffs applied to all rift expeditions.
