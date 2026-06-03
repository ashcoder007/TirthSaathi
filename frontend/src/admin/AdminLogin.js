// frontend/src/admin/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";  // <--- FIXED IMPORT
import { API_ORIGIN } from "../config";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@tirthsaathi.local");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // IMPORTANT: ADMIN LOGIN ROUTE
      const res = await axios.post(`${API_ORIGIN}/api/admin/login`, {
        email,
        password,
      });

      console.log("Admin login response:", res.data);

      const { token, user } = res.data;

      if (!token) {
        alert("Login failed: no token returned from backend");
        setLoading(false);
        return;
      }

      let decoded = null;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        console.error("Token decode failed:", err);
      }

      const userToStore =
        user || {
          id: decoded?.id,
          email: decoded?.email || email,
          role: decoded?.role,
          isAdmin: decoded?.role === "admin" || decoded?.isAdmin === true,
        };

      // Save tokens
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(userToStore));

      // Also save for global token usage
      localStorage.setItem("ts_token", token);
      localStorage.setItem("ts_user", JSON.stringify(userToStore));

      // Attach token globally
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const isAdmin =
        userToStore.isAdmin ||
        String(userToStore.role).toLowerCase() === "admin";

      if (!isAdmin) {
        alert("You are not admin!");
        return;
      }

      navigate("/admin"); // or /admin/dashboard
    } catch (err) {
      console.error("Admin login error:", err.response?.data || err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          type="email"
          placeholder="admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px", borderRadius: 6 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
