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
          background: "linear-gradient(135deg, #070b14 0%, #0d1626 100%)",
          padding: "24px 20px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado Estilo Premium Dorado/Azul */}
        <div
          style={{
            background: "linear-gradient(90deg, rgba(13, 22, 38, 0.9) 0%, rgba(20, 32, 54, 0.9) 100%)",
            border: "1px solid rgba(224, 176, 52, 0.3)",
            borderRadius: "14px",
            padding: "18px 20px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(224, 176, 52, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "700",
                margin: "0 0 4px 0",
                color: "#e0b034",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                textShadow: "0 0 10px rgba(224, 176, 52, 0.4)",
              }}
            >
              Panel de Control
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              Métricas generales y gestión de CoastGuard.
            </p>
          </div>
          <div
            style={{
              background: "rgba(224, 176, 52, 0.1)",
              border: "1px solid rgba(224, 176, 52, 0.4)",
              borderRadius: "10px",
              padding: "8px 12px",
              color: "#e0b034",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "1px",
            }}
          >
            ADMIN
          </div>
        </div>

        {/* Grid de Tarjetas Estilo Lujo (Azul Marino y Bordes Dorados) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          {TARJETAS.map(({ clave, etiqueta, ruta, icono }) => (
            <Link key={clave} to={ruta} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "linear-gradient(145deg, #0f172a 0%, #090d16 100%)",
                  borderRadius: "14px",
                  padding: "18px",
                  border: "1px solid rgba(224, 176, 52, 0.25)",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "110px",
                  boxSizing: "border-box",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Detalle decorativo dorado superior */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, transparent, rgba(224, 176, 52, 0.6), transparent)",
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#cbd5e1" }}>
                    {etiqueta}
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      background: "rgba(224, 176, 52, 0.08)",
                      border: "1px solid rgba(224, 176, 52, 0.2)",
                      padding: "6px 8px",
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
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#e0b034",
                      textShadow: "0 0 10px rgba(224, 176, 52, 0.3)",
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

        {/* Sección de Accesos Rápidos Estilo Dorado */}
        <div
          style={{
            background: "linear-gradient(145deg, #0d1626 0%, #070b14 100%)",
            borderRadius: "14px",
            padding: "20px",
            border: "1px solid rgba(224, 176, 52, 0.25)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#e0b034",
              margin: "0 0 14px 0",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Acciones Rápidas
          </h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              to="/inspecciones"
              style={{
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(224, 176, 52, 0.1)",
                border: "1px solid rgba(224, 176, 52, 0.3)",
                color: "#e0b034",
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
                background: "rgba(224, 176, 52, 0.1)",
                border: "1px solid rgba(224, 176, 52, 0.3)",
                color: "#e0b034",
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
