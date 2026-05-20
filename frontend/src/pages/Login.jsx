import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ use username instead of email
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ send username instead of email
      const response = await login(username, password);

      if (response && response.token) {
        navigate(response.role === "admin" ? "/admin" : "/doctor");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🏥</div>
        <h1 style={s.title}>Smart OPD System</h1>
        <p style={s.subtitle}>Sign in to your account</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          
          {/* ✅ Username Field */}
          <label style={s.label}>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={s.input}
          />

          {/* ✅ Password Field */}
          <label style={s.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={s.input}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...s.btn, opacity: 0.7 } : s.btn}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            to="/emergency"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(220,38,38,0.08)",
              border: "1.5px solid rgba(220,38,38,0.3)",
              color: "#dc2626",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            🚨 Emergency Patient Identification
          </Link>
          <p style={{ color: "#718096", fontSize: "0.78rem", marginTop: "8px" }}>
            No login required for emergency access
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  logo: { fontSize: "3rem", marginBottom: "12px" },
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: "6px",
  },
  subtitle: {
    color: "#718096",
    marginBottom: "28px",
    fontSize: "0.95rem",
  },
  error: {
    background: "#fff5f5",
    border: "1px solid #fc8181",
    color: "#c53030",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#4a5568",
    marginBottom: "6px",
    marginTop: "14px",
  },
  input: {
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  btn: {
    marginTop: "24px",
    padding: "12px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

export default Login;