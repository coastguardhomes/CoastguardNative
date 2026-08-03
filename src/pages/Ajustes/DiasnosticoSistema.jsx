import React, { useState } from "react";
import Menu from "../../layouts/Menu";

export default function DiagnosticoSistema() {
  const [estado, setEstado] = useState({
    supabase: "Desconocido",
    storage: "Desconocido",
    edge: "Desconocido",
    cron: "Desconocido",
  });

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

  const buttonStyle = {
    background: "#4db8ff",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    boxShadow: "0 0 10px rgba(0,153,255,0.4)",
  };

  const probarSistema = () => {
    // Simulación de estados (luego puedes conectar Supabase real)
    setEstado({
      supabase: "OK",
      storage: "OK",
      edge: "OK",
      cron: "OK",
    });

    setTimeout(() => {
      setEstado({
        supabase: "OK",
        storage: "OK",
        edge: "OK",
        cron: "OK",
      });
    }, 1500);
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
          🛠️ Diagnóstico del Sistema
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Comprueba el estado de los servicios principales de CoastGuard.
          </p>

          <button style={buttonStyle} onClick={probarSistema}>
            Ejecutar diagnóstico
          </button>

          <div style={{ marginTop: "25px" }}>
            <div style={itemStyle}>
              <p style={titleStyle}>🗄️ Supabase</p>
              <p>{estado.supabase}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗂️ Storage</p>
              <p>{estado.storage}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⚡ Edge Functions</p>
              <p>{estado.edge}</p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⏱️ Cron Jobs</p>
              <p>{estado.cron}</p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
