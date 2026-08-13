import json
import math
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse
from app.utils.validators import validate_domain_name


def create_hosted_zone(db: Session, data: HostedZoneCreate, user_id: int) -> HostedZone:
    """Create a new hosted zone with auto-generated NS and SOA records."""
    name = validate_domain_name(data.name)

    # Check for duplicate zone name for this user
    existing = db.query(HostedZone).filter(
        HostedZone.name == name, HostedZone.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A hosted zone with name '{name}' already exists",
        )

    zone = HostedZone(
        name=name,
        type=data.type if data.type in ("Public", "Private") else "Public",
        comment=data.comment or "",
        user_id=user_id,
    )
    db.add(zone)
    db.flush()  # Get the zone ID before creating records

    # Auto-generate NS record
    name_servers = json.loads(zone.name_servers)
    ns_value = "\n".join(name_servers)
    ns_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=name,
        type="NS",
        ttl=172800,
        value=ns_value,
        routing_policy="Simple",
    )
    db.add(ns_record)

    # Auto-generate SOA record
    soa_value = f"{name_servers[0]} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
    soa_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=name,
        type="SOA",
        ttl=900,
        value=soa_value,
        routing_policy="Simple",
    )
    db.add(soa_record)

    db.commit()
    db.refresh(zone)
    return zone


def get_hosted_zones(
    db: Session, user_id: int, page: int = 1, limit: int = 10, search: str = "", zone_type: str = ""
) -> dict:
    """Get paginated hosted zones with optional search and type filter."""
    query = db.query(HostedZone).filter(HostedZone.user_id == user_id)

    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    if zone_type:
        query = query.filter(HostedZone.type == zone_type)

    total = query.count()
    total_pages = math.ceil(total / limit) if limit > 0 else 0

    zones = query.order_by(HostedZone.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    # Get record counts for each zone
    items = []
    for zone in zones:
        record_count = db.query(func.count(DNSRecord.id)).filter(
            DNSRecord.hosted_zone_id == zone.id
        ).scalar()
        zone_dict = {
            "id": zone.id,
            "zone_id": zone.zone_id,
            "name": zone.name,
            "type": zone.type,
            "comment": zone.comment or "",
            "status": zone.status,
            "name_servers": zone.name_servers,
            "record_count": record_count,
            "created_at": zone.created_at,
            "updated_at": zone.updated_at,
        }
        items.append(zone_dict)

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


def get_hosted_zone(db: Session, zone_id: str, user_id: int) -> HostedZone:
    """Get a single hosted zone by zone_id. Raises 404 if not found."""
    zone = db.query(HostedZone).filter(
        HostedZone.zone_id == zone_id, HostedZone.user_id == user_id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted zone {zone_id} not found")
    return zone


def update_hosted_zone(db: Session, zone_id: str, data: HostedZoneUpdate, user_id: int) -> HostedZone:
    """Update a hosted zone's comment or status."""
    zone = get_hosted_zone(db, zone_id, user_id)

    if data.comment is not None:
        zone.comment = data.comment
    if data.status is not None:
        if data.status not in ("Active", "Inactive"):
            raise HTTPException(status_code=422, detail="Status must be 'Active' or 'Inactive'")
        zone.status = data.status

    db.commit()
    db.refresh(zone)
    return zone


def delete_hosted_zone(db: Session, zone_id: str, user_id: int) -> None:
    """Delete a hosted zone and all its records (cascade)."""
    zone = get_hosted_zone(db, zone_id, user_id)
    db.delete(zone)
    db.commit()
