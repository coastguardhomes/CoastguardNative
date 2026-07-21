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
    <div style={{ padding: 20, color: "#fff" }}>
      <h2 style={{ color: "#4db8ff" }}>Filtros de Facturas</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Cliente"
          value={filtros.cliente}
          onChange={(e) =>
            setFiltros({ ...filtros, cliente: e.target.value })
          }
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <select
          value={filtros.estado}
          onChange={(e) =>
            setFiltros({ ...filtros, estado: e.target.value })
          }
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
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
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) =>
            setFiltros({ ...filtros, fechaHasta: e.target.value })
          }
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={aplicarFiltros}
          style={{
            padding: "12px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Aplicar filtros
        </button>
      </div>

      <h3 style={{ color: "#4db8ff" }}>Resultados</h3>

      {resultados.map((f) => (
        <div
          key={f.id}
          style={{
            padding: "15px",
            marginBottom: "10px",
            background: "#1e1e1e",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/facturas/ver/${f.id}`)}
        >
          <strong style={{ color: "#4db8ff" }}>Factura #{f.id}</strong><br />
          Cliente: {f.cliente_nombre}<br />
          Total: €{f.total}<br />
          Estado: {f.estado}<br />
          Fecha: {f.fecha}
        </div>
      ))}
    </div>
  );
}
