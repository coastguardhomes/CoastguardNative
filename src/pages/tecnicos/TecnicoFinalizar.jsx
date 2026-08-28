import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function TecnicoFinalizar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspeccion, setInspeccion] = useState(null);
  const [notas, setNotas] = useState("");
  const [alerta, setAlerta] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) cargarInspeccion();
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
      setAlerta(Boolean(insp.alerta));
    } catch {
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
      const updateData = {
        notas_tecnico: notas,
        observaciones: notas,
        alerta: alerta,
        estado: "completada_tecnico",
        fecha_finalizacion: new Date().toISOString(),
      };

      if (alerta) {
        updateData.alerta_vista = false;
      }

      const { error } = await supabase
        .from("inspecciones")
        .update(updateData)
        .eq("id", String(id));

      if (error) {
        setMensaje("Error guardando en base de datos: " + error.message);
        setExito(false);
        setGuardando(false);
        return;
      }

      setExito(true);
      setMensaje("¡Inspección enviada a revisión con éxito! Redirigiendo...");

      setTimeout(() => {
        navigate("/tecnico");
      }, 1500);

    } catch {
      setMensaje("Error crítico al finalizar la inspección.");
      setExito(false);
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ minHeight: "100vh", background: FONDO_PRINCIPAL, color: COLOR_DORADO, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Inter, sans-serif" }}>
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando inspección...</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: FONDO_PRINCIPAL, minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "100px", boxSizing: "border-box" }}>
        <h1 style={{ ...TEXTO_DORADO_BRILLO, marginBottom: "20px", fontSize: "20px", fontWeight: "900", textAlign: "center", textTransform: "uppercase" }}>
          Finalizar inspección
        </h1>

        {mensaje && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", background: exito ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", border: exito ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "12px", color: exito ? "#34d399" : "#ef4444", fontSize: "13px", fontWeight: "700", textAlign: "center" }}>
            {mensaje}
          </div>
        )}

        {inspeccion && (
          <div style={{ background: FONDO_TARJETA, padding: "16px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY, fontSize: "13px" }}>
            <p style={{ marginBottom: "8px" }}>
              <strong style={{ color: COLOR_DORADO }}>Fecha:</strong> {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "Sin fecha"}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: COLOR_DORADO }}>Estado actual:</strong>{" "}
              <span style={{ padding: "3px 8px", background: "rgba(11, 19, 32, 0.9)", border: BORDE_DORADO_FINO, borderRadius: "6px", color: "#fff", fontWeight: "700" }}>
                {inspeccion.estado}
              </span>
            </p>
          </div>
        )}

        <div style={{ background: FONDO_TARJETA, padding: "14px 16px", borderRadius: "12px", border: BORDE_DORADO_FINO, marginBottom: "20px", display: "flex", alignItems: "center", boxShadow: SOMBRA_LUXURY }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", width: "100%" }}>
            <input
              type="checkbox"
              checked={alerta}
              onChange={(e) => setAlerta(e.target.checked)}
              style={{ width: "20px", height: "20px", marginRight: "12px", cursor: "pointer", accentColor: "#ef4444" }}
            />
            <span style={{ fontSize: "13.5px", color: "#ef4444", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              ⚠️ Marcar como ALERTA / Urgencia importante
            </span>
          </label>
        </div>

        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Escribe aquí las notas de la inspección..."
          style={{ width: "100%", height: "130px", padding: "14px", borderRadius: "12px", border: BORDE_DORADO_FINO, background: "rgba(11, 19, 32, 0.8)", color: "#fff", fontSize: "14px", marginBottom: "20px", boxSizing: "border-box", outline: "none" }}
        />

        <button
          onClick={finalizarInspeccion}
          disabled={guardando || exito}
          style={{ padding: "14px", width: "100%", background: exito ? "#10b981" : guardando ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #10b981 0%, #047857 100%)", color: guardando ? "#64748b" : "#ffffff", borderRadius: "16px", border: guardando ? BORDE_DORADO_FINO : "1px solid rgba(16, 185, 129, 0.6)", fontWeight: "900", fontSize: "14px", cursor: (guardando || exito) ? "not-allowed" : "pointer", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: guardando ? "none" : "0 4px 15px rgba(16, 185, 129, 0.3)", transition: "all 0.2s ease" }}
        >
          {guardando ? "Guardando..." : exito ? "✔ Finalizada" : "Finalizar inspección"}
        </button>

        <Link to={`/tecnico/inspeccion/${id}/checklist`} style={{ textDecoration: "none" }}>
          <button style={{ padding: "12px", width: "100%", background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)", color: "#fff", borderRadius: "12px", border: BORDE_DORADO_FINO, fontWeight: "900", fontSize: "13px", cursor: "pointer", marginBottom: "12px", textTransform: "uppercase", boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)" }}>
            Checklist
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/fotos`} style={{ textDecoration: "none" }}>
          <button style={{ padding: "12px", width: "100%", background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)", color: "#fff", borderRadius: "12px", border: BORDE_DORADO_FINO, fontWeight: "900", fontSize: "13px", cursor: "pointer", marginBottom: "12px", textTransform: "uppercase", boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)" }}>
            Fotos
          </button>
        </Link>

        <Link to={`/tecnico`} style={{ textDecoration: "none" }}>
          <button style={{ padding: "12px", width: "100%", background: "transparent", color: COLOR_DORADO, borderRadius: "12px", border: BORDE_DORADO_FINO, fontWeight: "900", fontSize: "13px", cursor: "pointer", textTransform: "uppercase" }}>
            Volver al panel
          </button>
        </Link>
      </div>
    </Menu>
  );
}
