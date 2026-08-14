import os

# App settings
SECRET_KEY = os.getenv("SECRET_KEY", "route53-clone-super-secret-key-change-in-production")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./route53.db")
COOKIE_NAME = "route53_session"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days

raw_origins = os.getenv("CORS_ORIGINS", "")
if raw_origins:
    CORS_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
