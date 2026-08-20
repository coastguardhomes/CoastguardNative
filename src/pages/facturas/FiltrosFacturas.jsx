import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

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
        background: FONDO_TARJETA,
        padding: "20px",
        borderRadius: "16px",
        border: BORDE_DORADO_FINO,
        boxShadow: SOMBRA_LUXURY,
        marginBottom: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          ...TEXTO_DORADO_BRILLO,
          fontSize: "18px",
          fontWeight: "900",
          marginBottom: "16px",
          textTransform: "uppercase",
        }}
      >
        Filtros
      </h2>

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
          style={{ ...estiloCampo, cursor: "pointer" }}
        >
          <option value="" style={{ background: "#0b1320", color: "#fff" }}>Estado</option>
          <option value="pendiente" style={{ background: "#0b1320", color: "#fff" }}>Pendiente</option>
          <option value="pagada" style={{ background: "#0b1320", color: "#fff" }}>Pagada</option>
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
            padding: "14px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
            border: BORDE_DORADO_FINO,
            color: "#fff",
            fontWeight: "900",
            fontSize: "13px",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
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
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: "20px",
            fontWeight: "900",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Buscar facturas
        </h1>

        {panel}

        <p style={{ color: COLOR_DORADO, marginBottom: "12px", fontSize: "13px", fontWeight: "700" }}>
          {filtradas.length} resultado{filtradas.length === 1 ? "" : "s"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtradas.map((f) => (
            <Link
              key={f.id}
              to={`/facturas/ver/${f.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: FONDO_TARJETA,
                  border: BORDE_DORADO_FINO,
                  padding: "16px",
                  borderRadius: "16px",
                  boxShadow: SOMBRA_LUXURY,
                  color: "#fff",
                  boxSizing: "border-box",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                <p style={{ margin: "0 0 6px 0" }}>
                  <strong style={{ color: COLOR_DORADO }}>
                    {f.numero || `#${f.id}`}
                  </strong>{" "}
                  — <span style={{ color: "#fff" }}>{clientes[f.cliente_id] || "cliente"}</span>
                </p>
                <p style={{ margin: 0, opacity: 0.8, fontSize: "12px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Fecha:</strong> {String(f.fecha || "").slice(0, 10)} ·{" "}
                  <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
                  <span style={{ color: f.estado === "pagada" ? "#34d399" : COLOR_DORADO, fontWeight: "700" }}>
                    {f.estado}
                  </span>{" "}
                  · <strong style={{ color: COLOR_DORADO }}>Total:</strong> {Number(f.total || 0).toFixed(2)} €
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Menu>
  );
}

const estiloCampo = {
  backgroundColor: "rgba(11, 19, 32, 0.8)",
  border: BORDE_DORADO_FINO,
  borderRadius: "12px",
  padding: "12px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};
