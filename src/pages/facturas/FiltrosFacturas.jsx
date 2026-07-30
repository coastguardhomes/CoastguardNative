import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

/**
 * Filtros de facturas.
 *
 * Este componente estaba pensado para recibir `filtros` y `setFiltros` como
 * props, pero App.jsx lo monta directamente en /facturas/filtros SIN props:
 * `filtros.cliente` lanzaba un TypeError y la pantalla se quedaba en blanco
 * nada más entrar. Ahora, si no recibe props, gestiona su propio estado,
 * carga las facturas y muestra el resultado filtrado debajo.
 */
export default function FiltrosFacturas({ filtros: filtrosProp, setFiltros: setFiltrosProp }) {
  const [filtrosLocal, setFiltrosLocal] = useState({
    cliente: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const esAutonomo = filtrosProp === undefined;
  const filtros = esAutonomo ? filtrosLocal : filtrosProp;
  const setFiltros = esAutonomo ? setFiltrosLocal : setFiltrosProp;

  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState({});

  useEffect(() => {
    if (!esAutonomo) return;

    let cancelado = false;

    async function cargar() {
      const { data } = await supabase
        .from("facturas")
        .select("*")
        .order("fecha", { ascending: false });

      const { data: listaClientes } = await supabase
        .from("clientes")
        .select("id, nombre");

      if (cancelado) return;

      setFacturas(data || []);
      setClientes(
        Object.fromEntries((listaClientes || []).map((c) => [c.id, c.nombre]))
      );
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [esAutonomo]);

  const filtradas = facturas.filter((f) => {
    if (filtros.estado && f.estado !== filtros.estado) return false;
    if (filtros.fechaDesde && String(f.fecha) < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && String(f.fecha) > filtros.fechaHasta) return false;
    if (filtros.cliente) {
      const nombre = (clientes[f.cliente_id] || "").toLowerCase();
      if (!nombre.includes(filtros.cliente.toLowerCase())) return false;
    }
    return true;
  });

  const panel = (
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
        <input
          type="text"
          placeholder="Buscar por cliente"
          value={filtros.cliente || ""}
          onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
          style={estiloCampo}
        />

        <select
          value={filtros.estado || ""}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          style={estiloCampo}
        >
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
        </select>

        <input
          type="date"
          value={filtros.fechaDesde || ""}
          onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
          style={estiloCampo}
        />

        <input
          type="date"
          value={filtros.fechaHasta || ""}
          onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
          style={estiloCampo}
        />

        <button
          onClick={() =>
            setFiltros({ cliente: "", estado: "", fechaDesde: "", fechaHasta: "" })
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

  // Uso como componente embebido: sólo el panel, como antes.
  if (!esAutonomo) return panel;

  // Uso como pantalla (/facturas/filtros): panel + resultados.
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
        <h2 style={{ color: "#4db8ff", marginBottom: 18 }}>Buscar facturas</h2>

        {panel}

        <p style={{ color: "#9fb3c8", marginBottom: 12 }}>
          {filtradas.length} resultado{filtradas.length === 1 ? "" : "s"}
        </p>

        {filtradas.map((f) => (
          <Link
            key={f.id}
            to={`/facturas/ver/${f.id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "14px",
                borderRadius: "12px",
                marginBottom: "10px",
                color: "#fff",
              }}
            >
              <p>
                <strong style={{ color: "#4db8ff" }}>
                  {f.numero || `#${f.id}`}
                </strong>{" "}
                — {clientes[f.cliente_id] || "cliente"}
              </p>
              <p style={{ color: "#9fb3c8", fontSize: 13.5 }}>
                {String(f.fecha || "").slice(0, 10)} · {f.estado} ·{" "}
                {Number(f.total || 0).toFixed(2)} €
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Menu>
  );
}

const estiloCampo = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
};
