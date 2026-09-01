-- ============================================================================
-- RIFTBOUND: ECHOES OF THE AETHER - SEED DATA
-- Default Heroes, Weapons, Weave-Cores, and Planetary World Event States
-- ============================================================================

-- Seed Active Planetary World Event
INSERT INTO world_events (id, title, sector_name, current_progress, target_progress, status, active_modifiers, start_time, end_time)
VALUES (
    'event_shattered_core_s01',
    'Operation Aegis Crucible: Purge the Obsidian Fracture',
    'Sector IV - Volcanic Riftlands',
    3420500,
    10000000,
    'ACTIVE',
    '[{"id": "mod_pyro_surge", "name": "Pyro Flare Surge", "description": "+20% Fire Damage, +10% Enemy Aggro"}, {"id": "mod_aether_rich", "name": "Aether Influx", "description": "+25% Extraction Yield"}]',
    CURRENT_TIMESTAMP,
    DATETIME(CURRENT_TIMESTAMP, '+30 days')
) ON CONFLICT(id) DO NOTHING;

-- Seed Default Alpha Vanguard Guild
INSERT INTO users (id, username, email, hashed_password, is_guest, is_banned)
VALUES (
    'usr_commander_valerius',
    'CommanderValerius',
    'commander@aetheria.frontier',
    'pbkdf2:sha256:600000$dummyhashvalerius$',
    FALSE,
    FALSE
) ON CONFLICT(id) DO NOTHING;

INSERT INTO guilds (id, name, tag, description, citadel_level, total_beacon_aether, leader_id, max_members)
VALUES (
    'guild_alpha_vanguard',
    'Solaris Vanguard',
    'SLRS',
    'The premier dimensional exploration unit of Aetheria. United in resonance.',
    5,
    1284500,
    'usr_commander_valerius',
    50
) ON CONFLICT(id) DO NOTHING;
