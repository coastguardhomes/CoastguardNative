import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [inspeccion, setInspeccion] = useState(null);
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

      const { data: detalle } = await supabase
        .from("facturas_lineas")
        .select("*")
        .eq("factura_id", dataFactura.id);
      setLineas(detalle || []);

      if (dataFactura.cliente_id) {
        const { data: c } = await supabase
          .from("clientes")
          .select("nombre, direccion, email, telefono")
          .eq("id", dataFactura.cliente_id)
          .maybeSingle();
        setCliente(c || null);
      }

      const { data: dataExtra } = await supabase
        .from("extras")
        .select("*")
        .or(`factura_id.eq.${dataFactura.id},contrato_id.eq.${dataFactura.id}`)
        .maybeSingle();
      setInspeccion(dataExtra || null);

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

  async function marcarComoPagadaYEnviar() {
    if (!factura) return;
    setMensaje("");
    setError("");

    try {
      const { error: errorFactura } = await supabase
        .from("facturas")
        .update({ estado: "pagada", estado_pago: "pagada" })
        .eq("id", factura.id);

      if (errorFactura) throw new Error(errorFactura.message);

      setFactura((prev) => ({ ...prev, estado: "pagada", estado_pago: "pagada" }));

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
          <span 
            style={{ 
              ...estilos.badgeEstado, 
              background: estaPagada ? "rgba(16, 185, 129, 0.15)" : "rgba(224, 176, 52, 0.15)", 
              color: estaPagada ? "#34d399" : COLOR_DORADO,
              borderColor: estaPagada ? "rgba(16, 185, 129, 0.4)" : BORDE_DORADO_FINO
            }}
          >
            {estaPagada ? "Pagada" : "Pendiente"}
          </span>
        </div>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        <div style={estilos.tarjeta}>
          <div style={estilos.gridInfo}>
            <div>
              <span style={estilos.etiquetaChica}>Fecha</span>
              <p style={estilos.valorTexto}>{factura?.fecha ? String(factura.fecha).slice(0, 10) : "-"}</p>
            </div>
            <div>
              <span style={estilos.etiquetaChica}>Total Factura</span>
              <p style={{ ...estilos.valorTexto, color: COLOR_DORADO, fontSize: "18px" }}>
                {Number(factura?.total || 0).toFixed(2)} €
              </p>
            </div>
          </div>

          {cliente && (
            <div style={{ marginTop: "14px", borderTop: BORDE_DORADO_FINO, paddingTop: "12px" }}>
              <span style={estilos.etiquetaChica}>Cliente</span>
              <p style={{ ...estilos.valorTexto, color: "#fff" }}>{cliente.nombre}</p>
              {cliente.direccion && <p style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{cliente.direccion}</p>}
            </div>
          )}

          {factura?.descripcion && (
            <div style={{ marginTop: "14px", borderTop: BORDE_DORADO_FINO, paddingTop: "12px" }}>
              <span style={estilos.etiquetaChica}>Concepto</span>
              <p style={{ fontSize: "13px", color: "#ccc", marginTop: "4px", lineHeight: "1.4" }}>
                {factura.descripcion}
              </p>
            </div>
          )}

          {lineas && lineas.length > 0 && (
            <div style={{ marginTop: "14px", borderTop: BORDE_DORADO_FINO, paddingTop: "12px" }}>
              <span style={estilos.etiquetaChica}>Líneas</span>
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {lineas.map((l) => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#ccc" }}>{l.concepto}</span>
                    <span style={{ color: COLOR_DORADO, fontWeight: "700" }}>{Number(l.precio || l.subtotal || 0).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {!estaPagada ? (
            <button
              onClick={marcarComoPagadaYEnviar}
              style={{ ...estilos.botonAccion, background: "linear-gradient(135deg, #10b981 0%, #047857 100%)", color: "#fff", flex: 1, border: "1px solid rgba(16, 185, 129, 0.6)", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}
            >
              ✓ Marcar como Pagada y Enviar al Técnico
            </button>
          ) : inspeccion?.estado === "finalizado" ? (
            <button
              onClick={() => alert("¡El técnico ha finalizado! Ya puedes enviársela al cliente.")}
              style={{ ...estilos.botonAccion, background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)", color: "#fff", flex: 1, border: BORDE_DORADO_FINO, boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)" }}
            >
              🚀 Tarea Finalizada - Enviar al Cliente
            </button>
          ) : (
            <button style={{ ...estilos.botonAccion, background: FONDO_TARJETA, color: COLOR_DORADO, cursor: "default", flex: 1, border: BORDE_DORADO_FINO }} disabled>
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

        <div style={{ ...estilos.tarjeta, marginTop: "16px" }}>
          <h2 style={estilos.seccionSubtitulo}>Tarea para Técnico / Inspección</h2>
          
          {!estaPagada ? (
            <p style={{ fontSize: "12px", color: COLOR_DORADO, marginBottom: "12px", lineHeight: "1.4" }}>
              ⚠️ Factura pendiente. El técnico <strong>no recibirá la tarea</strong> en su panel hasta que se marque la factura como pagada.
            </p>
          ) : inspeccion?.estado === "finalizado" ? (
            <p style={{ fontSize: "12px", color: "#38bdf8", marginBottom: "12px", lineHeight: "1.4" }}>
              🚀 El técnico ha marcado la tarea como <strong>finalizada</strong>.
            </p>
          ) : (
            <p style={{ fontSize: "12px", color: "#34d399", marginBottom: "12px", lineHeight: "1.4" }}>
              ✓ Factura pagada. La tarea está activa para el técnico seleccionado.
            </p>
          )}
        </div>
      </div>
    </Menu>
  );
}

const estilos = {
  pagina: { 
    padding: "20px", 
    background: FONDO_PRINCIPAL, 
    minHeight: "100vh", 
    color: "#fff", 
    fontFamily: "Inter, sans-serif",
    paddingBottom: "100px",
    boxSizing: "border-box"
  },
  centrado: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    height: "60vh", 
    color: COLOR_DORADO,
    background: FONDO_PRINCIPAL,
    fontWeight: "700"
  },
  cabeceraFlex: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "20px" 
  },
  titulo: { 
    ...TEXTO_DORADO_BRILLO,
    fontSize: "20px", 
    fontWeight: "900", 
    textTransform: "uppercase" 
  },
  badgeEstado: { 
    padding: "4px 12px", 
    borderRadius: "20px", 
    fontSize: "11px", 
    fontWeight: "700", 
    textTransform: "uppercase", 
    letterSpacing: "0.5px",
    border: "1px solid"
  },
  ok: { 
    marginBottom: "16px", 
    color: "#34d399", 
    background: "rgba(16, 185, 129, 0.15)", 
    border: "1px solid rgba(16, 185, 129, 0.4)", 
    borderRadius: "12px", 
    padding: "12px 16px", 
    fontSize: "13px", 
    fontWeight: "700",
    textAlign: "center"
  },
  error: { 
    marginBottom: "16px", 
    color: "#ef4444", 
    background: "rgba(239, 68, 68, 0.15)", 
    border: "1px solid rgba(239, 68, 68, 0.4)", 
    borderRadius: "12px", 
    padding: "12px 16px", 
    fontSize: "13px", 
    fontWeight: "700",
    textAlign: "center"
  },
  tarjeta: { 
    background: FONDO_TARJETA, 
    padding: "20px", 
    borderRadius: "16px", 
    border: BORDE_DORADO_FINO, 
    boxShadow: SOMBRA_LUXURY,
    marginBottom: "16px",
    boxSizing: "border-box"
  },
  gridInfo: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    gap: "16px" 
  },
  etiquetaChica: { 
    display: "block", 
    fontSize: "11px", 
    color: COLOR_DORADO, 
    textTransform: "uppercase", 
    letterSpacing: "0.8px", 
    fontWeight: "700", 
    marginBottom: "4px" 
  },
  valorTexto: { 
    fontSize: "14px", 
    fontWeight: "700", 
    color: "#fff" 
  },
  seccionSubtitulo: { 
    ...TEXTO_DORADO_BRILLO,
    marginBottom: "12px", 
    fontSize: "15px", 
    fontWeight: "900",
    textTransform: "uppercase"
  },
  botonAccion: {
    padding: "14px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "13px",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxSizing: "border-box"
  },
  botonBorrar: {
    padding: "14px 20px",
    borderRadius: "16px",
    border: "1px solid rgba(239, 68, 68, 0.5)",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxSizing: "border-box"
  }
};
