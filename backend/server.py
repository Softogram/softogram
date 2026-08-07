import os
import json
import time
import uuid
import logging
import html
from collections import defaultdict, deque
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# --- Configuration & Setup ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

DATA_DIR = Path(os.getenv("LEADS_DATA_DIR", str(ROOT_DIR / "data")))
LEADS_JSONL = DATA_DIR / "contact_leads.jsonl"
EMAIL_FAILURES_JSONL = DATA_DIR / "contact_email_failures.jsonl"

mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
db_name = os.getenv("DB_NAME", "softogram_db")
# Short timeout so a down Mongo cannot hang contact submissions.
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
db = client[db_name]

app = FastAPI(title="Softogram API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger("softogram")

# --- Pydantic Models ---

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    message: str
    # Honeypot (issue #5) — bots fill this; humans leave empty. Do not email/persist if set.
    company_website: str = ""

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
    storage: str = "pending"  # jsonl | mongo+jsonl | mongo | failed


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
    """
    Durably store the lead before returning HTTP success.
    Always write JSONL; also try Mongo (best effort, short timeout).
    """
    doc = submission.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    mongo_ok = False

    try:
        await db.contact_submissions.insert_one({**doc})
        mongo_ok = True
    except Exception as e:
        logger.warning("Mongo contact persist skipped: %s", e)

    doc["storage"] = "mongo+jsonl" if mongo_ok else "jsonl"

    try:
        _append_jsonl(LEADS_JSONL, doc)
    except Exception as e:
        logger.error("Failed to append contact lead JSONL: %s", e)
        raise

    return doc


# --- Helper Functions ---

def send_contact_email(name: str, user_email: str, phone: str, service: str, message: str) -> bool:
    """Send contact form submission via SendGrid (single attempt)."""
    sender_email = os.getenv("SENDER_EMAIL")
    recipient_email = os.getenv("RECIPIENT_EMAIL")
    api_key = os.getenv("SENDGRID_API_KEY")

    if not api_key or not sender_email:
        logging.warning("SendGrid API key or Verified Sender not configured.")
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


def send_contact_email_with_retries(
    lead_id: str,
    name: str,
    user_email: str,
    phone: str,
    service: str,
    message: str,
    attempts: int = 3,
) -> bool:
    """Retry SendGrid with exponential backoff; alert on final failure."""
    for i in range(attempts):
        ok = send_contact_email(name, user_email, phone, service, message)
        if ok:
            logger.info("Contact email sent lead_id=%s attempt=%s", lead_id, i + 1)
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

# (Other status routes kept for your reference)
@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

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


app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(os.environ.get("CORS_ORIGINS", _DEFAULT_CORS_ORIGINS)),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()