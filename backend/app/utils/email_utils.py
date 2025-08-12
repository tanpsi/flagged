from datetime import datetime, timedelta
from email.message import EmailMessage
import aiosmtplib

from app.db.models import User as UserDB
from app.utils.JWTmgmt import generate_token
from app.config import (
    BASE_URL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_TLS,
    SMTP_STARTTLS,
    EMAIL_JWT_EXPIRY,
)
FRONTEND_URL='http://localhost:3000/'
VERIFY_URL = f"{BASE_URL}/user/email/verify"
RESET_PASSWORD_URL = f"{FRONTEND_URL}/reset-password"  # Adjust path if needed


async def send_email(email: EmailMessage):
    """Send email using SMTP settings."""
    if SMTP_TLS:
        use_tls = not SMTP_STARTTLS
        start_tls = SMTP_STARTTLS
    else:
        use_tls = start_tls = False

    await aiosmtplib.send(
        email,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USER,
        password=SMTP_PASS,
        use_tls=use_tls,
        start_tls=start_tls,
    )


async def send_verification_email(user: UserDB):
    """Send verification email with JWT token."""
    token = generate_token({
        "id": user.id,
        "email": user.email,
        "exp": int((datetime.now() + timedelta(minutes=EMAIL_JWT_EXPIRY)).timestamp())
    })
    link = f"{VERIFY_URL}?token={token}"

    msg = EmailMessage()
    msg["From"], msg["To"] = SMTP_FROM, user.email
    msg["Subject"] = "Verify your email address"
    msg.set_content(f"Please verify your email by clicking this link: {link}")

    await send_email(msg)


async def send_forgot_password_email(user: UserDB):
    """Send forgot password email with JWT token."""
    token = generate_token({
        "id": user.id,
        "email": user.email,
        "exp": int((datetime.now() + timedelta(minutes=EMAIL_JWT_EXPIRY)).timestamp())
    })
    link = f"{RESET_PASSWORD_URL}?token={token}"

    msg = EmailMessage()
    msg["From"], msg["To"] = SMTP_FROM, user.email
    msg["Subject"] = "Password Reset Request"
    msg.set_content(
        f"We received a request to reset your password.\n\n"
        f"Click the link below to set a new password:\n{link}\n\n"
        f"If you did not request this, please ignore this email."
    )

    await send_email(msg)
