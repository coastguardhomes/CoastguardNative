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
      // 3. Inspección del Técnico
      const { data: dataExtra } = await supabase.from("extras").select("*").eq("contrato_id", dataFactura.id).maybeSingle();
      setInspeccion(dataExtra);
    }
    setLoading(false);
  }

  useEffect(() => { cargarTodo(); }, [id]);

  // FUNCIÓN PARA ENVIAR AL CLIENTE
  async function enviarAlCliente() {
    setEnviando(true);
    try {
      // Actualizamos el estado del extra a 'enviado_cliente'
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

        {/* --- BLOQUE: INSPECCIÓN TÉCNICA (Visible si existe y está terminada) --- */}
        {inspeccion && (
          <div style={{ ...estilos.tarjeta, border: inspeccion.estado === "finalizado" ? "1px solid #4ade80" : "1px solid #4db8ff" }}>
            <h3 style={{ color: "#4db8ff", marginTop: 0 }}>
              {inspeccion.estado === "finalizado" ? "✅ Inspección lista para enviar" : "📧 Informe entregado al cliente"}
            </h3>
            <p style={estilos.clave}><strong>Descripción:</strong> {inspeccion.descripcion}</p>
            <p style={estilos.clave}><strong>Materiales:</strong> {inspeccion.materiales}</p>
            <p style={estilos.clave}><strong>Tiempo:</strong> {inspeccion.tiempo_empleado}</p>
            
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

        {/* ... AQUÍ VA EL RESTO DE TU CÓDIGO (Factura, Líneas, Totales) ... */}
        <div style={estilos.tarjeta}>
           <Fila clave="Total" valor={`${Number(factura?.total || 0).toFixed(2)} €`} destacado />
        </div>
      </div>
    </Menu>
  );
}

// Asegúrate de incluir tu componente Fila y estilos abajo como los tenías antes
function Fila({ clave, valor, destacado }) {
  return (
    <div style={estilos.fila}>
      <span style={estilos.clave}>{clave}</span>
      <span style={{ ...estilos.valor, color: destacado ? "#4db8ff" : "#fff" }}>{valor}</span>
    </div>
  );
}

const estilos = {
  // ... (tus estilos anteriores)
  pagina: { padding: 20, background: "#0a0f1a", minHeight: "100vh", color: "#fff" },
  centrado: { color: "#fff", textAlign: "center", padding: 50 },
  titulo: { color: "#4db8ff", fontSize: 24 },
  tarjeta: { background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 14 },
  clave: { color: "#9fb3c8", fontSize: 14, margin: "5px 0" },
  fila: { display: "flex", justifyContent: "space-between", padding: "6px 0" },
  valor: { fontWeight: 600 },
  botonAprobar: { width: "100%", padding: 14, borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#000" }
};
