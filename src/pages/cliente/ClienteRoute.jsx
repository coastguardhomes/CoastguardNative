import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClienteRoute({ children }) {
  const { user, role, loading } = useAuth();

  // Mientras carga la sesión
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#0a0f1a",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: "18px",
        }}
      >
        Cargando…
      </div>
    );
  }

  // Si no hay usuario → fuera
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario NO es cliente → fuera
  if (role !== "cliente") {
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien → mostrar la página
  return children;
}
