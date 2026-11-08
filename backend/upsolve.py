"""
Upsolve by Softogram: the live DSA coaching batch behind /upsolve (issues #152, #154).

Three public things and one admin tab:

- Demo bookings: the "Book a free demo seat" form. Rate limited, honeypot, one
  booking per phone per demo date.
- Stats: the live counters on the page (demo bookings, seats taken, early-bird
  seats left, days to the next demo). Only paid enrolments count as seats.
- Enrolments and payments through Razorpay. The browser never decides a price:
  this module computes it (early bird while seats remain), creates a Razorpay
  order for exactly that amount, and later checks the payment signature. The
  Razorpay webhook is the source of truth for "paid", so a student who closes
  the tab at the wrong moment still gets their seat.
- Admin: list and update bookings and enrolments.

Glossary, for a reader new to payments:
- Order: a Razorpay record that says "someone intends to pay this much". Created
  by our server before checkout opens.
- Signature: a code Razorpay computes from the order id and payment id using a
  secret only Razorpay and our server know. If it matches, the payment is real.
- Webhook: a message Razorpay's servers send to ours when something happens,
  for example payment.captured. It carries its own signature.
- Paise: one hundredth of a rupee. Razorpay amounts are always in paise.

Everything Razorpay-specific is reachable through RAZORPAY_API_BASE so the e2e
suite can point it at a local mock, exactly as AWS_SES_ENDPOINT_URL does for email.
"""
from __future__ import annotations

import hashlib
import hmac
import html
import json
import logging
import os
import re
from datetime import date, datetime, timedelta, timezone
from typing import Awaitable, Callable, Literal, Optional
from zoneinfo import ZoneInfo

import httpx
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import func, select, text, update
from sqlalchemy.exc import IntegrityError

from database import AsyncSessionLocal
from models import UpsolveDemoBooking, UpsolveEnrolment, UpsolvePaymentEvent

logger = logging.getLogger("softogram.upsolve")

# --- The batch, in numbers. Change here and the page, the prices and the
# counters all follow. Keep in step with softogram-upsolve/README.md. ---

SEATS_TOTAL = 10
EARLY_BIRD_SEATS = 5
FULL_FEE_PAISE = 15_000 * 100
EARLY_FEE_PAISE = 12_000 * 100
BATCH_START = "2026-11-30"
# Demo classes, IST. The page shows only the ones that have not happened yet.
# UPSOLVE_DEMOS_JSON replaces this list without a code change; the e2e suite uses
# it so its tests do not start failing the day after the last real demo.
DEFAULT_DEMOS = [
    {"date": "2026-11-22", "label": "Sunday 22 November, 6 pm"},
    {"date": "2026-11-28", "label": "Saturday 28 November, 6 pm"},
]
IST = ZoneInfo("Asia/Kolkata")
# Any fixed number: it names the Postgres lock that makes selling a seat one at a time.
SEAT_LOCK_KEY = 715_001

BOOKING_STATUSES = {"new", "link_sent", "attended", "not_interested"}
ENROLMENT_STATUSES = {"pending", "paid", "failed", "refunded"}
PLANS = {"full", "instalment"}
LANGUAGES = {"C++", "Java", "Python"}
# A pending order older than this no longer holds an early-bird seat.
PENDING_HOLD = timedelta(minutes=30)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _razorpay_keys() -> tuple[str, str]:
    return os.getenv("RAZORPAY_KEY_ID", "").strip(), os.getenv("RAZORPAY_KEY_SECRET", "").strip()


def payments_enabled() -> bool:
    key_id, secret = _razorpay_keys()
    return bool(key_id and secret)


def _razorpay_base() -> str:
    return os.getenv("RAZORPAY_API_BASE", "https://api.razorpay.com").rstrip("/")


def normalise_phone(raw: str) -> str:
    """Return a 10-digit Indian mobile number, or raise ValueError.

    Accepts "+91 98765 43210", "098765 43210", "9876543210" and the like.
    """
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 10 or digits[0] not in "6789":
        raise ValueError("Enter a 10-digit Indian mobile number")
    return digits


def _upcoming_demos() -> list[dict]:
    raw = os.getenv("UPSOLVE_DEMOS_JSON", "").strip()
    demos = json.loads(raw) if raw else DEFAULT_DEMOS
    today = datetime.now(IST).date()
    return [
        {**d, "daysLeft": (date.fromisoformat(d["date"]) - today).days}
        for d in demos
        if date.fromisoformat(d["date"]) >= today
    ]


