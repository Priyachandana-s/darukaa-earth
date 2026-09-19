from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from app.models import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)

    date = Column(Date, nullable=False)
    carbon_value = Column(Float, nullable=False)
    biodiversity_score = Column(Float, nullable=False)