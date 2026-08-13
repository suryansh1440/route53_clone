from datetime import datetime
from pydantic import BaseModel


class DNSRecordCreate(BaseModel):
    name: str
    type: str
    ttl: int = 300
    value: str
    routing_policy: str = "Simple"
    priority: int | None = None
    weight: int | None = None
    port: int | None = None
    flag: str | None = None
    tag: str | None = None


class DNSRecordUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    ttl: int | None = None
    value: str | None = None
    routing_policy: str | None = None
    priority: int | None = None
    weight: int | None = None
    port: int | None = None
    flag: str | None = None
    tag: str | None = None


class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str
    priority: int | None = None
    weight: int | None = None
    port: int | None = None
    flag: str | None = None
    tag: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DNSRecordListResponse(BaseModel):
    items: list[DNSRecordResponse]
    page: int
    limit: int
    total: int
    total_pages: int
