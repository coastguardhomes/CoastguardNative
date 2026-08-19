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
  const [inspeccion, setInspeccion] = useState(null); // extra/tarea relacionada
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Helper: resolver tecnico (sin fallback automático)
  async function resolverTecnico({ facturaRecord = null } = {}) {
    if (!facturaRecord && id) {
      const { data: f } = await supabase.from("facturas").select("tecnico_id,contrato_id,vivienda_id").eq("id", id).maybeSingle();
      facturaRecord = f || null;
    }

    if (!facturaRecord) return null;

    if (facturaRecord.tecnico_id) return facturaRecord.tecnico_id;

    if (facturaRecord.contrato_id) {
      const { data: c } = await supabase.from("contratos").select("tecnico_id").eq("id", facturaRecord.contrato_id).maybeSingle();
      if (c?.tecnico_id) return c.tecnico_id;
    }

    if (facturaRecord.vivienda_id) {
      const { data: v } = await supabase.from("viviendas").select("tecnico_id").eq("id", facturaRecord.vivienda_id).maybeSingle();
      if (v?.tecnico_id) return v.tecnico_id;
    }

    return null;
  }

  async function cargarTodo() {
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      // 1. Cargar factura
      const { data: dataFactura, error: errorFactura } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (errorFactura) {
        console.error("Error cargando factura:", errorFactura);
        setError("Error cargando factura");
        setLoading(false);
        return;
      }

      setFactura(dataFactura || null);

      if (dataFactura) {
        // 2. Líneas
        const { data: detalle } = await supabase
          .from("facturas_lineas")
          .select("*")
          .eq("factura_id", dataFactura.id);

        setLineas(detalle || []);

        // 3. Cliente
        if (dataFactura.cliente_id) {
          const { data: c } = await supabase
            .from("clientes")
            .select("nombre, direccion, email, telefono")
            .eq("id", dataFactura.cliente_id)
            .maybeSingle();
          setCliente(c || null);
        } else {
          setCliente(null);
        }

        // 4. Extra/tarea: buscar por factura_id o (compatibilidad) por contrato_id
        const { data: dataExtra, error: errorExtra } = await supabase
          .from("extras")
          .select("*")
          .or(`factura_id.eq.${dataFactura.id},contrato_id.eq.${dataFactura.id}`)
          .maybeSingle();

        if (!errorExtra && dataExtra) {
          setInspeccion(dataExtra);
        } else {
          setInspeccion(null);
        }
      } else {
        setLineas([]);
        setCliente(null);
        setInspeccion(null);
      }
    } catch (e) {
      console.error("Error en cargarTodo:", e);
      setError("Error cargando datos de la factura.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function enviarAlCliente() {
    if (!inspeccion) return setError("No hay informe para enviar.");
    setEnviando(true);
    try {
      const { error: updateError } = await supabase
        .from("extras")
        .update({ estado: "enviado_cliente" })
        .eq("id", inspeccion.id);

      if (updateError) throw updateError;
      setInspeccion((prev) => ({ ...prev, estado: "enviado_cliente" }));
      setMensaje("¡Informe enviado al cliente correctamente!");
    } catch (err) {
      console.error("Error enviando informe:", err);
      setError("Error al enviar el informe.");
    } finally {
      setEnviando(false);
    }
  }

  async function marcarComoPagadaYEnviar() {
    if (!factura) return;
    setMensaje("");
    setError("");

    try {
      // 1. Actualizar factura a pagada
      const { error: errorFactura } = await supabase
        .from("facturas")
        .update({ estado: "pagada", estado_pago: "pagada" })
        .eq("id", factura.id);

      if (errorFactura) {
        console.error("Error actualizando factura:", errorFactura);
        setError("Error al actualizar la factura.");
        return;
      }

      setFactura((prev) => ({ ...prev, estado: "pagada", estado_pago: "pagada" }));

      // 2. Resolver técnico a asignar
      const tecnicoId = await resolverTecnico({ facturaRecord: factura });

      // 3. Buscar extra existente
      const { data: existingExtra, error: searchError } = await supabase
        .from("extras")
        .select("*")
        .or(`factura_id.eq.${factura.id},contrato_id.eq.${factura.id}`)
        .maybeSingle();

      if (searchError) {
        console.error("Error buscando extra existente:", searchError);
      }

      if (!existingExtra) {
        // Insert nuevo extra con campos completos
        const { error: insertError } = await supabase.from("extras").insert([
          {
            factura_id: factura.id,
            contrato_id: factura.contrato_id || null,
            cliente_id: factura.cliente_id || null,
            vivienda_id: factura.vivienda_id || null,
            tecnico_id: tecnicoId || null,
            descripcion: factura.descripcion || `Servicio extra ligado a factura #${factura.id}`,
            estado: "pendiente",
            creado_en: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          console.error("Error creando extra al marcar pagada:", insertError);
          setError("La factura se marcó como pagada pero no se pudo crear la tarea para el técnico.");
          return;
        }

        // Refrescar inspeccion (extra) local
        const { data: newExtra } = await supabase
          .from("extras")
          .select("*")
          .eq("factura_id", factura.id)
          .maybeSingle();
        setInspeccion(newExtra || null);
      } else {
        // Actualizar extra existente: asegurarse de estado y campos de enlace
        const { error: updateExtraError } = await supabase
          .from("extras")
          .update({
            estado: "pendiente",
            cliente_id: existingExtra.cliente_id || factura.cliente_id || null,
            vivienda_id: existingExtra.vivienda_id || factura.vivienda_id || null,
            tecnico_id: existingExtra.tecnico_id || tecnicoId || null,
            descripcion: existingExtra.descripcion || factura.descripcion || `Servicio extra ligado a factura #${factura.id}`,
          })
          .eq("id", existingExtra.id);

        if (updateExtraError) {
          console.error("Error actualizando extra existente:", updateExtraError);
          setError("La factura se marcó como pagada pero no se pudo actualizar la tarea para el técnico.");
          return;
        }

        // Actualizar inspeccion local
        setInspeccion((prev) => (prev ? { ...prev, estado: "pendiente", tecnico_id: prev.tecnico_id || tecnicoId } : prev));
      }

      setMensaje("Factura marcada como pagada y tarea enviada al técnico.");
    } catch (e) {
      console.error("Error en marcarComoPagadaYEnviar:", e);
      setError("Error procesando la petición.");
    }
  }

  if (loading) return <Menu><div style={estilos.centrado}>Cargando...</div></Menu>;

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>{factura?.numero || `Factura #${factura?.id}`}</h1>
        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        <div style={estilos.tarjeta}>
          <Fila clave="Fecha" valor={factura?.fecha || "-"} />
          <Fila clave="Estado de pago" valor={factura?.estado_pago || factura?.estado || "-"} destacado />
          {factura?.descripcion && <Fila clave="Concepto" valor={factura.descripcion} />}

          {lineas && lineas.length > 0 && (
            <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
              <h3 style={{ color: "#9fb3c8" }}>Líneas</h3>
              {lineas.map((l) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <div style={{ color: "#cbd5e1" }}>{l.concepto}</div>
                  <div style={{ color: "#fff", fontWeight: "700" }}>{Number(l.precio || l.subtotal || 0).toFixed(2)} €</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          {factura?.estado !== "pagada" ? (
            <button
              onClick={marcarComoPagadaYEnviar}
              style={{ ...estilos.botonAprobar, background: "#4ade80", marginRight: 10 }}
            >
              Marcar como Pagada y Enviar al Técnico
            </button>
          ) : (
            <button style={{ ...estilos.botonAprobar, background: "#94a3b8", cursor: "default" }} disabled>
              Factura Pagada
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm("¿Seguro que quieres borrar esta factura?")) {
                supabase.from("facturas").delete().eq("id", factura.id);
                navigate("/admin/facturas");
              }
            }}
            style={{ ...estilos.botonAprobar, background: "#ef4444", color: "#fff" }}
          >
            Borrar Factura
          </button>
        </div>

        {inspeccion && (
          <div style={{ marginTop: 18 }}>
            <h3 style={{ color: "#9fb3c8" }}>Tarea para Técnico</h3>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10 }}>
              <p><strong>Descripción:</strong> {inspeccion.descripcion}</p>
              <p><strong>Estado:</strong> {inspeccion.estado}</p>
              <p><strong>ID:</strong> {inspeccion.id}</p>
            </div>
          </div>
        )}
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
  centrado: { display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#9fb3c8" },
  titulo: { fontSize: 26, color: "#4db8ff", marginBottom: 12 },
  ok: { color: "#4ade80", marginBottom: 12 },
  error: { color: "#ff6b6b", marginBottom: 12 },
  tarjeta: { background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 },
  botonAprobar: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    marginBottom: 8,
  },
  fila: { display: "flex", justifyContent: "space-between", padding: "8px 0" },
  clave: { color: "#9fb3c8" },
  valor: { color: "#fff", fontWeight: 700 },
};
