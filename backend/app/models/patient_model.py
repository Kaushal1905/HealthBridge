from app.utils.db import get_db
from datetime import datetime, timezone
from bson import ObjectId   # FIXED: was incorrectly imported from json
import re


class PatientModel:
    def __init__(self):
        db = get_db()
        self.collection = db["patients"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        self.collection.create_index("patient_id", unique=True)
        self.collection.create_index("contact_number")
        self.collection.create_index("full_name")

    def create_patient(self, patient_data: dict):
        patient_data["created_at"] = datetime.now(timezone.utc)
        patient_data["updated_at"] = datetime.now(timezone.utc)
        patient_data["is_active"] = True
        result = self.collection.insert_one(patient_data)
        return result

    def get_patient_by_id(self, patient_id: str) -> dict | None:
        patient = self.collection.find_one({"patient_id": patient_id})
        return self._serialize(patient)

    def get_patient_basic_info(self, patient_id: str) -> dict | None:
        fields = {
            "patient_id": 1, "full_name": 1, "age": 1,
            "gender": 1, "blood_group": 1, "contact_number": 1,
            "fingerprint_path": 1, "_id": 0,
        }
        return self.collection.find_one({"patient_id": patient_id}, fields)

    def get_all_patients(self, skip: int = 0, limit: int = 20) -> list:
        cursor = (
            self.collection.find({"is_active": True})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return [self._serialize(p) for p in cursor]

    def count_patients(self) -> int:
        return self.collection.count_documents({"is_active": True})

    def search_patients(self, query: str) -> list:
        regex = re.compile(re.escape(query), re.IGNORECASE)
        cursor = self.collection.find({
            "$or": [
                {"full_name": {"$regex": regex}},
                {"contact_number": {"$regex": regex}},
                {"patient_id": {"$regex": regex}},
            ],
            "is_active": True,
        }).limit(50)
        return [self._serialize(p) for p in cursor]

    def update_patient(self, patient_id: str, update_data: dict) -> bool:
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = self.collection.update_one(
            {"patient_id": patient_id},
            {"$set": update_data},
        )
        return result.matched_count > 0

    def delete_patient(self, patient_id: str) -> bool:
        result = self.collection.update_one(
            {"patient_id": patient_id},
            {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}},
        )
        return result.matched_count > 0

    @staticmethod
    def _serialize(doc: dict | None) -> dict | None:
        if doc is None:
            return None
        doc["_id"] = str(doc["_id"])
        return doc
