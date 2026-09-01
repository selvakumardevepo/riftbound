"""
Leaderboards and Competitive Tiering Service
"""

from typing import List, Dict, Any

class LeaderboardService:
    
    TIER_THRESHOLDS = [
        ("GRANDMASTER", 500000),
        ("DIAMOND", 300000),
        ("PLATINUM", 150000),
        ("GOLD", 75000),
        ("SILVER", 25000),
        ("BRONZE", 0),
    ]

    @classmethod
    def calculate_competitive_tier(cls, season_score: int) -> str:
        for tier_name, threshold in cls.TIER_THRESHOLDS:
            if season_score >= threshold:
                return tier_name
        return "BRONZE"
