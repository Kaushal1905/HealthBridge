from datetime import datetime


class Queue:
    def __init__(self, patient_id, name, priority="normal"):
        self.patient_id = patient_id
        self.name = name
        self.priority = priority
        self.token_number = None
        self.created_at = datetime.now()

    def to_dict(self):
        return {
            "patient_id": self.patient_id,
            "name": self.name,
            "priority": self.priority,
            "token_number": self.token_number,
            "created_at": self.created_at.isoformat(),
        }
