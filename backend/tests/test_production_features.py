import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_refresh_token_and_logout():
    # Register
    reg_resp = client.post("/api/v1/auth/register", json={
        "name": "Refresh User",
        "email": "refresh@buildloop.com",
        "password": "password123",
        "role": "BUYER"
    })
    assert reg_resp.status_code == 201

    # Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "refresh@buildloop.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Refresh token rotation
    ref_resp = client.post("/api/v1/auth/refresh", json={
        "refresh_token": tokens["refresh_token"]
    })
    assert ref_resp.status_code == 200
    new_tokens = ref_resp.json()
    assert new_tokens["access_token"] != tokens["access_token"]

    # Logout
    logout_resp = client.post("/api/v1/auth/logout", json={
        "refresh_token": new_tokens["refresh_token"]
    })
    assert logout_resp.status_code == 200

def test_geocode_location():
    response = client.get("/api/v1/locations/geocode?address=Bengaluru")
    assert response.status_code == 200
    data = response.json()
    assert "latitude" in data
    assert "longitude" in data
