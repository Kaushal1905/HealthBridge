from dotenv import load_dotenv
load_dotenv()

from app.utils.db import get_db
from werkzeug.security import generate_password_hash
from datetime import datetime

db = get_db()

# Delete existing admin if any (fresh start)
db.users.delete_many({"username": "admin"})

# Create fresh admin user
db.users.insert_one({
    "username": "admin",
    "password": generate_password_hash("admin123"),
    "role": "admin",
    "name": "Admin",
    "created_at": datetime.utcnow()
})

print("✅ Admin user created successfully!")
print("   Username: admin")
print("   Password: admin123")

user = db.users.find_one({"username": "admin"})
if user:
    print(f"✅ Verified in DB — role: {user['role']}")
else:
    print("❌ Something went wrong!")
