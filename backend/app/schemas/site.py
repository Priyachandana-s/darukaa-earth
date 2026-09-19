from pydantic import BaseModel


class SiteCreate(BaseModel):
    name: str
    description: str | None = None
    project_id: int
    geometry: dict


class SiteResponse(BaseModel):
    id: int
    name: str
    description: str | None
    project_id: int
    geometry: dict

    class Config:
        from_attributes = True