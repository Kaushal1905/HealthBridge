from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId


class User:
    def __init__(self, db):
        self.collection = db["users"]

    def create_user(self, name, email, password, role):
        hashed_password = generate_password_hash(password)
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
        }
        return self.collection.insert_one(user_data)

    def find_by_email(self, email):
        return self.collection.find_one({"email": email})

    def verify_password(self, stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)
