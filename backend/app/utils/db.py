import os
from pymongo import MongoClient

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        # ✅ FIX: Read URI from environment variable — never hardcode credentials.
        # Set MONGO_URI in your backend/.env file (see .env.example for format).
        mongo_uri = os.environ.get(
            "MONGO_URI",
            "mongodb://localhost:27017/smart_opd",  # fallback for local dev only
        )
        _client = MongoClient(mongo_uri)
        _db = _client["smart_opd"]
    return _db