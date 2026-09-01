import pytest
from app.core.anticheat import AntiCheatVerifier

def test_valid_floor_combat_verification():
    metrics = {
        "enemies_slain": 8,
        "damage_dealt": 2400,
        "damage_taken": 80,
        "resonances_triggered": 4,
        "clear_time_ms": 25000
    }
    is_valid, reason, score_delta = AntiCheatVerifier.validate_floor_combat(
        hero_id="hero_kaelen",
        weapon_tier=1,
        floor_number=1,
        combat_metrics=metrics
    )
    assert is_valid is True
    assert reason == "PASSED_VERIFICATION"
    assert score_delta > 10000

def test_speed_hack_detection():
    # 10 enemies killed in 1 second
    metrics = {
        "enemies_slain": 10,
        "damage_dealt": 5000,
        "damage_taken": 0,
        "resonances_triggered": 0,
        "clear_time_ms": 1000
    }
    is_valid, reason, score_delta = AntiCheatVerifier.validate_floor_combat(
        hero_id="hero_kaelen",
        weapon_tier=1,
        floor_number=1,
        combat_metrics=metrics
    )
    assert is_valid is False
    assert "traversal speed" in reason

def test_damage_hack_detection():
    # 50,000 damage dealt in 5 seconds with Tier 1 weapon (Exceeds theoretical ceiling)
    metrics = {
        "enemies_slain": 5,
        "damage_dealt": 50000,
        "damage_taken": 0,
        "resonances_triggered": 1,
        "clear_time_ms": 5000
    }
    is_valid, reason, score_delta = AntiCheatVerifier.validate_floor_combat(
        hero_id="hero_kaelen",
        weapon_tier=1,
        floor_number=1,
        combat_metrics=metrics
    )
    assert is_valid is False
    assert "Damage ceiling exceeded" in reason

def test_resonance_spam_detection():
    # 20 resonances reported in 4 seconds
    metrics = {
        "enemies_slain": 5,
        "damage_dealt": 1000,
        "damage_taken": 0,
        "resonances_triggered": 20,
        "clear_time_ms": 4000
    }
    is_valid, reason, score_delta = AntiCheatVerifier.validate_floor_combat(
        hero_id="hero_kaelen",
        weapon_tier=1,
        floor_number=1,
        combat_metrics=metrics
    )
    assert is_valid is False
    assert "resonance reaction frequency" in reason
