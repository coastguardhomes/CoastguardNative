import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

const SERVICIOS_DISPONIBLES = [
  { nombre: "Urgencia / Emergencia", precio: 50 },
  { nombre: "Apertura de vivienda", precio: 30 },
  { nombre: "Supervisión (por hora o fracción)", precio: 35 },
  { nombre: "Cierre de vivienda", precio: 30 },
  { nombre: "Gestión del técnico", precio: 25 },
  { nombre: "Visita rápida", precio: 25 },
  { nombre: "Inspección posterior a tormenta", precio: 35 },
  { nombre: "Coste del técnico", precio: null }
];

const IVA = 0.21;
const redondear = (n) => Math.round(n * 100) / 100;

async function pdfDisponible(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export default function Servicios() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [viviendas, setViviendas] = useState([]);
  const [viviendaId, setViviendaId] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, direccion, email")
        .order("nombre");

      if (!error) setClientes(data || []);
      setCargando(false);
    }
    cargarClientes();
  }, []);

  useEffect(() => {
    if (!clienteId) {
      setViviendas([]);
      setViviendaId("");
      return;
    }
    async function cargarViviendasCliente() {
      const { data } = await supabase
        .from("viviendas")
        .select("id, direccion")
        .eq("cliente_id", clienteId)
        .eq("activa", true);
      setViviendas(data || []);
    }
    cargarViviendasCliente();
  }, [clienteId]);

  const toggleServicio = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((x) => x !== nombre) : [...prev, nombre]
    );
  };

  const lineas = seleccionados.map((nombre) => {
    const serv = SERVICIOS_DISPONIBLES.find((e) => e.nombre === nombre);
    const precio = serv.precio ?? Number(precios[nombre] || 0);
    return { nombre, precio };
  });

  const base = redondear(lineas.reduce((acc, l) => acc + l.precio, 0));
  const iva = redondear(base * IVA);
  const total = redondear(base + iva);

  async function siguienteNumero() {
    const { data, error: errorNum } = await supabase
      .from("facturas")
      .select("numero")
      .like("numero", "CG-%")
      .order("numero", { ascending: false })
      .limit(1);

    if (errorNum) throw new Error(errorNum.message);
    const ultimo = data?.[0]?.numero;
    const n = ultimo ? parseInt(String(ultimo).replace(/\D/g, ""), 10) : 0;
    return `CG-${String((Number.isNaN(n) ? 0 : n) + 1).padStart(6, "0")}`;
  }

  const crearServicioyFactura = async () => {
    setMensaje("");
    setError("");

    if (!clienteId) {
      setError("Selecciona el cliente.");
      return;
    }
    if (seleccionados.length === 0) {
      setError("Selecciona al menos un servicio u orden.");
      return;
    }

    const sinPrecio = lineas.find((l) => !l.precio || l.precio <= 0);
    if (sinPrecio) {
      setError(`Indica un precio válido para "${sinPrecio.nombre}".`);
      return;
    }

    setGuardando(true);

    try {
      const numero = await siguienteNumero();
      const descripcionServicios = lineas.map((l) => l.nombre).join(", ");
      const viviendaSeleccionada = viviendas.find((v) => v.id == viviendaId);
      const direccionTexto = viviendaSeleccionada ? viviendaSeleccionada.direccion : null;

      // 1. Crear Factura Contable (estado pendiente por defecto)
      const { data: factura, error: errorFactura } = await supabase
        .from("facturas")
        .insert({
          numero,
          cliente_id: clienteId, // Corregido: UUID limpio sin Number()
          fecha: new Date().toISOString().slice(0, 10),
          base,
          iva,
          total,
          descripcion: descripcionServicios,
          estado: "pendiente"
        })
        .select()
        .single();

      if (errorFactura) throw new Error(errorFactura.message);

      // 2. Guardar líneas de la factura
      const { error: errorLineas } = await supabase.from("facturas_lineas").insert(
        lineas.map((l) => ({
          factura_id: factura.id,
          concepto: l.nombre,
          cantidad: 1,
          precio: l.precio,
          subtotal: l.precio
        }))
      );

      if (errorLineas) throw new Error(errorLineas.message);

      // 3. Registrar en la tabla 'extras'
      await supabase.from("extras").insert({
        cliente_id: clienteId, // Corregido: UUID limpio sin Number()
        direccion: direccionTexto,
        descripcion: descripcionServicios,
        precio: total,
        estado: "pendiente",
        creado_en: new Date().toISOString()
      });

      // 4. Generación y envío de PDF
      let avisoPdf = "";
      const { data: pdfData, error: errorPdf } = await supabase.functions.invoke(
        "factura-pdf",
        { body: { facturaId: factura.id } }
      );

      if (!errorPdf && pdfData?.url && (await pdfDisponible(pdfData.url))) {
        await supabase.from("facturas").update({ pdf_url: pdfData.url }).eq("id", factura.id);
        const cliente = clientes.find((c) => c.id == clienteId);

        if (enviarEmail && cliente?.email) {
          const { error: errorEmail } = await supabase.functions.invoke(
            "enviar-email",
            { body: { email: cliente.email, pdfUrl: pdfData.url } }
          );
          avisoPdf = errorEmail ? " Error al enviar email." : ` Factura enviada a ${cliente.email}.`;
        }
      }

      setSeleccionados([]);
      setPrecios({});
      setViviendaId("");
      setMensaje(`Factura ${factura.numero} creada con éxito (${total} €). Pendiente de pago.${avisoPdf}`);
      setGuardando(false);
    } catch (e) {
      setError(`Error en el proceso: ${e.message}`);
      setGuardando(false);
    }
  };

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>Gestión de Servicios y Órdenes</h1>
        <p style={estilos.subtitulo}>
          Emite servicios de campo y genera su contabilidad automáticamente.
        </p>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        <div style={estilos.tarjeta}>
          <label style={estilos.etiqueta}>Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={estilos.select}
            disabled={cargando}
          >
            <option value="">{cargando ? "Cargando..." : "-- Selecciona un cliente --"}</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.direccion ? `— ${c.direccion}` : ""}</option>
            ))}
          </select>

          {viviendas.length > 0 && (
            <>
              <label style={{...estilos.etiqueta, marginTop: 18}}>Vivienda</label>
              <select
                value={viviendaId}
                onChange={(e) => setViviendaId(e.target.value)}
                style={estilos.select}
              >
                <option value="">-- Selecciona una vivienda --</option>
                {viviendas.map((v) => (
                  <option key={v.id} value={v.id}>{v.direccion}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div style={estilos.tarjeta}>
          <h3 style={estilos.seccionTitulo}>Seleccionar Servicios</h3>
          {SERVICIOS_DISPONIBLES.map((serv) => (
            <div key={serv.nombre} style={{ marginBottom: 16 }}>
              <label style={estilos.check}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(serv.nombre)}
                  onChange={() => toggleServicio(serv.nombre)}
                  style={estilos.checkbox}
                />
                <span style={{ color: seleccionados.includes(serv.nombre) ? "#fff" : "#cbd5e1" }}>
                  {serv.nombre} — {serv.precio !== null ? `${serv.precio} €` : "Precio variable"}
                </span>
              </label>

              {serv.precio === null && seleccionados.includes(serv.nombre) && (
                <input
                  type="number"
                  placeholder="Introduce el importe en €"
                  value={precios[serv.nombre] || ""}
                  onChange={(e) => setPrecios({ ...precios, [serv.nombre]: e.target.value })}
                  style={estilos.input}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ ...estilos.tarjeta, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)" }}>
          <div style={estilos.fila}><span>Base Imponible</span><strong>{base.toFixed(2)} €</strong></div>
          <div style={estilos.fila}><span>IVA ({IVA * 100}%)</span><strong>{iva.toFixed(2)} €</strong></div>
          <div style={{ ...estilos.fila, borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 10, paddingTop: 10 }}>
            <span style={{ fontSize: 18, color: "#4db8ff", fontWeight: 600 }}>Total</span>
            <strong style={{ fontSize: 22, color: "#4db8ff" }}>{total.toFixed(2)} €</strong>
          </div>

          <label style={{ ...estilos.check, marginTop: 18 }}>
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              style={estilos.checkbox}
            />
            <span style={{ fontSize: 14, color: "#cbd5e1" }}>Enviar comprobante y factura por correo al cliente</span>
          </label>
        </div>

        <button
          onClick={crearServicioyFactura}
          disabled={guardando}
          style={{ ...estilos.boton, opacity: guardando ? 0.6 : 1 }}
        >
          {guardando ? "Procesando..." : "Emitir Servicio y Facturar"}
        </button>

        <button onClick={() => navigate("/facturas")} style={estilos.botonSec}>
          Ir al listado de Facturas
        </button>
      </div>
    </Menu>
  );
}

const estilos = {
  pagina: { padding: "20px 16px 40px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" },
  titulo: { color: "#4db8ff", marginBottom: 6, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" },
  subtitulo: { opacity: 0.7, fontSize: 14, marginBottom: 20, lineHeight: 1.4 },
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
  seccionTitulo: { color: "#4db8ff", marginBottom: 14, fontSize: 16, fontWeight: 600, letterSpacing: "0.2px" },
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
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
    transition: "border-color 0.2s"
  },
  check: { display: "flex", alignItems: "center", fontSize: 15, cursor: "pointer", userSelect: "none" },
  checkbox: { width: 20, height: 20, marginRight: 12, cursor: "pointer", accentColor: "#4db8ff", borderRadius: 4 },
  input: { 
    padding: "11px 14px", 
    width: "100%", 
    borderRadius: 10, 
    border: "1px solid rgba(255, 255, 255, 0.15)", 
    background: "rgba(255, 255, 255, 0.06)", 
    color: "#fff", 
    marginTop: 10, 
    fontSize: 15,
    outline: "none",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
  },
  fila: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 15, color: "#cbd5e1" },
  boton: { 
    width: "100%", 
    padding: 15, 
    background: "linear-gradient(135deg, #4db8ff 0%, #2b9ee6 100%)", 
    color: "#0a0f1a", 
    borderRadius: 12, 
    border: "none", 
    fontWeight: 700, 
    fontSize: 16, 
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(77, 184, 255, 0.35)",
    transition: "transform 0.1s ease, filter 0.2s"
  },
  botonSec: { 
    width: "100%", 
    marginTop: 12, 
    padding: 14, 
    background: "rgba(255, 255, 255, 0.03)", 
    color: "#4db8ff", 
    borderRadius: 12, 
    border: "1px solid rgba(77, 184, 255, 0.3)", 
    fontWeight: 600, 
    fontSize: 15, 
    cursor: "pointer",
    transition: "background 0.2s"
  },
  ok: { marginBottom: 16, color: "#4ade80", background: "rgba(74, 222, 128, 0.12)", border: "1px solid rgba(74, 222, 128, 0.3)", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.4 },
  error: { marginBottom: 16, color: "#ff6b6b", background: "rgba(255, 107, 107, 0.12)", border: "1px solid rgba(255, 107, 107, 0.3)", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.4 }
};
