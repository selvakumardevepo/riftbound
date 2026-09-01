# RIFTBOUND: ECHOES OF THE AETHER
> **World-Class Mobile Action-Tactical Roguelite RPG & Live-Ops Backend**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/Client-TypeScript%20%2F%20Vite-3178C6.svg)](https://www.typescriptlang.org)
[![Anti-Cheat](https://img.shields.io/badge/Security-Server--Authoritative-E53935.svg)]()
[![Zero-Dark-Patterns](https://img.shields.io/badge/Monetization-Ethical%20%26%20Fair-4CAF50.svg)]()

---

## 🎮 Overview

**RIFTBOUND: Echoes of the Aether** is an original, premium-grade mobile action-tactical roguelite RPG. Players pilot customizable Riftweavers into collapsing pocket dimensions, forging dual-element resonance combos, making calculated risk/reward extraction wagers, climbing verified competitive leaderboards, and collaboratively purifying a living, persistent planetary frontier.

---

## 📁 Repository Structure

```
riftbound/
├── backend/                  # FastAPI Server-Authoritative Engine
│   ├── app/
│   │   ├── api/v1/           # Modular REST Endpoints (Auth, Player, Rift, Forge, Guild, Leaderboards, LiveOps)
│   │   ├── core/             # Security, JWT, Config & Anti-Cheat Simulation Verifier
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── schemas/          # Pydantic V2 Request & Response Schemas
│   │   ├── services/         # Combat Sim, Matchmaking & LiveOps Engine
│   │   └── main.py           # Application Entrypoint
│   ├── tests/                # Pytest Automated Test Suite
│   └── requirements.txt
├── mobile/                   # Interactive 60fps Mobile Client
│   ├── src/
│   │   ├── engine/           # 60fps Loop, Canvas/WebGL Renderer, Virtual Input, Particle & Web Audio Synth
│   │   ├── game/             # Combat System, Elemental Synergies, Enemy AI, Procedural Dungeon Gen
│   │   ├── ui/               # HUD, Armory/Forge, World Sector Map, Leaderboards, Guild Citadel, Share Cards
│   │   ├── state/            # Reactive State Store & Offline Sync Queue
│   │   └── main.ts           # Client Bootstrap
│   ├── index.html            # Mobile Viewport & Touch Layout
│   └── package.json
├── database/                 # Normalized SQL DDL & Seed Data
│   ├── schema.sql
│   └── seed.sql
├── docs/                     # Full Engineering & Game Design Specs
│   ├── GDD.md                # 36-Section Master Game Design Document
│   ├── ARCHITECTURE.md       # Technical Architecture & Scalability
│   ├── API.md                # REST & WebSocket Contracts
│   ├── DATABASE.md           # ERD & Sharding Guide
│   ├── SECURITY.md           # Anti-Cheat & Deterministic Replay Engine
│   └── LIVEOPS_ROADMAP.md    # 12-Month Content Calendar
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Test Suite
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
pytest -v
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`

### 2. Mobile Web/Client Setup
```bash
cd mobile
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser or mobile device with touch simulation.

---

## 🌟 Core Pillars

1. **Kinetic Resonance Combat**: Dual-element combo triggers (e.g. *Pyro + Gale = Firestorm Vortex*, *Cryo + Volt = Superconduct Shatter*).
2. **Transparent Risk/Reward Extraction**: Choose between Safe Harvest vs Overcharged Void Breaches per floor.
3. **Living Planetary Frontier**: Global community contributions unlock real-time world buffs and new biomes.
4. **Server-Authoritative Anti-Cheat**: Deterministic combat validation and DPS ceiling audits guarantee fair competition.
5. **Ethical Monetization**: Zero energy barriers, deterministic crafting, pure skill-based leaderboards.
