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
        .select(`
          id,
          direccion,
          metros_cuadrados,
          habitaciones,
          banos,
          tiene_piscina,
          tiene_jardin,
          tiene_garaje,
          tiene_sotano
        `)
        .eq("cliente_id", clienteId)
        .eq("activa", true);

      setViviendas(data || []);
    }
    cargarViviendasCliente();
  }, [clienteId]);

  const toggleServicio = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((x) => x !== nombre)
        : [...prev, nombre]
    );
  };

  let lineas = seleccionados.map((nombre) => {
    const serv = SERVICIOS_DISPONIBLES.find((e) => e.nombre === nombre);
    const precio = serv.precio ?? Number(precios[nombre] || 0);
    return { nombre, precio };
  });

  if (viviendaId) {
    const vivienda = viviendas.find((v) => v.id == viviendaId);
    if (vivienda) {
      const precioAuto = calcularPrecio(vivienda);
      lineas.push({
        nombre: "Tarifa vivienda (precio automático)",
        precio: precioAuto
      });
    }
  }

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
    if (seleccionados.length === 0 && !viviendaId) {
      setError("Selecciona al menos un servicio o una vivienda.");
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

      const { data: factura, error: errorFactura } = await supabase
        .from("facturas")
        .insert({
          numero,
          cliente_id: clienteId,
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

      await supabase.from("extras").insert({
        cliente_id: clienteId,
        direccion: direccionTexto,
        descripcion: descripcionServicios,
        precio: total,
        estado: "pendiente",
        creado_en: new Date().toISOString()
      });

      let avisoPdf = "";
      const { data: pdfData, error: errorPdf } = await supabase.functions.invoke(
        "factura-pdf",
        { body: { facturaId: factura.id } }
      );

      if (errorPdf && !factura?.pdf_url) {
        avisoPdf = " Error generando PDF.";
      }

      if ((!errorPdf || factura?.pdf_url) && pdfData?.url && (await pdfDisponible(pdfData.url))) {
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
        <h1 style={estilos.titulo}>Emitir Servicio y Facturar</h1>
        <p style={estilos.subtitulo}>Selecciona un cliente, los servicios adicionales o la vivienda y genera la factura correspondiente.</p>

        {mensaje && <div style={estilos.ok}>{mensaje}</div>}
        {error && <div style={estilos.error}>{error}</div>}

        <div style={estilos.tarjeta}>
          <h2 style={estilos.seccionTitulo}>Datos del Cliente</h2>
          <label style={estilos.etiqueta}>Cliente</label>
          <select
            style={estilos.select}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            disabled={cargando}
          >
            <option value="">{cargando ? "Cargando clientes..." : "Selecciona un cliente"}</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.direccion ? `- ${c.direccion}` : ""}
              </option>
            ))}
          </select>
        </div>

        {clienteId && (
          <div style={estilos.tarjeta}>
            <h2 style={estilos.seccionTitulo}>Vivienda (Tarifa Automática)</h2>
            <label style={estilos.etiqueta}>Vivienda asociada</label>
            <select
              style={estilos.select}
              value={viviendaId}
              onChange={(e) => setViviendaId(e.target.value)}
            >
              <option value="">Ninguna / Opcional</option>
              {viviendas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.direccion} ({v.metros_cuadrados} m²)
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={estilos.tarjeta}>
          <h2 style={estilos.seccionTitulo}>Servicios Disponibles</h2>
          {SERVICIOS_DISPONIBLES.map((s) => {
            const activo = seleccionados.includes(s.nombre);
            return (
              <div key={s.nombre} style={{ marginBottom: 12 }}>
                <label style={estilos.check}>
                  <input
                    type="checkbox"
                    style={estilos.checkbox}
                    checked={activo}
                    onChange={() => toggleServicio(s.nombre)}
                  />
                  {s.nombre} {s.precio ? `(${s.precio} €)` : ""}
                </label>
                {activo && s.precio === null && (
                  <input
                    type="number"
                    placeholder="Introduce el precio"
                    style={estilos.input}
                    value={precios[s.nombre] || ""}
                    onChange={(e) =>
                      setPrecios({ ...precios, [s.nombre]: e.target.value })
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {(seleccionados.length > 0 || viviendaId) && (
          <div style={estilos.tarjeta}>
            <h2 style={estilos.seccionTitulo}>Resumen del Importe</h2>
            <div style={estilos.fila}>
              <span>Base imponible:</span>
              <span>{base} €</span>
            </div>
            <div style={estilos.fila}>
              <span>IVA (21%):</span>
              <span>{iva} €</span>
            </div>
            <div style={{ ...estilos.fila, fontWeight: 700, color: "#4db8ff", fontSize: 17, borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 8, paddingTop: 8 }}>
              <span>Total a Pagar:</span>
              <span>{total} €</span>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={estilos.check}>
                <input
                  type="checkbox"
                  style={estilos.checkbox}
                  checked={enviarEmail}
                  onChange={(e) => setEnviarEmail(e.target.checked)}
                />
                Enviar factura por email automáticamente al cliente
              </label>
            </div>
          </div>
        )}

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
