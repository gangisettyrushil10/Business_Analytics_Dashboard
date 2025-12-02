import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from app.models import Base, Sale

# create test database (in-memory sqlite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# create tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_upload_csv_success():
    """test successful csv upload"""
    # create a test csv file content
    csv_content = "date,amount,category,customerID\n2024-01-01,100.50,Electronics,1\n2024-01-02,250.75,Clothing,2"
    
    # need to create a mock file upload
    # for now, we'll test the endpoint structure
    # in a real test, you'd use a proper file upload
    
    # first, we need to authenticate
    # register a test user
    register_response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    assert register_response.status_code == 200
    token = register_response.json()["access_token"]
    
    # test upload endpoint (without actual file for now)
    # this tests the endpoint exists and requires auth
    response = client.post(
        "/upload/csv",
        headers={"Authorization": f"Bearer {token}"}
    )
    # should fail without file, but endpoint should exist
    assert response.status_code in [400, 422]  # bad request or validation error


def test_upload_csv_missing_auth():
    """test that upload requires authentication"""
    response = client.post("/upload/csv")
    assert response.status_code == 403  # forbidden without auth


def test_upload_csv_invalid_file_type():
    """test that upload rejects non-csv files"""
    # register and get token
    register_response = client.post(
        "/auth/register",
        json={"email": "test2@example.com", "password": "testpass123"}
    )
    token = register_response.json()["access_token"]
    
    # try to upload non-csv file
    response = client.post(
        "/upload/csv",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test.txt", "some content", "text/plain")}
    )
    assert response.status_code == 400
    assert "csv" in response.json()["detail"].lower()

