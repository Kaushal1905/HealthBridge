import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { getAllPatients, searchPatient, deletePatient } from "../services/patientService";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPatients = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllPatients(p);
      setPatients(data.patients);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      setError("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchPatients(1); return; }
    setLoading(true);
    try {
      const data = await searchPatient(searchQuery.trim());
      setPatients(data.results);
      setTotal(data.count);
      setPages(1);
    } catch {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm(`Delete patient ${patientId}?`)) return;
    try {
      await deletePatient(patientId);
      fetchPatients(page);
    } catch {
      setError("Failed to delete patient.");
    }
  };

  useEffect(() => { fetchPatients(1); }, []);

  return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.container}>
          <div style={s.topRow}>
            <div>
              <h2 style={s.pageTitle}>Admin Dashboard</h2>
              <p style={s.subtitle}>Welcome back, {user?.name}</p>
            </div>
            <button style={s.primaryBtn} onClick={() => navigate("/register-patient")}>
              + Register New Patient
            </button>
          </div>

          {/* Stats */}
          <div style={s.statsRow}>
            {[["Total Patients", total, "#1a73e8"], ["Active Today", Math.min(total, 12), "#38a169"], ["In Queue", 0, "#e67e22"]].map(([label, val, color]) => (
              <div key={label} style={s.statCard}>
                <div style={{ ...s.statNum, color }}>{val}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>

          {/* Search + Table */}
          <div style={s.card}>
            <div style={s.searchRow}>
              <input
                style={s.searchInput}
                placeholder="Search by name, ID, or contact…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button style={s.searchBtn} onClick={handleSearch}>Search</button>
              {searchQuery && <button style={s.clearBtn} onClick={() => { setSearchQuery(""); fetchPatients(1); }}>Clear</button>}
            </div>

            {error && <div style={s.error}>{error}</div>}

            {loading ? (
              <div style={s.loading}>Loading patients…</div>
            ) : patients.length === 0 ? (
              <div style={s.empty}>No patients found.</div>
            ) : (
              <>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        {["Patient ID", "Name", "Age", "Gender", "Blood Group", "Contact", "Actions"].map((h) => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p, i) => (
                        <tr key={p.patient_id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                          <td style={s.td}><span style={s.idBadge}>{p.patient_id}</span></td>
                          <td style={{ ...s.td, fontWeight: 600 }}>{p.full_name}</td>
                          <td style={s.td}>{p.age}</td>
                          <td style={s.td}>{p.gender}</td>
                          <td style={s.td}>{p.blood_group || "—"}</td>
                          <td style={s.td}>{p.contact_number}</td>
                          <td style={s.td}>
                            <button style={s.deleteBtn} onClick={() => handleDelete(p.patient_id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={s.pagination}>
                    <button style={s.pageBtn} disabled={page <= 1} onClick={() => fetchPatients(page - 1)}>← Prev</button>
                    <span style={s.pageInfo}>Page {page} of {pages}</span>
                    <button style={s.pageBtn} disabled={page >= pages} onClick={() => fetchPatients(page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const s = {
  page: { minHeight: "100vh", padding: "28px 16px" },
  container: { maxWidth: "1100px", margin: "0 auto" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#1a202c" },
  subtitle: { color: "#718096", marginTop: "4px", fontSize: "0.9rem" },
  primaryBtn: { padding: "10px 20px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", textAlign: "center" },
  statNum: { fontSize: "2rem", fontWeight: 700 },
  statLabel: { color: "#718096", fontSize: "0.85rem", marginTop: "4px" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  searchRow: { display: "flex", gap: "10px", marginBottom: "18px" },
  searchInput: { flex: 1, padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.92rem", outline: "none" },
  searchBtn: { padding: "9px 20px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  clearBtn: { padding: "9px 16px", background: "#e2e8f0", color: "#4a5568", border: "none", borderRadius: "8px", cursor: "pointer" },
  error: { background: "#fff5f5", border: "1px solid #fc8181", color: "#c53030", padding: "9px 14px", borderRadius: "7px", marginBottom: "14px", fontSize: "0.88rem" },
  loading: { textAlign: "center", color: "#a0aec0", padding: "40px 0" },
  empty: { textAlign: "center", color: "#a0aec0", padding: "40px 0", fontSize: "0.95rem" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f7fafc" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "0.8rem", fontWeight: 700, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e2e8f0" },
  td: { padding: "11px 14px", fontSize: "0.9rem", color: "#2d3748", borderBottom: "1px solid #f0f4f8" },
  trEven: { background: "#fff" },
  trOdd: { background: "#f9fbff" },
  idBadge: { background: "#ebf8ff", color: "#2b6cb0", padding: "3px 8px", borderRadius: "5px", fontSize: "0.8rem", fontWeight: 600 },
  deleteBtn: { padding: "5px 12px", background: "#fff5f5", color: "#c53030", border: "1px solid #fc8181", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "20px" },
  pageBtn: { padding: "7px 16px", background: "#edf2f7", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: 600 },
  pageInfo: { color: "#4a5568", fontSize: "0.9rem" },
};

export default AdminDashboard;
