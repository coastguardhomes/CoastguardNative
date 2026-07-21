import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerFacturas } from "../../services/facturasLista";

export default function FacturasLista() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  async function cargar() {
    const data = await obtenerFacturas(filtros);
    setFacturas(data);
  }

  useEffect(() => {
    cargar();
  }, []);

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
        Facturas
      </h2>

      {/* Filtros */}
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
          onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
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
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
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

        <button
          onClick={cargar}
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
          Filtrar
        </button>
      </div>

      {/* Listado */}
      {facturas.map((f) => (
        <div
          key={f.id}
          style={{
            padding: "18px",
            marginBottom: "15px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/facturas/ver/${f.id}`)}
        >
          <strong style={{ color: "#4db8ff", fontSize: "18px" }}>
            Factura #{f.id}
          </strong>
          <p style={{ marginTop: "8px" }}>Cliente: {f.cliente_nombre}</p>
          <p>Total: €{f.total}</p>
          <p>Estado: {f.estado}</p>
          <p>Fecha: {f.fecha}</p>
        </div>
      ))}
    </div>
  );
}
