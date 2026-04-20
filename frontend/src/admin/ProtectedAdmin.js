// frontend/src/admin/ProtectedAdmin.js
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // correct named import

export default function ProtectedAdmin({ children }) {
  // Support both keys during transition
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("ts_token");

  // If no token at all → not logged in as admin
  if (!token) return <Navigate to="/admin/login" />;

  // Check stored user first (most reliable)
  try {
    const rawUser =
      localStorage.getItem("admin_user") ||
      localStorage.getItem("ts_user");

    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (
        user &&
        (user.isAdmin === true ||
          String(user.role).toLowerCase() === "admin")
      ) {
        return children; // allowed
      }
      return <Navigate to="/admin/login" />;
    }
  } catch (err) {
    console.warn("Could not parse stored user:", err);
  }

  // Fallback: decode JWT and check claims
  try {
    const decoded = jwtDecode(token);
    console.log("Decoded:", decoded);

    if (
      decoded &&
      (decoded.isAdmin === true ||
        String(decoded.role).toLowerCase() === "admin")
    ) {
      return children;
    }
  } catch (err) {
    console.warn("Token decode failed:", err);
  }

  // Default: block access
  return <Navigate to="/admin/login" />;
}
