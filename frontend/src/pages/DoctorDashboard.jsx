import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { getPatientHistory, addMedicalRecord } from "../services/medicalService";
import { getPatientById } from "../services/patientService";

const DoctorDashboard = () => {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ symptoms: "", diagnosis: "", prescription: "", notes: "" });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPatient = async () => {
    if (!patientId.trim()) return;
    setLoadingSearch(true);
    setError("");
    setPatient(null);
    setHistory([]);
    try {
      const [patientData, historyData] = await Promise.all([
        getPatientById(patientId.trim()),
        getPatientHistory(patientId.trim()),
      ]);
      setPatient(patientData);
      setHistory(historyData);
    } catch {
      setError("Patient not found. Please check the ID.");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!patient) return;
    if (!form.symptoms || !form.diagnosis || !form.prescription) {
      setError("Symptoms, diagnosis, and prescription are required.");
      return;
    }
    setLoadingSave(true);
    setError("");
    setSuccess("");
    try {
      await addMedicalRecord({ patient_id: patient.patient_id, ...form });
      setSuccess("Medical record saved successfully!");
      setForm({ symptoms: "", diagnosis: "", prescription: "", notes: "" });
      const updated = await getPatientHistory(patient.patient_id);
      setHistory(updated);
    } catch {
      setError("Failed to save record. Please try again.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>
          <h2 style={s.pageTitle}>Doctor Dashboard</h2>

          {/* Search */}
          <div style={s.card}>
            <h3 style={s.sectionTitle}>🔍 Find Patient</h3>
            <div style={s.searchRow}>
              <input
                style={s.input}
                type="text"
                placeholder="Enter Patient ID (e.g. OPD-2024-ABC123)"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPatient()}
              />
              <button style={s.btn} onClick={fetchPatient} disabled={loadingSearch}>
                {loadingSearch ? "Searching…" : "Search"}
              </button>
            </div>
            {error && <div style={s.error}>{error}</div>}
          </div>

          {/* Patient Info */}
          {patient && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>👤 Patient Details</h3>
              <div style={s.infoGrid}>
                {[
                  ["Patient ID", patient.patient_id],
                  ["Name", patient.full_name],
                  ["Age", patient.age],
                  ["Gender", patient.gender],
                  ["Blood Group", patient.blood_group || "—"],
                  ["Contact", patient.contact_number],
                ].map(([label, value]) => (
                  <div key={label} style={s.infoItem}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                ))}
              </div>
              {patient.medical_history && (
                <div style={s.note}>
                  <strong>Medical History:</strong> {patient.medical_history}
                </div>
              )}
            </div>
          )}

          {/* Add Record */}
          {patient && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>📋 Add Consultation Record</h3>
              {success && <div style={s.successMsg}>{success}</div>}
              <div style={s.formGrid}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Symptoms *</label>
                  <textarea style={s.textarea} name="symptoms" placeholder="Describe symptoms…" value={form.symptoms} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Diagnosis *</label>
                  <textarea style={s.textarea} name="diagnosis" placeholder="Diagnosis…" value={form.diagnosis} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Prescription *</label>
                  <textarea style={s.textarea} name="prescription" placeholder="Medications prescribed…" value={form.prescription} onChange={handleChange} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Notes</label>
                  <textarea style={s.textarea} name="notes" placeholder="Additional notes…" value={form.notes} onChange={handleChange} />
                </div>
              </div>
              <button style={s.saveBtn} onClick={handleSubmit} disabled={loadingSave}>
                {loadingSave ? "Saving…" : "💾 Save Record"}
              </button>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={s.card}>
              <h3 style={s.sectionTitle}>📁 Medical History ({history.length} records)</h3>
              {history.map((item) => (
                <div key={item._id} style={s.historyItem}>
                  <div style={s.historyDate}>{item.date ? new Date(item.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—"}</div>
                  <div style={s.historyGrid}>
                    {[["Symptoms", item.symptoms], ["Diagnosis", item.diagnosis], ["Prescription", item.prescription], ["Notes", item.notes]].map(([label, val]) => val ? (
                      <div key={label}>
                        <span style={s.histLabel}>{label}:</span> {val}
                      </div>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const s = {
  page: { minHeight: "100vh", padding: "28px 16px" },
  container: { maxWidth: "900px", margin: "0 auto" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#1a202c", marginBottom: "20px" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  sectionTitle: { fontSize: "1rem", fontWeight: 600, color: "#4a5568", marginBottom: "16px" },
  searchRow: { display: "flex", gap: "12px" },
  input: { flex: 1, padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" },
  btn: { padding: "10px 22px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  error: { marginTop: "12px", background: "#fff5f5", border: "1px solid #fc8181", color: "#c53030", padding: "9px 14px", borderRadius: "7px", fontSize: "0.88rem" },
  successMsg: { background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "9px 14px", borderRadius: "7px", marginBottom: "14px", fontSize: "0.88rem" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  infoItem: { display: "flex", flexDirection: "column" },
  infoLabel: { fontSize: "0.78rem", color: "#a0aec0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  infoValue: { fontSize: "0.95rem", fontWeight: 600, color: "#2d3748", marginTop: "2px" },
  note: { marginTop: "14px", padding: "10px 14px", background: "#fffbeb", borderRadius: "7px", fontSize: "0.9rem", color: "#744210" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  fieldWrap: { display: "flex", flexDirection: "column" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#4a5568", marginBottom: "5px" },
  textarea: { padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", resize: "vertical", minHeight: "80px", outline: "none" },
  saveBtn: { marginTop: "16px", padding: "11px 28px", background: "#38a169", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" },
  historyItem: { borderLeft: "3px solid #1a73e8", paddingLeft: "16px", marginBottom: "18px" },
  historyDate: { fontSize: "0.82rem", fontWeight: 700, color: "#1a73e8", marginBottom: "6px" },
  historyGrid: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.9rem", color: "#4a5568" },
  histLabel: { fontWeight: 600, color: "#2d3748" },
};

export default DoctorDashboard;
