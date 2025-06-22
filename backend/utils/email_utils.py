import os
from dotenv import load_dotenv
from email.message import EmailMessage
import aiosmtplib

load_dotenv()

HOST = os.getenv("EMAIL_HOST")
PORT = int(os.getenv("EMAIL_PORT"))
USER = os.getenv("EMAIL_USER")
PASS = os.getenv("EMAIL_PASS")
VERIF_URL = os.getenv("VERIF_URL")


async def send_verification_email(email: str, token: str):
    msg = EmailMessage()
    msg["From"], msg["To"] = USER, email
    msg["Subject"] = "Verify your email"
    link = f"{VERIF_URL}?token={token}"
    msg.set_content(f"Please verify: {link}")
    await aiosmtplib.send(
        msg, hostname=HOST, port=PORT, start_tls=True, username=USER, password=PASS
    )
