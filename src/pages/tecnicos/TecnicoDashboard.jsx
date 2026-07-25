import React from "react";
import { Link } from "react-router-dom";
import { FaTools, FaHome, FaClipboardList, FaFileContract, FaUser } from "react-icons/fa";

export default function TecnicoDashboard() {
  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "25px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  };

  const cardHover = {
    transform: "scale(1.03)",
    boxShadow: "0 0 18px rgba(0,153,255,0.35)",
  };

  return (
    <div
      style={{
        padding: "25px",
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "700",
          marginBottom: "25px",
          color: "#4db8ff",
          textShadow: "0 0 10px rgba(0,153,255,0.6)",
          textAlign: "center",
        }}
      >
        Panel del Técnico
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
        }}
      >
        <Link to="/tecnico/inspecciones" style={{ textDecoration: "none" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <FaTools size={45} color="#4db8ff" />
            <h3 style={{ marginTop: "12px", color: "#4db8ff" }}>
              Inspecciones asignadas
            </h3>
          </div>
        </Link>

        <Link to="/tecnico/viviendas" style={{ textDecoration: "none" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <FaHome size={45} color="#4db8ff" />
            <h3 style={{ marginTop: "12px", color: "#4db8ff" }}>
              Viviendas asignadas
            </h3>
          </div>
        </Link>

        <Link to="/tecnico/tareas" style={{ textDecoration: "none" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <FaClipboardList size={45} color="#4db8ff" />
            <h3 style={{ marginTop: "12px", color: "#4db8ff" }}>
              Tareas pendientes
            </h3>
          </div>
        </Link>

        <Link to="/tecnico/documentos" style={{ textDecoration: "none" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <FaFileContract size={45} color="#4db8ff" />
            <h3 style={{ marginTop: "12px", color: "#4db8ff" }}>
              Documentos
            </h3>
          </div>
        </Link>

        <Link to="/tecnico/perfil" style={{ textDecoration: "none" }}>
          <div
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <FaUser size={45} color="#4db8ff" />
            <h3 style={{ marginTop: "12px", color: "#4db8ff" }}>
              Mi perfil
            </h3>
          </div>
        </Link>
      </div>
    </div>
  );
}
