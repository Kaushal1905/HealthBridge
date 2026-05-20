from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.db import get_db
import jwt
import os
import datetime

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
        data = request.get_json()

        username = data.get("username", "").strip()
        password = data.get("password", "")
        role = data.get("role", "doctor")

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        if db.users.find_one({"username": username}):
            return jsonify({"message": "User already exists"}), 400

        db.users.insert_one({
            "username": username,
            "password": generate_password_hash(password),
            "role": role,
        })

        return jsonify({"message": "User registered successfully"}), 201

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