# --- Request and response shapes ---


class DemoBookingCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=20)
    college: str = Field(default="", max_length=120)
    year: str = Field(default="", max_length=40)
    demo_date: str = Field(min_length=10, max_length=10)
    # Honeypot, same pattern as the contact and newsletter forms.
    company_website: str = Field(default="", max_length=200)

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        return normalise_phone(v)

    @field_validator("demo_date")
    @classmethod
    def demo_valid(cls, v: str) -> str:
        if v not in {d["date"] for d in _upcoming_demos()}:
            raise ValueError("Pick one of the upcoming demo dates")
        return v


class EnrolmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=20)
    email: EmailStr
    college: str = Field(default="", max_length=120)
    language: str = Field(default="C++", max_length=20)
    plan: str = Field(default="full", max_length=20)
    company_website: str = Field(default="", max_length=200)

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        return normalise_phone(v)

    @field_validator("language")
    @classmethod
    def language_valid(cls, v: str) -> str:
        if v not in LANGUAGES:
            raise ValueError(f"language must be one of {sorted(LANGUAGES)}")
        return v

    @field_validator("plan")
    @classmethod
    def plan_valid(cls, v: str) -> str:
        if v not in PLANS:
            raise ValueError(f"plan must be one of {sorted(PLANS)}")
        return v


class AdminEnrolmentCreate(BaseModel):
    """A student who enrols over WhatsApp: send them a payment link, or record a
    UPI transfer that has already arrived."""

    method: Literal["link", "manual"]
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    college: str = Field(default="", max_length=120)
    language: str = Field(default="C++", max_length=20)
    plan: str = Field(default="full", max_length=20)

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        return normalise_phone(v)

    @field_validator("language")
    @classmethod
    def language_valid(cls, v: str) -> str:
        if v not in LANGUAGES:
            raise ValueError(f"language must be one of {sorted(LANGUAGES)}")
        return v

    @field_validator("plan")
    @classmethod
    def plan_valid(cls, v: str) -> str:
        if v not in PLANS:
            raise ValueError(f"plan must be one of {sorted(PLANS)}")
        return v


class SecondInstalmentCreate(BaseModel):
    method: Literal["link", "manual"]


class EnrolmentVerify(BaseModel):
    razorpay_order_id: str = Field(min_length=1, max_length=64)
    razorpay_payment_id: str = Field(min_length=1, max_length=64)
    razorpay_signature: str = Field(min_length=1, max_length=256)


class BookingUpdate(BaseModel):
    status: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in BOOKING_STATUSES:
            raise ValueError(f"status must be one of {sorted(BOOKING_STATUSES)}")
        return v


class EnrolmentUpdate(BaseModel):
    status: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ENROLMENT_STATUSES:
            raise ValueError(f"status must be one of {sorted(ENROLMENT_STATUSES)}")
        return v


# --- Serialisers ---


