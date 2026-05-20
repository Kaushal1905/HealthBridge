import React, { createContext, useState, useEffect } from "react";
import { loginUser, logoutUser } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    if (token && role) {
      setUser({ token, role, name });
    }
  }, []);

  // ✅ FIXED: use username instead of email
  const login = async (username, password) => {
    try {
      const data = await loginUser(username, password);

      if (data.token) {
        setUser({
          token: data.token,
          role: data.role,
          name: data.name,
        });

        // ✅ store in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
      }

      return data;
    } catch (error) {
      return { message: "Login failed" };
    }
  };

  const logout = () => {
    logoutUser();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};