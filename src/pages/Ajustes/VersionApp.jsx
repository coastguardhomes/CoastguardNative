import React from "react";
import Menu from "../../layouts/Menu";

export default function VersionApp() {
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

  // Puedes cambiar estos valores cuando actualices la app
  const versionApp = "1.0.0";
  const versionBackend = "Supabase v2";
  const versionCapacitor = "Capacitor 6";
  const versionReact = "React 18";

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
          🧩 Versión de la App
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Información técnica de CoastGuard.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={itemStyle}>
              <p style={titleStyle}>📱 Versión de CoastGuard</p>
              <p>{versionApp}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗄️ Backend</p>
              <p>{versionBackend}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⚡ Capacitor</p>
              <p>{versionCapacitor}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⚛️ React</p>
              <p>{versionReact}</p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
