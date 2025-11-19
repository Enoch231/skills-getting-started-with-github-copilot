import uuid
from urllib.parse import quote

from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    activity = "Chess Club"
    # unique email so tests are isolated
    email = f"testuser+{uuid.uuid4().hex}@example.com"

    signup_url = f"/activities/{quote(activity)}/signup"

    # Sign up should succeed
    r = client.post(signup_url, params={"email": email})
    assert r.status_code == 200

    # Participant appears in the activity
    activities = client.get("/activities").json()
    assert email in activities[activity]["participants"]

    # Duplicate signup should return 400
    r2 = client.post(signup_url, params={"email": email})
    assert r2.status_code == 400

    # Unregister should succeed
    unregister_url = f"/activities/{quote(activity)}/unregister"
    ru = client.post(unregister_url, params={"email": email})
    assert ru.status_code == 200

    # Participant removed
    activities_after = client.get("/activities").json()
    assert email not in activities_after[activity]["participants"]
