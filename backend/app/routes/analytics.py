from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.analytics import Analytics
from app.schemas.analytics import AnalyticsCreate, AnalyticsResponse


router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=AnalyticsResponse)
def create_analytics(
    analytics_data: AnalyticsCreate,
    db: Session = Depends(get_db)
):
    analytics = Analytics(
        site_id=analytics_data.site_id,
        date=analytics_data.date,
        carbon_value=analytics_data.carbon_value,
        biodiversity_score=analytics_data.biodiversity_score
    )

    db.add(analytics)
    db.commit()
    db.refresh(analytics)

    return analytics


@router.get("/site/{site_id}", response_model=list[AnalyticsResponse])
def get_site_analytics(
    site_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Analytics).filter(
        Analytics.site_id == site_id
    ).all()