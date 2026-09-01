# TECHNICAL ARCHITECTURE SPECIFICATION
# RIFTBOUND: ECHOES OF THE AETHER

## 1. System Overview

```
                      ┌─────────────────────────────────┐
                      │    MOBILE CLIENT (Vite / TS)    │
                      │  • 60 FPS Canvas Game Engine    │
                      │  • State Store & Offline Queue  │
                      │  • Procedural Web Audio Synth   │
                      └────────────────┬────────────────┘
                                       │ HTTPS / WSS
                                       ▼
                      ┌─────────────────────────────────┐
                      │    API GATEWAY & LOAD BALANCER  │
                      │  • Rate Limiting & TLS Term     │
                      │  • CORS & Request Validation    │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   AUTH & PLAYER SVC   │  │   RIFT SIMULATION &   │  │   LIVEOPS & METASVC   │
│ • JWT Tokens & RBAC   │  │   ANTI-CHEAT VERIFIER │  │ • Planetary Event Calc│
│ • Profiles & Armory   │  │ • Deterministic Replay│  │ • Guild Beacons & Ranks│
└───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │   DATABASE & CACHE LAYER        │
                      │ • PostgreSQL 16 (Relational)    │
                      │ • Redis (Leaderboards & Events) │
                      └─────────────────────────────────┘
```

---

## 2. Backend Architecture (FastAPI + SQLAlchemy)

### 2.1 Core Modules
- **`app/api/v1/`**: API route controllers separated by domain boundaries:
  - `auth.py`: Registration, Login, Token Refresh, Guest Linking.
  - `player.py`: Profile, Currencies, Hero Roster, Inventory management.
  - `rift.py`: Seeded run initiation, floor state transitions, combat delta submission, extraction settlement.
  - `forge.py`: Weapon upgrade, Weave-Core socketing, deterministic blueprint synthesis.
  - `guild.py`: Guild creation, recruitment, weekly beacon Aether pooling.
  - `leaderboards.py`: Global, Seasonal, Guild, and Friend leaderboard views.
  - `liveops.py`: World event status, active planetary modifiers, seasonal pass challenges.
- **`app/core/`**:
  - `config.py`: Environment configurations and secret management.
  - `security.py`: Token signing, password hashing (PBKDF2/Bcrypt), HMAC token generator.
  - `anticheat.py`: Server-side combat simulation, maximum damage ceiling calculations, movement speed limits, cooldown integrity checks.
  - `database.py`: Async session manager and connection pooling.
- **`app/models/`**: Normalized relational entities with strict constraints and foreign keys.
- **`app/schemas/`**: Pydantic V2 schemas ensuring strict type-safety on all request/response boundaries.
- **`app/services/`**:
  - `combat_engine.py`: Headless deterministic combat mathematics.
  - `matchmaking.py`: Skill-based bracket sorting for Chrono Trials.
  - `liveops_engine.py`: Real-time world state progression and periodic scheduled event triggers.

---

## 3. Client Architecture (Mobile / TypeScript)

### 3.1 Game Engine Subsystems
- **`GameLoop`**: Fixed-timestep simulation (60 updates/sec) with variable render interpolation.
- **`Renderer`**: Isometric canvas renderer with layered sprite drawing, dynamic shadow casting, screen shake matrix transformations, and glow/bloom post-processing.
- **`ParticleEngine`**: High-performance pooled particle system capable of rendering 1,000+ simultaneous elemental sparks, slash trails, explosion shocks, and aether motes with zero GC allocation spikes.
- **`InputManager`**: Multi-touch virtual thumbstick, drag gestures, tap targeting, and keyboard fallback (WASD + Space + J/K/L).
- **`AudioSynth`**: Procedural sound synthesizer using Web Audio API oscillators, noise nodes, and biquad filters to produce rich combat sounds (slashes, lasers, impact crunches, level-ups, crystal drops) without bulky audio asset dependencies.

### 3.2 State Management & Offline Synchronization
- **`Store`**: Reactive state container managing local player state, active run state, inventory, and unlocked blueprints.
- **`SyncQueue`**: Offline-first optimistic queue that caches completed actions locally when offline, then idempotently replays and verifies transactions with the backend upon network reconnection using cryptographic nonce IDs.

---

## 4. Scalability & Deployment

1. **Stateless Compute**: Backend micro-containers deployable on Kubernetes, AWS ECS, or Google Cloud Run with auto-scaling based on CPU / Request concurrency.
2. **Database Sharding Strategy**:
   - Player operational data partitioned by `player_id % N`.
   - Leaderboards maintained in Redis Sorted Sets (`ZADD`, `ZREVRANGEBYSCORE`) with O(log N) lookup.
3. **CDN Asset Edge**: Mobile client static assets distributed over Cloudflare / Fastly with immutable hash-versioned bundle caching.
