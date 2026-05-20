import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { getQueue, addToQueue, callNext } from "../services/queueService";
import { getPriorityBadge } from "../utils/priorityHelper";
import { searchPatient, getPatientById } from "../services/patientService";
import { getPatientHistory } from "../services/medicalService";

const QueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ patient_id: "", name: "", priority: "normal" });
  const [error, setError] = useState("");
  const [lastCalled, setLastCalled] = useState(null);

  // Patient Details state
  const [patientSearch, setPatientSearch] = useState("");
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientResult, setPatientResult] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [patientError, setPatientError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handlePatientSearch = async (e) => {
    e.preventDefault();
    if (!patientSearch.trim()) return;
    setPatientLoading(true);
    setPatientError("");
    setPatientResult(null);
    setPatientHistory([]);
    setShowHistory(false);
    try {
      let patient = null;
      try {
        const res = await getPatientById(patientSearch.trim());
        patient = res.patient || res;
      } catch {
        const res = await searchPatient(patientSearch.trim());
        const list = res.patients || res;
        patient = Array.isArray(list) ? list[0] : list;
      }
      if (!patient) { setPatientError("No patient found."); return; }
      setPatientResult(patient);
      const pid = patient.patient_id || patient._id;
      try {
        const hist = await getPatientHistory(pid);
        setPatientHistory(Array.isArray(hist) ? hist : []);
      } catch { setPatientHistory([]); }
    } catch {
      setPatientError("Patient not found. Check the ID or name.");
    } finally {
      setPatientLoading(false);
    }
  };

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d || "—"; }
  };

  const fmt = (v) => v || "—";

  const loadQueue = useCallback(async () => {
    try {
      const data = await getQueue();
      setQueue(data);
    } catch {
      setError("Failed to load queue.");
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.name) return;
    setLoading(true);
    setError("");
    try {
      await addToQueue(form.patient_id, form.name, form.priority);
      setForm({ patient_id: "", name: "", priority: "normal" });
      await loadQueue();
    } catch {
      setError("Failed to add patient to queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      const res = await callNext();
      if (res.data) setLastCalled(res.data);
      await loadQueue();
    } catch {
      setError("Failed to call next patient.");
    }
  };

  return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>
          <h2 style={s.pageTitle}>🏥 OPD Queue Management</h2>

          {error && <div style={s.error}>{error}</div>}

          {lastCalled && (
            <div style={s.calledBanner}>
              🔔 Now Calling: <strong>{lastCalled.name}</strong> — Token #{lastCalled.token}
              <button style={s.dismissBtn} onClick={() => setLastCalled(null)}>✕</button>
            </div>
          )}

          {/* ── Patient Details Section ── */}
          <div style={s.card}>
            <h3 style={s.sectionTitle}>🔍 Patient Details Lookup</h3>
            <form onSubmit={handlePatientSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                style={{ ...s.input, flex: 1, minWidth: "200px" }}
                placeholder="Enter Patient ID or Name"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              <button type="submit" disabled={patientLoading} style={{ ...s.addBtn, marginTop: 0, padding: "9px 22px", whiteSpace: "nowrap" }}>
                {patientLoading ? "Searching…" : "Search"}
              </button>
            </form>

            {patientError && <div style={{ ...s.error, marginTop: "12px" }}>{patientError}</div>}

            {patientResult && (
              <div style={pd.resultWrap}>
                <div style={pd.header}>
                  <div style={pd.avatar}>{(patientResult.full_name || patientResult.name || "?")[0].toUpperCase()}</div>
                  <div>
                    <div style={pd.name}>{fmt(patientResult.full_name || patientResult.name)}</div>
                    <div style={pd.pid}>{fmt(patientResult.patient_id)}</div>
                  </div>
                  <div style={{ ...pd.bloodBadge }}>{fmt(patientResult.blood_group)}</div>
                </div>

                <div style={pd.grid}>
                  {[
                    ["Age", patientResult.age ? `${patientResult.age} yrs` : "—"],
                    ["Gender", patientResult.gender],
                    ["Contact", patientResult.contact_number],
                    ["Emergency Contact", patientResult.emergency_contact],
                    ["Email", patientResult.email],
                    ["Registered", fmtDate(patientResult.created_at || patientResult.registered_at)],
                  ].map(([label, val]) => (
                    <div key={label} style={pd.infoBox}>
                      <div style={pd.infoLabel}>{label}</div>
                      <div style={pd.infoValue}>{fmt(val)}</div>
                    </div>
                  ))}
                </div>

                {/* Registration Medical Notes */}
                {patientResult.medical_history && patientResult.medical_history.trim() && (
                  <div style={pd.regNotesBox}>
                    <div style={pd.regNotesTitle}>📋 Registration Notes (Allergies / Chronic Conditions)</div>
                    <div style={pd.regNotesText}>{patientResult.medical_history}</div>
                  </div>
                )}

                <button style={pd.histBtn} onClick={() => setShowHistory((p) => !p)}>
                  {showHistory ? "▲ Hide" : "▼ Show"} Medical History ({patientHistory.length} records)
                </button>

                {showHistory && (
                  <div style={{ marginTop: "12px" }}>
                    {patientHistory.length === 0 ? (
                      <div style={pd.noHist}>No medical history found.</div>
                    ) : (
                      patientHistory.map((rec, i) => (
                        <div key={i} style={pd.histItem}>
                          <div style={pd.histDate}>📅 {fmtDate(rec.date)}</div>
                          {rec.symptoms && <div style={pd.histField}><span style={pd.histLabel}>Symptoms: </span>{rec.symptoms}</div>}
                          {rec.diagnosis && <div style={pd.histField}><span style={pd.histLabel}>Diagnosis: </span>{rec.diagnosis}</div>}
                          {rec.prescription && <div style={pd.histField}><span style={pd.histLabel}>Prescription: </span>{rec.prescription}</div>}
                          {rec.notes && <div style={pd.histField}><span style={pd.histLabel}>Notes: </span>{rec.notes}</div>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={s.layout}>
            {/* Add to Queue */}
            <div style={s.card}>
              <h3 style={s.sectionTitle}>➕ Add Patient to Queue</h3>
              <form onSubmit={handleAdd} style={s.form}>
                <label style={s.label}>Patient ID</label>
                <input style={s.input} placeholder="OPD-2024-XXXXXX" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required />
                <label style={s.label}>Patient Name</label>
                <input style={s.input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <label style={s.label}>Priority</label>
                <select style={s.input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="emergency">Emergency</option>
                </select>
                <button type="submit" disabled={loading} style={s.addBtn}>
                  {loading ? "Adding…" : "Add to Queue"}
                </button>
              </form>
            </div>

            {/* Queue List */}
            <div style={s.card}>
              <div style={s.queueHeader}>
                <h3 style={s.sectionTitle}>📋 Current Queue ({queue.length})</h3>
                <button style={s.nextBtn} onClick={handleCallNext} disabled={queue.length === 0}>
                  Call Next ▶
                </button>
              </div>

              {queue.length === 0 ? (
                <div style={s.empty}>Queue is empty</div>
              ) : (
                queue.map((patient, idx) => (
                  <div key={patient.token} style={{ ...s.queueItem, ...(idx === 0 ? s.firstItem : {}) }}>
                    <div style={s.tokenBadge}>#{patient.token}</div>
                    <div style={s.patientInfo}>
                      <div style={s.patientName}>{patient.name}</div>
                      <div style={s.patientId}>{patient.patient_id}</div>
                    </div>
                    <div style={{ ...s.priorityBadge, ...getPriorityBadge(patient.priority) }}>
                      {patient.priority === "emergency" ? "🚨 Emergency" : "✅ Normal"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const s = {
  page: { minHeight: "100vh", padding: "28px 16px" },
  container: { maxWidth: "960px", margin: "0 auto" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#1a202c", marginBottom: "20px" },
  error: { background: "#fff5f5", border: "1px solid #fc8181", color: "#c53030", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" },
  calledBanner: { background: "#ebf8ff", border: "1px solid #90cdf4", color: "#2b6cb0", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" },
  dismissBtn: { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#2b6cb0", fontSize: "1rem" },
  layout: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  sectionTitle: { fontSize: "1rem", fontWeight: 600, color: "#4a5568", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#4a5568", marginTop: "8px" },
  input: { padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.92rem", outline: "none" },
  addBtn: { marginTop: "14px", padding: "11px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  queueHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  nextBtn: { padding: "8px 18px", background: "#38a169", color: "#fff", border: "none", borderRadius: "7px", fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", color: "#a0aec0", padding: "40px 0", fontSize: "0.95rem" },
  queueItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "9px", marginBottom: "8px", background: "#f7fafc", border: "1px solid #e2e8f0" },
  firstItem: { background: "#ebf8ff", border: "1px solid #90cdf4" },
  tokenBadge: { width: "36px", height: "36px", background: "#1a73e8", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 },
  patientInfo: { flex: 1 },
  patientName: { fontWeight: 600, color: "#1a202c", fontSize: "0.95rem" },
  patientId: { fontSize: "0.8rem", color: "#a0aec0", marginTop: "2px" },
  priorityBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" },
};

const pd = {
  resultWrap: { marginTop: "16px", background: "#f7fafc", borderRadius: "10px", padding: "18px", border: "1px solid #e2e8f0" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", flexWrap: "wrap" },
  avatar: { width: "44px", height: "44px", borderRadius: "50%", background: "#1a73e8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem", flexShrink: 0 },
  name: { fontWeight: 700, fontSize: "1.05rem", color: "#1a202c" },
  pid: { fontSize: "0.8rem", color: "#a0aec0", marginTop: "2px" },
  bloodBadge: { marginLeft: "auto", background: "#fff5f5", border: "1px solid #fc8181", color: "#c53030", padding: "4px 12px", borderRadius: "20px", fontWeight: 700, fontSize: "0.9rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "14px" },
  infoBox: { background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "1px solid #e2e8f0" },
  infoLabel: { fontSize: "0.72rem", color: "#a0aec0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" },
  infoValue: { fontSize: "0.9rem", fontWeight: 600, color: "#2d3748" },
  histBtn: { background: "none", border: "1px solid #cbd5e0", borderRadius: "7px", padding: "7px 14px", cursor: "pointer", fontSize: "0.85rem", color: "#4a5568", fontWeight: 600 },
  histItem: { background: "#fff", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px", borderLeft: "3px solid #1a73e8", border: "1px solid #e2e8f0", borderLeftWidth: "3px", borderLeftColor: "#1a73e8" },
  histDate: { fontSize: "0.78rem", color: "#a0aec0", marginBottom: "6px" },
  histField: { fontSize: "0.88rem", color: "#4a5568", marginBottom: "3px" },
  histLabel: { fontWeight: 600, color: "#2d3748" },
  noHist: { textAlign: "center", color: "#a0aec0", padding: "16px 0", fontSize: "0.9rem" },
  regNotesBox: { background: "#fffbeb", border: "1px solid #f6e05e", borderLeft: "3px solid #d69e2e", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px", marginTop: "12px" },
  regNotesTitle: { fontSize: "0.78rem", fontWeight: 700, color: "#b7791f", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  regNotesText: { fontSize: "0.9rem", color: "#744210", lineHeight: "1.5", whiteSpace: "pre-wrap" },
};

export default QueuePage;
