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
  const [tecnicos, setTecnicos] = useState([]); // Lista de técnicos para el selector
  const [loading, setLoading] = useState(true);
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

        // 4. Extra/tarea relacionada
        const { data: dataExtra } = await supabase
          .from("extras")
          .select("*")
          .or(`factura_id.eq.${dataFactura.id},contrato_id.eq.${dataFactura.id}`)
          .maybeSingle();

        setInspeccion(dataExtra || null);
      }

      // 5. Cargar técnicos para el selector manual
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // FUNCIÓN DE BORRADO CORREGIDA: Borra dependencias antes para evitar errores de restricciones
  async function borrarFactura() {
    if (!window.confirm("¿Seguro que quieres borrar esta factura y sus datos asociados?")) return;

    setError("");
    setMensaje("");

    try {
      // 1. Borrar líneas de factura asociadas
      await supabase.from("facturas_lineas").delete().eq("factura_id", id);

      // 2. Borrar tarea/extra asociado
      await supabase.from("extras").delete().eq("factura_id", id);

      // 3. Borrar la factura principal
      const { error: errorBorrado } = await supabase
        .from("facturas")
        .delete()
        .eq("id", id);

      if (errorBorrado) throw errorBorrado;

      navigate("/facturas/lista"); // Cambia por tu ruta de listado si es /admin/facturas
    } catch (e) {
      console.error("Error al borrar factura:", e);
      setError("Error al borrar la factura. Comprueba restricciones de base de datos.");
    }
  }

  // FUNCIÓN PARA ASIGNAR O CAMBIAR TÉCNICO MANUALMENTE
  async function cambiarTecnicoExtra(nuevoTecnicoId) {
    const tecnicoVal = nuevoTecnicoId ? Number(nuevoTecnicoId) : null;

    try {
      if (inspeccion) {
        const { error: updateError } = await supabase
          .from("extras")
          .update({ tecnico_id: tecnicoVal })
          .eq("id", inspeccion.id);

        if (updateError) throw updateError;
        setInspeccion((prev) => ({ ...prev, tecnico_id: tecnicoVal }));
      } else {
        // Si no existe el registro en extras todavía, lo creamos directamente asignado al técnico
        const { data: newExtra, error: insertError } = await supabase.from("extras").insert([
          {
            factura_id: factura.id,
            contrato_id: factura.contrato_id || null,
            cliente_id: factura.cliente_id || null,
            vivienda_id: factura.vivienda_id || null,
            tecnico_id: tecnicoVal,
            descripcion: factura.descripcion || `Servicio extra ligado a factura #${factura.id}`,
            estado: "pendiente",
            creado_en: new Date().toISOString(),
          },
        ]).select().single();

        if (insertError) throw insertError;
        setInspeccion(newExtra);
      }
      setMensaje("Técnico asignado correctamente a la tarea.");
    } catch (err) {
      console.error("Error al asignar técnico:", err);
      setError("No se pudo actualizar el técnico.");
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

      if (errorFactura) {
        setError("Error al actualizar la factura.");
        return;
      }

      setFactura((prev) => ({ ...prev, estado: "pagada", estado_pago: "pagada" }));

      const tecnicoId = await resolverTecnico({ facturaRecord: factura });

      const { data: existingExtra } = await supabase
        .from("extras")
        .select("*")
        .or(`factura_id.eq.${factura.id},contrato_id.eq.${factura.id}`)
        .maybeSingle();

      if (!existingExtra) {
        await supabase.from("extras").insert([
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

        const { data: newExtra } = await supabase
          .from("extras")
          .select("*")
          .eq("factura_id", factura.id)
          .maybeSingle();
        setInspeccion(newExtra || null);
      } else {
        await supabase
          .from("extras")
          .update({ estado: "pendiente", tecnico_id: existingExtra.tecnico_id || tecnicoId || null })
          .eq("id", existingExtra.id);

        setInspeccion((prev) => (prev ? { ...prev, estado: "pendiente" } : prev));
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
          <Fila clave="Total" valor={`${Number(factura?.total || 0).toFixed(2)} €`} />

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

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {factura?.estado !== "pagada" ? (
            <button
              onClick={marcarComoPagadaYEnviar}
              style={{ ...estilos.botonAccion, background: "#4ade80", color: "#0b1220" }}
            >
              Marcar como Pagada y Enviar al Técnico
            </button>
          ) : (
            <button style={{ ...estilos.botonAccion, background: "#94a3b8", color: "#0b1220", cursor: "default" }} disabled>
              Factura Pagada
            </button>
          )}

          <button
            onClick={borrarFactura}
            style={{ ...estilos.botonAccion, background: "#ef4444", color: "#fff" }}
          >
            🗑️ Borrar Factura
          </button>
        </div>

        {/* SECCIÓN DE TAREA / TÉCNICO */}
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ color: "#4db8ff", marginBottom: 10 }}>Tarea para Técnico / Inspección</h3>
          {inspeccion ? (
            <>
              <p><strong>Descripción:</strong> {inspeccion.descripcion}</p>
              <p style={{ marginBottom: 12 }}><strong>Estado:</strong> {inspeccion.estado}</p>
            </>
          ) : (
            <p style={{ color: "#9fb3c8", marginBottom: 12 }}><em>No hay tarea registrada. Selecciona un técnico abajo para crearla o marca la factura como pagada.</em></p>
          )}

          <label style={{ display: "block", marginBottom: 6, color: "#9fb3c8", fontWeight: "600", fontSize: "14px" }}>
            Asignar / Cambiar Técnico Manualmente:
          </label>
          <select
            value={inspeccion?.tecnico_id || ""}
            onChange={(e) => cambiarTecnicoExtra(e.target.value)}
            style={estilos.input}
          >
            <option value="">-- Sin técnico asignado --</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id} style={{ background: "#0a0f1a", color: "#fff" }}>
                {t.nombre || t.email || `Técnico #${t.id}`}
              </option>
            ))}
          </select>
        </div>
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
  ok: { color: "#4ade80", marginBottom: 12, fontWeight: "600" },
  error: { color: "#ff6b6b", marginBottom: 12, fontWeight: "600" },
  tarjeta: { background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" },
  botonAccion: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  fila: { display: "flex", justifyContent: "space-between", padding: "8px 0" },
  clave: { color: "#9fb3c8" },
  valor: { color: "#fff", fontWeight: 700 },
  input: {
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  },
};
