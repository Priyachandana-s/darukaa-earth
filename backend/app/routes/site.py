from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape, mapping

from app.database import SessionLocal
from app.models.site import Site
from app.models.project import Project
from app.models.analytics import Analytics
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/sites",
    tags=["Sites"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Create Site
# -----------------------------
@router.post("/", response_model=SiteResponse)
def create_site(
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check that the project belongs to the logged-in user
    project = (
        db.query(Project)
        .filter(
            Project.id == site_data.project_id,
            Project.user_id == current_user.id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Convert GeoJSON to PostGIS polygon
    polygon = shape(site_data.geometry)

    # Create site
    site = Site(
        name=site_data.name,
        description=site_data.description,
        project_id=site_data.project_id,
        geometry=from_shape(polygon, srid=4326)
    )

    db.add(site)
    db.commit()
    db.refresh(site)

    # -----------------------------
    # Add sample analytics
    # -----------------------------
    sample_analytics = [
        Analytics(
            site_id=site.id,
            date=date(2026, 1, 1),
            carbon_value=42.5,
            biodiversity_score=61
        ),
        Analytics(
            site_id=site.id,
            date=date(2026, 2, 1),
            carbon_value=48.2,
            biodiversity_score=65
        ),
        Analytics(
            site_id=site.id,
            date=date(2026, 3, 1),
            carbon_value=53.7,
            biodiversity_score=69
        ),
        Analytics(
            site_id=site.id,
            date=date(2026, 4, 1),
            carbon_value=59.4,
            biodiversity_score=73
        ),
        Analytics(
            site_id=site.id,
            date=date(2026, 5, 1),
            carbon_value=64.8,
            biodiversity_score=78
        ),
    ]

    db.add_all(sample_analytics)
    db.commit()

    return {
        "id": site.id,
        "name": site.name,
        "description": site.description,
        "project_id": site.project_id,
        "geometry": site_data.geometry
    }


# -----------------------------
# Get Sites
# -----------------------------
@router.get("/", response_model=list[SiteResponse])
def get_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sites = (
        db.query(Site)
        .join(
            Project,
            Site.project_id == Project.id
        )
        .filter(
            Project.user_id == current_user.id
        )
        .all()
    )

    return [
        {
            "id": site.id,
            "name": site.name,
            "description": site.description,
            "project_id": site.project_id,
            "geometry": mapping(
                to_shape(site.geometry)
            )
        }
        for site in sites
    ]