def _booking_to_dict(row: UpsolveDemoBooking) -> dict:
    return {
        "id": row.id,
        "name": row.name,
        "phone": row.phone,
        "college": row.college,
        "year": row.year,
        "demoDate": row.demo_date,
        "status": row.status,
        "notes": row.notes,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


def _enrolment_to_dict(row: UpsolveEnrolment) -> dict:
    return {
        "id": row.id,
        "receipt": f"UPS-{row.id:04d}",
        "name": row.name,
        "phone": row.phone,
        "email": row.email,
        "college": row.college,
        "language": row.language,
        "plan": row.plan,
        "earlyBird": row.early_bird,
        "instalmentNo": row.instalment_no,
        "amountPaise": row.amount_paise,
        "amountRupees": row.amount_paise // 100,
        "currency": row.currency,
        "razorpayOrderId": row.razorpay_order_id,
        "razorpayPaymentId": row.razorpay_payment_id,
        "paymentLinkUrl": row.payment_link_url,
        "status": row.status,
        "source": row.source,
        "notes": row.notes,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
        "paidAt": row.paid_at.isoformat() if row.paid_at else None,
    }


# --- Seat arithmetic ---


async def _seat_counts(session) -> dict:
    """Seats and early-bird seats, counting paid first payments plus pending
    first payments younger than PENDING_HOLD (a checkout in progress holds a seat
    for half an hour so two students cannot both be sold the last early seat)."""
    hold_since = _utcnow() - PENDING_HOLD
    paid_seats = (
        await session.execute(
            select(func.count()).select_from(UpsolveEnrolment).where(
                UpsolveEnrolment.status == "paid", UpsolveEnrolment.instalment_no == 1
            )
        )
    ).scalar_one()
    paid_early = (
        await session.execute(
            select(func.count()).select_from(UpsolveEnrolment).where(
                UpsolveEnrolment.status == "paid",
                UpsolveEnrolment.instalment_no == 1,
                UpsolveEnrolment.early_bird.is_(True),
            )
        )
    ).scalar_one()
    held_seats = (
        await session.execute(
            select(func.count()).select_from(UpsolveEnrolment).where(
                UpsolveEnrolment.status == "pending",
                UpsolveEnrolment.instalment_no == 1,
                UpsolveEnrolment.created_at >= hold_since,
            )
        )
    ).scalar_one()
    held_early = (
        await session.execute(
            select(func.count()).select_from(UpsolveEnrolment).where(
                UpsolveEnrolment.status == "pending",
                UpsolveEnrolment.instalment_no == 1,
                UpsolveEnrolment.early_bird.is_(True),
                UpsolveEnrolment.created_at >= hold_since,
            )
        )
    ).scalar_one()
    collected = (
        await session.execute(
            select(func.coalesce(func.sum(UpsolveEnrolment.amount_paise), 0)).where(
                UpsolveEnrolment.status == "paid"
            )
        )
    ).scalar_one()
    return {
        "paidSeats": int(paid_seats),
        "heldSeats": int(held_seats),
        "paidEarly": int(paid_early),
        "earlyLeftToSell": max(0, EARLY_BIRD_SEATS - int(paid_early) - int(held_early)),
        "earlyLeftPublic": max(0, EARLY_BIRD_SEATS - int(paid_early)),
        "collectedPaise": int(collected),
    }


def price_for(plan: str, early_bird: bool) -> int:
    fee = EARLY_FEE_PAISE if early_bird else FULL_FEE_PAISE
    return fee // 2 if plan == "instalment" else fee


# --- Razorpay HTTP ---


async def _create_razorpay_order(amount_paise: int, receipt: str, notes: dict) -> str:
    key_id, secret = _razorpay_keys()
    async with httpx.AsyncClient(timeout=15.0, auth=(key_id, secret)) as client:
        resp = await client.post(
            f"{_razorpay_base()}/v1/orders",
            json={"amount": amount_paise, "currency": "INR", "receipt": receipt, "notes": notes},
        )
    if resp.status_code >= 300:
        logger.error("Razorpay order creation failed: %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="Payment service is unavailable. Try again in a minute.")
    order_id = resp.json().get("id")
    if not order_id:
        raise HTTPException(status_code=502, detail="Payment service returned no order id")
    return order_id


async def _create_razorpay_link(row: UpsolveEnrolment, description: str) -> tuple[str, str]:
    """Create a hosted payment page for this row; return (link id, short url)."""
    key_id, secret = _razorpay_keys()
    customer = {"name": row.name, "contact": f"+91{row.phone}"}
    if row.email:
        customer["email"] = row.email
    async with httpx.AsyncClient(timeout=15.0, auth=(key_id, secret)) as client:
        resp = await client.post(
            f"{_razorpay_base()}/v1/payment_links",
            json={
                "amount": row.amount_paise,
                "currency": "INR",
                "accept_partial": False,
                "reference_id": f"UPS-{row.id:04d}",
                "description": description,
                "customer": customer,
                # Saurabh sends the link on WhatsApp himself.
                "notify": {"sms": False, "email": False},
                "reminder_enable": False,
                "notes": {"enrolment_id": str(row.id)},
            },
        )
    if resp.status_code >= 300:
        logger.error("Razorpay payment link failed: %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="Payment service is unavailable. Try again in a minute.")
    data = resp.json()
    if not data.get("id") or not data.get("short_url"):
        raise HTTPException(status_code=502, detail="Payment service returned no link")
    return data["id"], data["short_url"]


def _signature_ok(secret: str, message: bytes, given: str) -> bool:
    expected = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, (given or "").strip())


# --- Emails ---

SendEmail = Callable[..., bool]


def _receipt_html(row: UpsolveEnrolment) -> str:
    amount = f"Rs {row.amount_paise // 100:,}"
    plan = "full fee" if row.plan == "full" else f"instalment {row.instalment_no} of 2"
    early = " (early bird)" if row.early_bird else ""
    return f"""
    <html><body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px;">
        <h2 style="color: #0d1117; margin-top: 0;">Upsolve by Softogram: receipt UPS-{row.id:04d}</h2>
        <p>Hi {html.escape(row.name)}, your payment is received. You are in.</p>
        <table style="border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Amount</td><td style="padding: 4px 0;"><strong>{amount}</strong></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Plan</td><td style="padding: 4px 0;">College batch, {plan}{early}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Payment id</td><td style="padding: 4px 0;">{html.escape(row.razorpay_payment_id or "recorded by hand")}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Batch starts</td><td style="padding: 4px 0;">Monday 30 November 2026, 7 pm, Google Meet</td></tr>
        </table>
        <p style="margin-top: 18px;">Within an hour I add you to the batch WhatsApp group and the private Codeforces group. Before 30 November you get the week 1 sheet and the Meet link.</p>
        <p style="font-size: 13px; color: #666;">Refund rule: full refund if you leave before the 3rd class. After that, the only refund is the Upsolve guarantee. Fees are collected by Saurabh Mishra as an individual tutor; this receipt carries his name.</p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 25px;">Upsolve is a Softogram initiative. support@softogram.in</p>
      </div>
    </body></html>
    """


def _send_receipt(send_email: SendEmail, row: UpsolveEnrolment) -> None:
    sender = os.getenv("SENDER_EMAIL")
    if not sender:
        return
    subject = f"Upsolve receipt UPS-{row.id:04d}: Rs {row.amount_paise // 100:,} received"
    if row.email:
        send_email(sender, row.email, subject, _receipt_html(row))
    recipient = os.getenv("RECIPIENT_EMAIL")
    if recipient:
        send_email(
            sender,
            recipient,
            f"[Upsolve] paid: {row.name}, {subject}",
            f"<p>{html.escape(row.name)} ({row.phone}, {html.escape(row.email)}) paid Rs {row.amount_paise // 100:,} "
            f"for plan {row.plan}{' early bird' if row.early_bird else ''}, instalment {row.instalment_no}. "
            f"Payment {html.escape(row.razorpay_payment_id or '-')}. Add them to the batch groups.</p>",
            reply_to=row.email or None,
        )


def _send_booking_alert(send_email: SendEmail, row: UpsolveDemoBooking) -> None:
    sender = os.getenv("SENDER_EMAIL")
    recipient = os.getenv("RECIPIENT_EMAIL")
    if not sender or not recipient:
        return
    send_email(
        sender,
        recipient,
        f"[Upsolve] demo booking: {row.name} for {row.demo_date}",
        f"<p>{html.escape(row.name)} ({row.phone}) booked the demo on {row.demo_date}. "
        f"College: {html.escape(row.college or '-')}, year: {html.escape(row.year or '-')}. "
        f"Send the Meet link on WhatsApp and mark the booking as link_sent in /admin.</p>",
    )


# --- Marking paid, shared by the verify endpoint and the webhook ---


async def _mark_paid(session, row: UpsolveEnrolment, payment_id: str) -> bool:
    """Return True if this call moved the row to paid (so a receipt is owed)."""
    if row.status in {"paid", "refunded"}:
        return False
    row.status = "paid"
    # "or None", because a hand-recorded payment has no id and the column is unique.
    row.razorpay_payment_id = row.razorpay_payment_id or (payment_id or None)
    row.paid_at = _utcnow()
    await session.commit()
    return True


async def _reserve_seat(
    session,
    *,
    name: str,
    phone: str,
    email: str,
    college: str,
    language: str,
    plan: str,
    source: str,
) -> UpsolveEnrolment:
    """Decide the price and hold a seat, one request at a time.

    The Postgres advisory lock is held until this function commits, so two
    students pressing Pay in the same moment cannot both be given the last seat
    or the last early-bird price.
    """
    await session.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": SEAT_LOCK_KEY})
    already_paid = await session.execute(
        select(UpsolveEnrolment.id)
        .where(
            UpsolveEnrolment.phone == phone,
            UpsolveEnrolment.status == "paid",
            UpsolveEnrolment.instalment_no == 1,
        )
        .limit(1)
    )
    if already_paid.first() is not None:
        raise HTTPException(
            status_code=409,
            detail="This WhatsApp number already has a seat. Message +91 63601 58761 if that looks wrong.",
        )
    # A retry replaces this student's own unpaid attempt, so one person never
    # holds two seats. If the old checkout still completes, the webhook honours it.
    await session.execute(
        update(UpsolveEnrolment)
        .where(
            UpsolveEnrolment.phone == phone,
            UpsolveEnrolment.status == "pending",
            UpsolveEnrolment.instalment_no == 1,
        )
        .values(status="failed", notes="replaced by a newer attempt")
    )
    seats = await _seat_counts(session)
    if seats["paidSeats"] + seats["heldSeats"] >= SEATS_TOTAL:
        raise HTTPException(status_code=409, detail="The batch is full. Message +91 63601 58761 for the waitlist.")
    early = seats["earlyLeftToSell"] > 0
    row = UpsolveEnrolment(
        name=name,
        phone=phone,
        email=email,
        college=college,
        language=language,
        plan=plan,
        early_bird=early,
        instalment_no=1,
        amount_paise=price_for(plan, early),
        source=source,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


def _describe(row: UpsolveEnrolment) -> str:
    part = "full fee" if row.plan == "full" else f"instalment {row.instalment_no} of 2"
    return f"Upsolve college batch, {'early bird, ' if row.early_bird else ''}{part}"


async def _give_up_on(enrolment_id: int) -> None:
    """Razorpay could not start this payment, so stop holding the seat."""
    async with AsyncSessionLocal() as session:
        row = await session.get(UpsolveEnrolment, enrolment_id)
        if row is not None and row.status == "pending":
            row.status = "failed"
            row.notes = "payment service error"
            await session.commit()


# --- Router ---


def build_router(
    *,
    require_admin: Callable[[Request], Awaitable[None]],
    client_key: Callable[[Request], str],
    limiter,
    send_email: SendEmail,
) -> APIRouter:
    """Build the Upsolve routes with the app's own admin guard, client key,
    rate limiter and email sender, so this module never imports server.py."""
    router = APIRouter()

    # ----- public -----

    @router.get("/upsolve/stats")
    async def stats():
        async with AsyncSessionLocal() as session:
            bookings = (
                await session.execute(select(func.count()).select_from(UpsolveDemoBooking))
            ).scalar_one()
            seats = await _seat_counts(session)
        early_active = seats["earlyLeftToSell"] > 0
        upcoming = _upcoming_demos()
        return {
            "demoBookings": int(bookings),
            "seatsTaken": seats["paidSeats"],
            "seatsTotal": SEATS_TOTAL,
            "seatsLeft": max(0, SEATS_TOTAL - seats["paidSeats"]),
            "earlyBirdLeft": seats["earlyLeftPublic"],
            "earlyBirdTotal": EARLY_BIRD_SEATS,
            "earlyBirdActive": early_active,
            "nextDemo": upcoming[0] if upcoming else None,
            "demos": upcoming,
            "batchStart": BATCH_START,
            "paymentsEnabled": payments_enabled(),
            "fees": {
                "fullRupees": FULL_FEE_PAISE // 100,
                "earlyRupees": EARLY_FEE_PAISE // 100,
                "instalmentFullRupees": FULL_FEE_PAISE // 200,
                "instalmentEarlyRupees": EARLY_FEE_PAISE // 200,
            },
        }

    @router.post("/upsolve/demo-bookings")
    async def create_demo_booking(body: DemoBookingCreate, background: BackgroundTasks, request: Request):
        key = f"upsolve-demo:{client_key(request)}"
        if not limiter.allow(key):
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        if (body.company_website or "").strip():
            logger.info("Upsolve demo honeypot tripped; dropping key=%s", key)
            return {"status": "success", "message": "Seat booked. The Meet link comes on WhatsApp within a day."}
        async with AsyncSessionLocal() as session:
            existing = (
                await session.execute(
                    select(UpsolveDemoBooking).where(
                        UpsolveDemoBooking.phone == body.phone,
                        UpsolveDemoBooking.demo_date == body.demo_date,
                    )
                )
            ).scalar_one_or_none()
            if existing is not None:
                return {
                    "status": "success",
                    "message": "You already have a seat for this demo. The link comes on WhatsApp within a day.",
                    "alreadyBooked": True,
                }
            row = UpsolveDemoBooking(
                name=body.name.strip(),
                phone=body.phone,
                college=body.college.strip(),
                year=body.year.strip(),
                demo_date=body.demo_date,
            )
            session.add(row)
            await session.commit()
            await session.refresh(row)
        background.add_task(_send_booking_alert, send_email, row)
        return {
            "status": "success",
            "message": "Seat booked. The Meet link comes on WhatsApp within a day.",
            "alreadyBooked": False,
        }

    @router.post("/upsolve/enrolments")
    async def create_enrolment(body: EnrolmentCreate, request: Request):
        key = f"upsolve-enrol:{client_key(request)}"
        if not limiter.allow(key):
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        if (body.company_website or "").strip():
            logger.info("Upsolve enrol honeypot tripped; dropping key=%s", key)
            raise HTTPException(status_code=400, detail="Could not start the payment")
        if not payments_enabled():
            raise HTTPException(
                status_code=503,
                detail="Online payment is not open yet. Message +91 63601 58761 on WhatsApp for a payment link.",
            )
        async with AsyncSessionLocal() as session:
            row = await _reserve_seat(
                session,
                name=body.name.strip(),
                phone=body.phone,
                email=str(body.email).strip().lower(),
                college=body.college.strip(),
                language=body.language,
                plan=body.plan,
                source="site",
            )
        receipt = f"UPS-{row.id:04d}"
        try:
            order_id = await _create_razorpay_order(
                row.amount_paise,
                receipt,
                {
                    "enrolment_id": str(row.id),
                    "plan": row.plan,
                    "early_bird": str(row.early_bird).lower(),
                    "phone": row.phone,
                },
            )
        except Exception:
            await _give_up_on(row.id)
            raise
        async with AsyncSessionLocal() as session:
            stored = await session.get(UpsolveEnrolment, row.id)
            stored.razorpay_order_id = order_id
            await session.commit()
        key_id, _ = _razorpay_keys()
        return {
            "enrolmentId": row.id,
            "receipt": receipt,
            "orderId": order_id,
            "amountPaise": row.amount_paise,
            "amountRupees": row.amount_paise // 100,
            "currency": "INR",
            "keyId": key_id,
            "plan": row.plan,
            "earlyBird": row.early_bird,
            "description": _describe(row),
            "prefill": {"name": row.name, "email": row.email, "contact": f"+91{row.phone}"},
        }

    @router.post("/upsolve/enrolments/{enrolment_id}/verify")
    async def verify_enrolment(enrolment_id: int, body: EnrolmentVerify, background: BackgroundTasks):
        _, secret = _razorpay_keys()
        if not secret:
            raise HTTPException(status_code=503, detail="Online payment is not open yet.")
        async with AsyncSessionLocal() as session:
            row = await session.get(UpsolveEnrolment, enrolment_id)
            if row is None or row.razorpay_order_id != body.razorpay_order_id:
                raise HTTPException(status_code=404, detail="Enrolment not found")
            message = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode("utf-8")
            if not _signature_ok(secret, message, body.razorpay_signature):
                logger.warning("Upsolve payment signature mismatch for enrolment %s", enrolment_id)
                raise HTTPException(status_code=400, detail="Payment could not be verified")
            newly_paid = await _mark_paid(session, row, body.razorpay_payment_id)
            seats = await _seat_counts(session)
        if newly_paid:
            background.add_task(_send_receipt, send_email, row)
        out = _enrolment_to_dict(row)
        out["seatNumber"] = seats["paidSeats"]
        out["seatsTotal"] = SEATS_TOTAL
        return out

    @router.post("/upsolve/razorpay/webhook")
    async def razorpay_webhook(request: Request, background: BackgroundTasks):
        secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "").strip()
        if not secret:
            raise HTTPException(status_code=503, detail="Webhook secret not configured")
        raw = await request.body()
        if not _signature_ok(secret, raw, request.headers.get("x-razorpay-signature", "")):
            raise HTTPException(status_code=400, detail="Bad signature")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Bad payload")
        event = str(payload.get("event", ""))[:60]
        event_id = (request.headers.get("x-razorpay-event-id") or "").strip()[:64]
        if not event_id:
            # Older deliveries without the header: derive a stable id from the body.
            event_id = hashlib.sha256(raw).hexdigest()[:64]

        receipt_for: Optional[UpsolveEnrolment] = None
        async with AsyncSessionLocal() as session:
            seen = (
                await session.execute(select(UpsolvePaymentEvent).where(UpsolvePaymentEvent.event_id == event_id))
            ).scalar_one_or_none()
            if seen is not None:
                return {"status": "ok", "duplicate": True}
            session.add(UpsolvePaymentEvent(event_id=event_id, event=event, payload=payload))
            try:
                await session.commit()
            except IntegrityError:
                # Two deliveries of one event raced; the other one is applying it.
                await session.rollback()
                return {"status": "ok", "duplicate": True}

            entity = ((payload.get("payload") or {}).get("payment") or {}).get("entity") or {}
            if event in {"payment.captured", "payment.failed"}:
                order_id = entity.get("order_id")
                payment_id = entity.get("id")
                row = None
                if order_id:
                    row = (
                        await session.execute(
                            select(UpsolveEnrolment).where(UpsolveEnrolment.razorpay_order_id == order_id)
                        )
                    ).scalar_one_or_none()
                if row is None:
                    # A payment link paid from WhatsApp, or something unexpected: kept in
                    # upsolve_payment_events for the admin to match by hand.
                    logger.info("Upsolve webhook %s with no matching order %s", event, order_id)
                    return {"status": "ok", "matched": False}
                if event == "payment.captured":
                    if await _mark_paid(session, row, payment_id):
                        receipt_for = row
                elif row.status == "pending":
                    row.status = "failed"
                    await session.commit()
            elif event == "payment_link.paid":
                link = ((payload.get("payload") or {}).get("payment_link") or {}).get("entity") or {}
                row = (
                    await session.execute(
                        select(UpsolveEnrolment).where(UpsolveEnrolment.razorpay_link_id == link.get("id"))
                    )
                ).scalar_one_or_none()
                if row is None:
                    logger.info("Upsolve payment link %s has no matching enrolment", link.get("id"))
                    return {"status": "ok", "matched": False}
                if await _mark_paid(session, row, entity.get("id")):
                    receipt_for = row
            elif event == "refund.processed":
                refund = ((payload.get("payload") or {}).get("refund") or {}).get("entity") or {}
                payment_id = refund.get("payment_id")
                if payment_id:
                    row = (
                        await session.execute(
                            select(UpsolveEnrolment).where(UpsolveEnrolment.razorpay_payment_id == payment_id)
                        )
                    ).scalar_one_or_none()
                    if row is not None:
                        row.status = "refunded"
                        await session.commit()
        if receipt_for is not None:
            background.add_task(_send_receipt, send_email, receipt_for)
        return {"status": "ok", "matched": True}

    # ----- admin -----

    @router.get("/admin/upsolve/bookings")
    async def admin_list_bookings(request: Request):
        await require_admin(request)
        async with AsyncSessionLocal() as session:
            rows = (
                await session.execute(select(UpsolveDemoBooking).order_by(UpsolveDemoBooking.created_at.desc()))
            ).scalars().all()
            return [_booking_to_dict(r) for r in rows]

    @router.patch("/admin/upsolve/bookings/{booking_id}")
    async def admin_update_booking(booking_id: int, body: BookingUpdate, request: Request):
        await require_admin(request)
        async with AsyncSessionLocal() as session:
            row = await session.get(UpsolveDemoBooking, booking_id)
            if row is None:
                raise HTTPException(status_code=404, detail="Booking not found")
            if body.status is not None:
                row.status = body.status
            if body.notes is not None:
                row.notes = body.notes
            await session.commit()
            return _booking_to_dict(row)

    @router.get("/admin/upsolve/enrolments")
    async def admin_list_enrolments(request: Request):
        await require_admin(request)
        async with AsyncSessionLocal() as session:
            rows = (
                await session.execute(select(UpsolveEnrolment).order_by(UpsolveEnrolment.created_at.desc()))
            ).scalars().all()
            seats = await _seat_counts(session)
            return {
                "items": [_enrolment_to_dict(r) for r in rows],
                "seatsTaken": seats["paidSeats"],
                "seatsTotal": SEATS_TOTAL,
                "earlyBirdLeft": seats["earlyLeftPublic"],
                "collectedRupees": seats["collectedPaise"] // 100,
            }

    async def _finish_admin_payment(row_id: int, method: str, background: BackgroundTasks) -> dict:
        """A new row exists; either record it as paid or create its payment link."""
        async with AsyncSessionLocal() as session:
            row = await session.get(UpsolveEnrolment, row_id)
            if method == "manual":
                row.source = "manual"
                await _mark_paid(session, row, "")
                background.add_task(_send_receipt, send_email, row)
                return _enrolment_to_dict(row)
        try:
            link_id, url = await _create_razorpay_link(row, _describe(row))
        except Exception:
            await _give_up_on(row_id)
            raise
        async with AsyncSessionLocal() as session:
            row = await session.get(UpsolveEnrolment, row_id)
            row.razorpay_link_id = link_id
            row.payment_link_url = url
            row.source = "link"
            await session.commit()
            return _enrolment_to_dict(row)

    @router.post("/admin/upsolve/enrolments")
    async def admin_create_enrolment(body: AdminEnrolmentCreate, request: Request, background: BackgroundTasks):
        await require_admin(request)
        if body.method == "link" and not payments_enabled():
            raise HTTPException(status_code=503, detail="Razorpay keys are not set on the server yet.")
        async with AsyncSessionLocal() as session:
            row = await _reserve_seat(
                session,
                name=body.name.strip(),
                phone=body.phone,
                email=str(body.email).strip().lower() if body.email else "",
                college=body.college.strip(),
                language=body.language,
                plan=body.plan,
                source=body.method,
            )
        return await _finish_admin_payment(row.id, body.method, background)

    @router.post("/admin/upsolve/enrolments/{enrolment_id}/second-instalment")
    async def admin_second_instalment(
        enrolment_id: int, body: SecondInstalmentCreate, request: Request, background: BackgroundTasks
    ):
        await require_admin(request)
        if body.method == "link" and not payments_enabled():
            raise HTTPException(status_code=503, detail="Razorpay keys are not set on the server yet.")
        async with AsyncSessionLocal() as session:
            first = await session.get(UpsolveEnrolment, enrolment_id)
            if first is None:
                raise HTTPException(status_code=404, detail="Enrolment not found")
            if first.plan != "instalment" or first.instalment_no != 1 or first.status != "paid":
                raise HTTPException(status_code=409, detail="Only a paid first instalment has a second one")
            existing = (
                await session.execute(
                    select(UpsolveEnrolment).where(
                        UpsolveEnrolment.phone == first.phone,
                        UpsolveEnrolment.instalment_no == 2,
                        UpsolveEnrolment.status.in_(["pending", "paid"]),
                    )
                )
            ).scalars().first()
            if existing is not None and (existing.status == "paid" or body.method == "link"):
                # Pressing the button twice returns the same link, never a second charge.
                return _enrolment_to_dict(existing)
            if existing is not None:
                row_id = existing.id
            else:
                second = UpsolveEnrolment(
                    name=first.name,
                    phone=first.phone,
                    email=first.email,
                    college=first.college,
                    language=first.language,
                    plan=first.plan,
                    early_bird=first.early_bird,
                    instalment_no=2,
                    amount_paise=first.amount_paise,
                    source=body.method,
                )
                session.add(second)
                await session.commit()
                await session.refresh(second)
                row_id = second.id
        return await _finish_admin_payment(row_id, body.method, background)

    @router.patch("/admin/upsolve/enrolments/{enrolment_id}")
    async def admin_update_enrolment(enrolment_id: int, body: EnrolmentUpdate, request: Request, background: BackgroundTasks):
        """Hand corrections: record a UPI transfer as paid, or a refund done outside
        the dashboard. Razorpay-driven changes arrive through the webhook."""
        await require_admin(request)
        receipt_owed = False
        async with AsyncSessionLocal() as session:
            row = await session.get(UpsolveEnrolment, enrolment_id)
            if row is None:
                raise HTTPException(status_code=404, detail="Enrolment not found")
            if body.notes is not None:
                row.notes = body.notes
            if body.status is not None and body.status != row.status:
                if body.status == "paid":
                    receipt_owed = await _mark_paid(session, row, row.razorpay_payment_id or "")
                    if row.source == "site" and not row.razorpay_payment_id:
                        row.source = "manual"
                else:
                    row.status = body.status
            await session.commit()
            out = _enrolment_to_dict(row)
        if receipt_owed:
            background.add_task(_send_receipt, send_email, row)
        return out

    return router
