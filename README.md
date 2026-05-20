# 🏥 HealthBridge — Smart OPD Management System

A full-stack web application for managing hospital Out-Patient Department (OPD) operations. It supports patient registration with fingerprint identification, smart queue management, emergency handling, and role-based dashboards for doctors and admins.

---

## 📸 Screenshots

| Login Page | Emergency Page |
|---|---|
| ![Login](screenshots/login.png) | ![Emergency](screenshots/emergency.png) |

| Admin Dashboard |
|---|---|
| ![Admin](screenshots/admin-dashboard.png) |

| Register Patient | Queue Management |
|---|---|
| ![Register](screenshots/register-patient.png) | ![Queue](screenshots/queue.png) |

---

## 🚀 Features

- 🔐 **Role-based Authentication** — Separate access for Admin and Doctor roles
- 🧑‍⚕️ **Patient Registration** — Register patients with fingerprint image support
- 🗂️ **Queue Management** — Smart OPD queue with priority handling
- 🚨 **Emergency Page** — Public emergency access without login
- 👨‍💼 **Admin Dashboard** — Manage users, patients, and system overview
- 🩺 **Doctor Dashboard** — View assigned patients and medical history
- 🧬 **Fingerprint Identification** — Match patients using fingerprint images
- 📋 **Medical History** — Track and update patient medical records

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Bootstrap 5, Axios |
| Backend | Python, Flask, Flask-CORS, PyJWT |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Image Processing | OpenCV, NumPy |

---

## 📁 Project Structure

```
healthbridge/
├── backend/
│   ├── app/
│   │   ├── routes/        # auth, patient, queue, medical, fingerprint, emergency
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # business logic
│   │   └── utils/         # db, token generator, image processing
│   ├── fingerprint_data/  # stored fingerprint images
│   ├── create_admin.py    # script to create admin user
│   ├── run.py             # app entry point
│   ├── requirements.txt
│   └── .env               # environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── pages/         # Login, AdminDashboard, DoctorDashboard, QueuePage, EmergencyPage, RegisterPatient
│   │   ├── components/    # Navbar, ProtectedRoute
│   │   ├── context/       # AuthContext
│   │   ├── services/      # API service files
│   │   └── utils/         # priority helpers
│   ├── public/
│   ├── package.json
│   └── .env               # frontend environment variables (not committed)
└── screenshots/           # project screenshots
```

---

## ⚙️ Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/Kaushal1905/HealthBridge.git
cd HealthBridge
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:

```
SECRET_KEY=your_secret_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_opd?retryWrites=true&w=majority&appName=Cluster0
FRONTEND_URL=http://localhost:3000
```

Create the admin user:

```bash
python create_admin.py
```

Start the backend:

```bash
python run.py
```

Backend runs at: `http://localhost:5001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing secret |
| `MONGO_URI` | MongoDB Atlas connection string |
| `FRONTEND_URL` | Allowed frontend origin for CORS |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (default: http://localhost:5001) |

---

## 👤 User Roles

| Role | Access |
|---|---|
| `admin` | Full access — manage users, patients, queue |
| `doctor` | View patients, queue, and medical history |
| Public | Emergency page only (no login required) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET/POST | `/api/patients` | Get or register patients |
| GET/POST | `/api/queue` | Manage OPD queue |
| GET/POST | `/api/medical` | Medical history |
| POST | `/api/fingerprint` | Fingerprint matching |
| GET/POST | `/api/emergency` | Emergency cases |

---

## 📄 License

This project is for educational purposes.

---

## 🙌 Author

Made with ❤️ by Kaushal Tanna
