import os
import json
import sys
import subprocess
import time
import uuid
import logging
import html
from collections import defaultdict, deque
from pathlib import Path
from datetime import datetime, timezone
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from database import AsyncSessionLocal, engine
from models import Lead
import cms as content_cms

# --- Configuration & Setup ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

DATA_DIR = Path(os.getenv("LEADS_DATA_DIR", str(ROOT_DIR / "data")))
EMAIL_FAILURES_JSONL = DATA_DIR / "contact_email_failures.jsonl"


def _run_migrations() -> None:
    """Apply pending Alembic migrations at boot (issue #31/#32) - dev, CI, and
    prod all self-provision the schema; there is no separate step to forget."""
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=ROOT_DIR,
        check=True,
    )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _run_migrations()
    await content_cms.ensure_seeded()
    yield
    await engine.dispose()


app = FastAPI(title="Softogram API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")

logger = logging.getLogger("softogram")

# --- Pydantic Models ---

class ContactFormRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(
        min_length=5,
        max_length=20,
        pattern=r"^[+\d][\d\s\-()]{4,19}$",
    )
    service: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=5000)
    # Honeypot (issue #5) — bots fill this; humans leave empty. Do not email/persist if set.
    company_website: str = Field(default="", max_length=200)

    @field_validator("name", "service", "message", "phone", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

class ContactFormResponse(BaseModel):
    status: str
    message: str

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    service: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    storage: str = "pending"  # postgres | failed


# --- Persistence (issue #3) ---

def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _append_jsonl(path: Path, record: dict) -> None:
    _ensure_data_dir()
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
        f.flush()
        os.fsync(f.fileno())


async def persist_contact_submission(submission: ContactSubmission) -> dict:
    """Durably store the lead in Postgres before returning HTTP success (issue #33)."""
    doc = submission.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    doc["storage"] = "postgres"

    async with AsyncSessionLocal() as session:
        session.add(
            Lead(
                id=submission.id,
                name=submission.name,
                email=submission.email,
                phone=submission.phone,
                service=submission.service,
                message=submission.message,
                status="new",
                storage="postgres",
            )
        )
        await session.commit()

    return doc


# --- Helper Functions ---

def _sendgrid_send(mail: Mail) -> bool:
    api_key = os.getenv("SENDGRID_API_KEY")
    if not api_key:
        logging.warning("SendGrid API key not configured.")
        return False
    try:
        sg = SendGridAPIClient(api_key)
        sendgrid_host = os.getenv("SENDGRID_HOST")
        if sendgrid_host:
            sg.client.host = sendgrid_host
        response = sg.send(mail)
        return response.status_code == 202
    except Exception as e:
        logging.error("SendGrid Error: %s", e)
        return False


def send_contact_email(name: str, user_email: str, phone: str, service: str, message: str) -> bool:
    """Send contact form submission via SendGrid (single attempt)."""
    sender_email = os.getenv("SENDER_EMAIL")
    recipient_email = os.getenv("RECIPIENT_EMAIL")

    if not sender_email:
        logging.warning("Verified Sender not configured.")
        return False

    # Escape all user fields for HTML body; strip CR/LF from subject (issue #4).
    safe_name = html.escape(name or "", quote=True)
    safe_email = html.escape(user_email or "", quote=True)
    safe_phone = html.escape(phone or "", quote=True)
    safe_service = html.escape(service or "", quote=True)
    safe_message = html.escape(message or "", quote=True)
    subject_name = (name or "").replace("\r", " ").replace("\n", " ").strip()
    subject = f"New Project Inquiry from {subject_name}"

    html_content = f"""
    <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px;">
                <h2 style="color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Submission</h2>
                <p><strong>Name:</strong> {safe_name}</p>
                <p><strong>Email:</strong> {safe_email}</p>
                <p><strong>Phone:</strong> {safe_phone}</p>
                <p><strong>Interested In:</strong> {safe_service}</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <p style="font-style: italic;">"{safe_message}"</p>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 25px;">Sent via Softogram Backend</p>
            </div>
        </body>
    </html>
    """

    mail = Mail(
        from_email=sender_email,
        to_emails=recipient_email,
        subject=subject,
        html_content=html_content,
    )
    mail.reply_to = user_email
    return _sendgrid_send(mail)


def send_lead_auto_reply(name: str, user_email: str) -> bool:
    """Confirmation email to the lead (issue #11)."""
    sender_email = os.getenv("SENDER_EMAIL")
    if not sender_email or not user_email:
        return False
    safe_name = html.escape(name or "there", quote=True)
    support = os.getenv("RECIPIENT_EMAIL", "support@softogram.in")
    html_content = f"""
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px;">
          <h2 style="color: #0d1117;">We got your message</h2>
          <p>Hi {safe_name},</p>
          <p>Thanks for reaching out to Softogram. We received your inquiry and typically respond within 24 hours.</p>
          <p>If anything is urgent, reply to this email or write to {html.escape(support)}.</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 25px;">— Softogram</p>
        </div>
      </body>
    </html>
    """
    mail = Mail(
        from_email=sender_email,
        to_emails=user_email,
        subject="We received your Softogram inquiry",
        html_content=html_content,
    )
    return _sendgrid_send(mail)


def send_contact_email_with_retries(
    lead_id: str,
    name: str,
    user_email: str,
    phone: str,
    service: str,
    message: str,
    attempts: int = 3,
) -> bool:
    """Retry SendGrid with exponential backoff; alert on final failure; auto-reply on success."""
    for i in range(attempts):
        ok = send_contact_email(name, user_email, phone, service, message)
        if ok:
            logger.info("Contact email sent lead_id=%s attempt=%s", lead_id, i + 1)
            if send_lead_auto_reply(name, user_email):
                logger.info("Lead auto-reply sent lead_id=%s", lead_id)
            else:
                logger.warning("Lead auto-reply failed lead_id=%s", lead_id)
            return True
        if i < attempts - 1:
            time.sleep(0.4 * (2**i))

    failure = {
        "id": lead_id,
        "email": user_email,
        "name": name,
        "service": service,
        "phone": phone,
        "message": message,
        "failed_at": datetime.now(timezone.utc).isoformat(),
        "attempts": attempts,
        "alert": "contact_email_final_failure",
    }
    try:
        _append_jsonl(EMAIL_FAILURES_JSONL, failure)
    except Exception as e:
        logger.error("Could not write email failure log: %s", e)

    logger.error(
        "ALERT contact_email_final_failure lead_id=%s email=%s service=%s attempts=%s",
        lead_id,
        user_email,
        service,
        attempts,
    )
    return False

# --- Rate limiting (issue #5) ---

class ContactRateLimiter:
    """Simple sliding-window limiter: N/minute and M/hour per client key."""

    def __init__(self, per_minute: int, per_hour: int):
        self.per_minute = per_minute
        self.per_hour = per_hour
        self._hits = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.time()
        q = self._hits[key]
        while q and now - q[0] > 3600:
            q.popleft()
        minute_hits = sum(1 for t in q if now - t <= 60)
        if minute_hits >= self.per_minute or len(q) >= self.per_hour:
            return False
        q.append(now)
        return True


_contact_limiter = ContactRateLimiter(
    per_minute=int(os.getenv("CONTACT_RATE_LIMIT_PER_MINUTE", "2")),
    per_hour=int(os.getenv("CONTACT_RATE_LIMIT_PER_HOUR", "5")),
)
# Separate bucket for E2E burst tests (never used in production).
_e2e_strict_limiter = ContactRateLimiter(per_minute=2, per_hour=5)


def _client_key(request: Request) -> str:
    # E2E isolation: optional client id (only when explicitly enabled).
    if os.getenv("ALLOW_E2E_CLIENT_ID") == "1":
        e2e_id = request.headers.get("x-e2e-client-id")
        if e2e_id:
            return f"e2e:{e2e_id}"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _limiter_for(request: Request) -> ContactRateLimiter:
    if (
        os.getenv("ALLOW_E2E_CLIENT_ID") == "1"
        and request.headers.get("x-e2e-strict-limit") == "1"
    ):
        return _e2e_strict_limiter
    return _contact_limiter


# --- API Routes ---

@api_router.get("/")
async def root():
    return {"message": "Softogram API is Live"}

@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(
    body: ContactFormRequest,
    background_tasks: BackgroundTasks,
    request: Request,
):
    """Persist the lead first, then email in the background (with retries)."""
    key = _client_key(request)
    if not _limiter_for(request).allow(key):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
        )

    # Honeypot: pretend success, drop silently (issue #5).
    if (body.company_website or "").strip():
        logger.info("Honeypot tripped; dropping submission key=%s", key)
        return ContactFormResponse(
            status="success",
            message="Thank you! We'll get back to you shortly.",
        )

    try:
        submission = ContactSubmission(
            name=body.name,
            email=str(body.email),
            phone=body.phone,
            service=body.service,
            message=body.message,
        )
        doc = await persist_contact_submission(submission)

        background_tasks.add_task(
            send_contact_email_with_retries,
            doc["id"],
            body.name,
            str(body.email),
            body.phone,
            body.service,
            body.message,
        )

        return ContactFormResponse(
            status="success",
            message="Thank you! We'll get back to you shortly.",
        )
    except Exception as e:
        logging.error("Contact Form Error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process request")

