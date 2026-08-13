# 🌐 AWS Route 53 Console Clone

A full-stack pixel-perfect clone of the **Amazon Route 53** DNS management console. Built with **Next.js 16**, **FastAPI**, **SQLAlchemy**, and **SQLite**, this application mimics the real AWS Cloudscape Console experience—complete with dynamic DNS record validation, BIND zone import/export, and global keyboard shortcuts.

---

## 🚀 Quick Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed initial demo data
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
> Backend API will be available at **`http://localhost:8000`** (Swagger docs at `/docs`).

### 2. Frontend Setup (Next.js)
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
> Open your browser at **`http://localhost:3000`** to access the AWS Console!

---

## 🏗️ Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      Browser Viewport                       │
 │  Next.js 16 App Router (TypeScript + Tailwind CSS)           │
 │  - AWS Cloudscape Header (45px) & Sub-Header Breadcrumbs    │
 │  - Collapsible Sidebar & Full-Width Form Containers          │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP API Requests
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                      FastAPI Backend                        │
 │  - Session Cookie Auth (URLSafeTimedSerializer)             │
 │  - Pydantic Input Validation Engine                         │
 │  - BIND Zone Parser & Serializer (RFC 1035)                 │
 └──────────────────────────────┬──────────────────────────────┘
                                │ SQLAlchemy 2.0 ORM
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                      SQLite Database                        │
 │  `route53.db` (Hosted Zones & 9 DNS Record Types)            │
 └─────────────────────────────────────────────────────────────┘
```

### Key Technical Choices
- **App Layout Engine**: Custom flexbox layout matching AWS Cloudscape (`ml-56` when sidebar is open, `ml-0` when collapsed, white canvas background).
- **DNS Record Engine**: Type-specific input fields for 9 DNS record types (`A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, `PTR`, `SRV`, `CAA`).
- **Session Authentication**: Lightweight IAM mock login with cookie persistence (`route53_session`).

---

## 🗄️ Database Schema

The database uses SQLite (`route53.db`) managed via SQLAlchemy ORM.

### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | User ID |
| `username` | String | Unique, Not Null | Account username |
| `email` | String | Unique, Not Null | User email address |
| `password_hash` | String | Not Null | Hashed password |
| `created_at` | DateTime | Default: UTC | Timestamp created |

### 2. `hosted_zones`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Auto-increment PK |
| `zone_id` | String | Unique, Index | AWS Zone ID (e.g. `Z0123456789ABC`) |
| `name` | String | Not Null | Domain name (e.g. `example.com`) |
| `type` | String | `Public` / `Private` | Hosted zone accessibility |
| `comment` | Text | Optional | Zone description |
| `status` | String | Default: `Active` | Zone health status |
| `name_servers` | Text | JSON String | Assigned AWS Name Servers list |
| `user_id` | Integer | Foreign Key (`users.id`) | Owner user ID |

### 3. `dns_records`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Record ID |
| `hosted_zone_id` | Integer | Foreign Key (`hosted_zones.id`) | Parent zone |
| `name` | String | Not Null | Record domain prefix / FQDN |
| `type` | String | Enum (9 types) | Record type (`A`, `AAAA`, `MX`, etc.) |
| `ttl` | Integer | Default: `300` | Time-to-Live in seconds |
| `value` | Text | Not Null | IP address, target hostname, or text |
| `routing_policy` | String | Default: `Simple` | Traffic routing policy |
| `priority` | Integer | Optional | Mail server priority (MX / SRV) |
| `weight` | Integer | Optional | Weighted routing weight |
| `port` | Integer | Optional | Service port number (SRV) |
| `flag` | String | Optional | CAA Certificate Flag |
| `tag` | String | Optional | CAA Property Tag (`issue`, `iodef`) |

---

## 📡 API Overview

All API endpoints reside under `/api` and return standardized JSON responses.

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user and set session cookie.
- `POST /api/auth/logout` — Clear session cookie.
- `GET /api/auth/me` — Fetch current logged-in account info.

### Hosted Zones (`/api/hosted-zones`)
- `GET /api/hosted-zones` — List hosted zones (supports `page`, `limit`, `search`, `type`).
- `POST /api/hosted-zones` — Create new hosted zone (automatically creates apex `NS` and `SOA` records).
- `GET /api/hosted-zones/{zone_id}` — Get single hosted zone details.
- `PUT /api/hosted-zones/{zone_id}` — Update zone comment or status.
- `DELETE /api/hosted-zones/{zone_id}` — Delete hosted zone and all associated records.
- `POST /api/hosted-zones/bulk-delete` — Batch delete multiple hosted zones.

### DNS Records (`/api/hosted-zones/{zone_id}/records`)
- `GET /api/hosted-zones/{zone_id}/records` — List DNS records for a zone (supports search & filter).
- `POST /api/hosted-zones/{zone_id}/records` — Create DNS record with type validation.
- `GET /api/hosted-zones/{zone_id}/records/{record_id}` — Fetch record details.
- `PUT /api/hosted-zones/{zone_id}/records/{record_id}` — Update DNS record.
- `DELETE /api/hosted-zones/{zone_id}/records/{record_id}` — Delete single record.
- `POST /api/hosted-zones/{zone_id}/records/bulk-delete` — Batch delete selected records.

### BIND Import & Export Features ⭐
- `GET /api/hosted-zones/{zone_id}/export-bind` — Export zone data as an RFC 1035 compliant `.zone` file.
- `POST /api/hosted-zones/{zone_id}/import-bind` — Parse and bulk import records from BIND zone text.

---

## 🌟 Bonus Features Included

1. **🌙 AWS Dark Mode**: Toggle between AWS Console Light and Dark Mode via the top header (`🌙 / ☀️`). Preference is saved to `localStorage`.
2. **📄 BIND Zone File Import & Export**: Full RFC 1035 BIND zone file parser and exporter. One-click `.zone` file download and upload/paste modal to bulk-import DNS records.
3. **📦 Bulk Multi-Select Deletion**: Checkbox multi-select (`[x]` and header "Select All") to batch delete multiple DNS records or hosted zones simultaneously.
4. **⌨️ Global Keyboard Shortcuts**:
   - `Alt + S`: Focus search bar
   - `Shift + N`: Create new hosted zone
   - `Shift + R`: Refresh data table
   - `Esc`: Close open modal windows
   - `?`: Toggle keyboard shortcuts helper modal
5. **💾 JSON Data Export**: One-click JSON backup export for offline record inspection.

---

## 📝 License
This project is open-source and created for learning and demonstration purposes.
