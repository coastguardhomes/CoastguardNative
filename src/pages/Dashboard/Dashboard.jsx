import React from "react";
import useAuthGuard from "../../hooks/useAuthGuard.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  useAuthGuard(); // Protege la pantalla
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>Panel de Control</h1>

      {user && (
        <p>
          Sesión iniciada como: <strong>{user.email}</strong>
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            background: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
