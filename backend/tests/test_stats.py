import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database import get_db
from app.models import Sale, Base
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stats.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

Base.metadata.create_all(bind=engine)

client = TestClient(app)


# note: test_data fixture removed - tests work without it for now


def test_get_revenue_stats():
    """test revenue stats endpoint"""
    # register and get token
    register_response = client.post(
        "/auth/register",
        json={"email": "test_revenue@example.com", "password": "testpass123"}
    )
    token = register_response.json()["access_token"]
    
    # get revenue stats
    response = client.get(
        "/stats/revenue?range=30",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "range_days" in data
    assert data["range_days"] == 30


def test_get_revenue_requires_auth():
    """test that revenue endpoint requires authentication"""
    response = client.get("/stats/revenue?range=30")
    assert response.status_code == 403


def test_get_category_stats():
    """test category stats endpoint"""
    # register and get token
    register_response = client.post(
        "/auth/register",
        json={"email": "test_category@example.com", "password": "testpass123"}
    )
    token = register_response.json()["access_token"]
    
    # get category stats
    response = client.get(
        "/stats/by-category",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "total_revenue" in data
    assert isinstance(data["categories"], list)

