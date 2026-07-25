import React from "react";

export default function FiltrosFacturas({ filtros, setFiltros }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.2)",
        marginBottom: "20px",
      }}
    >
      <h3
        style={{
          marginBottom: "15px",
          color: "#4db8ff",
          fontWeight: "700",
          fontSize: "20px",
        }}
      >
        Filtros
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Buscar por cliente */}
        <input
          type="text"
          placeholder="Buscar por cliente"
          value={filtros.cliente || ""}
          onChange={(e) =>
            setFiltros({ ...filtros, cliente: e.target.value })
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        {/* Estado */}
        <select
          value={filtros.estado || ""}
          onChange={(e) =>
            setFiltros({ ...filtros, estado: e.target.value })
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        >
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
        </select>

        {/* Fecha desde */}
        <input
          type="date"
          value={filtros.fechaDesde || ""}
          onChange={(e) =>
            setFiltros({ ...filtros, fechaDesde: e.target.value })
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        {/* Fecha hasta */}
        <input
          type="date"
          value={filtros.fechaHasta || ""}
          onChange={(e) =>
            setFiltros({ ...filtros, fechaHasta: e.target.value })
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        <button
          onClick={() =>
            setFiltros({
              cliente: "",
              estado: "",
              fechaDesde: "",
              fechaHasta: "",
            })
          }
          style={{
            padding: "12px",
            borderRadius: "8px",
            background: "#4db8ff",
            border: "none",
            color: "#000",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
