from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.db import get_db
import jwt
import os
import datetime
import requests

auth_bp = Blueprint("auth", __name__)


def _make_token(user, username):
    """Generate a real signed JWT for the given user."""
    secret = os.environ.get("SECRET_KEY", "smart_opd_secret_key_change_in_prod")
    payload = {
        "user_id": str(user["_id"]),
        "username": username,
        "name": username,
        "role": user.get("role", "doctor"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
    }
    return jwt.encode(payload, secret, algorithm="HS256")

# ── REGISTER ──────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        db = get_db()
        data = request.get_json() or {}

        username = data.get("username", "").strip()
        password = data.get("password", "")
        name = data.get("name", "").strip() or username
        email = data.get("email", "").strip()
        role = data.get("role", "doctor")
        department = data.get("department", "General Medicine").strip()

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        if db.users.find_one({"username": username}):
            return jsonify({"message": "Username is already taken"}), 400

        if email and db.users.find_one({"email": email}):
            return jsonify({"message": "Email is already registered"}), 400

        user_doc = {
            "username": username,
            "name": name,
            "email": email,
            "password": generate_password_hash(password),
            "role": role,
            "department": department,
            "created_at": datetime.datetime.utcnow(),
        }

        res = db.users.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id

        # Generate token for instant login upon successful registration
        token = _make_token(user_doc, username)

        return jsonify({
            "message": "Account created successfully",
            "token": token,
            "role": role,
            "name": name,
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ── LOGIN ──────────────────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        db = get_db()
        data = request.get_json()

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        user = db.users.find_one({"username": username})

        password_ok = False
        if user:
            stored = user["password"]
            if stored.startswith("pbkdf2:") or stored.startswith("scrypt:"):
                password_ok = check_password_hash(stored, password)
            else:
                # legacy plain-text accounts
                password_ok = stored == password

        if user and password_ok:
            token = _make_token(user, username)
            return jsonify({
                "message": "Login successful",
                "token": token,
                "role": user.get("role", "doctor"),
                "name": username,
            }), 200

        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ── GOOGLE AUTH ───────────────────────────────────────────────────────────────
@auth_bp.route("/google", methods=["POST"])
def google_auth():
    try:
        data = request.get_json() or {}
        credential = data.get("credential")

        if not credential:
            return jsonify({"message": "Google token missing"}), 400

        # Verify the Google ID token with Google's tokeninfo API
        google_res = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
            timeout=10,
        )

        if google_res.status_code != 200:
            return jsonify({"message": "Invalid Google token"}), 401

        google_user = google_res.json()
        email = google_user.get("email")
        name = google_user.get("name") or email.split("@")[0]

        if not email:
            return jsonify({"message": "Unable to get email from Google"}), 400

        db = get_db()
        user = db.users.find_one({"$or": [{"email": email}, {"username": email}]})

        # If user does not exist yet, auto-create as a doctor
        if not user:
            new_user = {
                "username": email,
                "email": email,
                "name": name,
                "role": "doctor",
                "department": "General Medicine",
                "auth_provider": "google",
                "created_at": datetime.datetime.utcnow(),
            }
            res = db.users.insert_one(new_user)
            new_user["_id"] = res.inserted_id
            user = new_user

        token = _make_token(user, user.get("username", email))

        return jsonify({
            "message": "Google login successful",
            "token": token,
            "role": user.get("role", "doctor"),
            "name": user.get("name", name),
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
