import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Inspecciones() {
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarInspecciones();
  }, []);

  async function cargarInspecciones() {
    setLoading(true);
    try {
      // 1. Cargamos las inspecciones ordenadas de más antigua a más nueva
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .order("fecha", { ascending: true });

      if (error) {
        setErrorMsg("Error al obtener inspecciones: " + error.message);
        setLoading(false);
        return;
      }

      let listaInspecciones = data || [];

      // 2. Cruzar con viviendas para asegurar dirección y localidad reales si existen
      if (listaInspecciones.length > 0) {
        const viviendaIds = [...new Set(listaInspecciones.map(i => i.vivienda_id).filter(Boolean))];

        let viviendasMap = {};
        if (viviendaIds.length > 0) {
          const { data: dataViviendas } = await supabase
            .from("viviendas")
            .select("id, direccion, ciudad, localidad, alias")
            .in("id", viviendaIds);

          if (dataViviendas) {
            viviendasMap = dataViviendas.reduce((acc, viv) => {
              acc[viv.id] = viv;
              return acc;
            }, {});
          }
        }

        listaInspecciones = listaInspecciones.map(item => ({
          ...item,
          viviendas: viviendasMap[item.vivienda_id] || null
        }));
      }

      setInspecciones(listaInspecciones);
    } catch {
      setErrorMsg("Error conectando con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "20px", fontSize: "28px", fontWeight: "700", textAlign: "center" }}>
          Inspecciones
        </h1>

        <Link to="/inspecciones/nueva" style={{ textDecoration: "none" }}>
          <button style={{ padding: "14px", width: "100%", background: "#4db8ff", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginBottom: "25px" }}>
            Nueva inspección
          </button>
        </Link>

        {errorMsg && (
          <div style={{ padding: "10px", background: "rgba(255,107,107,0.2)", border: "1px solid #ff6b6b", color: "#ff6b6b", borderRadius: "8px", marginBottom: "15px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#4db8ff", marginTop: "30px" }}>Cargando inspecciones...</div>
        ) : inspecciones.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", marginTop: "30px" }}>No hay inspecciones registradas.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {inspecciones.map((insp, index) => {
              // Obtener dirección y localidad reales
              const direccionReal = insp.viviendas?.direccion || insp.viviendas?.alias || insp.direccion;
              const localidadReal = insp.viviendas?.ciudad || insp.viviendas?.localidad || insp.localidad || "No especificada";
              
              // Fecha formateada
              const fechaFormateada = insp.fecha ? String(insp.fecha).slice(0, 10) : "Sin fecha";

              // Numeración limpia: La más antigua (índice 0) será la Nº 01
              const numeroCorrelativo = String(index + 1).padStart(2, '0');
              
              // Título profesional sin UUID
              const titulo = direccionReal 
                ? `Inspección - ${direccionReal}` 
                : `Inspección Nº ${numeroCorrelativo}`;

              return (
                <div
                  key={insp.id}
                  onClick={() => navigate(`/inspecciones/finalizar/${insp.id}`)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                  }}
                >
                  <h3 style={{ color: "#4db8ff", fontSize: "16px", marginBottom: "8px" }}>
                    {titulo}
                  </h3>
                  <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px" }}>
                    <strong>Dirección:</strong> {direccionReal || "No especificada"}
                  </p>
                  <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px" }}>
                    <strong>Localidad:</strong> {localidadReal}
                  </p>
                  <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px" }}>
                    <strong>Fecha:</strong> {fechaFormateada}
                  </p>
                  <p style={{ color: "#ccc", fontSize: "14px" }}>
                    <strong>Estado:</strong>{" "}
                    <span style={{ color: insp.estado === "completada_tecnico" ? "#4ade80" : insp.estado === "finalizada" ? "#60a5fa" : "#facc15" }}>
                      {insp.estado || "pendiente"}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Menu>
  );
}
