import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [inspeccion, setInspeccion] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoId, setTecnicoId] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarTodo() {
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      const { data: dataFactura, error: errorFactura } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (errorFactura || !dataFactura) {
        setError("Error cargando factura");
        setLoading(false);
        return;
      }

      setFactura(dataFactura);
      setTecnicoId(dataFactura.tecnico_id || "");

      // Líneas
      const { data: detalle } = await supabase
        .from("facturas_lineas")
        .select("*")
        .eq("factura_id", dataFactura.id);
      setLineas(detalle || []);

      // Cliente
      if (dataFactura.cliente_id) {
        const { data: c } = await supabase
          .from("clientes")
          .select("nombre, direccion, email, telefono")
          .eq("id", dataFactura.cliente_id)
          .maybeSingle();
        setCliente(c || null);
      }

      // Extra / Tarea
      const { data: dataExtra } = await supabase
        .from("extras")
        .select("*")
        .or(`factura_id.eq.${dataFactura.id},contrato_id.eq.${dataFactura.id}`)
        .maybeSingle();
      setInspeccion(dataExtra || null);

      // Técnicos
      const { data: dataTecnicos } = await supabase.from("tecnicos").select("id, nombre, email");
      setTecnicos(dataTecnicos || []);
    } catch (e) {
      console.error("Error en cargarTodo:", e);
      setError("Error cargando datos de la factura.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTodo();
  }, [id]);

  async function borrarFactura() {
    if (!window.confirm("¿Seguro que quieres borrar esta factura y sus datos asociados?")) return;

    setError("");
    setMensaje("");

    try {
      await supabase.from("facturas_lineas").delete().eq("factura_id", id);
      await supabase.from("extras").delete().eq("factura_id", id);
      const { error: errorBorrado } = await supabase.from("facturas").delete().eq("id", id);

      if (errorBorrado) throw errorBorrado;
      navigate("/facturas");
    } catch (e) {
      console.error("Error al borrar factura:", e);
      setError("Error al borrar la factura. Comprueba restricciones de base de datos.");
    }
  }

  async function handleCambiarTecnico(nuevoTecnicoId) {
    const tecnicoVal = nuevoTecnicoId ? Number(nuevoTecnicoId) : null;
    setTecnicoId(tecnicoVal);

    try {
      // Guardar el técnico seleccionado en la factura
      await supabase
        .from("facturas")
        .update({ tecnico_id: tecnicoVal })
        .eq("id", id);

      // Si la factura YA está pagada, actualizamos también la tarea en extras de inmediato
      const estaPagada = factura?.estado === "pagada" || factura?.estado_pago === "pagada";
      if (estaPagada) {
        if (inspeccion) {
          await supabase.from("extras").update({ tecnico_id: tecnicoVal }).eq("id", inspeccion.id);
          setInspeccion((prev) => ({ ...prev, tecnico_id: tecnicoVal }));
        } else if (tecnicoVal) {
          const { data: newExtra, error: insErr } = await supabase.from("extras").insert([
            {
              factura_id: factura.id,
              contrato_id: factura.contrato_id || null,
              cliente_id: factura.cliente_id || null,
              vivienda_id: factura.vivienda_id || null,
              tecnico_id: tecnicoVal,
              descripcion: factura.descripcion || `Servicio ligado a factura #${factura.numero}`,
              estado: "pendiente",
              creado_en: new Date().toISOString(),
            },
          ]).select().single();
          if (!insErr) setInspeccion(newExtra);
        }
      }

      setMensaje("Técnico guardado correctamente.");
    } catch (err) {
      console.error("Error al actualizar técnico:", err);
      setError("No se pudo actualizar el técnico.");
    }
  }

  async function marcarComoPagadaYEnviar() {
    if (!factura) return;
    setMensaje("");
    setError("");

    try {
      // 1. Marcar factura como pagada
      const { error: errorFactura } = await supabase
        .from("facturas")
        .update({ estado: "pagada", estado_pago: "pagada" })
        .eq("id", factura.id);

      if (errorFactura) throw new Error(errorFactura.message);

      setFactura((prev) => ({ ...prev, estado: "pagada", estado_pago: "pagada" }));

      // 2. Crear o activar la tarea en 'extras' para que le llegue al técnico ahora sí
      const tecnicoAAsignar = tecnicoId || factura.tecnico_id || null;

      if (!inspeccion) {
        const { data: newExtra, error: insError } = await supabase.from("extras").insert([
          {
            factura_id: factura.id,
            contrato_id: factura.contrato_id || null,
            cliente_id: factura.cliente_id || null,
            vivienda_id: factura.vivienda_id || null,
            tecnico_id: tecnicoAAsignar,
            descripcion: factura.descripcion || `Servicio ligado a factura #${factura.numero}`,
            estado: "pendiente",
            creado_en: new Date().toISOString(),
          },
        ]).select().single();

        if (insError) throw new Error(insError.message);
        setInspeccion(newExtra || null);
      } else {
        await supabase
          .from("extras")
          .update({ 
            estado: "pendiente", 
            tecnico_id: inspeccion.tecnico_id || tecnicoAAsignar 
          })
          .eq("id", inspeccion.id);

        setInspeccion((prev) => (prev ? { ...prev, estado: "pendiente", tecnico_id: prev.tecnico_id || tecnicoAAsignar } : prev));
      }

      setMensaje("¡Factura marcada como pagada y tarea enviada al técnico con éxito!");
    } catch (e) {
      console.error("Error en marcarComoPagadaYEnviar:", e);
      setError(`Error procesando la petición: ${e.message}`);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div style={estilos.centrado}>Cargando detalle de factura...</div>
      </Menu>
    );
  }

  const estaPagada = factura?.estado === "pagada" || factura?.estado_pago === "pagada";

  return (
    <Menu>
      <div style={estilos.pagina}>
        <div style={estilos.cabeceraFlex}>
          <h1 style={estilos.titulo}>{factura?.numero || `Factura #${factura?.id}`}</h1>
          <span style={{ ...estilos.badgeEstado, background: estaPagada ? "rgba(74, 222, 128, 0.15)" : "rgba(251, 191, 36, 0.15)", color: estaPagada ? "#4ade80" : "#fbbf24" }}>
            {estaPagada ? "Pagada" : "Pendiente"}
          </span>
        </div>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        <div style={estilos.tarjeta}>
          <div style={estilos.gridInfo}>
            <div>
              <span style={estilos.etiquetaChica}>Fecha</span>
              <p style={estilos.valorTexto}>{factura?.fecha || "-"}</p>
            </div>
            <div>
              <span style={estilos.etiquetaChica}>Total Factura</span>
              <p style={{ ...estilos.valorTexto, color: "#4db8ff", fontSize: "18px" }}>
                {Number(factura?.total || 0).toFixed(2)} €
              </p>
            </div>
          </div>

          {cliente && (
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
              <span style={estilos.etiquetaChica}>Cliente</span>
              <p style={{ ...estilos.valorTexto, color: "#fff" }}>{cliente.nombre}</p>
              {cliente.direccion && <p style={{ fontSize: 13, color: "#9fb3c8", marginTop: 2 }}>{cliente.direccion}</p>}
            </div>
          )}

          {factura?.descripcion && (
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
              <span style={estilos.etiquetaChica}>Concepto</span>
              <p style={{ fontSize: 14, color: "#cbd5e1", marginTop: 4, lineHeight: 1.4 }}>{factura.descripcion}</p>
            </div>
          )}

          {lineas && lineas.length > 0 && (
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
              <span style={estilos.etiquetaChica}>Líneas</span>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {lineas.map((l) => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#cbd5e1" }}>{l.concepto}</span>
                    <span style={{ color: "#fff", fontWeight: "700" }}>{Number(l.precio || l.subtotal || 0).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {!estaPagada ? (
            <button
              onClick={marcarComoPagadaYEnviar}
              style={{ ...estilos.botonAccion, background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", color: "#0a0f1a", flex: 1 }}
            >
              ✓ Marcar como Pagada y Enviar al Técnico
            </button>
          ) : inspeccion?.estado === "finalizado" ? (
            <button
              onClick={() => alert("¡El técnico ha finalizado! Ya puedes enviársela al cliente.")}
              style={{ ...estilos.botonAccion, background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#fff", flex: 1 }}
            >
              🚀 Tarea Finalizada - Enviar al Cliente
            </button>
          ) : (
            <button style={{ ...estilos.botonAccion, background: "rgba(255,255,255,0.06)", color: "#94a3b8", cursor: "default", flex: 1, border: "1px solid rgba(255,255,255,0.1)" }} disabled>
              ⏳ Factura Pagada (Esperando que el técnico finalice)
            </button>
          )}

          <button
            onClick={borrarFactura}
            style={estilos.botonBorrar}
          >
            🗑️ Borrar
          </button>
        </div>

        {/* SECCIÓN DE TAREA / TÉCNICO */}
        <div style={{ ...estilos.tarjeta, marginTop: 16, background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}>
          <h3 style={estilos.seccionSubtitulo}>Tarea para Técnico / Inspección</h3>
          
          {!estaPagada ? (
            <p style={{ fontSize: 13, color: "#fbbf24", marginBottom: 12, lineHeight: 1.4 }}>
              ⚠️ Factura pendiente. El técnico <strong>no recibirá la tarea</strong> en su panel hasta que se marque la factura como pagada.
            </p>
          ) : inspeccion?.estado === "finalizado" ? (
            <p style={{ fontSize: 13, color: "#3b82f6", marginBottom: 12, lineHeight: 1.4 }}>
              🚀 El técnico ha marcado la tarea como <strong>finalizada</strong>.
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "#4ade80", marginBottom: 12, lineHeight: 1.4 }}>
              ✓ Factura pagada. La tarea está activa para el técnico seleccionado.
            </p>
          )}

          <label style={estilos.etiqueta}>
            Asignar / Cambiar Técnico Manualmente:
          </label>
          <select
            value={tecnicoId}
            onChange={(e) => handleCambiarTecnico(e.target.value)}
            style={estilos.select}
          >
            <option value="">-- Sin técnico asignado --</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id} style={{ background: "#132033", color: "#fff" }}>
                {t.nombre || t.email || `Técnico #${t.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Menu>
  );
}

const estilos = {
  pagina: { padding: "20px 16px 40px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" },
  centrado: { display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#9fb3c8" },
  cabeceraFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  titulo: { fontSize: 24, color: "#4db8ff", fontWeight: 700, letterSpacing: "-0.5px" },
  badgeEstado: { padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  ok: { marginBottom: 16, color: "#4ade80", background: "rgba(74, 222, 128, 0.12)", border: "1px solid rgba(74, 222, 128, 0.3)", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.4 },
  error: { marginBottom: 16, color: "#ff6b6b", background: "rgba(255, 107, 107, 0.12)", border: "1px solid rgba(255, 107, 107, 0.3)", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.4 },
  tarjeta: { 
    background: "rgba(255, 255, 255, 0.04)", 
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: 20, 
    borderRadius: 16, 
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
    marginBottom: 16 
  },
  gridInfo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  etiquetaChica: { display: "block", fontSize: 11, color: "#9fb3c8", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 4 },
  valorTexto: { fontSize: 15, fontWeight: 700, color: "#fff" },
  seccionSubtitulo: { color: "#4db8ff", marginBottom: 8, fontSize: 16, fontWeight: 600 },
  etiqueta: { display: "block", fontSize: 12, color: "#9fb3c8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 },
  select: { 
    width: "100%", 
    padding: "13px 14px", 
    borderRadius: 10, 
    border: "1px solid rgba(255, 255, 255, 0.12)", 
    background: "#132033", 
    color: "#fff", 
    fontSize: 15,
    outline: "none",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
  },
  botonAccion: {
    padding: "15px 20px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 6px 20px rgba(74, 222, 128, 0.25)",
    transition: "transform 0.1s ease, filter 0.2s",
    textAlign: "center"
  },
  botonBorrar: {
    padding: "15px 20px",
    borderRadius: 12,
    border: "1px solid rgba(239, 68, 68, 0.4)",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ff6b6b",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    transition: "background 0.2s"
  }
};
