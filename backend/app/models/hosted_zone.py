import random
import string
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def generate_zone_id() -> str:
    """Generate a Route53-style zone ID like Z1234567890ABC."""
    chars = string.ascii_uppercase + string.digits
    random_part = "".join(random.choices(chars, k=13))
    return f"Z{random_part}"


def generate_name_servers() -> str:
    """Generate 4 mock AWS nameservers as JSON string."""
    import json
    ns_numbers = random.sample(range(100, 999), 4)
    return json.dumps([
        f"ns-{ns_numbers[0]}.awsdns-{random.randint(10, 99)}.com",
        f"ns-{ns_numbers[1]}.awsdns-{random.randint(10, 99)}.net",
        f"ns-{ns_numbers[2]}.awsdns-{random.randint(10, 99)}.org",
        f"ns-{ns_numbers[3]}.awsdns-{random.randint(10, 99)}.co.uk",
    ])


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    zone_id: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True, default=generate_zone_id
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(10), nullable=False, default="Public")
    comment: Mapped[str] = mapped_column(Text, nullable=True, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Active")
    name_servers: Mapped[str] = mapped_column(Text, nullable=False, default=generate_name_servers)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="hosted_zones")
    records = relationship("DNSRecord", back_populates="hosted_zone", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<HostedZone(zone_id='{self.zone_id}', name='{self.name}')>"
