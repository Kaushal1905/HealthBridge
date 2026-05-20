import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.services.fingerprint_service import find_best_match
from app.utils.db import get_db

fingerprint_bp = Blueprint("fingerprint", __name__)

FINGERPRINT_DATA_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "fingerprint_data")
)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "tif", "tiff"}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _save_uploaded_file(file) -> str:
    os.makedirs(FINGERPRINT_DATA_DIR, exist_ok=True)
    ext = secure_filename(file.filename).rsplit(".", 1)[-1]
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(FINGERPRINT_DATA_DIR, unique_name)
    file.save(save_path)
    return save_path


@fingerprint_bp.route("/upload-fingerprint", methods=["POST"])
def upload_fingerprint():
    patient_id = request.form.get("patient_id", "").strip()
    if not patient_id:
        return jsonify({"success": False, "message": "patient_id is required."}), 400

    if "fingerprint" not in request.files:
        return jsonify({"success": False, "message": "No fingerprint file provided."}), 400

    file = request.files["fingerprint"]
    if file.filename == "":
        return jsonify({"success": False, "message": "Empty filename."}), 400

    if not _allowed_file(file.filename):
        return jsonify({"success": False, "message": f"File type not allowed. Use: {ALLOWED_EXTENSIONS}"}), 400

    try:
        image_path = _save_uploaded_file(file)
        db = get_db()
        db.fingerprints.update_one(
            {"patient_id": patient_id},
            {"$set": {"patient_id": patient_id, "image_path": image_path}},
            upsert=True,
        )
        return jsonify({
            "success": True,
            "message": "Fingerprint uploaded and stored successfully.",
            "patient_id": patient_id,
            "image_path": image_path,
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500


@fingerprint_bp.route("/match-fingerprint", methods=["POST"])
def match_fingerprint():
    if "fingerprint" not in request.files:
        return jsonify({"success": False, "message": "No fingerprint file provided."}), 400

    file = request.files["fingerprint"]
    if not _allowed_file(file.filename):
        return jsonify({"success": False, "message": "Invalid file type."}), 400

    query_path = None
    try:
        query_path = _save_uploaded_file(file)
        result = find_best_match(query_path)
        return jsonify({"success": True, **result}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
    finally:
        if query_path and os.path.exists(query_path):
            os.remove(query_path)
