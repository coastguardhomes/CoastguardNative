import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

/**
 * Facturación de extras.
 *
 * Crea una factura a partir de los servicios sueltos seleccionados, guarda
 * el desglose en facturas_lineas y automatiza la creación de inspecciones.
 */

const EXTRAS = [
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

/** Comprueba que el PDF existe de verdad antes de guardar su enlace. */
async function pdfDisponible(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export default function Extras() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

  // Estados para automatización de inspecciones
  const [viviendas, setViviendas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [viviendaId, setViviendaId] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // ⭐ NUEVO: alerta para inspecciones extra
  const [alertaExtra, setAlertaExtra] = useState(false);

  // Cargar Clientes y Técnicos al montar
  useEffect(() => {
    let cancelado = false;

    async function cargarDatosIniciales() {
      const [resClientes, resTecnicos] = await Promise.all([
        supabase.from("clientes").select("id, nombre, direccion, email").order("nombre"),
        supabase.from("tecnicos").select("id, nombre").eq("activo", true).order("nombre")
      ]);

      if (cancelado) return;

      if (resClientes.error) {
        console.error("Error cargando clientes:", resClientes.error);
        setError("No se pudieron cargar los clientes.");
      } else {
        setClientes(resClientes.data || []);
      }

      if (!resTecnicos.error) {
        setTecnicos(resTecnicos.data || []);
      }

      setCargando(false);
    }

    cargarDatosIniciales();
    return () => {
      cancelado = true;
    };
  }, []);

  // Cargar Viviendas cuando cambia el cliente seleccionado
  useEffect(() => {
    if (!clienteId) {
      setViviendas([]);
      setViviendaId("");
      return;
    }

    async function cargarViviendasCliente() {
      const { data, error: errViviendas } = await supabase
        .from("viviendas")
        .select("id, direccion")
        .eq("cliente_id", clienteId)
        .eq("activa", true);

      if (errViviendas) {
        console.error("Error cargando viviendas:", errViviendas);
      } else {
        setViviendas(data || []);
      }
    }

    cargarViviendasCliente();
  }, [clienteId]);

  const toggleExtra = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((x) => x !== nombre) : [...prev, nombre]
    );
  };

  /** Líneas con su precio final resuelto (tarifa fija o precio manual). */
  const lineas = seleccionados.map((nombre) => {
    const extra = EXTRAS.find((e) => e.nombre === nombre);
    const precio = extra.precio ?? Number(precios[nombre] || 0);
    return { nombre, precio };
  });

  const base = redondear(lineas.reduce((acc, l) => acc + l.precio, 0));
  const iva = redondear(base * IVA);
  const total = redondear(base + iva);

  /**
   * Genera el siguiente número de factura con el formato ya usado en la base
   * de datos ("CG-000008").
   */
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
    const siguiente = (Number.isNaN(n) ? 0 : n) + 1;

    return `CG-${String(siguiente).padStart(6, "0")}`;
  }

  const crearFactura = async () => {
    setMensaje("");
    setError("");

    if (!clienteId) {
      setError("Selecciona el cliente al que se factura.");
      return;
    }

    if (seleccionados.length === 0) {
      setError("Selecciona al menos un extra.");
      return;
    }

    const sinPrecio = lineas.find((l) => !l.precio || l.precio <= 0);
    if (sinPrecio) {
      setError(`Indica un precio para "${sinPrecio.nombre}".`);
      return;
    }

    const esInspeccion = seleccionados.includes("Inspección posterior a tormenta");
    if (esInspeccion && (!viviendaId || !tecnicoId)) {
      setError("Para la inspección posterior a tormenta, debes seleccionar una vivienda y un técnico.");
      return;
    }

    setGuardando(true);

    try {
      const numero = await siguienteNumero();

      const { data: factura, error: errorFactura } = await supabase
        .from("facturas")
        .insert({
          numero,
          cliente_id: Number(clienteId),
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

      const { error: errorLineas } = await supabase.from("facturas_lineas").insert(
        lineas.map((l) => ({
          factura_id: factura.id,
          concepto: l.nombre,
          cantidad: 1,
          precio: l.precio,
          subtotal: l.precio
        }))
      );

      if (errorLineas) {
        console.error("Error guardando líneas:", errorLineas);
        setMensaje(
          `Factura ${factura.numero} creada, pero falló el desglose: ${errorLineas.message}`
        );
        setGuardando(false);
        return;
      }

      // ⭐ AUTOMATIZACIÓN: Si es inspección, crear registro automático para la app del técnico
      let avisoInspeccion = "";
      if (esInspeccion) {
        const { error: errorInspeccion } = await supabase.from("inspecciones").insert({
          vivienda_id: Number(viviendaId),
          cliente_id: String(clienteId),
          tecnico_id: tecnicoId,
          estado: "pendiente",
          fecha: new Date().toISOString(),

          // ⭐ AÑADIDO: ALERTA EN INSPECCIÓN EXTRA
          alerta: alertaExtra,
          alerta_vista: false,

          notas: `Generado automáticamente desde Factura ${factura.numero}`
        });

        if (errorInspeccion) {
          console.error("Error creando inspección:", errorInspeccion);
          avisoInspeccion = " (Aviso: La factura se creó pero falló la asignación al técnico).";
        } else {
          avisoInspeccion = " Inspección asignada al técnico en la app.";
        }
      }

      let avisoPdf = "";

      const { data: pdfData, error: errorPdf } = await supabase.functions.invoke(
        "factura-pdf",
        { body: { facturaId: factura.id } }
      );

      if (errorPdf) {
        console.error("Error generando PDF:", errorPdf);
        avisoPdf = " El PDF no se pudo generar.";
      } else if (pdfData?.url && !(await pdfDisponible(pdfData.url))) {
        console.warn("factura-pdf devolvió una URL inexistente:", pdfData.url);
        avisoPdf = " El PDF no está disponible todavía.";
      } else if (pdfData?.url) {
        await supabase
          .from("facturas")
          .update({ pdf_url: pdfData.url })
          .eq("id", factura.id);

        const cliente = clientes.find((c) => c.id === Number(clienteId));

        if (enviarEmail && cliente?.email) {
          const { error: errorEmail } = await supabase.functions.invoke(
            "enviar-email",
            { body: { email: cliente.email, pdfUrl: pdfData.url } }
          );

          if (errorEmail) {
            console.error("Error enviando email:", errorEmail);
            avisoPdf += " No se pudo enviar el email.";
          } else {
            avisoPdf += ` Enviada a ${cliente.email}.`;
          }
        } else if (enviarEmail) {
          avisoPdf += " El cliente no tiene email registrado.";
        }
      }

      setSeleccionados([]);
      setPrecios({});
      setViviendaId("");
      setTecnicoId("");
      setAlertaExtra(false);

      setMensaje(
        `Factura ${factura.numero} creada correctamente (${total} €).${avisoInspeccion}${avisoPdf}`
      );
      setGuardando(false);
    } catch (e) {
      console.error("Error creando factura:", e);
      setError(`No se pudo crear la factura: ${e.message}`);
      setGuardando(false);
    }
  };

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>Extras</h1>
        <p style={estilos.subtitulo}>
          Factura servicios sueltos y automatiza órdenes para los técnicos.
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
            <option value="">
              {cargando ? "Cargando clientes..." : "-- Selecciona un cliente --"}
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.direccion ? ` — ${c.direccion}` : ""}
              </option>
            ))}
          </select>

          {!cargando && clientes.length === 0 && (
            <p style={estilos.aviso}>
              No hay clientes disponibles. Crea uno primero en el módulo de
              Clientes.
            </p>
          )}
        </div>

        <div style={estilos.tarjeta}>
          {EXTRAS.map((extra) => (
            <div key={extra.nombre} style={{ marginBottom: 18 }}>
              <label style={estilos.check}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(extra.nombre)}
                  onChange={() => toggleExtra(extra.nombre)}
                  style={estilos.checkbox}
                />
                {extra.nombre} —{" "}
                {extra.precio !== null ? `${extra.precio} €` : "Según tarifa"}
              </label>

              {extra.precio === null && seleccionados.includes(extra.nombre) && (
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Precio €"
                  value={precios[extra.nombre] || ""}
                  onChange={(e) =>
                    setPrecios({ ...precios, [extra.nombre]: e.target.value })
                  }
                  style={estilos.input}
                />
              )}
            </div>
          ))}

          {/* ⭐ ALERTA EN EXTRAS */}
          <div style={{ marginTop: 20 }}>
            <label style={estilos.check}>
              <input
                type="checkbox"
                checked={alertaExtra}
                onChange={(e) => setAlertaExtra(e.target.checked)}
                style={estilos.checkbox}
              />
              <span>Marcar como ALERTA / Incidencia importante</span>
            </label>
          </div>
        </div>

        {/* Sección condicional para la automatización de inspecciones */}
        {seleccionados.includes("Inspección posterior a tormenta") && (
          <div style={{ ...estilos.tarjeta, border: "1px solid #4db8ff" }}>
            <h3 style={{ color: "#4db8ff", marginBottom: 14, fontSize: 16 }}>
              ⚡ Automatización de Inspección
            </h3>

            <label style={estilos.etiqueta}>Vivienda a inspeccionar</label>
            <select
              value={viviendaId}
              onChange={(e) => setViviendaId(e.target.value)}
              style={estilos.select}
            >
              <option value="">-- Selecciona una vivienda del cliente --</option>
              {viviendas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.direccion}
                </option>
              ))}
            </select>
            {clienteId && viviendas.length === 0 && (
              <p style={{ ...estilos.aviso, color: "#ffc861" }}>
                Este cliente no tiene viviendas registradas.
              </p>
            )}

            <label style={{ ...estilos.etiqueta, marginTop: 14 }}>Técnico asignado</label>
            <select
              value={tecnicoId}
              onChange={(e) => setTecnicoId(e.target.value)}
              style={estilos.select}
            >
              <option value="">-- Selecciona un técnico --</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={estilos.tarjeta}>
          <Fila clave="Base" valor={`${base.toFixed(2)} €`} />
          <Fila clave={`IVA (${IVA * 100}%)`} valor={`${iva.toFixed(2)} €`} />
          <Fila clave="Total" valor={`${total.toFixed(2)} €`} destacado />

          <label style={{ ...estilos.check, marginTop: 14 }}>
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              style={estilos.checkbox}
            />
            <span style={{ fontSize: 14.5 }}>
              Enviar la factura por email al cliente
            </span>
          </label>
        </div>

        <button
          onClick={crearFactura}
          disabled={guardando}
          style={{ ...estilos.boton, opacity: guardando ? 0.6 : 1 }}
        >
          {guardando ? "Procesando..." : "Crear factura y asignar"}
        </button>

        <button onClick={() => navigate("/facturas")} style={estilos.botonSec}>
          Ver facturas
        </button>
      </div>
    </Menu>
  );
}

function Fila({ clave, valor, destacado }) {
  return (
    <div style={estilos.fila}>
      <span style={{ color: "#9fb3c8", fontSize: 15 }}>{clave}</span>
      <span
        style={{
          fontWeight: 700,
          fontSize: destacado ? 20 : 16,
          color: destacado ? "#4db8ff" : "#fff"
        }}
      >
        {valor}
      </span>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: 20,
    background: "#0a0f1a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif"
  },
  titulo: {
    color: "#4db8ff",
    marginBottom: 6,
    fontSize: 28,
    fontWeight: 700,
    textShadow: "0 0 8px rgba(0,153,255,0.6)"
  },
  subtitulo: { opacity: 0.7, fontSize: 14, marginBottom: 20 },
  tarjeta: {
