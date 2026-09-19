from datetime import date
from pydantic import BaseModel


class AnalyticsCreate(BaseModel):
    site_id: int
    date: date
    carbon_value: float
    biodiversity_score: float


class AnalyticsResponse(BaseModel):
    id: int
    site_id: int
    date: date
    carbon_value: float
    biodiversity_score: float

    class Config:
        from_attributes = True