from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.hosted_zone import (
    HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse, HostedZoneListResponse,
)
from app.services import hosted_zone_service
from app.utils.security import get_session_user_id
from app.models.dns_record import DNSRecord
from sqlalchemy import func

router = APIRouter(prefix="/api/hosted-zones", tags=["Hosted Zones"])


@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(""),
    type: str = Query(""),
    db: Session = Depends(get_db),
):
    """List all hosted zones with pagination, search, and type filter."""
    user_id = get_session_user_id(request)
    return hosted_zone_service.get_hosted_zones(db, user_id, page, limit, search, type)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(zone_id: str, request: Request, db: Session = Depends(get_db)):
    """Get a single hosted zone by zone_id."""
    user_id = get_session_user_id(request)
    zone = hosted_zone_service.get_hosted_zone(db, zone_id, user_id)
    record_count = db.query(func.count(DNSRecord.id)).filter(
        DNSRecord.hosted_zone_id == zone.id
    ).scalar()
    return HostedZoneResponse(
        id=zone.id,
        zone_id=zone.zone_id,
        name=zone.name,
        type=zone.type,
        comment=zone.comment or "",
        status=zone.status,
        name_servers=zone.name_servers,
        record_count=record_count,
        created_at=zone.created_at,
        updated_at=zone.updated_at,
    )


@router.post("", response_model=HostedZoneResponse, status_code=201)
def create_hosted_zone(data: HostedZoneCreate, request: Request, db: Session = Depends(get_db)):
    """Create a new hosted zone. Auto-generates NS and SOA records."""
    user_id = get_session_user_id(request)
    zone = hosted_zone_service.create_hosted_zone(db, data, user_id)
    record_count = db.query(func.count(DNSRecord.id)).filter(
        DNSRecord.hosted_zone_id == zone.id
    ).scalar()
    return HostedZoneResponse(
        id=zone.id,
        zone_id=zone.zone_id,
        name=zone.name,
        type=zone.type,
        comment=zone.comment or "",
        status=zone.status,
        name_servers=zone.name_servers,
        record_count=record_count,
        created_at=zone.created_at,
        updated_at=zone.updated_at,
    )


@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    zone_id: str, data: HostedZoneUpdate, request: Request, db: Session = Depends(get_db),
):
    """Update a hosted zone's comment or status."""
    user_id = get_session_user_id(request)
    zone = hosted_zone_service.update_hosted_zone(db, zone_id, data, user_id)
    record_count = db.query(func.count(DNSRecord.id)).filter(
        DNSRecord.hosted_zone_id == zone.id
    ).scalar()
    return HostedZoneResponse(
        id=zone.id,
        zone_id=zone.zone_id,
        name=zone.name,
        type=zone.type,
        comment=zone.comment or "",
        status=zone.status,
        name_servers=zone.name_servers,
        record_count=record_count,
        created_at=zone.created_at,
        updated_at=zone.updated_at,
    )


@router.delete("/{zone_id}", status_code=204)
def delete_hosted_zone(zone_id: str, request: Request, db: Session = Depends(get_db)):
    """Delete a hosted zone and all its DNS records."""
    user_id = get_session_user_id(request)
    hosted_zone_service.delete_hosted_zone(db, zone_id, user_id)


@router.post("/bulk-delete", status_code=200)
def bulk_delete_hosted_zones(payload: dict, request: Request, db: Session = Depends(get_db)):
    """Bulk delete multiple hosted zones."""
    user_id = get_session_user_id(request)
    zone_ids = payload.get("zone_ids", [])
    deleted_count = 0
    for zid in zone_ids:
        try:
            hosted_zone_service.delete_hosted_zone(db, zid, user_id)
            deleted_count += 1
        except Exception:
            pass
    return {"deleted_count": deleted_count}


@router.get("/{zone_id}/export-bind")
def export_bind(zone_id: str, request: Request, db: Session = Depends(get_db)):
    """Export hosted zone and records in RFC 1035 BIND zone format."""
    from fastapi.responses import Response
    from app.utils.bind_parser import export_bind_zone

    user_id = get_session_user_id(request)
    zone = hosted_zone_service.get_hosted_zone(db, zone_id, user_id)
    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id).all()

    bind_content = export_bind_zone(zone.name, records)
    filename = f"{zone.name}.zone"

    return Response(
        content=bind_content,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{zone_id}/import-bind")
def import_bind(zone_id: str, payload: dict, request: Request, db: Session = Depends(get_db)):
    """Import records from a BIND zone file text."""
    from app.utils.bind_parser import parse_bind_zone
    from app.schemas.dns_record import DNSRecordCreate
    from app.services import record_service

    user_id = get_session_user_id(request)
    zone = hosted_zone_service.get_hosted_zone(db, zone_id, user_id)

    bind_text = payload.get("bind_text", "")
    parsed_records = parse_bind_zone(bind_text, zone.name)

    created_count = 0
    errors = []

    for item in parsed_records:
        try:
            record_data = DNSRecordCreate(
                name=item["name"],
                type=item["type"],
                ttl=item["ttl"],
                value=item["value"],
                routing_policy=item.get("routing_policy", "Simple"),
                priority=item.get("priority"),
            )
            record_service.create_record(db, zone_id, record_data, user_id)
            created_count += 1
        except Exception as e:
            errors.append(f"{item['name']} ({item['type']}): {str(e)}")

    return {
        "created_count": created_count,
        "failed_count": len(errors),
        "errors": errors,
    }
