from flask import Blueprint, request, jsonify
from app.models.patient_model import PatientModel
from app.utils.token_generator import generate_patient_id
from app.utils.image_processing import save_fingerprint_image
from app.utils.db import get_db
from functools import wraps
import jwt
import os

patient_bp = Blueprint("patients", __name__)
patient_model = PatientModel()


# ── JWT Auth Decorator ─────────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip()
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            secret = os.environ.get("SECRET_KEY", "smart_opd_secret_key_change_in_prod")
            data = jwt.decode(token, secret, algorithms=["HS256"])
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# ── POST /api/patients/register ───────────────────────────────
@patient_bp.route("/register", methods=["POST"])
@token_required
def register_patient():
    try:
        data = request.form.to_dict()

        required = ["full_name", "age", "gender", "contact_number"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        patient_id = generate_patient_id()

        fingerprint_path = None
        if "fingerprint" in request.files:
            file = request.files["fingerprint"]
            if file.filename:
                fingerprint_path = save_fingerprint_image(file, patient_id)
                # ✅ KEY FIX: also store in db.fingerprints so find_best_match() can find it
                db = get_db()
                db.fingerprints.update_one(
                    {"patient_id": patient_id},
                    {"$set": {"patient_id": patient_id, "image_path": fingerprint_path}},
                    upsert=True,
                )

        patient_data = {
            "patient_id": patient_id,
            "full_name": data["full_name"].strip().title(),
            "age": int(data["age"]),
            "gender": data["gender"],
            "blood_group": data.get("blood_group", "Unknown"),
            "contact_number": data["contact_number"],
            "email": data.get("email", ""),
            "address": data.get("address", ""),
            "emergency_contact": data.get("emergency_contact", ""),
            "medical_history": data.get("medical_history", ""),
            "fingerprint_path": fingerprint_path,
            "registered_by": request.current_user.get("user_id"),
        }

        result = patient_model.create_patient(patient_data)
        return jsonify({
            "message": "Patient registered successfully",
            "patient_id": patient_id,
            "full_name": patient_data["full_name"],
            "id": str(result.inserted_id),
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /api/patients ─────────────────────────────────────────
@patient_bp.route("/", methods=["GET"])
@token_required
def get_all_patients():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    skip = (page - 1) * limit

    patients = patient_model.get_all_patients(skip=skip, limit=limit)
    total = patient_model.count_patients()

    return jsonify({
        "patients": patients,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }), 200


# ── GET /api/patients/search ──────────────────────────────────
@patient_bp.route("/search", methods=["GET"])
@token_required
def search_patient():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Search query is required"}), 400

    results = patient_model.search_patients(query)
    return jsonify({"results": results, "count": len(results)}), 200


# ── GET /api/patients/<patient_id> ────────────────────────────
@patient_bp.route("/<patient_id>", methods=["GET"])
@token_required
def get_patient(patient_id):
    patient = patient_model.get_patient_by_id(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(patient), 200


# ── GET /api/patients/<patient_id>/basic ─────────────────────
@patient_bp.route("/<patient_id>/basic", methods=["GET"])
@token_required
def get_patient_basic(patient_id):
    patient = patient_model.get_patient_basic_info(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(patient), 200


# ── PUT /api/patients/<patient_id> ────────────────────────────
@patient_bp.route("/<patient_id>", methods=["PUT"])
@token_required
def update_patient(patient_id):
    update_data = request.get_json()
    if not update_data:
        return jsonify({"error": "No data provided"}), 400

    for field in ["patient_id", "_id", "registered_by"]:
        update_data.pop(field, None)

    updated = patient_model.update_patient(patient_id, update_data)
    if not updated:
        return jsonify({"error": "Patient not found or update failed"}), 404

    return jsonify({"message": "Patient updated successfully"}), 200


# ── DELETE /api/patients/<patient_id> ────────────────────────
@patient_bp.route("/<patient_id>", methods=["DELETE"])
@token_required
def delete_patient(patient_id):
    if request.current_user.get("role") != "admin":
        return jsonify({"error": "Unauthorized: Admins only"}), 403

    deleted = patient_model.delete_patient(patient_id)
    if not deleted:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify({"message": "Patient deleted successfully"}), 200
