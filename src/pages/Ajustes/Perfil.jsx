import React from "react";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Perfil() {
  const { user } = useAuth();

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const labelStyle = {
    fontSize: "14px",
    opacity: 0.7,
    marginBottom: "6px",
  };

  const valueStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4db8ff",
    textShadow: "0 0 6px rgba(0,153,255,0.5)",
  };

  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          👤 Perfil
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Información de tu cuenta en CoastGuard.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={labelStyle}>Correo electrónico</p>
              <p style={valueStyle}>{user?.email || "Sin datos"}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={labelStyle}>ID de usuario</p>
              <p style={valueStyle}>{user?.id || "Sin datos"}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={labelStyle}>Estado</p>
              <p style={valueStyle}>
                {user ? "Sesión activa" : "No autenticado"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
