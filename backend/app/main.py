from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
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


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://darukaa-earth-frontend-gkav.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(site_router)
app.include_router(analytics_router)


# Create database tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Darukaa.Earth Backend Running"}