# MASTER GAME DESIGN DOCUMENT (GDD)
# RIFTBOUND: ECHOES OF THE AETHER
**Version:** 1.0.0-PROD  
**Target Platform:** Mobile (iOS / Android), WebGL / Mobile Web  
**Engine & Tech Stack:** High-Performance TypeScript/WebGL Client + Server-Authoritative Python/FastAPI Backend + PostgreSQL  

---

## 1. Core Product Vision

### 1.1 Name
**RIFTBOUND: Echoes of the Aether**

### 1.2 Genre
**Action-Tactical Roguelite RPG / Asynchronous Extraction Battler**

### 1.3 Target Audience
- **Primary:** Mid-core to core mobile gamers (ages 18–35) who enjoy high-agency action, build-crafting, and tactical mastery (fans of *Hades*, *Slay the Spire*, *Archero*, *Genshin Impact*, *Dead Cells*).
- **Secondary:** Competitive and collaborative players seeking meaningful, non-exploitative leaderboard climbing and guild-driven world progression without pay-to-win mechanics.

### 1.4 Core Fantasy
You are a **Riftweaver**, an elite dimensional vanguard capable of synchronizing with elemental Aether resonance. You plunge into fractured, collapsing pocket dimensions (Rifts) torn across the planetary frontier of Aetheria. Your mission: harvest unstable Aether Cores, forge transcendent elemental synergies, conquer eldritch aberrations, and extract back to the Citadel before the dimension collapses.

### 1.5 Unique Selling Proposition (USP)
1. **Kinetic Resonance Combat:** Single-thumb fluid combat paired with a deep dual-element "Resonance Synergy" matrix (e.g., combining Pyro + Gale triggers *Conflagration Vortex*; Cryo + Volt triggers *Superconduct Shatter*).
2. **True Risk/Reward Extraction Structure:** Players make explicit, transparent risk wagers per rift floor—deciding whether to bank hard-earned loot or push deeper into Overcharged Void breaches for legendary blueprints.
3. **Collective World Frontier:** The global player base’s extractions directly stabilize planetary sectors, unlocking new global biomes, boss encounters, and world-tier bonuses in real time.
4. **Ethical, Skill-Centric Design:** 100% server-authoritative competitive trials with zero energy bars, transparent deterministic crafting, and cosmetic/battle-pass monetization only.

### 1.6 Pitch (1-Sentence)
> *"An isometric real-time action-tactical roguelite where players forge dynamic resonance combos, extract primordial Aether shards from collapsing dimensional rifts, compete in asynchronous global trials, and collectively shape an evolving persistent planetary frontier."*

---

## 2. Design Philosophy & Ethical Framework

### 2.1 Easy to Start, Infinite to Master
- **0–30s Intuitiveness:** Drag to move, release or tap to attack/dash. Auto-aim targeting with manual skill direction overrides.
- **Skill Ceiling:** Frame-perfect dodge i-frames, directional parries, elemental stagger windows, and positional combo chaining.
- **Mastery over Grind:** A skilled player with baseline gear can conquer Tier-5 rifts through tactical precision, while optimized builds provide varied creative playstyles rather than numerical stat walls.

### 2.2 Constant Meaningful Progression
Progression occurs along four synchronized horizons:
1. **Short-Term (1–5 min):** Immediate floor augments, weapon trait procs, instant tactical feedback.
2. **Medium-Term (1–3 days):** Forging new Weave-Cores, unlocking Hero Archetype passive trees, completing Weekly Sector Bounties.
3. **Long-Term (1–3 months):** Competitive Chrono Trial Master badges, Guild Citadel Monument construction, Season Pass cosmetic mastery.
4. **Permanent World Legacy:** Community planetary stabilization milestones that permanently unlock lore, dungeons, and regional perks.

### 2.3 Ethical Engagement Manifesto
- **No Energy Gates:** Play as much or as little as you desire. No "stamina" timers blocking gameplay.
- **No Pay-to-Win:** Premium purchases are restricted strictly to high-tier aesthetic customizations, vanity visual fx, emote packs, and convenience passes (e.g., extra loadout slots). Competitive rankings are 100% skill & build determined.
- **Deterministic Crafting & Transparent Odds:** Zero hidden RNG pity tricks. If a blueprint requires 50 Void Fragments, 50 fragments guarantees the craft every single time.
- **Respect for Player Time:** Instant-start runs, seamless reconnects, local offline caching with secure server verification upon reconnection.

