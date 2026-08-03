import React from "react";
import Menu from "../../layouts/Menu";

export default function Dependencias() {
  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const itemStyle = {
    marginBottom: "15px",
    lineHeight: "1.6",
    fontSize: "16px",
    opacity: 0.85,
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4db8ff",
    marginBottom: "8px",
    textShadow: "0 0 6px rgba(0,153,255,0.5)",
  };

  // Puedes actualizar estos valores cuando cambies dependencias
  const deps = {
    react: "18.x",
    capacitor: "6.x",
    supabase: "2.x",
    router: "6.x",
    context: "Custom AuthContext",
    pdf: "jsPDF + html2canvas",
    storage: "Supabase Storage",
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
          📦 Dependencias
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Versiones principales utilizadas en CoastGuard.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={itemStyle}>
              <p style={titleStyle}>⚛️ React</p>
              <p>{deps.react}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⚡ Capacitor</p>
              <p>{deps.capacitor}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗄️ Supabase</p>
              <p>{deps.supabase}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🧭 React Router</p>
              <p>{deps.router}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🔐 Sistema de autenticación</p>
              <p>{deps.context}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>📄 Generación de PDF</p>
              <p>{deps.pdf}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗂️ Storage</p>
              <p>{deps.storage}</p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
