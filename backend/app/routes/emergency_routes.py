import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.services.fingerprint_service import find_best_match
from app.models.patient_model import PatientModel           # FIXED: use class, not bare function
from app.models.medical_history_model import get_medical_history_by_patient_id

emergency_bp = Blueprint("emergency", __name__)

TEMP_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "fingerprint_data", "temp")
)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "tif", "tiff"}

_patient_model = PatientModel()


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _save_temp_file(file) -> str:
    os.makedirs(TEMP_DIR, exist_ok=True)
    ext = secure_filename(file.filename).rsplit(".", 1)[-1]
    temp_path = os.path.join(TEMP_DIR, f"emergency_{uuid.uuid4().hex}.{ext}")
    file.save(temp_path)
    return temp_path


@emergency_bp.route("/identify", methods=["POST"])
def emergency_identify():
    if "fingerprint" not in request.files:
        return jsonify({"success": False, "message": "No fingerprint file provided."}), 400

    file = request.files["fingerprint"]
    if file.filename == "" or not _allowed_file(file.filename):
        return jsonify({"success": False, "message": f"Invalid file. Allowed: {ALLOWED_EXTENSIONS}"}), 400

    temp_path = None
    try:
        temp_path = _save_temp_file(file)
        match_result = find_best_match(temp_path)

        if not match_result["matched"]:
            return jsonify({
                "success": True,
                "matched": False,
                "message": match_result["message"],
                "fingerprint_score": match_result["score"],
            }), 200

        patient_id = match_result["patient_id"]
        patient = _patient_model.get_patient_by_id(patient_id)   # FIXED: class method

        if not patient:
            return jsonify({
                "success": False,
                "matched": True,
                "patient_id": patient_id,
                "message": "Fingerprint matched but patient record not found.",
            }), 404

        medical_history = get_medical_history_by_patient_id(patient_id)

        return jsonify({
            "success": True,
            "matched": True,
            "patient": patient,
            "medical_history": medical_history,
            "fingerprint_score": match_result["score"],
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Emergency identification failed: {str(e)}"}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
