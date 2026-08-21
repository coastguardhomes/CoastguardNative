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
