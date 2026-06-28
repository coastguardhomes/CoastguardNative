import React, { useState } from "react";
import { obtenerFacturas } from "../../services/facturasLista";

export default function FiltrosFacturas() {
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
    <div style={{ padding: 20 }}>
      <h2>Filtros de Facturas</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Cliente"
          value={filtros.cliente}
          onChange={(e) =>
            setFiltros({ ...filtros, cliente: e.target.value })
          }
        />

        <select
          value={filtros.estado}
          onChange={(e) =>
            setFiltros({ ...filtros, estado: e.target.value })
          }
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
        />

        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) =>
            setFiltros({ ...filtros, fechaHasta: e.target.value })
          }
        />

        <button onClick={aplicarFiltros}>Aplicar filtros</button>
      </div>

      <h3>Resultados</h3>

      {resultados.map((f) => (
        <div
          key={f.id}
          style={{
            padding: 10,
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = `/facturas/ver/${f.id}`)}
        >
          <strong>Factura #{f.id}</strong><br />
          Cliente: {f.cliente_nombre}<br />
          Total: €{f.total}<br />
          Estado: {f.estado}<br />
          Fecha: {f.fecha}
        </div>
      ))}
    </div>
  );
}
