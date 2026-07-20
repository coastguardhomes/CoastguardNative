import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Menu({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0f1f 0%, #02040a 100%)",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          width: "100%",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 200,
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          CoastGuard PRO
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <div
          onClick={() => setOpen(!open)}
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: "26px" }}>☰</span>
        </div>
      </header>

      {/* MENÚ LATERAL */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-260px",
          width: "260px",
          height: "100vh",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          padding: "24px",
          transition: "0.3s",
          zIndex: 300,
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#4db8ff" }}>Menú</h2>

        <MenuItem to="/">🏠 Inicio</MenuItem>
        <MenuItem to="/clientes">👥 Clientes</MenuItem>
        <MenuItem to="/viviendas">🏡 Viviendas</MenuItem>
        <MenuItem to="/tecnicos">🛠 Técnicos</MenuItem>
        <MenuItem to="/inspecciones">📋 Inspecciones</MenuItem>
        <MenuItem to="/contratos">📑 Contratos</MenuItem>
        <MenuItem to="/facturas">💶 Facturas</MenuItem>
        <MenuItem to="/facturas/filtros">🔍 Filtros</MenuItem>
        <MenuItem to="/facturas/estadisticas">📊 Estadísticas</MenuItem>
        <MenuItem to="/extras">✨ Extras</MenuItem>
        <MenuItem to="/ajustes">⚙ Ajustes</MenuItem>
      </aside>

      {/* CONTENIDO */}
      <main style={{ padding: "32px" }}>{children}</main>
    </div>
  );
}

function MenuItem({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "12px 16px",
        marginBottom: "12px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.05)",
        color: "#fff",
        textDecoration: "none",
        fontSize: "16px",
        transition: "0.3s",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "rgba(0,153,255,0.3)";
        e.target.style.boxShadow = "0 0 12px rgba(0,153,255,0.6)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "rgba(255,255,255,0.05)";
        e.target.style.boxShadow = "none";
      }}
    >
      {children}
    </Link>
  );
}
