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
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarTodo() {
    setLoading(true);
    // 1. Factura
    const { data: dataFactura } = await supabase.from("facturas").select("*").eq("id", id).maybeSingle();
    setFactura(dataFactura);

    if (dataFactura) {
      // 2. Líneas y Cliente
      const { data: detalle } = await supabase.from("facturas_lineas").select("*").eq("factura_id", dataFactura.id);
      setLineas(detalle || []);
      if (dataFactura.cliente_id) {
        const { data: c } = await supabase.from("clientes").select("nombre, direccion, email, telefono").eq("id", dataFactura.cliente_id).maybeSingle();
        setCliente(c);
      }
      // 3. Inspección del Técnico (Extras)
      const { data: dataExtra } = await supabase.from("extras").select("*").eq("contrato_id", dataFactura.id).maybeSingle();
      setInspeccion(dataExtra);
    }
    setLoading(false);
  }

  useEffect(() => { cargarTodo(); }, [id]);

  async function enviarAlCliente() {
    setEnviando(true);
    try {
      const { error: updateError } = await supabase
        .from("extras")
        .update({ estado: "enviado_cliente" })
        .eq("id", inspeccion.id);

      if (updateError) throw updateError;
      setInspeccion(prev => ({ ...prev, estado: "enviado_cliente" }));
      setMensaje("¡Informe enviado al cliente correctamente!");
    } catch (err) {
      setError("Error al enviar el informe.");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <Menu><div style={estilos.centrado}>Cargando...</div></Menu>;

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>{factura?.numero || `Factura #${factura?.id}`}</h1>
        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        {/* --- DETALLES DE LA FACTURA Y LÍNEAS --- */}
        <div style={estilos.tarjeta}>
          <Fila clave="Fecha" valor={factura?.fecha || "-"} />
          <Fila clave="Estado de pago" valor={factura?.estado_pago || factura?.estado || "-"} destacado />
          {factura?.descripcion && <Fila clave="Concepto" valor={factura.descripcion} />}
          
          {lineas && lineas.length > 0 && (
            <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
              <span style={{ color: "#4db8ff", fontSize: 13, fontWeight: "bold" }}>Conceptos / Líneas:</span>
              {lineas.map((linea, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13 }}>
                  <span style={{ color: "#9fb3c8" }}>{linea.descripcion || linea.concepto || "Extra"}</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{Number(linea.total || linea.precio || 0).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            {factura?.base !== null && factura?.base !== undefined && (
              <Fila clave="Base Imponible" valor={`${Number(factura.base || 0).toFixed(2)} €`} />
            )}
            {factura?.iva !== null && factura?.iva !== undefined && (
              <Fila clave="IVA" valor={`${Number(factura.iva || 0).toFixed(2)} €`} />
            )}
            <Fila clave="Total" valor={`${Number(factura?.total || 0).toFixed(2)} €`} destacado />
          </div>
        </div>

        {/* --- INSPECCIÓN TÉCNICA --- */}
        {inspeccion && (
          <div style={{ ...estilos.tarjeta, border: inspeccion.estado === "finalizado" ? "1px solid #4ade80" : "1px solid #4db8ff" }}>
            <h3 style={{ color: "#4db8ff", marginTop: 0 }}>
              {inspeccion.estado === "pendiente" && "⏳ Trabajo enviado al técnico (Pendiente de realización)"}
              {inspeccion.estado === "finalizado" && "✅ Inspección lista para enviar"}
              {inspeccion.estado === "enviado_cliente" && "📧 Informe entregado al cliente"}
            </h3>
            <p style={estilos.clave}><strong>Descripción:</strong> {inspeccion.descripcion || "-"}</p>
            <p style={estilos.clave}><strong>Materiales:</strong> {inspeccion.materiales || "-"}</p>
            <p style={estilos.clave}><strong>Tiempo:</strong> {inspeccion.tiempo_empleado || "-"}</p>
            
            {inspeccion.fotos && inspeccion.fotos.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                {inspeccion.fotos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="evidencia" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            )}

            {inspeccion.estado === "finalizado" && (
              <button 
                onClick={enviarAlCliente} 
                disabled={enviando}
                style={{ ...estilos.botonAprobar, marginTop: 15, background: "#4ade80", border: "none" }}
              >
                {enviando ? "Enviando..." : "📤 Enviar Informe al Cliente"}
              </button>
            )}
          </div>
        )}

        {/* --- BOTONES DE ACCIÓN --- */}
        {factura?.estado !== 'pagada' && (
          <button 
            onClick={async () => {
              // 1. Actualizar factura a pagada
              const { error: errorFactura } = await supabase
                .from('facturas')
                .update({ estado: 'pagada', estado_pago: 'pagada' })
                .eq('id', factura.id);

              if (errorFactura) {
                alert("Error al actualizar la factura");
                return;
              }

              // 2. 🚀 AL MARCAR COMO PAGADA, MANDAMOS EL EXTRA AL TÉCNICO (Creamos o actualizamos el registro en 'extras')
              if (!inspeccion) {
                await supabase.from('extras').insert({
                  contrato_id: factura.id,
                  descripcion: factura.descripcion || "Servicio extra contratado",
                  estado: 'pendiente'
                });
              } else {
                await supabase
                  .from('extras')
                  .update({ estado: 'pendiente' })
                  .eq('id', inspeccion.id);
              }

              window.location.reload();
            }}
            style={{ ...estilos.botonAprobar, background: "#4ade80", marginBottom: "10px", border: "none" }}
          >
            Marcar como Pagada y Enviar al Técnico
          </button>
        )}

        <button 
          onClick={async () => {
            if(window.confirm("¿Seguro que quieres borrar esta factura?")) {
              await supabase.from('facturas').delete().eq('id', factura.id);
              navigate('/admin/facturas'); 
            }
          }}
          style={{ ...estilos.botonAprobar, background: "#ef4444", color: "#fff", border: "none" }}
        >
          Borrar Factura
        </button>
      </div>
    </Menu>
  );
}

function Fila({ clave, valor, destacado }) {
  return (
    <div style={estilos.fila}>
      <span style={estilos.clave}>{clave}</span>
      <span style={{ ...estilos.valor, color: destacado ? "#4db8ff" : "#fff" }}>{valor}</span>
    </div>
  );
}

const estilos = {
  pagina: { padding: 20, background: "#0a0f1a", minHeight: "100vh", color: "#fff" },
  centrado: { color: "#fff", textAlign: "center", padding: 50 },
  titulo: { color: "#4db8ff", fontSize: 24, marginBottom: 20 },
  tarjeta: { background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 14 },
  clave: { color: "#9fb3c8", fontSize: 14, margin: "5px 0" },
  fila: { display: "flex", justifyContent: "space-between", padding: "6px 0" },
  valor: { fontWeight: 600 },
  botonAprobar: { width: "100%", padding: 14, borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#000" },
  ok: { color: "#4ade80", textAlign: "center" },
  error: { color: "#ef4444", textAlign: "center" }
};
