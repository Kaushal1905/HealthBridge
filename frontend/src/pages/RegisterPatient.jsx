import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient } from "../services/patientService";
import Navbar from "../components/Navbar";

const RegisterPatient = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: "", age: "", gender: "", blood_group: "",
    contact_number: "", email: "", address: "",
    emergency_contact: "", medical_history: "",
  });
  const [fingerprintFile, setFingerprintFile] = useState(null);
  const [fingerprintPreview, setFingerprintPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFingerprintUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFingerprintFile(file);
      setFingerprintPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (fingerprintFile) data.append("fingerprint", fingerprintFile);
      const response = await registerPatient(data);
      setSuccessData(response);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <>
        <Navbar />
        <div style={s.page}>
          <div style={s.successCard}>
            <div style={{ fontSize: "3rem" }}>✅</div>
            <h2 style={s.successTitle}>Patient Registered!</h2>
            <div style={s.infoRow}><span style={s.infoLabel}>Patient ID</span><span style={s.infoValue}>{successData.patient_id}</span></div>
            <div style={s.infoRow}><span style={s.infoLabel}>Name</span><span style={s.infoValue}>{successData.full_name}</span></div>
            <div style={s.btnRow}>
              <button style={s.btn} onClick={() => navigate("/admin")}>Go to Dashboard</button>
              <button style={{ ...s.btn, background: "#48bb78" }} onClick={() => { setSuccessData(null); setFormData({ full_name: "", age: "", gender: "", blood_group: "", contact_number: "", email: "", address: "", emergency_contact: "", medical_history: "" }); setFingerprintFile(null); setFingerprintPreview(null); }}>
                Register Another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.card}>
          <h2 style={s.pageTitle}>🏥 Patient Registration</h2>
          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Personal Information</h3>
              <div style={s.grid}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Full Name *</label>
                  <input style={s.input} name="full_name" placeholder="Full Name" required value={formData.full_name} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Age *</label>
                  <input style={s.input} name="age" type="number" placeholder="Age" required min="0" max="120" value={formData.age} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Gender *</label>
                  <select style={s.input} name="gender" required value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Blood Group</label>
                  <select style={s.input} name="blood_group" value={formData.blood_group} onChange={handleChange}>
                    <option value="">Select Blood Group</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={s.section}>
              <h3 style={s.sectionTitle}>Contact Details</h3>
              <div style={s.grid}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Contact Number *</label>
                  <input style={s.input} name="contact_number" placeholder="10-digit number" required value={formData.contact_number} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} name="email" type="email" placeholder="Optional" value={formData.email} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Emergency Contact</label>
                  <input style={s.input} name="emergency_contact" placeholder="Emergency phone" value={formData.emergency_contact} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Address</label>
                  <input style={s.input} name="address" placeholder="Full address" value={formData.address} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={s.section}>
              <h3 style={s.sectionTitle}>Medical History</h3>
              <textarea style={{ ...s.input, width: "100%", height: "90px", resize: "vertical" }} name="medical_history" placeholder="Known allergies, chronic conditions, past surgeries…" value={formData.medical_history} onChange={handleChange} />
            </div>

            <div style={s.section}>
              <h3 style={s.sectionTitle}>Fingerprint Registration</h3>
              <div style={s.fpBox} onClick={() => fileInputRef.current.click()}>
                {fingerprintPreview
                  ? <img src={fingerprintPreview} alt="Fingerprint" style={{ maxHeight: "120px", borderRadius: "8px" }} />
                  : <><div style={{ fontSize: "2rem" }}>👆</div><p style={{ color: "#718096", marginTop: "8px" }}>Click to upload fingerprint image</p></>
                }
              </div>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFingerprintUpload} />
            </div>

            <button type="submit" disabled={loading} style={loading ? { ...s.submitBtn, opacity: 0.7 } : s.submitBtn}>
              {loading ? "Registering…" : "Register Patient"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const s = {
  page: { padding: "32px 16px", minHeight: "100vh" },
  card: { background: "#fff", borderRadius: "14px", padding: "36px", maxWidth: "800px", margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px", color: "#1a202c" },
  error: { background: "#fff5f5", border: "1px solid #fc8181", color: "#c53030", padding: "10px 14px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "1rem", fontWeight: 600, color: "#4a5568", marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid #e2e8f0" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  fieldWrap: { display: "flex", flexDirection: "column" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#4a5568", marginBottom: "5px" },
  input: { padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.92rem", outline: "none", background: "#fff" },
  fpBox: { border: "2px dashed #cbd5e0", borderRadius: "10px", padding: "28px", textAlign: "center", cursor: "pointer", background: "#f7fafc", minHeight: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  submitBtn: { width: "100%", padding: "13px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "9px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: "8px" },
  successCard: { background: "#fff", borderRadius: "14px", padding: "48px", maxWidth: "440px", margin: "60px auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" },
  successTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#1a202c", margin: "12px 0 24px" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f4f8" },
  infoLabel: { color: "#718096", fontSize: "0.9rem" },
  infoValue: { fontWeight: 600, color: "#1a202c", fontSize: "0.9rem" },
  btnRow: { display: "flex", gap: "12px", marginTop: "24px" },
  btn: { flex: 1, padding: "11px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
};

export default RegisterPatient;
