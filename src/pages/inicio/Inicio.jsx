import React from "react";
import Menu from "../../layouts/Menu";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Inicio() {
  const { role } = useAuth();

  // Seguridad extra: este panel es solo para ADMIN
  if (role && role !== "admin") {
    return null;
  }

  return (
    <Menu>
      <div
        style={{
          padding: "22px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* CABECERA */}
        <header
          style={{
            marginBottom: "28px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#4db8ff",
              textShadow: "0 0 12px rgba(0,153,255,0.6)",
              marginBottom: "6px",
            }}
          >
            CoastGuard · Administración
          </h1>

          <p
            style={{
              opacity: 0.75,
              fontSize: "15px",
            }}
          >
            Panel principal de gestión
          </p>
        </header>

        {/* GRID DE ACCESOS PREMIUM */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
          }}
        >
          <CardAcceso
            to="/clientes"
            titulo="Clientes"
            icono="👥"
            color="#4db8ff"
          />

          <CardAcceso
            to="/viviendas"
            titulo="Viviendas"
            icono="🏠"
            color="#f9d71c"
          />

          <CardAcceso
            to="/tecnicos"
            titulo="Técnicos"
            icono="🛠️"
            color="#ff9f43"
          />

          <CardAcceso
            to="/inspecciones"
            titulo="Inspecciones"
            icono="🔍"
            color="#00e5ff"
          />

          <CardAcceso
            to="/contratos"
            titulo="Contratos"
            icono="📄"
            color="#9b59b6"
          />

          <CardAcceso
            to="/facturas"
            titulo="Facturación"
            icono="💶"
            color="#28a745"
          />
        </section>

        <div style={{ height: "20px" }}></div>
      </div>
    </Menu>
  );
}

/* ------------------ COMPONENTE PREMIUM DE ACCESO ------------------ */

function CardAcceso({ to, titulo, color, icono }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: "14px",
          border: `1px solid rgba(255,255,255,0.12)`,
          padding: "18px",
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: "0 0 12px rgba(0,153,255,0.15)",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            marginBottom: "10px",
            color,
            textAlign: "center",
          }}
        >
          {icono}
        </div>

        <h3
          style={{
            fontSize: "17px",
            fontWeight: "600",
            color: "#fff",
            textAlign: "center",
            marginBottom: "6px",
          }}
        >
          {titulo}
        </h3>

        <div
          style={{
            height: "4px",
            width: "40%",
            background: color,
            margin: "0 auto",
            borderRadius: "999px",
            opacity: 0.8,
          }}
        ></div>
      </div>
    </Link>
  );
}
