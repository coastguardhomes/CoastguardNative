import React, { useEffect, useState } from "react";
import { obtenerFacturas } from "../../services/facturasLista";

export default function FacturasLista() {
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
    <div style={{ padding: 20 }}>
      <h2>Facturas</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Cliente"
          value={filtros.cliente}
          onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
        />
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
        </select>
        <button onClick={cargar}>Filtrar</button>
      </div>

      {facturas.map((f) => (
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
