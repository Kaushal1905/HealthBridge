import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart_opd_secret_key_change_in_prod")
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/smart_opd")
