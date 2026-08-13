from datetime import datetime
from pydantic import BaseModel


class HostedZoneCreate(BaseModel):
    name: str
    type: str = "Public"
    comment: str = ""


class HostedZoneUpdate(BaseModel):
    comment: str | None = None
    status: str | None = None


class HostedZoneResponse(BaseModel):
    id: int
    zone_id: str
    name: str
    type: str
    comment: str
    status: str
    name_servers: str  # JSON string of nameservers
    record_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HostedZoneListResponse(BaseModel):
    items: list[HostedZoneResponse]
    page: int
    limit: int
    total: int
    total_pages: int
