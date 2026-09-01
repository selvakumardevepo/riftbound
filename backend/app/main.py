from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List
import json
import asyncio

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Server-Authoritative Anti-Cheat & Live-Ops API for Riftbound: Echoes of the Aether",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Healthcheck & Welcome
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ONLINE",
        "game": "RIFTBOUND: ECHOES OF THE AETHER",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

# WebSocket Real-Time Telemetry & World Broadcast Stream
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial world state message
        await websocket.send_text(json.dumps({
            "type": "WORLD_UPDATE",
            "active_vanguards": 14208,
            "sector": "Sector IV - Volcanic Riftlands",
            "planetary_purification_pct": 34.82,
            "global_buff": "+20% Attack Cadence (Volt Surge)"
        }))
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming client ping
            await websocket.send_text(json.dumps({"type": "PONG", "received": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Mount v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
