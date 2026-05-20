import jwt
import datetime
import uuid
from flask import current_app


def generate_token(user):
    """Generate a JWT token for an authenticated user."""
    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
    }
    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return token


def verify_token(token):
    """Decode and verify a JWT token. Returns payload or None."""
    try:
        decoded = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"],
        )
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_patient_id():
    """Generate a unique patient ID in the format OPD-YYYY-XXXXXX."""
    year = datetime.datetime.utcnow().year
    unique_part = uuid.uuid4().hex[:6].upper()
    return f"OPD-{year}-{unique_part}"
