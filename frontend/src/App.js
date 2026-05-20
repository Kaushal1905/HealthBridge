import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import RegisterPatient from "./pages/RegisterPatient";
import DoctorDashboard from "./pages/DoctorDashboard";
import QueuePage from "./pages/QueuePage";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyPage from "./pages/EmergencyPage";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/register-patient" element={<ProtectedRoute allowedRoles={["admin", "doctor"]}><RegisterPatient /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={["doctor", "admin"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute allowedRoles={["admin", "doctor"]}><QueuePage /></ProtectedRoute>} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;