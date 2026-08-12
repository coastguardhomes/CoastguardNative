import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../layouts/Menu";
import { supabase } from "../lib/supabase";

const TARJETAS = [
  { clave: "clientes", etiqueta: "Clientes", ruta: "/clientes", icono: "👤" },
  { clave: "viviendas", etiqueta: "Viviendas", ruta: "/viviendas", icono: "🏠" },
  { clave: "contratos", etiqueta: "Contratos", ruta: "/contratos", icono: "📄" },
  { clave: "facturas", etiqueta: "Facturas", ruta: "/facturas", icono: "💳" },
  { clave: "inspecciones", etiqueta: "Inspecciones", ruta: "/inspecciones", icono: "📋" },
  { clave: "tecnicos", etiqueta: "Técnicos", ruta: "/tecnicos", icono: "🛠️" },
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
          background: "#05080f",
          padding: "16px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Cabecera Principal Estilo Panel de Mandos */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d1527 0%, #080e1a 100%)",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "16px",
            boxShadow: "0 0 15px rgba(234, 179, 8, 0.15), inset 0 0 10px rgba(234, 179, 8, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: "800",
                margin: "0 0 2px 0",
                color: "#eab308",
                letterSpacing: "1px",
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(234, 179, 8, 0.5)",
              }}
            >
              PANEL DE CONTROL
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0, fontWeight: "500" }}>
              Métricas generales y gestión de CoastGuard.
            </p>
          </div>
          <div
            style={{
              background: "transparent",
              border: "1px solid rgba(234, 179, 8, 0.6)",
              borderRadius: "8px",
              padding: "4px 10px",
              color: "#eab308",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              boxShadow: "0 0 8px rgba(234, 179, 8, 0.2)",
            }}
          >
            ADMIN
          </div>
        </div>

        {/* Grid de Tarjetas Compactas de 2 Columnas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {TARJETAS.map(({ clave, etiqueta, ruta, icono }) => (
            <Link key={clave} to={ruta} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "linear-gradient(145deg, #0b1220 0%, #060913 100%)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  border: "1px solid rgba(234, 179, 8, 0.35)",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(234, 179, 8, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "85px",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>
                    {etiqueta}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      padding: "4px 6px",
                      borderRadius: "8px",
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
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#eab308",
                      textShadow: "0 0 10px rgba(234, 179, 8, 0.6)",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {cargando ? "…" : conteos[clave] ?? "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sección de Gráficas Estilo Panel Táctico (Inspirado en la referencia) */}
        <div
          style={{
            background: "linear-gradient(145deg, #0b1220 0%, #060913 100%)",
            borderRadius: "14px",
            padding: "14px",
            border: "1px solid rgba(234, 179, 8, 0.35)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(234, 179, 8, 0.08)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              borderBottom: "1px solid rgba(234, 179, 8, 0.2)",
              paddingBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#eab308",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              🔍 Actividad Diaria
            </span>
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>Semanal</span>
          </div>

          {/* Gráfica de Líneas simulando la referencia */}
          <div style={{ height: "100px", position: "relative", display: "flex", alignItems: "flex-end", paddingBottom: "15px" }}>
            {/* Líneas horizontales de guía de fondo */}
            <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.1)", top: "0%" }}></div>
            <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.1)", top: "50%" }}></div>
            <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.1)", top: "100%" }}></div>

            {/* Puntos y trazo simulado de la gráfica */}
            <svg style={{ position: "absolute", width: "100%", height: "85px", overflow: "visible" }}>
              <polyline
                fill="none"
                stroke="#eab308"
                strokeWidth="2.5"
                points="15,65 70,50 125,58 180,30 235,45 290,20 345,35"
              />
              {/* Puntos brillantes */}
              {[[15, 65], [70, 50], [125, 58], [180, 30], [235, 45], [290, 20], [345, 35]].map(([cx, cy], idx) => (
                <circle key={idx} cx={cx} cy={cy} r="3.5" fill="#eab308" stroke="#05080f" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

          {/* Leyenda de días */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </div>
      </div>
    </Menu>
  );
}
