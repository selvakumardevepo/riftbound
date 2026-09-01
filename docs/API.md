# API SPECIFICATION & CONTRACTS
# RIFTBOUND: ECHOES OF THE AETHER — v1

Base URL: `/api/v1`

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 `POST /auth/register`
Create a new player account.
- **Request Body:**
  ```json
  {
    "username": "RiftMaster99",
    "email": "player@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response 201 Created:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "player_id": "usr_8fa9102b",
    "username": "RiftMaster99",
    "profile": {
      "level": 1,
      "xp": 0,
      "aether_shards": 500,
      "void_fragments": 50
    }
  }
  ```

### 1.2 `POST /auth/login`
Authenticate existing player.
- **Request Body:**
  ```json
  {
    "username": "RiftMaster99",
    "password": "SecurePassword123!"
  }
  ```
- **Response 200 OK:** Access token and full player profile metadata.

### 1.3 `POST /auth/guest`
Instant guest login for zero-friction FTUE onboarding.

---

## 2. Player & Inventory Endpoints (`/player`, `/forge`)

### 2.1 `GET /player/profile`
Retrieve active hero loadout, currencies, mastery stats, and world sector status.

### 2.2 `GET /player/inventory`
Returns equipment, unlocked Weave-Cores, raw Aether, and blueprints.

### 2.3 `POST /forge/upgrade`
Upgrade weapon tier or fuse Weave-Cores.
- **Request Body:**
  ```json
  {
    "item_id": "wpn_blade_01",
    "upgrade_type": "ENHANCE_TIER",
    "materials_spent": {
      "aether_shards": 200,
      "void_fragments": 15
    }
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "item": {
      "item_id": "wpn_blade_01",
      "level": 2,
      "base_damage": 85,
      "synergy_slots": 2
    }
  }
  ```

---

## 3. Rift Simulation & Combat Endpoints (`/rift`)

### 3.1 `POST /rift/start`
Initialize a new seeded dimensional rift run.
- **Request Body:**
  ```json
  {
    "hero_id": "hero_kaelen",
    "rift_tier": 1,
    "selected_loadout": {
      "weapon_id": "wpn_blade_01",
      "weave_core_ids": ["core_pyro_burst"]
    }
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "session_id": "sess_e3a981c",
    "seed": 182949102,
    "initial_floor": 1,
    "biome": "VOID_CHASM",
    "floor_hazards": ["AETHER_INSTABILITY"],
    "starting_health": 500
  }
  ```

### 3.2 `POST /rift/floor/complete`
Validate floor combat metrics and select next augment/risk path.
- **Request Body:**
  ```json
  {
    "session_id": "sess_e3a981c",
    "floor_number": 1,
    "combat_metrics": {
      "enemies_slain": 12,
      "damage_dealt": 4200,
      "damage_taken": 120,
      "resonances_triggered": 5,
      "clear_time_ms": 48200,
      "client_signature_hash": "a4f891b6c0..."
    },
    "selected_augment_id": "aug_flame_whirlwind"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "validated": true,
    "next_floor": 2,
    "rewards_pending": {
      "aether_shards": 320,
      "void_fragments": 20
    },
    "risk_node_options": [
      { "type": "SAFE_HARVEST", "risk_level": "LOW", "multiplier": 1.0 },
      { "type": "VOID_BREACH", "risk_level": "HIGH", "multiplier": 2.5 }
    ]
  }
  ```

### 3.3 `POST /rift/extract`
Finalize run, securely credit permanent account currencies and submit leaderboard score.

---

## 4. Competitive & Social Endpoints (`/leaderboards`, `/guild`, `/liveops`)

### 4.1 `GET /leaderboards/chrono-trials`
Retrieve top 100 global, regional, or guild ranks with verified run clear times.

### 4.2 `POST /guild/contribute`
Contribute extracted Aether to the communal Planetary Beacon project.

### 4.3 `GET /liveops/world-state`
Fetch active planetary purification progress, global buffs, and active community milestones.
