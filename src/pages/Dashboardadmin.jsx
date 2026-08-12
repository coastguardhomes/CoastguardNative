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
  const [datosGrafica, setDatosGrafica] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      const resultado = {};

      // 1. Cargar conteos de tarjetas
      await Promise.all(
        TARJETAS.map(async ({ clave }) => {
          const { count, error } = await supabase
            .from(clave)
            .select("*", { count: "exact", head: true });
          resultado[clave] = error ? null : count ?? 0;
        })
      );

      // 2. Cargar inspecciones reales para la gráfica de la semana (Lunes a Domingo)
      // Buscamos las inspecciones y su fecha (asumiendo columna 'created_at' o 'fecha')
      const { data: inspeccionesData, error: errorInsp } = await supabase
        .from("inspecciones")
        .select("created_at, fecha");

      const conteoDias = [0, 0, 0, 0, 0, 0, 0]; // Lun, Mar, Mié, Jue, Vie, Sáb, Dom

      if (!errorInsp && inspeccionesData) {
        inspeccionesData.forEach((item) => {
          const fechaStr = item.fecha || item.created_at;
          if (fechaStr) {
            const d = new Date(fechaStr);
            let dia = d.getDay(); // 0 es Domingo, 1 es Lunes...
            // Ajustar para que 0 sea Lunes y 6 sea Domingo
            dia = dia === 0 ? 6 : dia - 1;
            if (dia >= 0 && dia < 7) {
              conteoDias[dia]++;
            }
          }
        });
      }

      if (!cancelado) {
        setConteos(resultado);
        setDatosGrafica(conteoDias);
        setCargando(false);
      }
    }

    cargarDatos();
    return () => {
      cancelado = true;
    };
  }, []);

  // Calcular el valor máximo para escalar la gráfica de forma dinámica (mínimo 10 para que luzca bien)
  const maxValor = Math.max(10, ...datosGrafica);
  const alturaSVG = 90;
  const anchoSVG = 300;

  // Mapear los puntos de los 7 días a coordenadas SVG exactas
  const puntosCoordenadas = datosGrafica.map((valor, index) => {
    const x = 35 + (index * (anchoSVG - 45)) / 6;
    const y = alturaSVG - (valor / maxValor) * (alturaSVG - 15) - 10;
    return { x, y, valor };
  });

  const stringPuntos = puntosCoordenadas.map((p) => `${p.x},${p.y}`).join(" ");

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

        {/* Gráfica Real IDÉNTICA a la Referencia (Con Eje Numérico Izquierdo) */}
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
          {/* Cabecera de la Gráfica */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
              borderBottom: "1px solid rgba(234, 179, 8, 0.2)",
              paddingBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#eab308",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              🔍 Inspecciones por Día
            </span>
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>Semanal</span>
          </div>

          <div style={{ display: "flex", position: "relative", height: "105px" }}>
            {/* Eje Numérico Izquierdo (0, 3, 6, 10 estilo imagen de referencia) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "#64748b",
                paddingRight: "6px",
                textAlign: "right",
                width: "16px",
                height: "85px",
              }}
            >
              <span>{maxValor}</span>
              <span>{Math.round(maxValor * 0.66)}</span>
              <span>{Math.round(maxValor * 0.33)}</span>
              <span>0</span>
            </div>

            {/* Contenedor del Gráfico SVG */}
            <div style={{ flex: 1, position: "relative", height: "90px" }}>
              {/* Líneas de guía horizontales de fondo */}
              <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.12)", top: "0%" }}></div>
              <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.08)", top: "33%" }}></div>
              <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.08)", top: "66%" }}></div>
              <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(234, 179, 8, 0.12)", top: "100%" }}></div>

              <svg style={{ width: "100%", height: "95px", overflow: "visible" }} viewBox={`0 0 ${anchoSVG} ${alturaSVG}`}>
                {/* Línea principal dorada */}
                <polyline
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={stringPuntos}
                />
                {/* Puntos brillantes con sombra y valor flotante */}
                {puntosCoordenadas.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#eab308"
                      stroke="#05080f"
                      strokeWidth="1.5"
                      style={{ filter: "drop-shadow(0 0 4px #eab308)" }}
                    />
                    {p.valor > 0 && (
                      <text
                        x={p.x}
                        y={p.y - 8}
                        fill="#eab308"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.valor}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Leyenda de Días */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
              color: "#94a3b8",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "6px",
              paddingLeft: "22px",
            }}
          >
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
