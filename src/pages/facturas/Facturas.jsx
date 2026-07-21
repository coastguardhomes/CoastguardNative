import React from "react";
import Menu from "../../layouts/Menu";
import { Link } from "react-router-dom";

export default function Facturas() {
  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Facturas
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          <Link to="/facturas/lista">
            <button
              style={{
                padding: "14px",
                width: "100%",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                marginBottom: "15px",
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              Listado de facturas
            </button>
          </Link>

          <Link to="/facturas/crear">
            <button
              style={{
                padding: "14px",
                width: "100%",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                marginBottom: "15px",
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              Crear factura
            </button>
          </Link>

          <Link to="/facturas/filtros">
            <button
              style={{
                padding: "14px",
                width: "100%",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                marginBottom: "15px",
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              Filtros de facturas
            </button>
          </Link>

          <Link to="/facturas/estadisticas">
            <button
              style={{
                padding: "14px",
                width: "100%",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              Estadísticas de facturas
            </button>
          </Link>
        </div>
      </div>
    </Menu>
  );
}
