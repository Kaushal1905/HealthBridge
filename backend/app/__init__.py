from flask import Flask
from flask_cors import CORS
import os

from app.routes.auth_routes import auth_bp
from app.routes.patient_routes import patient_bp
from app.routes.queue_routes import queue_bp
from app.routes.medical_routes import medical_bp
from app.routes.fingerprint_routes import fingerprint_bp
from app.routes.emergency_routes import emergency_bp


def create_app():
    app = Flask(__name__)

    # ✅ CORS FIX:
    # "supports_credentials=True" CANNOT be combined with origins="*".
    # Browsers will block preflight requests if you do that.
    # We list the allowed front-end origin explicitly instead.
    frontend_origin = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    CORS(
        app,
        resources={r"/api/*": {"origins": [frontend_origin, "http://127.0.0.1:3000"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "smart_opd_secret_key_change_in_prod"
    )

    # Register routes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(patient_bp, url_prefix="/api/patients")
    app.register_blueprint(queue_bp, url_prefix="/api/queue")
    app.register_blueprint(medical_bp, url_prefix="/api/medical")
    app.register_blueprint(fingerprint_bp, url_prefix="/api/fingerprint")
    app.register_blueprint(emergency_bp, url_prefix="/api/emergency")

    @app.route("/")
    def home():
        return {"status": "Backend running"}, 200

    return app