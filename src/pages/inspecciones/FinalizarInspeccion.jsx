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

  // 🔥 Cargar inspección completa
  useEffect(() => {
    async function cargarInspeccion() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMensaje("Error cargando inspección");
        setLoading(false);
        return;
      }

      setInspeccion(data);
      setLoading(false);
    }

    cargarInspeccion();
  }, [id]);

  // 🔥 Finalizar inspección (Marca el checklist y el estado para revisión del admin)
  async function finalizar() {
    setProcesando(true);
    setMensaje("");

    try {
      const { error } = await supabase
        .from("inspecciones")
        .update({
          estado: "pendiente_aprobacion",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        setMensaje("Error al finalizar la inspección: " + error.message);
        setProcesando(false);
        return;
      }

      setMensaje("¡Inspección finalizada con éxito! Enviada al administrador para su revisión ✔");

      setTimeout(() => {
        navigate("/panel-tecnico");
      }, 1500);
    } catch (e) {
      setMensaje("Error finalizando inspección");
      setProcesando(false);
    }
  }

  if (loading || !inspeccion) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
          }}
        >
          Cargando inspección...
        </div>
      </Menu>
    );
  }

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
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Finalizar Inspección
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: mensaje.includes("éxito")
                ? "rgba(74, 222, 128, 0.15)"
                : "rgba(255, 107, 107, 0.15)",
              border: `1px solid ${mensaje.includes("éxito") ? "#4ade80" : "#ff6b6b"}`,
              borderRadius: "10px",
              color: mensaje.includes("éxito") ? "#4ade80" : "#ff6b6b",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "25px",
          }}
        >
          <p style={{ marginBottom: "12px", fontSize: "16px" }}>
            <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {String(inspeccion.fecha || "").slice(0, 10)}
          </p>

          <p style={{ marginBottom: "12px", fontSize: "16px" }}>
            <strong style={{ color: "#4db8ff" }}>Estado actual:</strong>{" "}
            <span style={{ padding: "3px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "6px" }}>
              {inspeccion.estado}
            </span>
          </p>

          <p style={{ marginBottom: "12px", fontSize: "16px" }}>
            <strong style={{ color: "#4db8ff" }}>Checklist:</strong>{" "}
            {inspeccion.checklist_completado ? "Completado ✔" : "Revisar ítems ✗"}
          </p>

          <p style={{ marginBottom: "12px", fontSize: "16px" }}>
            <strong style={{ color: "#4db8ff" }}>Notas del técnico:</strong>{" "}
            {inspeccion.observaciones || inspeccion.notas || "Sin observaciones adicionales"}
          </p>
        </div>

        <button
          onClick={finalizar}
          disabled={procesando}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "#4ade80",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: procesando ? "not-allowed" : "pointer",
            boxShadow: "0 0 10px rgba(74,222,128,0.4)",
            opacity: procesando ? 0.6 : 1,
          }}
        >
          {procesando ? "Enviando al administrador..." : "🚀 Enviar al administrador para aprobación"}
        </button>
      </div>
    </Menu>
  );
}
