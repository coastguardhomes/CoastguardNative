import { useState } from "react";
import { Link } from "react-router-dom";

export default function Menu() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {/* TOP BAR */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "#0a0f1a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          justifyContent: "space-between",
          fontFamily: "Inter, sans-serif",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* BOTÓN HAMBURGUESA */}
        <div
          onClick={toggleMenu}
          style={{
            width: 32,
            height: 22,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <span style={{ height: 3, background: "#4db8ff", borderRadius: 2 }}></span>
          <span style={{ height: 3, background: "#4db8ff", borderRadius: 2 }}></span>
          <span style={{ height: 3, background: "#4db8ff", borderRadius: 2 }}></span>
        </div>

        <h2
          style={{
            marginLeft: 20,
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            fontWeight: "700",
          }}
        >
          CoastGuard
        </h2>
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-270px",
          width: 270,
          height: "100vh",
          background: "#012a4a",
          color: "#fff",
          paddingTop: 25,
          transition: "left 0.3s ease",
          zIndex: 999,
          boxShadow: open ? "4px 0 12px rgba(0,0,0,0.4)" : "none",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: 25,
            color: "#4db8ff",
            fontWeight: "700",
            textShadow: "0 0 6px rgba(0,153,255,0.5)",
          }}
        >
          Menú
        </h3>

        {/* OPCIONES DEL MENÚ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            to="/inicio"
            style={{
              padding: "14px 20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Inicio
          </Link>

          <Link
            to="/clientes"
            style={{
              padding: "14px 20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Clientes
          </Link>

          <Link
            to="/tecnicos"
            style={{
              padding: "14px 20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Técnicos
          </Link>

          <Link
            to="/viviendas"
            style={{
              padding: "14px 20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
