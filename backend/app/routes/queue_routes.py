from flask import Blueprint, request, jsonify
from app.services.queue_service import add_patient_to_queue, get_queue, next_patient

queue_bp = Blueprint("queue", __name__)


@queue_bp.route("/add", methods=["POST"])
def add_to_queue():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    patient_id = data.get("patient_id")
    name = data.get("name")
    if not patient_id or not name:
        return jsonify({"error": "patient_id and name are required"}), 400

    patient = add_patient_to_queue(
        patient_id,
        name,
        data.get("priority", "normal"),
    )
    return jsonify({"message": "Patient added to queue", "data": patient}), 201


@queue_bp.route("/list", methods=["GET"])
def list_queue():
    return jsonify(get_queue()), 200


@queue_bp.route("/next", methods=["POST"])
def call_next():
    patient = next_patient()
    if not patient:
        return jsonify({"message": "Queue is empty"}), 200
    return jsonify({"message": "Next patient", "data": patient}), 200
