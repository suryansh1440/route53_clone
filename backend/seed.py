"""
Seed script to populate the database with initial data.
Run: python seed.py
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.hosted_zone import HostedZone, generate_zone_id, generate_name_servers
from app.models.dns_record import DNSRecord
from app.utils.security import hash_password

import json


def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            print("Database already seeded. Skipping...")
            return

        # Create admin user
        admin = User(
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            name="Admin User",
        )
        db.add(admin)
        db.flush()
        print(f"Created user: {admin.email}")

        # === Zone 1: example.com ===
        zone1_ns = json.dumps([
            "ns-384.awsdns-48.com",
            "ns-712.awsdns-31.net",
            "ns-1536.awsdns-62.org",
            "ns-204.awsdns-25.co.uk",
        ])
        zone1 = HostedZone(
            zone_id="Z0123456789ABC",
            user_id=admin.id,
            name="example.com",
            type="Public",
            comment="Production website",
            status="Active",
            name_servers=zone1_ns,
        )
        db.add(zone1)
        db.flush()

        # Zone 1 records
        z1_ns_list = json.loads(zone1_ns)
        zone1_records = [
            DNSRecord(hosted_zone_id=zone1.id, name="example.com", type="NS", ttl=172800,
                      value="\n".join(z1_ns_list), routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="example.com", type="SOA", ttl=900,
                      value=f"{z1_ns_list[0]} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
                      routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="example.com", type="A", ttl=300,
                      value="192.168.1.10", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="www.example.com", type="CNAME", ttl=300,
                      value="example.com", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="api.example.com", type="A", ttl=300,
                      value="192.168.1.20", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="example.com", type="MX", ttl=3600,
                      value="mail.example.com", priority=10, routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="example.com", type="TXT", ttl=300,
                      value='"v=spf1 include:_spf.google.com ~all"', routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone1.id, name="mail.example.com", type="A", ttl=300,
                      value="192.168.1.30", routing_policy="Simple"),
        ]
        db.add_all(zone1_records)
        print(f"Created zone: {zone1.name} with {len(zone1_records)} records")

        # === Zone 2: example.org ===
        zone2_ns = json.dumps([
            "ns-567.awsdns-12.com",
            "ns-891.awsdns-45.net",
            "ns-234.awsdns-78.org",
            "ns-678.awsdns-34.co.uk",
        ])
        zone2 = HostedZone(
            zone_id="Z9876543210DEF",
            user_id=admin.id,
            name="example.org",
            type="Public",
            comment="Staging environment",
            status="Active",
            name_servers=zone2_ns,
        )
        db.add(zone2)
        db.flush()

        z2_ns_list = json.loads(zone2_ns)
        zone2_records = [
            DNSRecord(hosted_zone_id=zone2.id, name="example.org", type="NS", ttl=172800,
                      value="\n".join(z2_ns_list), routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone2.id, name="example.org", type="SOA", ttl=900,
                      value=f"{z2_ns_list[0]} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
                      routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone2.id, name="example.org", type="A", ttl=300,
                      value="10.0.0.1", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone2.id, name="staging.example.org", type="CNAME", ttl=300,
                      value="example.org", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone2.id, name="example.org", type="AAAA", ttl=300,
                      value="2001:0db8:85a3:0000:0000:8a2e:0370:7334", routing_policy="Simple"),
        ]
        db.add_all(zone2_records)
        print(f"Created zone: {zone2.name} with {len(zone2_records)} records")

        # === Zone 3: myapp.io ===
        zone3_ns = json.dumps([
            "ns-111.awsdns-99.com",
            "ns-222.awsdns-88.net",
            "ns-333.awsdns-77.org",
            "ns-444.awsdns-66.co.uk",
        ])
        zone3 = HostedZone(
            zone_id="Z5555555555GHI",
            user_id=admin.id,
            name="myapp.io",
            type="Public",
            comment="SaaS application",
            status="Active",
            name_servers=zone3_ns,
        )
        db.add(zone3)
        db.flush()

        z3_ns_list = json.loads(zone3_ns)
        zone3_records = [
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="NS", ttl=172800,
                      value="\n".join(z3_ns_list), routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="SOA", ttl=900,
                      value=f"{z3_ns_list[0]} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
                      routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="A", ttl=300,
                      value="172.16.0.1", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="www.myapp.io", type="CNAME", ttl=300,
                      value="myapp.io", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="api.myapp.io", type="A", ttl=60,
                      value="172.16.0.2", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="MX", ttl=3600,
                      value="aspmx.l.google.com", priority=1, routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="MX", ttl=3600,
                      value="alt1.aspmx.l.google.com", priority=5, routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="TXT", ttl=300,
                      value='"v=spf1 include:_spf.google.com ~all"', routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="myapp.io", type="CAA", ttl=300,
                      value="letsencrypt.org", flag="0", tag="issue", routing_policy="Simple"),
            DNSRecord(hosted_zone_id=zone3.id, name="_sip._tcp.myapp.io", type="SRV", ttl=300,
                      value="sip.myapp.io", priority=10, weight=5, port=5060, routing_policy="Simple"),
        ]
        db.add_all(zone3_records)
        print(f"Created zone: {zone3.name} with {len(zone3_records)} records")

        db.commit()
        print("\n[OK] Database seeded successfully!")
        print(f"   Login: admin@example.com / admin123")
        print(f"   Zones: 3 (example.com, example.org, myapp.io)")
        print(f"   Records: {len(zone1_records) + len(zone2_records) + len(zone3_records)} total")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
