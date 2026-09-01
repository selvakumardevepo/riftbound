import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db

@pytest.mark.asyncio
async def test_full_api_lifecycle():
    # Initialize in-memory/sqlite tables for testing
    await init_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        # 1. Healthcheck
        res = await ac.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "ONLINE"

        # 2. Guest Login
        guest_res = await ac.post("/api/v1/auth/guest")
        assert guest_res.status_code == 200
        data = guest_res.json()
        assert "access_token" in data
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Get Player Profile
        prof_res = await ac.get("/api/v1/player/profile", headers=headers)
        assert prof_res.status_code == 200
        prof_data = prof_res.json()
        assert prof_data["account_level"] == 1
        assert prof_data["aether_shards"] >= 500

        # 4. Get Inventory
        inv_res = await ac.get("/api/v1/player/inventory", headers=headers)
        assert inv_res.status_code == 200
        items = inv_res.json()
        assert len(items) > 0
        weapon_item = next(i for i in items if i["item_type"] == "WEAPON")

        # 5. Upgrade Weapon in Forge
        forge_res = await ac.post(
            "/api/v1/forge/upgrade",
            json={"item_id": weapon_item["item_id"], "upgrade_type": "ENHANCE_TIER"},
            headers=headers
        )
        assert forge_res.status_code == 200
        assert forge_res.json()["new_tier"] == 2

        # 6. Start Rift Run
        start_res = await ac.post(
            "/api/v1/rift/start",
            json={"hero_id": "hero_kaelen", "rift_tier": 1},
            headers=headers
        )
        assert start_res.status_code == 200
        run_data = start_res.json()
        session_id = run_data["session_id"]

        # 7. Complete Floor 1 with Valid Combat Metrics
        floor_res = await ac.post(
            "/api/v1/rift/floor/complete",
            json={
                "session_id": session_id,
                "floor_number": 1,
                "combat_metrics": {
                    "enemies_slain": 6,
                    "damage_dealt": 1800,
                    "damage_taken": 50,
                    "resonances_triggered": 3,
                    "clear_time_ms": 20000
                }
            },
            headers=headers
        )
        assert floor_res.status_code == 200
        floor_data = floor_res.json()
        assert floor_data["validated"] is True
        assert floor_data["next_floor"] == 2

        # 8. Extract from Rift
        extract_res = await ac.post(
            "/api/v1/rift/extract",
            json={"session_id": session_id},
            headers=headers
        )
        assert extract_res.status_code == 200
        extract_data = extract_res.json()
        assert extract_data["success"] is True
        assert extract_data["final_score"] > 0

        # 9. Get LiveOps World State & Daily Surge
        liveops_res = await ac.get("/api/v1/liveops/world-state")
        assert liveops_res.status_code == 200
        surge_res = await ac.get("/api/v1/liveops/daily-surge")
        assert surge_res.status_code == 200
        assert "buff" in surge_res.json()

        # 10. Check Leaderboards
        lead_res = await ac.get("/api/v1/leaderboards/chrono-trials")
        assert lead_res.status_code == 200
        lead_data = lead_res.json()
        assert len(lead_data) > 0
