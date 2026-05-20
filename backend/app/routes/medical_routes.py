from flask import Blueprint, request, jsonify
from app.models.medical_history_model import create_medical_record, get_medical_history

medical_bp = Blueprint("medical", __name__)


@medical_bp.route("/add", methods=["POST"])
def add_medical():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ["patient_id", "symptoms", "diagnosis", "prescription"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    record_id = create_medical_record(data)
    return jsonify({"message": "Medical record added", "id": record_id}), 201


@medical_bp.route("/history/<patient_id>", methods=["GET"])
def history(patient_id):
    records = get_medical_history(patient_id)
    return jsonify(records), 200
