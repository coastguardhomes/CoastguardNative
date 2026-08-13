import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TecnicoFinalizar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspeccion, setInspeccion] = useState(null);
  const [notas, setNotas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarInspeccion();
    }
  }, [id, user]);

  async function cargarInspeccion() {
    setLoading(true);
    setMensaje("");

    try {
      const { data: insp, error: inspError } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", String(id))
        .single();

      if (inspError || !insp) {
        setMensaje(`Error cargando inspección: ${inspError?.message || "No encontrada"}`);
        setLoading(false);
        return;
      }

      setInspeccion(insp);
      setNotas(insp.notas_tecnico || insp.observaciones || "");
    } catch (e) {
      setMensaje("Error de conexión al cargar la inspección.");
    } finally {
      setLoading(false);
    }
  }

  async function finalizarInspeccion() {
    if (!notas.trim()) {
      setMensaje("Debes añadir notas antes de finalizar.");
      setExito(false);
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const { error } = await supabase
        .from("inspecciones")
        .update({
          notas_tecnico: notas,
          observaciones: notas,
          estado: "completada_tecnico",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", String(id));

      if (error) {
        setMensaje("Error guardando en base de datos: " + error.message);
        setExito(false);
        setGuardando(false);
        return;
      }

      // Intentar ejecutar funciones adicionales (PDF / Email) sin bloquear el flujo si fallan
      try {
        await supabase.functions.invoke("pdf-inspeccion", { body: { inspeccion_id: id } });
        await supabase.functions.invoke("enviar-email", { body: { inspeccion_id: id, tipo: "inspeccion_finalizada" } });
      } catch (errFunc) {
        console.warn("Aviso en Edge Functions:", errFunc);
      }

      setExito(true);
      setMensaje("¡Inspección finalizada con éxito! Redirigiendo al panel...");

      // Pausa de 1.5 segundos para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        navigate("/tecnico");
      }, 1500);

    } catch (e) {
      setMensaje("Error crítico al finalizar la inspección.");
      setExito(false);
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ height: "100vh", background: "#0a0f1a", color: "#4db8ff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px", fontFamily: "Inter, sans-serif", fontWeight: "bold" }}>
          Cargando inspección...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "20px", fontSize: "26px", fontWeight: "700", textShadow: "0 0 8px rgba(0,153,255,0.6)", textAlign: "center" }}>
          Finalizar inspección
        </h1>

        {mensaje && (
          <div style={{ marginBottom: "15px", padding: "12px", background: exito ? "rgba(74, 222, 128, 0.2)" : "rgba(255, 107, 107, 0.2)", border: `1px solid ${exito ? "#4ade80" : "#ff6b6b"}`, borderRadius: "8px", color: exito ? "#4ade80" : "#ff6b6b", fontSize: "15px", fontWeight: "600", textAlign: "center" }}>
            {mensaje}
          </div>
        )}

        {inspeccion && (
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 12px rgba(0,153,255,0.2)", marginBottom: "20px" }}>
            <p style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "Sin fecha"}
            </p>
            <p>
              <strong style={{ color: "#4db8ff" }}>Estado actual:</strong>{" "}
              <span style={{ padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                {inspeccion.estado}
              </span>
            </p>
          </div>
        )}

        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Escribe aquí las notas de la inspección..."
          style={{ width: "100%", height: "130px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "15px", marginBottom: "20px", boxSizing: "border-box" }}
        />

        <button
          onClick={finalizarInspeccion}
          disabled={guardando || exito}
          style={{ padding: "14px", width: "100%", background: exito ? "#10b981" : guardando ? "#666" : "#4ade80", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: (guardando || exito) ? "not-allowed" : "pointer", marginBottom: "15px" }}
        >
          {guardando ? "Guardando e informando..." : exito ? "✔ Finalizada" : "Finalizar inspección"}
        </button>

        <Link to={`/tecnico/inspeccion/${id}/checklist`} style={{ textDecoration: "none" }}>
          <button style={{ padding: "12px", width: "100%", background: "#4db8ff", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", marginBottom: "12px" }}>
            Checklist
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/fotos`} style={{ textDecoration: "none" }}>
          <button style={{ padding: "12px", width: "100%", background: "#1e90ff", color: "#fff", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", marginBottom: "12px" }}>
            Fotos
          </button>
        </Link>

        <Link to={`/tecnico`} style={{ textDecoration: "none" }}>
          <button style={{ padding: "12px", width: "100%", background: "#ffcc00", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
            Volver al panel
          </button>
        </Link>
      </div>
    </Menu>
  );
}
