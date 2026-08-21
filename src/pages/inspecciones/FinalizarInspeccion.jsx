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
  const [esError, setEsError] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (id) cargarInspeccion();
  }, [id]);

  async function cargarInspeccion() {
    setLoading(true);
    try {
      // Ampliamos la consulta para obtener también el email del cliente y la dirección de la vivienda
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*, clientes(nombre, email), viviendas(direccion)")
        .eq("id", String(id))
        .single();

      if (error || !data) {
        setMensaje("No se encontró la inspección.");
        setEsError(true);
      } else {
        setInspeccion(data);
      }
    } catch {
      setMensaje("Error de conexión.");
      setEsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function aprobarInspeccion() {
    setProcesando(true);
    setMensaje("Aprobando inspección...");
    setEsError(false);

    try {
      // 1. Cambiar estado a aprobada
      const { error: updateErr } = await supabase
        .from("inspecciones")
        .update({
          estado: "aprobada",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", String(id));

      if (updateErr) throw updateErr;

      // 2. Ejecutar funciones de Supabase para PDF y Email
      let pdfOk = false;
      let emailOk = false;
      let pdfUrl = null;

      try {
        const resPdf = await supabase.functions.invoke("pdf-inspeccion", { body: { inspeccion_id: id } });
        if (!resPdf.error && resPdf.data?.url) {
          pdfUrl = resPdf.data.url;
          pdfOk = true;
        }
      } catch (e) {
        console.error("Error al invocar pdf-inspeccion:", e);
      }

      try {
        if (pdfUrl && inspeccion?.clientes?.email) {
          const resEmail = await supabase.functions.invoke("enviar-email", { 
            body: { 
              email: inspeccion.clientes.email,
              pdfUrl: pdfUrl,
              cliente_nombre: inspeccion.clientes.nombre || "Estimado cliente",
              direccion: inspeccion.viviendas?.direccion || "Dirección no especificada",
              fecha: inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "",
              tipo_servicio: inspeccion.tipo_servicio || "Inspección",
              observaciones: inspeccion.notas_tecnico || inspeccion.observaciones || ""
            } 
          });
          if (!resEmail.error) emailOk = true;
        }
      } catch (e) {
        console.error("Error al invocar enviar-email:", e);
      }

      // 3. Feedback real al administrador
      if (pdfOk && emailOk) {
        setMensaje("¡Inspección aprobada, PDF generado y email enviado con éxito! ✔");
      } else if (!pdfOk && !emailOk) {
        setMensaje("Inspección aprobada en BD, pero falló la generación de PDF y el envío de Email (Revisa las Edge Functions de Supabase).");
        setEsError(true);
      } else {
        setMensaje("Inspección aprobada. Revisa los servicios de correo/PDF.");
      }

      setTimeout(() => {
        navigate("/inspecciones");
      }, 2500);

    } catch (e) {
      setMensaje("Error al aprobar: " + e.message);
      setEsError(true);
      setProcesando(false);
    }
  }

  // 🚀 FUNCIÓN: Eliminar inspección y sus datos relacionados (checklist y fotos)
  async function eliminarInspeccion() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta inspección?");
    if (!confirmar) return;

    setProcesando(true);
    try {
      await supabase.from("checklist_inspeccion").delete().eq("inspeccion_id", id);
      await supabase.from("fotos_inspeccion").delete().eq("inspeccion_id", id);

      const { error } = await supabase.from("inspecciones").delete().eq("id", id);

      if (error) throw error;

      alert("Inspección eliminada correctamente");
      navigate("/inspecciones");
    } catch (e) {
      alert("Error eliminando inspección: " + e.message);
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
          <div style={{ marginBottom: "20px", padding: "12px", background: esError ? "rgba(255,107,107,0.15)" : "rgba(0,153,255,0.15)", border: `1px solid ${esError ? "#ff6b6b" : "#4db8ff"}`, borderRadius: "10px", color: esError ? "#ff6b6b" : "#4db8ff", textAlign: "center", fontSize: "14px" }}>
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

            {/* 🚀 BOTÓN DE ELIMINAR */}
            <button
              onClick={eliminarInspeccion}
              disabled={procesando}
              style={{ marginTop: "12px", padding: "14px", width: "100%", background: "#ef4444", color: "#fff", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: "pointer", opacity: procesando ? 0.6 : 1 }}
            >
              Eliminar Inspección
            </button>
          </>
        )}
      </div>
    </Menu>
  );
              }
