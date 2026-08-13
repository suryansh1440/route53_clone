from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hosted_zone_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
    ttl: Mapped[int] = mapped_column(Integer, nullable=False, default=300)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    routing_policy: Mapped[str] = mapped_column(String(50), nullable=False, default="Simple")

    # Type-specific fields (nullable)
    priority: Mapped[int | None] = mapped_column(Integer, nullable=True)  # MX, SRV
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)  # SRV
    port: Mapped[int | None] = mapped_column(Integer, nullable=True)  # SRV
    flag: Mapped[str | None] = mapped_column(String(10), nullable=True)  # CAA
    tag: Mapped[str | None] = mapped_column(String(50), nullable=True)  # CAA

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
    hosted_zone = relationship("HostedZone", back_populates="records")

    def __repr__(self) -> str:
        return f"<DNSRecord(name='{self.name}', type='{self.type}', value='{self.value}')>"
