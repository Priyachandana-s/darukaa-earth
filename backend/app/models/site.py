from sqlalchemy import Column, Integer, String, Text, ForeignKey
from geoalchemy2 import Geometry
from app.models import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    geometry = Column(
        Geometry("POLYGON", srid=4326),
        nullable=False
    )