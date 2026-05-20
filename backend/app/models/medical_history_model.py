from datetime import datetime
from bson import ObjectId
from app.utils.db import get_db  # FIXED: was importing non-existent 'mongo'


def create_medical_record(data: dict) -> str:
    db = get_db()
    record = {
        "patient_id": data["patient_id"],
        "symptoms": data.get("symptoms", ""),
        "diagnosis": data.get("diagnosis", ""),
        "prescription": data.get("prescription", ""),
        "notes": data.get("notes", ""),
        "date": datetime.utcnow(),
    }
    result = db.medical_history.insert_one(record)
    return str(result.inserted_id)


def get_medical_history(patient_id: str) -> list:
    db = get_db()
    records = list(db.medical_history.find({"patient_id": patient_id}).sort("date", -1))
    for record in records:
        record["_id"] = str(record["_id"])
        if "date" in record:
            record["date"] = record["date"].isoformat()
    return records


# Alias used by emergency_routes
def get_medical_history_by_patient_id(patient_id: str) -> list:
    return get_medical_history(patient_id)
