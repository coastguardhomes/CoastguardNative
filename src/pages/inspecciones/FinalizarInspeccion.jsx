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

  // ⭐ SISTEMA AUTOMÁTICO DE PUNTOS
  function calcularPuntos(v) {
    let puntos = 0;

    if (v.metros_cuadrados > 80 && v.metros_cuadrados <= 120) puntos += 5;
    else if (v.metros_cuadrados > 120 && v.metros_cuadrados <= 180) puntos += 10;
    else if (v.metros_cuadrados > 180) puntos += 15;

    if (v.habitaciones > 1) puntos += (v.habitaciones - 1) * 2;
    if (v.banos > 1) puntos += (v.banos - 1) * 3;

    if (v.tiene_piscina) puntos += 10;
    if (v.tiene_jardin) puntos += 8;
    if (v.tiene_garaje) puntos += 4;
    if (v.tiene_sotano) puntos += 6;

    return puntos;
  }

  function calcularPrecio(v) {
    const puntos = calcularPuntos(v);
    return Number((puntos * 1.5).toFixed(2));
  }

  useEffect(() => {
    if (id) cargarInspeccion();
  }, [id]);

  async function cargarInspeccion() {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("inspecciones")
        .select(`
          *,
          viviendas (
            id,
            direccion,
            ciudad,
            localidad,
            metros_cuadrados,
            habitaciones,
            banos,
            tiene_piscina,
            tiene_jardin,
            tiene_garaje,
            tiene_sotano
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        const resSimple = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        data = resSimple.data;
        error = resSimple.error;
      }

      if (error || !data) {
        setMensaje("No se encontró la inspección con ID: " + id);
        setEsError(true);
      } else {
        setInspeccion(data);
      }
    } catch (e) {
      console.error(e);
      setMensaje("Error de conexión al cargar la inspección.");
      setEsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function aprobarInspeccion() {
    setProcesando(true);
    setMensaje("Finalizando inspección, generando PDF y enviando correo...");
    setEsError(false);

    try {
      const { error: updateErr } = await supabase
        .from("inspecciones")
        .update({
          estado: "finalizada",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateErr) throw updateErr;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headersAuth = token ? { Authorization: `Bearer ${token}` } : {};

      const resPdf = await supabase.functions.invoke("pdf-inspeccion", { 
        body: { inspeccionId: id, inspeccion_id: id, id: id },
        headers: headersAuth
      });

      if (resPdf.error) throw new Error("Error en PDF: " + resPdf.error.message);

      // ⭐ CALCULAR PRECIO AUTOMÁTICO DE LA VIVIENDA
      const vivienda = inspeccion.viviendas;
      const precioAuto = calcularPrecio(vivienda);

      // ⭐ CREAR FACTURA AUTOMÁTICA DE INSPECCIÓN
      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: inspeccion.cliente_id,
            vivienda_id: inspeccion.vivienda_id,
            inspeccion_id: id,
            tipo: "inspeccion",
            descripcion: `Inspección técnica — ${inspeccion.fecha}`,
            base: precioAuto,
            iva: (precioAuto * 0.21).toFixed(2),
            total: (precioAuto * 1.21).toFixed(2),
            estado: "pendiente",
            fecha: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (!facturaError) {
        const facturaId = facturaData.id;

        try {
          await supabase.functions.invoke("factura-pdf", {
            body: { facturaId },
          });
        } catch (e) {
          console.error("Error generando factura PDF:", e);
        }

        try {
          await supabase.functions.invoke("enviar-email", {
            body: { id: facturaId, tipo: "factura" },
          });
        } catch (e) {
          console.error("Error enviando factura:", e);
        }
      }

      const resEmail = await supabase.functions.invoke("enviar-email", { 
        body: { inspeccionId: id, inspeccion_id: id, id: id, tipo: "inspeccion_aprobada" },
        headers: headersAuth
      });

      if (resEmail.error) throw new Error("Error en Email: " + resEmail.error.message);

      setMensaje("¡Inspección finalizada, PDF generado y email enviado con éxito! ✔");
      setEsError(false);

      setTimeout(() => {
        navigate("/inspecciones");
      }, 2500);

    } catch (e) {
      console.error("Fallo detallado:", e);
      setMensaje(e.message);
      setEsError(true);
      setProcesando(false);
    }
  }

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

  const direccionReal = inspeccion?.viviendas?.direccion || inspeccion?.direccion || "Dirección no especificada";
  const localidadReal = inspeccion?.viviendas?.ciudad || inspeccion?.viviendas?.localidad || inspeccion?.localidad || "No especificada";

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "25px", fontSize: "24px", textAlign: "center" }}>
          Revisión y Finalización
        </h1>

        {mensaje && (
          <div style={{ marginBottom: "20px", padding: "12px", background: esError ? "rgba(255,107,107,0.15)" : "rgba(74,222,128,0.15)", border: `1px solid ${esError ? "#ff6b6b" : "#4ade80"}`, borderRadius: "10px", color: esError ? "#ff6b6b" : "#4ade80", textAlign: "center", fontSize: "14px", wordBreak: "break-word" }}>
            {mensaje}
          </div>
        )}

        {inspeccion && (
          <>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "25px" }}>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#4db8ff" }}>Dirección:</strong> {direccionReal}</p>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#4db8ff" }}>Localidad:</strong> {localidadReal}</p>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#4db8ff" }}>Fecha:</strong> {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "-"}</p>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#4db8ff" }}>Estado actual:</strong> {inspeccion.estado || "pendiente"}</p>
              <p><strong style={{ color: "#4db8ff" }}>Notas del técnico:</strong> {inspeccion.notas_tecnico || inspeccion.observaciones || "Sin observaciones"}</p>
            </div>

            <button
              onClick={aprobarInspeccion}
              disabled={procesando}
              style={{ padding: "14px", width: "100%", background: "#4ade80", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: "pointer", opacity: procesando ? 0.6 : 1 }}
            >
              {procesando ? "Procesando..." : "✔ Finalizar y Enviar al Cliente"}
            </button>

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
