import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const styles = {
  nav: {
    background: "#1a73e8",
    color: "#fff",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "56px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  brand: { fontWeight: 700, fontSize: "1.2rem", color: "#fff", textDecoration: "none" },
  links: { display: "flex", gap: "20px", alignItems: "center" },
  link: { color: "#fff", textDecoration: "none", fontSize: "0.95rem", opacity: 0.9 },
  btn: {
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  emergencyBtn: {
    background: "rgba(220,38,38,0.85)",
    border: "1px solid rgba(255,100,100,0.5)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <Link to={user?.role === "admin" ? "/admin" : "/doctor"} style={styles.brand}>
        🏥 Smart OPD
      </Link>
      <div style={styles.links}>
        {user?.role === "admin" && (
          <>
            <Link to="/admin" style={styles.link}>Dashboard</Link>
            <Link to="/register-patient" style={styles.link}>Register Patient</Link>
          </>
        )}
        {user && <Link to="/queue" style={styles.link}>Queue</Link>}
        {user?.role === "doctor" && (
          <Link to="/doctor" style={styles.link}>Consultations</Link>
        )}
        <Link to="/emergency" style={styles.emergencyBtn}>🚨 Emergency</Link>
        <span style={{ fontSize: "0.9rem", opacity: 0.85 }}>👤 {user?.name}</span>
        <button style={styles.btn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