---

## 3. Core Gameplay Loop

```
┌────────────────────────────────────────────────────────┐
│                      THE RIFT RUN                      │
│                                                        │
│  [SELECT RIFT NODE] ──> [TACTICAL REAL-TIME COMBAT]    │
│           │                           │                │
│           ▼                           ▼                │
│  [CHOOSE FLOOR AUGMENT] ──> [RISK / EXTRACT DECISION]  │
│                                       │                │
│                                       ▼                │
│                           [CITADEL FORGE & UPGRADE]    │
│                                       │                │
│                                       ▼                │
│                           [GLOBAL METRICS & LADDER]    │
└────────────────────────────────────────────────────────┘
```

### 3.1 Input & Micro-Actions (Every 1–3 Seconds)
- **Virtual Joystick / Touch Drag:** Responsive analog vector movement with dynamic re-centering.
- **Swipe / Dodge Button:** Directional phase dash granting 0.2s invulnerability (i-frame) and elemental trail emission.
- **Primary Attack:** Smart-target pulse combo with weapon-specific rhythmic cadence (e.g., Twin Blades = high cadence melee; Chrono Cannon = charged piercing beam).
- **Resonance Skill (Ability 1 & 2):** High-impact elemental cast (e.g., *Glacial Spike*, *Solar Flare*, *Vortex Trap*).

### 3.2 Dual-Element Resonance Synergy Engine
When two elemental statuses affect an enemy within a 3-second window, an explosive **Resonance Reaction** occurs:

| Element 1 | Element 2 | Resonance Reaction | Tactical Effect |
| :--- | :--- | :--- | :--- |
| **Pyro (Fire)** | **Gale (Wind)** | **Firestorm Vortex** | Spreads burning aura in an expanding suction cyclone for 4s |
| **Cryo (Ice)** | **Volt (Lightning)** | **Superconduct Shatter**| Stuns target and blasts 300% AoE physical/elemental armor-shred |
| **Void (Gravity)**| **Pyro (Fire)** | **Singularity Collapse**| Pulls enemies inward, detonating for massive true damage |
| **Cryo (Ice)** | **Gale (Wind)** | **Blizzard Frostbite** | Freezes all targets solid; frozen targets take +50% critical strike |
| **Volt (Lightning)**| **Void (Gravity)** | **Electromagnetic Pulse**| Silences enemy elite abilities and resets hero cooldowns by 15% |

---

## 4. First-Session Experience (FTUE Breakdown)

- **Minute 0:00–0:30 (Instant Immersion):** Player spawns directly as *Kaelen the Blade Dancer* amidst a collapsing rift. Minimal text. Floating holographic prompt: *"Drag to move. Tap to strike."* Player eliminates three training wisps. Instant satisfying kinetic juice, screen shake, and crystal shatter SFX.
- **Minute 0:30–1:30 (Resonance Discovery):** Player encounters an Armored Void Brute. The game introduces the Flame Slash ability. Combining basic ice attacks with Flame Slash triggers the first **Vaporize Detonation** with huge visual particle bloom and floating golden combat numbers.
- **Minute 1:30–3:00 (The First Risk Node):** Player clears Chamber 1. Two dimensional portals appear:
  - *Portal A (Stable):* Guarantees 150 Aether Shards + Common Augment.
  - *Portal B (Overcharged Void):* High enemy aggression, +350% Shards + Epic Augment Blueprint. Player makes their first strategic risk evaluation.
- **Minute 3:00–5:00 (Boss Confrontation & Victory):** Boss *Oblivion Sentinel* appears with clear red telegraph cones and rotating beam attacks. Player executes timed phase-dashes and unleashes their Resonance Burst. Boss explodes into a shower of crystalline loot.
- **Minute 5:00–10:00 (The Citadel Return & First Forge):** Player returns to the Aetheria Command Base. Upgrades their starter blade with newly extracted Aether Cores. Unlocks the Hero Roster and the Global Planetary Sector Map.
- **Minute 10:00–15:00 (Meta World Connection):** Player deposits 50 Aether to the *Aegis Beacon* world project and sees the planetary purification meter advance in real-time alongside other global vanguard players.