# Legacy template /api/status removed (issue #6).


# --- CMS (issue #17) ---

class AdminLoginRequest(BaseModel):
    password: str = Field(min_length=1, max_length=200)


class AdminLoginResponse(BaseModel):
    token: str
    expires_in: int = content_cms.SESSION_TTL_SEC


class BlogPostModel(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    excerpt: str = Field(default="", max_length=1000)
    content: str = Field(default="", max_length=100_000)
    author: str = Field(default="Softogram Team", max_length=120)
    date: str = Field(default="", max_length=40)
    tags: List[str] = Field(default_factory=list)
    coverImage: str = Field(default="", max_length=500)
    published: bool = True
    readTime: int = Field(default=5, ge=1, le=120)


class ProjectModel(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    client: str = Field(min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=200)
    desc: str = Field(default="", max_length=5000)
    industry: str = Field(default="Other", max_length=80)
    services: List[str] = Field(default_factory=list)
    outcome: str = Field(default="", max_length=2000)
    metrics: List[dict] = Field(default_factory=list)
    img: str = Field(default="", max_length=500)
    year: str = Field(default="", max_length=10)
    published: bool = True
    url: str = Field(default="", max_length=500)


def _require_admin(request: Request) -> None:
    auth = request.headers.get("authorization") or ""
    token = auth[7:].strip() if auth.lower().startswith("bearer ") else ""
    if not content_cms.session_ok(token):
        raise HTTPException(status_code=401, detail="Unauthorized")


@api_router.get("/content/blog")
async def public_blog_list():
    return await content_cms.published_blogs()


@api_router.get("/content/blog/{slug}")
async def public_blog_post(slug: str):
    post = await content_cms.blog_by_slug(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@api_router.get("/content/projects")
async def public_projects():
    return await content_cms.published_projects()


@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(body: AdminLoginRequest):
    if not content_cms.admin_password_ok(body.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    return AdminLoginResponse(token=content_cms.create_session())


@api_router.get("/admin/blog")
async def admin_list_blogs(request: Request):
    _require_admin(request)
    return await content_cms.get_blogs()


@api_router.put("/admin/blog")
async def admin_replace_blogs(request: Request, items: List[BlogPostModel]):
    _require_admin(request)
    return await content_cms.save_blogs([i.model_dump() for i in items])


@api_router.get("/admin/projects")
async def admin_list_projects(request: Request):
    _require_admin(request)
    return await content_cms.get_projects()


@api_router.put("/admin/projects")
async def admin_replace_projects(request: Request, items: List[ProjectModel]):
    _require_admin(request)
    return await content_cms.save_projects([i.model_dump() for i in items])


# --- App Initialization ---

app.include_router(api_router)

# CORS: fail closed. Never default to "*". Production should set
# CORS_ORIGINS=https://softogram.in,https://www.softogram.in
# E2E injects the Playwright frontend origin (see e2e/playwright.config.js).
_DEFAULT_CORS_ORIGINS = "https://softogram.in,https://www.softogram.in"


def _parse_cors_origins(raw):
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    # Guard: a lone "*" with credentials was the old production footgun.
    if not origins or origins == ["*"]:
        return [o.strip() for o in _DEFAULT_CORS_ORIGINS.split(",")]
    return origins


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Baseline API security headers (issue #10)."""
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
    )
    response.headers.setdefault(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()",
    )
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(os.environ.get("CORS_ORIGINS", _DEFAULT_CORS_ORIGINS)),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

logging.basicConfig(level=logging.INFO)

