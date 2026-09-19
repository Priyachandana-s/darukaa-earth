from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal
from app.models import Base

from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.analytics import Analytics

from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.site import router as site_router
from app.routes.analytics import router as analytics_router


app = FastAPI(title="Darukaa.Earth API")


# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# API Routes
# -----------------------------
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(site_router)
app.include_router(analytics_router)


# -----------------------------
# Create Database Tables
# -----------------------------
Base.metadata.create_all(bind=engine)


# -----------------------------
# Add Sample Analytics Data
# -----------------------------
db = SessionLocal()

if db.query(Analytics).count() == 0:

    sample_data = [
        Analytics(
            site_id=2,
            date=date(2026, 1, 1),
            carbon_value=42.5,
            biodiversity_score=61
        ),

        Analytics(
            site_id=2,
            date=date(2026, 2, 1),
            carbon_value=48.2,
            biodiversity_score=65
        ),

        Analytics(
            site_id=2,
            date=date(2026, 3, 1),
            carbon_value=53.7,
            biodiversity_score=69
        ),

        Analytics(
            site_id=2,
            date=date(2026, 4, 1),
            carbon_value=59.4,
            biodiversity_score=73
        ),

        Analytics(
            site_id=2,
            date=date(2026, 5, 1),
            carbon_value=64.8,
            biodiversity_score=78
        ),
    ]

    db.add_all(sample_data)
    db.commit()

db.close()


# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "Darukaa.Earth Backend Running"
    }