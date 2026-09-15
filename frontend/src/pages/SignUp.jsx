import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        role: "doctor",
        department: "General Medicine",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                role: formData.role,
                department: formData.department,
                password: formData.password,
            };

            const response = await registerUser(payload);

            if (response && response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("role", response.role);
                localStorage.setItem("name", response.name);

                navigate(response.role === "admin" ? "/admin" : "/doctor");
            } else if (response && response.message) {
                setError(response.message);
            } else {
                setError("Registration failed. Please try again.");
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
                <h1 style={s.title}>Create Account</h1>
                <p style={s.subtitle}>Sign up for Smart OPD System</p>

                {error && <div style={s.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={s.form}>
                    <label style={s.label}>Full Name *</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g. Dr. Jane Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={s.input}
                    />

                    <div style={s.row}>
                        <div style={s.col}>
                            <label style={s.label}>Username *</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Choose username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={s.input}
                            />
                        </div>
                        <div style={s.col}>
                            <label style={s.label}>Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={s.input}
                            >
                                <option value="doctor">🩺 Doctor</option>
                                <option value="admin">👨‍💼 Hospital Admin</option>
                            </select>
                        </div>
                    </div>

                    <div style={s.row}>
                        <div style={s.col}>
                            <label style={s.label}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@hospital.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={s.input}
                            />
                        </div>
                        <div style={s.col}>
                            <label style={s.label}>Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                style={s.input}
                            >
                                <option value="General Medicine">General Medicine</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Emergency & Trauma">Emergency & Trauma</option>
                                <option value="OPD Reception">OPD Reception</option>
                            </select>
                        </div>
                    </div>

                    <label style={s.label}>Password (min 6 characters) *</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={s.input}
                    />

                    <label style={s.label}>Confirm Password *</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={s.input}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={loading ? { ...s.btn, opacity: 0.7 } : s.btn}
                    >
                        {loading ? "Creating Account…" : "Create Account"}
                    </button>
                </form>

                <div style={s.footer}>
                    Already have an account?{" "}
                    <Link to="/" style={s.link}>
                        Sign In here
                    </Link>
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
        padding: "30px 16px",
        boxSizing: "border-box",
    },
    card: {
        background: "#fff",
        borderRadius: "16px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "460px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        textAlign: "center",
        boxSizing: "border-box",
    },
    logo: { fontSize: "2.8rem", marginBottom: "8px" },
    title: {
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#1a202c",
        marginBottom: "4px",
    },
    subtitle: {
        color: "#718096",
        marginBottom: "20px",
        fontSize: "0.92rem",
    },
    error: {
        background: "#fff5f5",
        border: "1px solid #fc8181",
        color: "#c53030",
        padding: "10px 14px",
        borderRadius: "8px",
        marginBottom: "16px",
        fontSize: "0.88rem",
        textAlign: "left",
    },
    form: { textAlign: "left" },
    row: {
        display: "flex",
        gap: "12px",
        marginBottom: "4px",
    },
    col: { flex: 1 },
    label: {
        display: "block",
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "#4a5568",
        marginBottom: "5px",
        marginTop: "12px",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        border: "1.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.92rem",
        outline: "none",
        boxSizing: "border-box",
    },
    btn: {
        width: "100%",
        padding: "12px",
        background: "#1a73e8",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "0.98rem",
        cursor: "pointer",
        marginTop: "20px",
    },
    footer: {
        marginTop: "20px",
        fontSize: "0.88rem",
        color: "#718096",
    },
    link: {
        color: "#1a73e8",
        fontWeight: 600,
        textDecoration: "none",
    },
};

export default SignUp;
