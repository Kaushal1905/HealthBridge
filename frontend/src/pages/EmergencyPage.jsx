import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { emergencyIdentify } from "../services/fingerprintService";

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0",
  },
  header: {
    width: "100%",
    background: "rgba(220,38,38,0.9)",
    backdropFilter: "blur(10px)",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 20px rgba(220,38,38,0.4)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "1.4rem",
    fontWeight: 800,
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
  },
  backBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  content: {
    width: "100%",
    maxWidth: "780px",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  alertBanner: {
    background: "rgba(220,38,38,0.15)",
    border: "1px solid rgba(220,38,38,0.4)",
    borderRadius: "12px",
    padding: "18px 24px",
    color: "#fca5a5",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "32px",
  },
  cardTitle: {
    color: "#fff",
    fontSize: "1.15rem",
    fontWeight: 700,
    margin: "0 0 20px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  uploadZone: {
    border: "2px dashed rgba(239,68,68,0.5)",
    borderRadius: "12px",
    padding: "48px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(239,68,68,0.05)",
  },
  uploadZoneActive: {
    border: "2px dashed rgba(239,68,68,0.9)",
    background: "rgba(239,68,68,0.12)",
  },
  uploadIcon: { fontSize: "3rem", marginBottom: "12px" },
  uploadText: { color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", margin: 0 },
  uploadHint: { color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: "6px" },
  previewWrap: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  previewImg: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "2px solid rgba(239,68,68,0.5)",
  },
  previewInfo: { flex: 1 },
  previewName: { color: "#fff", fontWeight: 600, marginBottom: "6px" },
  previewSize: { color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" },
  changeBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.6)",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.82rem",
    marginTop: "10px",
    display: "block",
  },
  scanBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 20px rgba(220,38,38,0.4)",
    transition: "opacity 0.2s",
  },
  scanBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  /* Result states */
  resultCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  resultHeader: {
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  resultHeaderFail: {
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
  },
  resultHeaderTitle: { color: "#fff", fontSize: "1.2rem", fontWeight: 800, margin: 0 },
  resultHeaderSub: { color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginTop: "2px" },
  resultBody: { padding: "28px" },
  sectionLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  infoBox: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "14px 16px",
  },
  infoLabel: { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginBottom: "4px" },
  infoValue: { color: "#fff", fontWeight: 700, fontSize: "1rem" },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    margin: "20px 0",
  },
  historyItem: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "10px",
    borderLeft: "3px solid rgba(239,68,68,0.6)",
  },
  historyDate: { color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", marginBottom: "8px" },
  historyField: { color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", marginBottom: "4px" },
  historyFieldLabel: { color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" },
  noHistory: { color: "rgba(255,255,255,0.4)", fontStyle: "italic", fontSize: "0.9rem" },
  regNotesBox: {
    background: "rgba(251,191,36,0.12)",
    border: "1px solid rgba(251,191,36,0.35)",
    borderLeft: "3px solid rgba(251,191,36,0.8)",
    borderRadius: "10px",
    padding: "14px 16px",
    color: "#fde68a",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    marginBottom: "4px",
  },
  scoreTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(22,163,74,0.2)",
    border: "1px solid rgba(22,163,74,0.4)",
    color: "#86efac",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginTop: "4px",
  },
  errorMsg: {
    background: "rgba(220,38,38,0.1)",
    border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: "10px",
    padding: "16px 20px",
    color: "#fca5a5",
    fontSize: "0.9rem",
  },
  resetBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.7)",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "16px",
  },
};

const EmergencyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState("");

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setApiError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleScan = async () => {
    if (!file || loading) return;
    setLoading(true);
    setResult(null);
    setApiError("");
    try {
      const data = await emergencyIdentify(file);
      setResult(data);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.message ||
          "Failed to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setApiError("");
  };

  const fmt = (val) => val || "—";
  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .scan-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .upload-zone:hover { border-color: rgba(239,68,68,0.8) !important; background: rgba(239,68,68,0.1) !important; }
      `}</style>

      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.headerTitle}>
            <span style={{ animation: "pulse 1.5s infinite" }}>🚨</span>
            Emergency Patient Identification
          </h1>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div style={s.content}>
          {/* Alert Banner */}
          <div style={s.alertBanner}>
            <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⚠️</span>
            <span>
              <strong>Emergency Use Only.</strong> Upload a fingerprint image to instantly identify
              an unconscious or unresponsive patient and retrieve their medical history.
              This feature is available without login for rapid access.
            </span>
          </div>

          {/* Upload Card */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>🖐 Upload Fingerprint Image</h2>

            {!file ? (
              <div
                className="upload-zone"
                style={{ ...s.uploadZone, ...(dragging ? s.uploadZoneActive : {}) }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <div style={s.uploadIcon}>🖐</div>
                <p style={s.uploadText}>Click to upload or drag & drop fingerprint image</p>
                <p style={s.uploadHint}>PNG, JPG, BMP, TIFF supported</p>
              </div>
            ) : (
              <div style={s.previewWrap}>
                <img src={preview} alt="fingerprint preview" style={s.previewImg} />
                <div style={s.previewInfo}>
                  <div style={s.previewName}>{file.name}</div>
                  <div style={s.previewSize}>{(file.size / 1024).toFixed(1)} KB</div>
                  <button style={s.changeBtn} onClick={() => { handleReset(); fileInputRef.current?.click(); }}>
                    Change Image
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.bmp,.tif,.tiff"
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </div>

          {/* Scan Button */}
          <button
            className="scan-btn"
            style={{ ...s.scanBtn, ...((!file || loading) ? s.scanBtnDisabled : {}) }}
            onClick={handleScan}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <div style={s.spinner} />
                Scanning Fingerprint…
              </>
            ) : (
              <>🔍 Identify Patient</>
            )}
          </button>

          {/* API Error */}
          {apiError && (
            <div style={s.errorMsg}>
              ❌ {apiError}
              <br />
              <button style={s.resetBtn} onClick={handleReset}>Try Again</button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={s.resultCard}>
              {result.matched ? (
                <>
                  <div style={s.resultHeader}>
                    <span style={{ fontSize: "2rem" }}>✅</span>
                    <div>
                      <div style={s.resultHeaderTitle}>Patient Identified</div>
                      <div style={s.resultHeaderSub}>
                        Fingerprint matched with confidence score: {result.fingerprint_score}
                      </div>
                      <div style={s.scoreTag}>🎯 Match Score: {result.fingerprint_score}</div>
                    </div>
                  </div>

                  <div style={s.resultBody}>
                    {/* Patient Info */}
                    <div style={s.sectionLabel}>Patient Information</div>
                    <div style={s.infoGrid}>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Patient ID</div>
                        <div style={s.infoValue}>{fmt(result.patient?.patient_id)}</div>
                      </div>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Full Name</div>
                        <div style={s.infoValue}>{fmt(result.patient?.full_name)}</div>
                      </div>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Age</div>
                        <div style={s.infoValue}>{fmt(result.patient?.age)} yrs</div>
                      </div>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Gender</div>
                        <div style={s.infoValue}>{fmt(result.patient?.gender)}</div>
                      </div>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Blood Group</div>
                        <div style={{ ...s.infoValue, color: "#f87171", fontSize: "1.2rem" }}>
                          {fmt(result.patient?.blood_group)}
                        </div>
                      </div>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Contact</div>
                        <div style={s.infoValue}>{fmt(result.patient?.contact_number)}</div>
                      </div>
                      <div style={s.infoBox}>
                        <div style={s.infoLabel}>Emergency Contact</div>
                        <div style={s.infoValue}>{fmt(result.patient?.emergency_contact)}</div>
                      </div>
                      {result.patient?.email && (
                        <div style={s.infoBox}>
                          <div style={s.infoLabel}>Email</div>
                          <div style={s.infoValue}>{result.patient.email}</div>
                        </div>
                      )}
                    </div>

                    <div style={s.divider} />

                    {/* Registration Notes (from patient profile) */}
                    {result.patient?.medical_history && result.patient.medical_history.trim() && (
                      <>
                        <div style={s.sectionLabel}>Allergies / Chronic Conditions (Registration Notes)</div>
                        <div style={s.regNotesBox}>
                          <span style={{ fontSize: "1.1rem", marginRight: "8px" }}>📋</span>
                          {result.patient.medical_history}
                        </div>
                        <div style={s.divider} />
                      </>
                    )}

                    {/* Medical History */}
                    <div style={s.sectionLabel}>
                      Medical History ({result.medical_history?.length || 0} records)
                    </div>
                    {result.medical_history?.length > 0 ? (
                      result.medical_history.map((rec, i) => (
                        <div key={i} style={s.historyItem}>
                          <div style={s.historyDate}>📅 {rec.date ? fmtDate(rec.date) : "Date unknown"}</div>
                          {rec.symptoms && rec.symptoms.trim() && (
                            <div style={s.historyField}>
                              <span style={s.historyFieldLabel}>Symptoms: </span>
                              {rec.symptoms}
                            </div>
                          )}
                          {rec.diagnosis && rec.diagnosis.trim() && (
                            <div style={s.historyField}>
                              <span style={s.historyFieldLabel}>Diagnosis: </span>
                              {rec.diagnosis}
                            </div>
                          )}
                          {rec.prescription && rec.prescription.trim() && (
                            <div style={s.historyField}>
                              <span style={s.historyFieldLabel}>Prescription: </span>
                              {rec.prescription}
                            </div>
                          )}
                          {rec.notes && rec.notes.trim() && (
                            <div style={s.historyField}>
                              <span style={s.historyFieldLabel}>Notes: </span>
                              {rec.notes}
                            </div>
                          )}
                          {/* Fallback: if all fields empty, show a placeholder */}
                          {!rec.symptoms && !rec.diagnosis && !rec.prescription && !rec.notes && (
                            <div style={{ ...s.historyField, fontStyle: "italic" }}>
                              No details recorded for this visit.
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={s.noHistory}>No medical history records found for this patient.</p>
                    )}

                    <button style={s.resetBtn} onClick={handleReset}>
                      🔄 Identify Another Patient
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...s.resultHeader, ...s.resultHeaderFail }}>
                    <span style={{ fontSize: "2rem" }}>❌</span>
                    <div>
                      <div style={s.resultHeaderTitle}>No Match Found</div>
                      <div style={s.resultHeaderSub}>
                        {result.message || "Fingerprint did not match any registered patient."}
                      </div>
                    </div>
                  </div>
                  <div style={s.resultBody}>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
                      The fingerprint could not be matched to any patient in the database.
                      The patient may not be registered in the system.
                    </p>
                    <div style={s.infoBox}>
                      <div style={s.infoLabel}>Match Score</div>
                      <div style={s.infoValue}>{result.fingerprint_score} (below threshold)</div>
                    </div>
                    <button style={s.resetBtn} onClick={handleReset}>
                      🔄 Try Another Fingerprint
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmergencyPage;
