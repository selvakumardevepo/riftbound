"""
Combat Engine & Procedural Seed Generator
Core rules for damage resolution, elemental synergies, and procedural floor generation.
"""

from typing import Dict, List, Any
import random

# Elemental Synergies
ELEMENTAL_REACTIONS: Dict[str, Dict[str, Any]] = {
    ("PYRO", "GALE"): {
        "name": "Firestorm Vortex",
        "effect": "EXPANDING_SUCTION_BURST",
        "damage_multiplier": 2.2,
        "aoe_radius": 180,
        "color": "#ff5500"
    },
    ("CRYO", "VOLT"): {
        "name": "Superconduct Shatter",
        "effect": "ARMOR_SHRED_STUN",
        "damage_multiplier": 2.8,
        "aoe_radius": 140,
        "color": "#00e5ff"
    },
    ("VOID", "PYRO"): {
        "name": "Singularity Collapse",
        "effect": "TRUE_GRAVITY_DETONATION",
        "damage_multiplier": 3.2,
        "aoe_radius": 220,
        "color": "#9d00ff"
    },
    ("CRYO", "GALE"): {
        "name": "Blizzard Frostbite",
        "effect": "FREEZE_AND_CRIT_AMPLIFY",
        "damage_multiplier": 2.0,
        "aoe_radius": 200,
        "color": "#76ffff"
    },
    ("VOLT", "VOID"): {
        "name": "Electromagnetic Pulse",
        "effect": "SILENCE_AND_COOLDOWN_RESET",
        "damage_multiplier": 2.5,
        "aoe_radius": 160,
        "color": "#ffd600"
    }
}

class CombatEngine:
    
    @staticmethod
    def resolve_elemental_resonance(elem_a: str, elem_b: str) -> Dict[str, Any]:
        """Check if two elements combine into a resonance reaction."""
        elem_a, elem_b = elem_a.upper(), elem_b.upper()
        if (elem_a, elem_b) in ELEMENTAL_REACTIONS:
            return ELEMENTAL_REACTIONS[(elem_a, elem_b)]
        if (elem_b, elem_a) in ELEMENTAL_REACTIONS:
            return ELEMENTAL_REACTIONS[(elem_b, elem_a)]
        return {"name": "None", "damage_multiplier": 1.0, "aoe_radius": 0, "effect": "NORMAL"}

    @staticmethod
    def generate_floor_layout(seed: int, floor_num: int) -> Dict[str, Any]:
        """Deterministic room configuration based on run seed and floor number."""
        rng = random.Random(seed + floor_num * 10007)
        biomes = ["VOID_CHASM", "OBSIDIAN_CRUCIBLE", "GLACIAL_TEMPEST", "AETHER_SANCTUM"]
        chosen_biome = biomes[floor_num % len(biomes)]
        
        enemy_count = 6 + (floor_num * 2)
        has_elite = (floor_num % 3 == 0)
        has_boss = (floor_num % 5 == 0)
        
        hazards = []
        if rng.random() > 0.4:
            hazards.append("VOID_CRYSTAL_TURRETS")
        if rng.random() > 0.6:
            hazards.append("CHRONO_SLOW_FIELDS")
            
        return {
            "floor": floor_num,
            "biome": chosen_biome,
            "enemy_count": enemy_count,
            "has_elite": has_elite,
            "has_boss": has_boss,
            "hazards": hazards,
            "ambient_energy": rng.randint(50, 150)
        }
