import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function FinalizarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarInspeccion();
    }
  }, [id]);

  async function cargarInspeccion() {
    setLoading(true);
    setMensaje("");

    try {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", String(id))
        .single();

      if (error) {
        setMensaje(`Error cargando inspección: ${error.message}`);
      } else if (!data) {
        setMensaje("No se encontró la inspección solicitada.");
      } else {
        setInspeccion(data);
      }
    } catch (err) {
      setMensaje("Error de conexión al cargar la inspección.");
    } finally {
      setLoading(false);
    }
  }

  async function aprobarInspeccion() {
    setProcesando(true);
    setMensaje("");

    try {
      const { error } = await supabase
        .from("inspecciones")
        .update({
          estado: "aprobada",
          fecha_aprobacion: new Date().toISOString(),
        })
        .eq("id", String(id));

      if (error) {
        setMensaje("Error al aprobar la inspección: " + error.message);
        setProcesando(false);
        return;
      }

      setMensaje("¡Inspección aprobada y cerrada con éxito! ✔");

      setTimeout(() => {
        navigate("/inspecciones");
      }, 1500);
    } catch (e) {
      setMensaje("Error procesando la aprobación.");
      setProcesando(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ height: "100vh", background: "#0a0f1a", color: "#4db8ff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px", fontFamily: "Inter, sans-serif", fontWeight: "bold" }}>
          Cargando datos de la inspección...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "25px", fontSize: "26px", fontWeight: "700", textShadow: "0 0 8px rgba(0,153,255,0.6)", textAlign: "center" }}>
          Revisión y Aprobación de Inspección
        </h1>

        {mensaje && (
          <div style={{ marginBottom: "20px", padding: "12px", background: mensaje.includes("éxito") ? "rgba(74, 222, 128, 0.15)" : "rgba(255, 107, 107, 0.15)", border: `1px solid ${mensaje.includes("éxito") ? "#4ade80" : "#ff6b6b"}`, borderRadius: "10px", color: mensaje.includes("éxito") ? "#4ade80" : "#ff6b6b", fontWeight: "600", textAlign: "center" }}>
            {mensaje}
          </div>
        )}

        {inspeccion ? (
          <>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 12px rgba(0,153,255,0.2)", marginBottom: "25px" }}>
              <p style={{ marginBottom: "12px", fontSize: "15px" }}>
                <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "Sin fecha"}
              </p>

              <p style={{ marginBottom: "12px", fontSize: "15px" }}>
                <strong style={{ color: "#4db8ff" }}>Estado actual:</strong>{" "}
                <span style={{ padding: "3px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                  {inspeccion.estado}
                </span>
              </p>

              <p style={{ marginBottom: "12px", fontSize: "15px" }}>
                <strong style={{ color: "#4db8ff" }}>Notas del técnico:</strong>{" "}
                {inspeccion.notas_tecnico || inspeccion.observaciones || "El técnico no dejó notas escritas."}
              </p>
            </div>

            <button
              onClick={aprobarInspeccion}
              disabled={procesando}
              style={{ padding: "14px", width: "100%", background: "#4ade80", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: procesando ? "not-allowed" : "pointer", boxShadow: "0 0 10px rgba(74,222,128,0.4)", opacity: procesando ? 0.6 : 1, marginBottom: "15px" }}
            >
              {procesando ? "Aprobando..." : "✔ Aprobar y Dar por Finalizada"}
            </button>

            <button
              onClick={() => navigate("/inspecciones")}
              style={{ padding: "12px", width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#ccc", borderRadius: "10px", fontSize: "15px", cursor: "pointer" }}
            >
              Volver a la lista
            </button>
          </>
        ) : (
          !mensaje && <div style={{ textAlign: "center", opacity: 0.7 }}>No hay datos para mostrar.</div>
        )}
      </div>
    </Menu>
  );
}
