from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# load .env if it exists
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

# default to sqlite for local dev, can override with DATABASE_URL env var for postgres
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./business_dashboard.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# fastapi dependency that gives each request its own db session
# auto closes the session when the request finishes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

