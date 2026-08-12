import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../layouts/Menu";
import { supabase } from "../lib/supabase";

/**
 * Dashboard del administrador con métricas en tiempo real y estilo profesional.
 */

const TARJETAS = [
  { clave: "clientes", etiqueta: "Clientes", ruta: "/clientes", icono: "👤", color: "#38bdf8" },
  { clave: "viviendas", etiqueta: "Viviendas", ruta: "/viviendas", icono: "🏠", color: "#a78bfa" },
  { clave: "contratos", etiqueta: "Contratos", ruta: "/contratos", icono: "📄", color: "#facc15" },
  { clave: "facturas", etiqueta: "Facturas", ruta: "/facturas", icono: "💳", color: "#f87171" },
  { clave: "inspecciones", etiqueta: "Inspecciones", ruta: "/inspecciones", icono: "📋", color: "#f59e0b" },
  { clave: "tecnicos", etiqueta: "Técnicos", ruta: "/tecnicos", icono: "🛠️", color: "#4ade80" },
];

export default function AdminDashboard() {
  const [conteos, setConteos] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const resultado = {};

      await Promise.all(
        TARJETAS.map(async ({ clave }) => {
          const { count, error } = await supabase
            .from(clave)
            .select("*", { count: "exact", head: true });
          resultado[clave] = error ? null : count ?? 0;
        })
      );

      if (!cancelado) {
        setConteos(resultado);
        setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "28px 20px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Cabecera del Panel */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              margin: "0 0 6px 0",
              color: "#4db8ff",
              letterSpacing: "-0.5px",
            }}
          >
            Panel de Control
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Métricas generales e indicadores de rendimiento del sistema CoastGuard.
          </p>
        </div>

        {/* Grid de Tarjetas de Indicadores */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {TARJETAS.map(({ clave, etiqueta, ruta, icono, color }) => (
            <Link key={clave} to={ruta} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>
                    {etiqueta}
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "8px",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icono}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "30px",
                      fontWeight: "700",
                      color: cargando ? "#64748b" : color,
                      letterSpacing: "-1px",
                    }}
                  >
                    {cargando ? "…" : conteos[clave] ?? "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sección Complementaria de Accesos Rápida */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", margin: "0 0 16px 0" }}>
            Acciones Rápidas
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/inspecciones"
              style={{
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(77, 184, 255, 0.1)",
                border: "1px solid rgba(77, 184, 255, 0.2)",
                color: "#4db8ff",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              📋 Ver Inspecciones
            </Link>
            <Link
              to="/tecnicos"
              style={{
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(74, 222, 128, 0.1)",
                border: "1px solid rgba(74, 222, 128, 0.2)",
                color: "#4ade80",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              🛠️ Gestionar Técnicos
            </Link>
          </div>
        </div>
      </div>
    </Menu>
  );
}
