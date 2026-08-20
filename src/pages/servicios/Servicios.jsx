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
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoId, setTecnicoId] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatosIniciales() {
      const [resClientes, resTecnicos] = await Promise.all([
        supabase.from("clientes").select("id, nombre, direccion, email").order("nombre"),
        supabase.from("tecnicos").select("id, nombre").eq("activo", true).order("nombre")
      ]);

      if (!resClientes.error) setClientes(resClientes.data || []);
      if (!resTecnicos.error) setTecnicos(resTecnicos.data || []);
      setCargando(false);
    }
    cargarDatosIniciales();
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

      // 1. Crear Factura Contable (SIN tecnico_id porque la tabla facturas no tiene esa columna)
      const { data: factura, error: errorFactura } = await supabase
        .from("facturas")
        .insert({
          numero,
          cliente_id: Number(clienteId),
          vivienda_id: viviendaId ? Number(viviendaId) : null,
          fecha: new Date().toISOString().slice(0, 10),
          base,
          iva,
          total,
          descripcion: lineas.map((l) => l.nombre).join(", "),
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

      // 3. Crear el registro en la tabla 'extras' asignando el técnico correctamente
      const { error: errorExtra } = await supabase.from("extras").insert({
        factura_id: factura.id,
        cliente_id: Number(clienteId),
        vivienda_id: viviendaId ? Number(viviendaId) : null,
        tecnico_id: tecnicoId ? Number(tecnicoId) : null, // Aquí sí se guarda el técnico
        descripcion: lineas.map((l) => l.nombre).join(", "),
        estado: "pendiente",
        creado_en: new Date().toISOString()
      });

      if (errorExtra) {
        console.error("Error al registrar la tarea del técnico:", errorExtra);
      }

      // 4. Generación y envío de PDF
      let avisoPdf = "";
      const { data: pdfData, error: errorPdf } = await supabase.functions.invoke(
        "factura-pdf",
        { body: { facturaId: factura.id } }
      );

      if (!errorPdf && pdfData?.url && (await pdfDisponible(pdfData.url))) {
        await supabase.from("facturas").update({ pdf_url: pdfData.url }).eq("id", factura.id);
        const cliente = clientes.find((c) => c.id === Number(clienteId));

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
      setTecnicoId("");
      setMensaje(`Factura ${factura.numero} creada con éxito (${total} €) y asignada al técnico.${avisoPdf}`);
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
          Emite servicios de campo, asigna técnicos automáticamente y genera su contabilidad.
        </p>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        {/* Sección Clientes y Viviendas */}
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
              <label style={{...estilos.etiqueta, marginTop: 15}}>Vivienda</label>
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

          <label style={{...estilos.etiqueta, marginTop: 15}}>Asignar Técnico</label>
          <select
            value={tecnicoId}
            onChange={(e) => setTecnicoId(e.target.value)}
            style={estilos.select}
          >
            <option value="">-- Sin técnico asignado (opcional) --</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div style={estilos.tarjeta}>
          <h3 style={{ color: "#4db8ff", marginBottom: 12, fontSize: 16 }}>Seleccionar Servicios</h3>
          {SERVICIOS_DISPONIBLES.map((serv) => (
            <div key={serv.nombre} style={{ marginBottom: 16 }}>
              <label style={estilos.check}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(serv.nombre)}
                  onChange={() => toggleServicio(serv.nombre)}
                  style={estilos.checkbox}
                />
                {serv.nombre} — {serv.precio !== null ? `${serv.precio} €` : "Precio variable"}
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

        <div style={estilos.tarjeta}>
          <div style={estilos.fila}><span>Base Imponible</span><strong>{base.toFixed(2)} €</strong></div>
          <div style={estilos.fila}><span>IVA ({IVA * 100}%)</span><strong>{iva.toFixed(2)} €</strong></div>
          <div style={{ ...estilos.fila, borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 8 }}>
            <span style={{ fontSize: 18, color: "#4db8ff" }}>Total</span>
            <strong style={{ fontSize: 20, color: "#4db8ff" }}>{total.toFixed(2)} €</strong>
          </div>

          <label style={{ ...estilos.check, marginTop: 14 }}>
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              style={estilos.checkbox}
            />
            <span>Enviar comprobante y factura por correo al cliente</span>
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
  pagina: { padding: 20, background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" },
  titulo: { color: "#4db8ff", marginBottom: 6, fontSize: 26, fontWeight: 700 },
  subtitulo: { opacity: 0.7, fontSize: 14, marginBottom: 20 },
  tarjeta: { background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 },
  etiqueta: { display: "block", fontSize: 13, color: "#9fb3c8", marginBottom: 6, textTransform: "uppercase" },
  select: { width: "100%", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "#132033", color: "#fff", fontSize: 15 },
  check: { display: "flex", alignItems: "center", fontSize: 15, cursor: "pointer" },
  checkbox: { width: 20, height: 20, marginRight: 10, cursor: "pointer", accentColor: "#4db8ff" },
  input: { padding: 10, width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", marginTop: 8, fontSize: 15 },
  fila: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 15 },
  boton: { width: "100%", padding: 14, background: "#4db8ff", color: "#000", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer" },
  botonSec: { width: "100%", marginTop: 10, padding: 13, background: "transparent", color: "#4db8ff", borderRadius: 8, border: "1px solid rgba(77,184,255,0.4)", fontWeight: 600, fontSize: 15, cursor: "pointer" },
  ok: { marginBottom: 15, color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, padding: 12 },
  error: { marginBottom: 15, color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: 12 }
};
