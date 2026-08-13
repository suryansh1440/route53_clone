import re
import ipaddress
from fastapi import HTTPException


def validate_domain_name(name: str) -> str:
    """Validate a domain name format."""
    name = name.strip().rstrip(".")
    if not name:
        raise HTTPException(status_code=422, detail="Domain name is required")
    if len(name) > 253:
        raise HTTPException(status_code=422, detail="Domain name too long (max 253 chars)")
    # Basic domain pattern
    pattern = r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$"
    if not re.match(pattern, name):
        raise HTTPException(status_code=422, detail=f"Invalid domain name: '{name}'")
    return name


def validate_ipv4(value: str) -> str:
    """Validate an IPv4 address."""
    try:
        ipaddress.IPv4Address(value.strip())
        return value.strip()
    except (ipaddress.AddressValueError, ValueError):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid IPv4 address: '{value}'",
        )


def validate_ipv6(value: str) -> str:
    """Validate an IPv6 address."""
    try:
        ipaddress.IPv6Address(value.strip())
        return value.strip()
    except (ipaddress.AddressValueError, ValueError):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid IPv6 address: '{value}'",
        )


def validate_hostname(value: str) -> str:
    """Validate a hostname."""
    value = value.strip().rstrip(".")
    if not value:
        raise HTTPException(status_code=422, detail="Hostname is required")
    pattern = r"^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.?$"
    if not re.match(pattern, value):
        raise HTTPException(status_code=422, detail=f"Invalid hostname: '{value}'")
    return value


def validate_ttl(ttl: int) -> int:
    """Validate TTL value."""
    if ttl < 0:
        raise HTTPException(status_code=422, detail="TTL must be a non-negative integer")
    if ttl > 2147483647:
        raise HTTPException(status_code=422, detail="TTL too large (max 2147483647)")
    return ttl


def validate_priority(priority: int | None, record_type: str) -> int | None:
    """Validate priority for MX and SRV records."""
    if record_type in ("MX", "SRV"):
        if priority is None:
            raise HTTPException(status_code=422, detail=f"Priority is required for {record_type} records")
        if priority < 0 or priority > 65535:
            raise HTTPException(status_code=422, detail="Priority must be between 0 and 65535")
    return priority


def validate_dns_record(record_type: str, value: str, **kwargs):
    """Validate a DNS record based on its type. Returns validated value."""
    record_type = record_type.upper()
    valid_types = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"}

    if record_type not in valid_types:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid record type: '{record_type}'. Must be one of: {', '.join(sorted(valid_types))}",
        )

    if record_type == "A":
        return validate_ipv4(value)
    elif record_type == "AAAA":
        return validate_ipv6(value)
    elif record_type in ("CNAME", "NS", "PTR"):
        return validate_hostname(value)
    elif record_type == "MX":
        validate_priority(kwargs.get("priority"), "MX")
        return validate_hostname(value)
    elif record_type == "SRV":
        validate_priority(kwargs.get("priority"), "SRV")
        weight = kwargs.get("weight")
        port = kwargs.get("port")
        if weight is None:
            raise HTTPException(status_code=422, detail="Weight is required for SRV records")
        if port is None:
            raise HTTPException(status_code=422, detail="Port is required for SRV records")
        if weight < 0 or weight > 65535:
            raise HTTPException(status_code=422, detail="Weight must be between 0 and 65535")
        if port < 0 or port > 65535:
            raise HTTPException(status_code=422, detail="Port must be between 0 and 65535")
        return validate_hostname(value)
    elif record_type == "CAA":
        flag = kwargs.get("flag")
        tag = kwargs.get("tag")
        if flag is None:
            raise HTTPException(status_code=422, detail="Flag is required for CAA records")
        if flag not in ("0", "128", 0, 128):
            raise HTTPException(status_code=422, detail="CAA flag must be 0 or 128")
        if tag not in ("issue", "issuewild", "iodef"):
            raise HTTPException(status_code=422, detail="CAA tag must be 'issue', 'issuewild', or 'iodef'")
        return value.strip()
    elif record_type == "TXT":
        return value.strip()

    return value
