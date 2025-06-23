import jwt
from datetime import datetime, timedelta
import os

SECRET = os.getenv("JWT_SECRET", "super-secret")
ALGO = "HS256"


def create_verification_token(email: str):
    exp = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": email, "exp": exp}, SECRET, algorithm=ALGO)


def decode_verification_token(token: str):
    return jwt.decode(token, SECRET, algorithms=[ALGO])
