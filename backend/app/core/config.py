import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Riftbound: Echoes of the Aether API"
    VERSION: str = "1.0.0-PROD"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("RIFTBOUND_SECRET_KEY", "dev_secret_key_change_in_production_981a28cb71e")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for mobile session stability
    ALGORITHM: str = "HS256"
    
    # SQLite default for local zero-dependency out-of-the-box running & testing
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./riftbound.db")
    
    # CORS Origins
    CORS_ORIGINS: List[str] = ["*"]
    
    # Anti-cheat tolerance thresholds
    MAX_DPS_CEILING_MULTIPLIER: float = 1.35
    MIN_DODGE_COOLDOWN_MS: int = 150
    
    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
