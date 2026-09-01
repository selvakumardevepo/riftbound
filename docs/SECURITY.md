# SECURITY & ANTI-CHEAT ARCHITECTURE
# RIFTBOUND: ECHOES OF THE AETHER

## 1. Threat Model & Security Pillars

In high-stakes competitive mobile gaming, client memory manipulation, speed-hacking, instant cooldowns, and false score submissions are major threats. Riftbound utilizes a **Server-Authoritative Verification Architecture** to guarantee total competitive integrity.

```
┌─────────────────────────────────────────────────────────────┐
│                 CLIENT SIMULATION (60 FPS)                  │
│  • Executes combat, animations, particle effects locally    │
│  • Compiles delta logs: { timestamp, action, target, dmg }  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS Encrypted Payload + HMAC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND VERIFICATION ENGINE                 │
│  1. Check Token & Timestamp Drift (Reject replay attacks)    │
│  2. Compute Max Theoretical DPS based on equipped Loadout   │
│  3. Verify Cooldown Minimum Timers (Reject spam injections) │
│  4. Re-simulate deterministic combat outcome against Seed   │
│  5. Validate Floor Traversal Speed vs Max Run Velocity      │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [PASS VALIDATION]             [FLAGGED AS CHEATER]
  Credit Currency & Score         Shadow-ban & Invalidate Run
```

---

## 2. Server-Authoritative Anti-Cheat Controls

### 2.1 Maximum DPS Ceiling & Damage Verification
The server maintains strict theoretical maximum damage formulas based on the player's weapon tier, hero base stats, and active augments:
$$\text{Max Allowed DPS} = (\text{Base Damage} \times \text{Max Cadence} \times \text{Crit Multiplier} \times \text{Max Synergy Multiplier}) \times 1.25$$
Any submitted combat delta exceeding this ceiling triggers an immediate audit exception and flags the run.

### 2.2 Cooldown & Ability Cadence Integrity
Every hero ability has a hardcoded floor duration ($T_{\text{min}}$). If a client submits three *Flame Whirlwinds* within 2 seconds when the cooldown is 6.0 seconds, the packet is invalidated and rejected.

### 2.3 Cryptographic Seed Verification
When a rift run starts, the server supplies a cryptographically secure pseudo-random seed ($S$). Enemy spawn tables, room layouts, and hazard timings are derived deterministically from $S$. If a client reports defeating enemies that could not have spawned given seed $S$, the run is flagged.

### 2.4 Currency & Inventory Isolation
- Currencies (`Aether Shards`, `Void Fragments`, `Astral Cores`) exist **strictly on the backend**.
- Clients never send `"aether_shards": 5000` in request payloads. Clients only send atomic transaction intents (e.g., `POST /forge/upgrade { "item_id": "wpn_01" }`). The server verifies sufficient balance, performs the debit, and writes the upgraded item to the database in an ACID-compliant transaction.

---

## 3. Network Security & Token Hygiene

- **JWT Authentication:** Short-lived access tokens (1 hour expiration) paired with secure HTTP-only refresh tokens.
- **HMAC Signatures:** Run completion payloads are signed with a per-session ephemeral HMAC key.
- **Rate Limiting:** Leaky bucket rate limiter enforcing a maximum of 60 requests/minute per client IP / User ID to mitigate API abuse and DDoS attacks.
