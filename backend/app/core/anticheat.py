"""
Server-Authoritative Anti-Cheat Verification Engine
Validates combat telemetry deltas, DPS ceilings, and deterministic scoring.
"""

from typing import Dict, Any, Tuple
import math
from app.core.config import settings

class AntiCheatVerifier:
    
    # Base hero damage metrics
    HERO_BASE_STATS = {
        "hero_kaelen": {"base_dps": 120.0, "burst_mult": 2.5, "speed": 1.0},
        "hero_valeria": {"base_dps": 95.0, "burst_mult": 1.8, "speed": 0.85},
        "hero_lyra": {"base_dps": 110.0, "burst_mult": 3.0, "speed": 0.95},
        "hero_orion": {"base_dps": 105.0, "burst_mult": 2.2, "speed": 1.05},
    }

    @classmethod
    def validate_floor_combat(
        cls,
        hero_id: str,
        weapon_tier: int,
        floor_number: int,
        combat_metrics: Dict[str, Any]
    ) -> Tuple[bool, str, int]:
        """
        Validates combat metrics submitted by the client.
        Returns (is_valid, reason, validated_score_delta)
        """
        enemies_slain = combat_metrics.get("enemies_slain", 0)
        damage_dealt = combat_metrics.get("damage_dealt", 0)
        damage_taken = combat_metrics.get("damage_taken", 0)
        resonances = combat_metrics.get("resonances_triggered", 0)
        clear_time_ms = combat_metrics.get("clear_time_ms", 1000)

        hero_stats = cls.HERO_BASE_STATS.get(hero_id, cls.HERO_BASE_STATS["hero_kaelen"])
        clear_time_sec = max(clear_time_ms / 1000.0, 1.0)

        # 1. Check Impossible Clear Speed (< 3 seconds for standard wave)
        if enemies_slain > 3 and clear_time_sec < 3.0:
            return False, "FLAGGED: Impossible chamber traversal speed", 0

        # 2. Check Theoretical Maximum DPS Ceiling
        weapon_multiplier = 1.0 + (weapon_tier - 1) * 0.35
        expected_dps = hero_stats["base_dps"] * weapon_multiplier
        max_allowable_dps = expected_dps * hero_stats["burst_mult"] * settings.MAX_DPS_CEILING_MULTIPLIER * (1.0 + resonances * 0.15)
        
        actual_dps = damage_dealt / clear_time_sec
        if actual_dps > max_allowable_dps:
            return False, f"FLAGGED: Damage ceiling exceeded (Actual DPS: {actual_dps:.1f}, Max Allowed: {max_allowable_dps:.1f})", 0

        # 3. Check Resonance Frequency (Max 1 resonance per 0.8s)
        max_possible_resonances = math.ceil(clear_time_sec / 0.8) + 2
        if resonances > max_possible_resonances:
            return False, f"FLAGGED: Abnormal resonance reaction frequency ({resonances} in {clear_time_sec:.1f}s)", 0

        # 4. Calculate Verified Deterministic Score
        floor_base_points = floor_number * 10000
        combat_bonus = int(damage_dealt * 0.5)
        resonance_bonus = resonances * 1500
        time_penalty = int(clear_time_sec * 25)
        damage_taken_penalty = int(damage_taken * 2)

        score_delta = max(100, floor_base_points + combat_bonus + resonance_bonus - time_penalty - damage_taken_penalty)
        return True, "PASSED_VERIFICATION", score_delta
