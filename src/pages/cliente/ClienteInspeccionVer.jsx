import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";

const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: `0 0 8px ${COLOR_BRILLO_DORADO}` };

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function cargarDetalle() {
      if (!id) return;

      try {
        setLoading(true);
        setError(false);

        // 1. Intento de consulta completa con relaciones
        let { data, error: errFetch } = await supabase
          .from("inspecciones")
          .select(`
            *,
            viviendas ( direccion, alias, ciudad ),
            tecnicos ( nombre, apellidos )
          `)
          .eq("id", id)
          .maybeSingle();

        // 2. Si la unión de tablas falla, hacemos una consulta simple
        if (errFetch || !data) {
          console.warn("Fallo la consulta con relaciones, reintentando consulta simple...", errFetch);
          const { data: dataSimple, error: errSimple } = await supabase
            .from("inspecciones")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (errSimple || !dataSimple) {
            setError(true);
            return;
          }
          data = dataSimple;
        }

        setInspeccion(data);
      } catch (err) {
        console.error("Error inesperado en detalle inspección:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    cargarDetalle();
  }, [id]);

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "15px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
          paddingBottom: "110px"
        }}
      >
        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate("/cliente/inspecciones")}
          style={{
            background: "transparent",
            border: "none",
            color: COLOR_DORADO,
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          ← Volver a Mis Inspecciones
        </button>

        {loading && (
          <div style={{ textAlign: "center", padding: "50px 0", color: COLOR_DORADO }}>
            <p>Cargando detalle de la inspección...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2 style={{ fontSize: "20px", color: "#38bdf8", marginBottom: "15px" }}>
              No se encontró la inspección
            </h2>
            <button
              onClick={() => navigate("/cliente/inspecciones")}
              style={{
                background: "transparent",
                border: BORDE_DORADO,
                color: COLOR_DORADO,
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer"
              }}
            >
              Volver
            </button>
          </div>
        )}

        {!loading && !error && inspeccion && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* CABECERA DETALLE */}
            <div
              style={{
                background: FONDO_TARJETA,
                border: BORDE_DORADO,
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 0 15px rgba(224, 176, 52, 0.15)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: "800", margin: 0, ...TEXTO_DORADO_BRILLO }}>
                    Inspección #{inspeccion.id.substring(0, 6)}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                    Fecha: {inspeccion.created_at ? new Date(inspeccion.created_at).toLocaleDateString("es-ES") : "N/A"}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    textTransform: "uppercase",
                    background: inspeccion.estado === "completada" || inspeccion.estado === "finalizada" ? "rgba(16, 185, 129, 0.2)" : "rgba(224, 176, 52, 0.2)",
                    color: inspeccion.estado === "completada" || inspeccion.estado === "finalizada" ? "#10b981" : COLOR_DORADO,
                    border: `1px solid ${inspeccion.estado === "completada" || inspeccion.estado === "finalizada" ? "#10b981" : COLOR_DORADO}`
                  }}
                >
                  {inspeccion.estado || "Pendiente"}
                </span>
              </div>
            </div>

            {/* INFORMACIÓN DE LA VIVIENDA */}
            <div
              style={{
                background: FONDO_TARJETA,
                border: BORDE_DORADO,
                borderRadius: "16px",
                padding: "16px"
              }}
            >
              <h3 style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 10px 0", fontWeight: "700" }}>
                Ubicación / Vivienda
              </h3>
              <p style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#e2e8f0" }}>
                {inspeccion.viviendas?.alias || inspeccion.viviendas?.direccion || "Dirección no especificada"}
              </p>
              {inspeccion.viviendas?.ciudad && (
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                  {inspeccion.viviendas.ciudad}
                </p>
              )}
            </div>

            {/* OBSERVACIONES / NOTAS */}
            {inspeccion.observaciones && (
              <div
                style={{
                  background: FONDO_TARJETA,
                  border: BORDE_DORADO,
                  borderRadius: "16px",
                  padding: "16px"
                }}
              >
                <h3 style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 8px 0", fontWeight: "700" }}>
                  Observaciones
                </h3>
                <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0, lineHeight: "1.5" }}>
                  {inspeccion.observaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Menu>
  );
}
