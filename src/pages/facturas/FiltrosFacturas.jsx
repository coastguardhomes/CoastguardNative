import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerFacturas } from "../../services/facturasLista";

export default function FiltrosFacturas() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    cliente: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const [resultados, setResultados] = useState([]);

  async function aplicarFiltros() {
    const data = await obtenerFacturas(filtros);
    setResultados(data);
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
          textAlign: "center",
        }}
      >
        Filtros de Facturas
      </h2>

      {/* Tarjeta de filtros */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          marginBottom: "25px",
        }}
      >
        <input
          placeholder="Cliente"
          value={filtros.cliente}
          onChange={(e) =>
            setFiltros({ ...filtros, cliente: e.target.value })
          }
          style={{
            padding: "12px",
            width: "100%",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        <select
          value={filtros.estado}
          onChange={(e) =>
            setFiltros({ ...filtros, estado: e.target.value })
          }
          style={{
            padding: "12px",
            width: "100%",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        >
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
        </select>

        <input
          type="date"
          value={filtros.fechaDesde}
          onChange={(e) =>
            setFiltros({ ...filtros, fechaDesde: e.target.value })
          }
          style={{
            padding: "12px",
            width: "100%",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) =>
            setFiltros({ ...filtros, fechaHasta: e.target.value })
          }
          style={{
            padding: "12px",
            width: "100%",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
