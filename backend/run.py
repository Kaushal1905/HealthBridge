from dotenv import load_dotenv
load_dotenv()  # ✅ FIX: loads backend/.env before the app reads os.environ

from app import create_app

app = create_app()

if __name__ == "__main__":
    # ✅ FIX: host="0.0.0.0" makes the server reachable from localhost:5000.
    app.run(host="0.0.0.0", port=5001, debug=True)
