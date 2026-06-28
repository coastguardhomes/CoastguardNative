import React from "react";
import { Link } from "react-router-dom";

const Menu = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0f1f 0%, #02040a 100%)",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            "linear-gradient(90deg, rgba(0,102,204,0.4), rgba(0,153,255,0.2))",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: "700",
            letterSpacing: "1px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          CoastGuard PRO
        </div>

        <nav style={{ display: "flex", gap: "24px" }}>
          <MenuButton to="/">Inicio</MenuButton>
          <MenuButton to="/contratos">Contratos</MenuButton>
          <MenuButton to="/inspecciones">Inspecciones</MenuButton>
          <MenuButton to="/tecnicos">Técnicos</MenuButton>
          <MenuButton to="/clientes">Clientes</MenuButton>
          <MenuButton to="/viviendas">Viviendas</MenuButton>
          <MenuButton to="/galeria">Galería</MenuButton>

          {/* 🟩 FACTURAS — TODO COMPLETO */}
          <MenuButton to="/facturas">Facturas</MenuButton>
          <MenuButton to="/facturas/filtros">Filtros</MenuButton>
          <MenuButton to="/facturas/estadisticas">Estadísticas</MenuButton>

          <MenuButton to="/ajustes">Ajustes</MenuButton>
        </nav>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <span style={{ fontSize: "22px" }}>🔔</span>
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-6px",
                background: "#ff4444",
                color: "#fff",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "700",
              }}
            >
              1
            </span>
          </div>

          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            👤
          </div>
        </div>
      </header>

      <main style={{ padding: "32px" }}>{children}</main>
    </div>
  );
};

const MenuButton = ({ to, children }) => {
  return (
    <Link
      to={to}
      style={{
        padding: "10px 18px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.05)",
        color: "#ffffff",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
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
};

export default Menu;
