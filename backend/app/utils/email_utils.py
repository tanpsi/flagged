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

VERIFY_URL = f"{BASE_URL}/user/email/verify"


async def send_email(email: EmailMessage):
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
    msg = EmailMessage()
    msg["From"], msg["To"] = SMTP_FROM, user.email
    msg["Subject"] = "Verify your email"
    link = f"{VERIFY_URL}?token={generate_token({'id': user.id, 'email': user.email, 'exp': int((datetime.now() + timedelta(minutes=EMAIL_JWT_EXPIRY)).timestamp())})}"
    msg.set_content(f"Please verify: {link}")
    await send_email(msg)
