from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dns_record import (
    DNSRecordCreate, DNSRecordUpdate, DNSRecordResponse, DNSRecordListResponse,
)
from app.services import record_service
from app.utils.security import get_session_user_id

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["DNS Records"])


@router.get("", response_model=DNSRecordListResponse)
def list_records(
    zone_id: str,
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    type: str = Query(""),
    db: Session = Depends(get_db),
):
    """List DNS records for a hosted zone with pagination, search, and type filter."""
    user_id = get_session_user_id(request)
    return record_service.get_records(db, zone_id, user_id, page, limit, search, type)


@router.get("/{record_id}", response_model=DNSRecordResponse)
def get_record(zone_id: str, record_id: int, request: Request, db: Session = Depends(get_db)):
    """Get a single DNS record."""
    user_id = get_session_user_id(request)
    return record_service.get_record(db, zone_id, record_id, user_id)


@router.post("", response_model=DNSRecordResponse, status_code=201)
def create_record(zone_id: str, data: DNSRecordCreate, request: Request, db: Session = Depends(get_db)):
    """Create a DNS record with type-specific validation."""
    user_id = get_session_user_id(request)
    return record_service.create_record(db, zone_id, data, user_id)


@router.put("/{record_id}", response_model=DNSRecordResponse)
def update_record(
    zone_id: str, record_id: int, data: DNSRecordUpdate, request: Request, db: Session = Depends(get_db),
):
    """Update a DNS record."""
    user_id = get_session_user_id(request)
    return record_service.update_record(db, zone_id, record_id, data, user_id)


@router.delete("/{record_id}", status_code=204)
def delete_record(zone_id: str, record_id: int, request: Request, db: Session = Depends(get_db)):
    """Delete a DNS record."""
    user_id = get_session_user_id(request)
    record_service.delete_record(db, zone_id, record_id, user_id)


@router.post("/bulk-delete", status_code=200)
def bulk_delete_records(zone_id: str, payload: dict, request: Request, db: Session = Depends(get_db)):
    """Bulk delete multiple DNS records."""
    user_id = get_session_user_id(request)
    record_ids = payload.get("record_ids", [])
    deleted_count = 0
    for rid in record_ids:
        try:
            record_service.delete_record(db, zone_id, int(rid), user_id)
            deleted_count += 1
        except Exception:
            pass
    return {"deleted_count": deleted_count}
