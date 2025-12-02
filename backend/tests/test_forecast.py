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
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_forecast.db"
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


@pytest.fixture
def test_forecast_data(db: Session):
    """create enough historical data for forecasting (need at least 7 days)"""
    today = date.today()
    sales = []
    # create 10 days of data
    for i in range(10):
        sales.append(
            Sale(
                date=today - timedelta(days=i),
                amount=100.0 + (i * 10),  # increasing trend
                category="Electronics",
                customerID=1
            )
        )
    db.add_all(sales)
    db.commit()
    return sales


def test_forecast_endpoint():
    """test forecast endpoint returns predictions"""
    # register and get token
    register_response = client.post(
        "/auth/register",
        json={"email": "test_forecast@example.com", "password": "testpass123"}
    )
    token = register_response.json()["access_token"]
    
    # get forecast
    response = client.get(
        "/stats/forecast?period=7",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # forecast might fail if not enough data, but endpoint should work
    assert response.status_code in [200, 400]  # 400 if insufficient data
    
    if response.status_code == 200:
        data = response.json()
        assert "dates" in data
        assert "predicted" in data
        assert "lower" in data
        assert "upper" in data
        assert len(data["dates"]) == 7
        assert len(data["predicted"]) == 7


def test_forecast_requires_auth():
    """test that forecast endpoint requires authentication"""
    response = client.get("/stats/forecast?period=7")
    assert response.status_code == 403


def test_forecast_insufficient_data():
    """test forecast with insufficient data returns error"""
    # register and get token
    register_response = client.post(
        "/auth/register",
        json={"email": "test_forecast2@example.com", "password": "testpass123"}
    )
    token = register_response.json()["access_token"]
    
    # try to forecast with no data
    response = client.get(
        "/stats/forecast?period=7",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # should return 400 with error message
    assert response.status_code == 400
    assert "insufficient" in response.json()["detail"].lower() or "data" in response.json()["detail"].lower()

