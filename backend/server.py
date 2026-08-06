import os
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# --- Configuration & Setup ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (Kept for reference, but usage is commented out below)
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.getenv('DB_NAME', 'softogram_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="Softogram API")
api_router = APIRouter(prefix="/api")

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

# --- Helper Functions ---

def send_contact_email(name: str, user_email: str, phone: str, service: str, message: str):
    """Send contact form submission via SendGrid"""
    # Use your verified email (e.g., your personal Gmail) as the 'from' address
    sender_email = os.getenv('SENDER_EMAIL')
    recipient_email = os.getenv('RECIPIENT_EMAIL')
    api_key = os.getenv('SENDGRID_API_KEY')

    if not api_key or not sender_email:
        logging.warning("SendGrid API key or Verified Sender not configured.")
        return False

    subject = f"🚀 New Project Inquiry from {name}"

    html_content = f"""
    <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px;">
                <h2 style="color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Submission</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {user_email}</p>
                <p><strong>Phone:</strong> {phone}</p>
                <p><strong>Interested In:</strong> {service}</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <p style="font-style: italic;">"{message}"</p>
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
        html_content=html_content
    )

    # Allows you to click 'Reply' and respond directly to the lead
    mail.reply_to = user_email

    try:
        # SENDGRID_HOST lets the e2e suite point sends at a local mock server
        sg = SendGridAPIClient(api_key)
        sendgrid_host = os.getenv('SENDGRID_HOST')
        if sendgrid_host:
            sg.client.host = sendgrid_host
        response = sg.send(mail)
        return response.status_code == 202
    except Exception as e:
        logging.error(f"SendGrid Error: {str(e)}")
        return False

# --- API Routes ---

@api_router.get("/")
async def root():
    return {"message": "Softogram API is Live"}

@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(request: ContactFormRequest, background_tasks: BackgroundTasks):
    """Handles contact form submissions and triggers background email"""
    try:
        # --- MONGODB SAVING COMMENTED OUT AS REQUESTED ---
        """
        submission = ContactSubmission(
            name=request.name,
            email=request.email,
            phone=request.phone,
            service=request.service,
            message=request.message
        )
        doc = submission.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.contact_submissions.insert_one(doc)
        """
        # --------------------------------------------------

        # Trigger background email task
        background_tasks.add_task(
            send_contact_email,
            request.name,
            request.email,
            request.phone,
            request.service,
            request.message
        )

        return ContactFormResponse(
            status="success",
            message="Thank you! We'll get back to you shortly."
        )
    except Exception as e:
        logging.error(f"Contact Form Error: {str(e)}")
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