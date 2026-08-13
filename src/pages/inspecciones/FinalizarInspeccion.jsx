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
    if (id) cargarInspeccion();
  }, [id]);

  async function cargarInspeccion() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", String(id))
        .single();

      if (error || !data) {
        setMensaje("No se encontró la inspección.");
      } else {
        setInspeccion(data);
      }
    } catch {
      setMensaje("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  async function aprobarInspeccion() {
    setProcesando(true);
    setMensaje("Aprobando, generando PDF y enviando notificación...");

    try {
      // 1. Cambiar estado a aprobada y guardar fecha
      const { error } = await supabase
        .from("inspecciones")
        .update({
          estado: "aprobada",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", String(id));

      if (error) throw error;

      // 2. Disparar Edge Functions para PDF y Email al cliente
      try {
        await supabase.functions.invoke("pdf-inspeccion", { body: { inspeccion_id: id } });
        await supabase.functions.invoke("enviar-email", { body: { inspeccion_id: id, tipo: "inspeccion_aprobada" } });
      } catch (fErr) {
        console.warn("Aviso en funciones Edge:", fErr);
      }

      setMensaje("¡Inspección aprobada, PDF generado y email enviado con éxito! ✔");

      setTimeout(() => {
        navigate("/inspecciones");
      }, 1800);
    } catch (e) {
      setMensaje("Error al aprobar: " + e.message);
      setProcesando(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ height: "100vh", background: "#0a0f1a", color: "#4db8ff", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Cargando inspección...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "25px", fontSize: "24px", textAlign: "center" }}>
          Revisión y Aprobación
        </h1>

        {mensaje && (
          <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(0,153,255,0.15)", border: "1px solid #4db8ff", borderRadius: "10px", color: "#4db8ff", textAlign: "center" }}>
            {mensaje}
          </div>
        )}

        {inspeccion && (
          <>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "25px" }}>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#4db8ff" }}>Fecha:</strong> {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "-"}</p>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#4db8ff" }}>Estado actual:</strong> {inspeccion.estado}</p>
              <p><strong style={{ color: "#4db8ff" }}>Notas del técnico:</strong> {inspeccion.notas_tecnico || inspeccion.observaciones || "Sin observaciones"}</p>
            </div>

            <button
              onClick={aprobarInspeccion}
              disabled={procesando}
              style={{ padding: "14px", width: "100%", background: "#4ade80", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: "pointer", opacity: procesando ? 0.6 : 1 }}
            >
              {procesando ? "Procesando..." : "✔ Aprobar y Enviar al Cliente"}
            </button>
          </>
        )}
      </div>
    </Menu>
  );
}
