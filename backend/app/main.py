from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path

from app.routers import upload, stats, sales, transform, auth, ai
from app.models import create_tables

# load .env file if it exists in the backend directory
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

# get cors origins from env or use default localhost ports
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app = FastAPI(
    title="Business Dashboard",
    description="A dashboard to track your business metrics",
    version="1.0.0"
)

# cors middleware so the react frontend can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# wire up all the route handlers
# auth routes are public, rest need auth
app.include_router(auth.router)

# protected routes (require authentication)
app.include_router(upload.router)
app.include_router(stats.router)
app.include_router(sales.router)
app.include_router(transform.router)
app.include_router(ai.router)

# create tables when the app starts
@app.on_event("startup")
async def startup_event():
    create_tables()

# health check endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "Business Dashboard API is running"}