---

## 5. Progression Architecture

### 5.1 Hero Progression (Vertical & Lateral)
- **4 Launch Archetypes:**
  1. **Blade Dancer (Kaelen):** High-speed dual-blade skirmisher (Pyro / Gale affinity).
  2. **Aegis Sentinel (Valeria):** Heavy shield titan with parry counters (Volt / Terra affinity).
  3. **Void Arcanist (Lyra):** Ranged gravity and black hole manipulator (Void / Umbra affinity).
  4. **Chrono Alchemist (Orion):** Time-dilation sniper and trap specialist (Cryo / Chrono affinity).
- **Skill Tree:** Each hero possesses a 3-branch specialization tree (Assault, Synergy, Survivability).

### 5.2 The Armory & Weave-Core Matrix
- Weapons feature randomized **Innate Imprints** (e.g., *+15% Critical on Frozen Targets*, *Dash leaves a Lightning Arc*).
- **Sockets:** Weave-Cores can be inserted, merged, and freely extracted without penalty or fee.

### 5.3 Asynchronous Competitive Chrono Trials
- Weekly rotating trial seeds where every player receives identical floor configurations and gear baseline.
- Leaderboard ranking based on:
  $$\text{Score} = (\text{Floors Cleared} \times 10,000) + (\text{Damage Dealt} \times 2) - (\text{Elapsed Seconds} \times 15) - (\text{Damage Taken} \times 5)$$
- Validated via server-authoritative deterministic replay hash.

---

## 6. Social & Guild Meta-Ecosystem

### 6.1 Guild Citadels
- Guilds (1–50 players) collaborate on weekly **Planetary Beacons**.
- Guild members contribute extracted surplus Aether to upgrade the guild’s communal research lab, providing passive bonuses (e.g., +5% Movement Speed in Gale Biomes) to all members.

### 6.2 Asynchronous Co-Op "Echo Projections"
- Players can summon an AI-controlled "Echo Projection" of their friend's or guildmate's hero into their single-player rift runs as an autonomous companion using that friend's exact gear and build setup.

---

## 7. 12-Month Live-Operations Roadmap

| Month | Season / Update | Key Content & Systems Added |
| :--- | :--- | :--- |
| **M1** | **Global Launch: The Awakening** | 4 Heroes, 3 Rift Biomes, 100+ Augments, Global Leaderboards, Guild Citadels |
| **M2** | **Update 1.1: Chrono Anomalies** | New Hero (*Orion*), Endless Chrono Tower Mode, Social Replay Sharing |
| **M3** | **Season 1: Obsidian Crucible** | Volcanic Biome, 15 New Weave-Cores, Battle Pass 1, Guild Raid Boss |
| **M4** | **Update 1.2: Relic Forge Expansion**| Weapon Transmutation System, Master Difficulty Modifiers, Spectator Mode |
| **M5** | **Season 2: Glacial Singularity** | Sub-Zero Biome, New Hero (*Eira the Frost Valkyrie*), 2v2 Tag-Team Trials |
| **M6** | **Major Expansion: The Void Sovereign**| World Boss Community Event, Cross-Guild Tournaments, Story Act II |
| **M7–12**| **Seasons 3–5 & Planetary Shift** | Rotating seasonal biomes, community voting on world state transformations |

---

## 8. Technical Architecture Summary

- **Backend:** FastAPI (Python 3.11+), async SQL engine (SQLAlchemy + asyncpg / SQLite for dev), Redis caching for leaderboard zsets, JWT auth with PBKDF2 hashing, deterministic combat seed verifier.
- **Frontend:** Canvas 2D / WebGL responsive engine running at solid 60 FPS, Web Audio API procedural sound synthesis, modular state store with offline sync queue.
- **Anti-Cheat Engine:** Server re-runs combat delta logs verifying tick timestamps, cooldown constraints, maximum DPS thresholds, and coordinate movement speed limits.
