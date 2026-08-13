import math
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.dns_record import DNSRecord
from app.models.hosted_zone import HostedZone
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate
from app.utils.validators import validate_dns_record, validate_ttl


def _get_zone_or_404(db: Session, zone_id: str, user_id: int) -> HostedZone:
    """Get hosted zone or raise 404."""
    zone = db.query(HostedZone).filter(
        HostedZone.zone_id == zone_id, HostedZone.user_id == user_id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Hosted zone {zone_id} not found")
    return zone


def create_record(db: Session, zone_id: str, data: DNSRecordCreate, user_id: int) -> DNSRecord:
    """Create a DNS record with type-specific validation."""
    zone = _get_zone_or_404(db, zone_id, user_id)

    # Validate record
    validate_ttl(data.ttl)
    validated_value = validate_dns_record(
        data.type,
        data.value,
        priority=data.priority,
        weight=data.weight,
        port=data.port,
        flag=data.flag,
        tag=data.tag,
    )

    record = DNSRecord(
        hosted_zone_id=zone.id,
        name=data.name.strip(),
        type=data.type.upper(),
        ttl=data.ttl,
        value=validated_value,
        routing_policy=data.routing_policy or "Simple",
        priority=data.priority,
        weight=data.weight,
        port=data.port,
        flag=str(data.flag) if data.flag is not None else None,
        tag=data.tag,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_records(
    db: Session, zone_id: str, user_id: int,
    page: int = 1, limit: int = 20, search: str = "", record_type: str = ""
) -> dict:
    """Get paginated DNS records with optional search and type filter."""
    zone = _get_zone_or_404(db, zone_id, user_id)

    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id)

    if search:
        query = query.filter(DNSRecord.name.ilike(f"%{search}%"))
    if record_type:
        query = query.filter(DNSRecord.type == record_type.upper())

    total = query.count()
    total_pages = math.ceil(total / limit) if limit > 0 else 0

    records = query.order_by(DNSRecord.type, DNSRecord.name).offset((page - 1) * limit).limit(limit).all()

    return {
        "items": records,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


def get_record(db: Session, zone_id: str, record_id: int, user_id: int) -> DNSRecord:
    """Get a single DNS record."""
    zone = _get_zone_or_404(db, zone_id, user_id)
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"DNS record {record_id} not found")
    return record


def update_record(db: Session, zone_id: str, record_id: int, data: DNSRecordUpdate, user_id: int) -> DNSRecord:
    """Update a DNS record."""
    record = get_record(db, zone_id, record_id, user_id)

    # Prevent editing auto-generated NS/SOA records at zone apex
    zone = _get_zone_or_404(db, zone_id, user_id)
    if record.name == zone.name and record.type in ("NS", "SOA"):
        raise HTTPException(
            status_code=403,
            detail=f"Cannot edit auto-generated {record.type} record at zone apex",
        )

    # Apply updates
    update_type = data.type.upper() if data.type else record.type
    update_value = data.value if data.value is not None else record.value

    if data.value is not None or data.type is not None:
        validate_dns_record(
            update_type,
            update_value,
            priority=data.priority if data.priority is not None else record.priority,
            weight=data.weight if data.weight is not None else record.weight,
            port=data.port if data.port is not None else record.port,
            flag=data.flag if data.flag is not None else record.flag,
            tag=data.tag if data.tag is not None else record.tag,
        )

    if data.name is not None:
        record.name = data.name.strip()
    if data.type is not None:
        record.type = data.type.upper()
    if data.ttl is not None:
        validate_ttl(data.ttl)
        record.ttl = data.ttl
    if data.value is not None:
        record.value = data.value
    if data.routing_policy is not None:
        record.routing_policy = data.routing_policy
    if data.priority is not None:
        record.priority = data.priority
    if data.weight is not None:
        record.weight = data.weight
    if data.port is not None:
        record.port = data.port
    if data.flag is not None:
        record.flag = str(data.flag)
    if data.tag is not None:
        record.tag = data.tag

    db.commit()
    db.refresh(record)
    return record


def delete_record(db: Session, zone_id: str, record_id: int, user_id: int) -> None:
    """Delete a DNS record. Prevents deletion of auto-generated NS/SOA."""
    record = get_record(db, zone_id, record_id, user_id)
    zone = _get_zone_or_404(db, zone_id, user_id)

    if record.name == zone.name and record.type in ("NS", "SOA"):
        raise HTTPException(
            status_code=403,
            detail=f"Cannot delete auto-generated {record.type} record at zone apex",
        )

    db.delete(record)
    db.commit()
