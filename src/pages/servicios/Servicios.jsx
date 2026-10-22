
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

export default function Servicios() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

  const [viviendas, setViviendas] = useState([]);
  const [viviendaId, setViviendaId] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, direccion, email")
        .order("nombre");

      if (cancelado) return;

      if (error) {
        console.error("Error cargando clientes:", error);
        setError("No se pudieron cargar los clientes.");
      } else {
        setClientes(data || []);
      }

      setCargando(false);
    }

    cargarClientes();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    if (!clienteId) {
      setViviendas([]);
      setViviendaId("");
      return () => {
        cancelado = true;
      };
    }

    async function cargarViviendasCliente() {
      const { data, error } = await supabase
        .from("viviendas")
        .select(`
          id,
          direccion,
          tecnico_id
        `)
        .eq("cliente_id", clienteId)
        .eq("activa", true)
        .order("id", { ascending: false });

      if (cancelado) return;

      if (error) {
        console.error("Error cargando viviendas:", error);
        setViviendas([]);
        setViviendaId("");
        setError(
          "No se pudieron cargar las viviendas del cliente."
        );
        return;
      }

      setViviendas(data || []);
      setViviendaId("");
    }

    cargarViviendasCliente();

    return () => {
      cancelado = true;
    };
  }, [clienteId]);

  const toggleServicio = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((x) => x !== nombre)
        : [...prev, nombre]
    );
  };

  /*
   * Solo se incluyen los servicios seleccionados.
   * La vivienda no añade ninguna tarifa.
   * Las características de la vivienda no intervienen
   * en el cálculo del precio.
   */
  const lineas = seleccionados.map((nombre) => {
    const serv = SERVICIOS_DISPONIBLES.find(
      (e) => e.nombre === nombre
    );

    const precio =
      serv.precio ?? Number(precios[nombre] || 0);

    return {
      nombre,
      precio
    };
  });

  /*
   * La base, el IVA y el total corresponden exclusivamente
   * a los servicios extras seleccionados.
   */
  const base = redondear(
    lineas.reduce(
      (acc, linea) => acc + linea.precio,
      0
    )
  );

  const iva = redondear(base * IVA);
  const total = redondear(base + iva);

  async function siguienteNumero() {
    const { data, error: errorNum } = await supabase
      .from("facturas")
      .select("numero")
      .like("numero", "CG-%")
      .order("numero", {
        ascending: false
      })
      .limit(1);

    if (errorNum) {
      throw new Error(errorNum.message);
    }

    const ultimo = data?.[0]?.numero;

    const n = ultimo
      ? parseInt(
          String(ultimo).replace(/\D/g, ""),
          10
        )
      : 0;

    return `CG-${String(
      (Number.isNaN(n) ? 0 : n) + 1
    ).padStart(6, "0")}`;
  }

  const crearServicioyFactura = async () => {
    setMensaje("");
    setError("");

    if (!clienteId) {
      setError("Selecciona el cliente.");
      return;
    }

    if (!viviendaId) {
      setError(
        "Selecciona la vivienda asociada al extra."
      );
      return;
    }

    if (seleccionados.length === 0) {
      setError(
        "Selecciona al menos un servicio extra."
      );
      return;
    }

    const sinPrecio = lineas.find(
      (linea) =>
        !Number.isFinite(linea.precio) ||
        linea.precio <= 0
    );

    if (sinPrecio) {
      setError(
        `Indica un precio válido para "${sinPrecio.nombre}".`
      );
      return;
    }

    const viviendaSeleccionada =
      viviendas.find(
        (v) => String(v.id) === String(viviendaId)
      );

    if (!viviendaSeleccionada) {
      setError(
        "No se encontró la vivienda seleccionada."
      );
      return;
    }

    /*
     * El extra debe tener técnico asignado para poder
     * llegar al técnico correspondiente.
     * Esto no afecta al precio.
     */
    if (!viviendaSeleccionada.tecnico_id) {
      setError(
        "La vivienda seleccionada no tiene ningún técnico asignado. Asigna primero el técnico a la vivienda."
      );
      return;
    }

    const cliente = clientes.find(
      (c) => String(c.id) === String(clienteId)
    );

    if (!cliente) {
      setError("No se encontró el cliente seleccionado.");
      return;
    }

    setGuardando(true);

    try {
      const numero = await siguienteNumero();

      const descripcionServicios = lineas
        .map((linea) => linea.nombre)
        .join(", ");

      const direccionTexto =
        viviendaSeleccionada.direccion || null;

      /*
       * Se crea un registro interno del cobro pendiente.
       * No se genera una factura fiscal en esta pantalla.
       */
      const {
        data: factura,
        error: errorFactura
      } = await supabase
        .from("facturas")
        .insert({
          numero,
          cliente_id: clienteId,
          vivienda_id: viviendaSeleccionada.id,
          fecha: new Date().toISOString().slice(0, 10),
          base,
          iva,
          total,
          descripcion: descripcionServicios,
          estado: "pendiente"
        })
        .select()
        .single();

      if (errorFactura) {
        throw new Error(errorFactura.message);
      }

      /*
       * Las líneas reflejan exclusivamente los servicios
       * seleccionados y sus importes.
       */
      const {
        error: errorLineas
      } = await supabase
        .from("facturas_lineas")
        .insert(
          lineas.map((linea) => ({
            factura_id: factura.id,
            concepto: linea.nombre,
            cantidad: 1,
            precio: linea.precio,
            subtotal: linea.precio
          }))
        );

      if (errorLineas) {
        console.error(
          "Error guardando líneas del cobro:",
          errorLineas
        );

        throw new Error(
          `Se creó el registro de cobro ${factura.numero}, pero falló el desglose: ${errorLineas.message}`
        );
      }

      /*
       * El extra queda relacionado con:
       * - el cliente;
       * - la vivienda;
       * - el registro de cobro;
       * - el técnico asignado.
       *
       * No se genera ni se envía aquí una factura fiscal.
       */
      const {
        data: extraCreado,
        error: errorExtra
      } = await supabase
        .from("extras")
        .insert({
          cliente_id: clienteId,
          cliente_email: cliente.email || null,

          factura_id: factura.id,
          vivienda_id: viviendaSeleccionada.id,
          tecnico_id: viviendaSeleccionada.tecnico_id,

          direccion: direccionTexto,
          descripcion: descripcionServicios,

          precio: total,

          estado: "pendiente",
          estado_tecnico: null,
          estado_admin: "pendiente",

          creado_en: new Date().toISOString()
        })
        .select()
        .single();

      if (errorExtra) {
        console.error(
          "Error creando extra:",
          errorExtra
        );

        throw new Error(
          `Se registró el cobro, pero no se pudo crear el extra asignado al técnico: ${errorExtra.message}`
        );
      }

      console.log(
        "Extra creado correctamente:",
        extraCreado
      );

      /*
       * IMPORTANTE:
       * No invocamos factura-pdf ni enviar-email aquí.
       * El aviso de pago se gestiona desde la ficha del cobro
       * al generar el enlace de Stripe.
       * La factura fiscal de FacturaDirecta debe emitirse
       * después de que Stripe confirme el pago.
       */
      setSeleccionados([]);
      setPrecios({});
      setViviendaId("");

      setMensaje(
        `Servicio extra ${factura.numero} registrado (${total.toFixed(2)} €), pendiente de pago. El extra ha quedado asignado al técnico. No se ha enviado ninguna factura fiscal. Genera el enlace de Stripe desde la ficha del cobro para enviar únicamente el aviso de pago.`
      );
    } catch (e) {
      console.error(
        "Error en el proceso de servicio:",
        e
      );

      setError(
        `Error en el proceso: ${e.message}`
      );
    } finally {
      setGuardando(false);
    }
  };

  const viviendaSeleccionada =
    viviendas.find(
      (v) => String(v.id) === String(viviendaId)
    );

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>
          Registrar Servicio Extra
        </h1>

        <p style={estilos.subtitulo}>
          Selecciona un cliente, una vivienda y los
          servicios adicionales que quieras registrar para
          su cobro. La factura fiscal se emitirá después
          de que el pago esté confirmado.
        </p>

        {mensaje && (
          <div style={estilos.ok}>
            {mensaje}
          </div>
        )}

        {error && (
          <div style={estilos.error}>
            {error}
          </div>
        )}

        <div style={estilos.tarjeta}>
          <h2 style={estilos.seccionTitulo}>
            Datos del Cliente
          </h2>

          <label style={estilos.etiqueta}>
            Cliente
          </label>

          <select
            style={estilos.select}
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setMensaje("");
              setError("");
            }}
            disabled={cargando || guardando}
          >
            <option value="">
              {cargando
                ? "Cargando clientes..."
                : "Selecciona un cliente"}
            </option>

            {clientes.map((cliente) => (
              <option
                key={cliente.id}
                value={cliente.id}
              >
                {cliente.nombre}
                {cliente.direccion
                  ? ` - ${cliente.direccion}`
                  : ""}
              </option>
            ))}
          </select>

          {!cargando && clientes.length === 0 && (
            <p style={estilos.aviso}>
              No hay clientes disponibles. Crea uno primero
              en el módulo de Clientes.
            </p>
          )}
        </div>

        {clienteId && (
          <div style={estilos.tarjeta}>
            <h2 style={estilos.seccionTitulo}>
              Vivienda asociada
            </h2>

            <p
              style={{
                ...estilos.subtitulo,
                marginBottom: 12
              }}
            >
              La vivienda identifica dónde se realizará
              el extra y qué técnico tiene asignado. Sus
              características no generan ningún cobro.
            </p>

            <label style={estilos.etiqueta}>
              Vivienda
            </label>

            <select
              style={estilos.select}
              value={viviendaId}
              disabled={guardando}
              onChange={(e) => {
                setViviendaId(e.target.value);
                setMensaje("");
                setError("");
              }}
            >
              <option value="">
                Selecciona una vivienda
              </option>

              {viviendas.map((vivienda) => (
                <option
                  key={vivienda.id}
                  value={vivienda.id}
                >
                  {vivienda.direccion}
                  {!vivienda.tecnico_id
                    ? " — ⚠️ Sin técnico asignado"
                    : ""}
                </option>
              ))}
            </select>

            {viviendaSeleccionada && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background:
                    viviendaSeleccionada.tecnico_id
                      ? "rgba(74,222,128,0.1)"
                      : "rgba(239,68,68,0.1)",
                  border:
                    viviendaSeleccionada.tecnico_id
                      ? "1px solid rgba(74,222,128,0.3)"
                      : "1px solid rgba(239,68,68,0.3)",
                  color:
                    viviendaSeleccionada.tecnico_id
                      ? "#4ade80"
                      : "#ef4444",
                  fontSize: 13
                }}
              >
                {viviendaSeleccionada.tecnico_id
                  ? "✓ Vivienda con técnico asignado. El extra quedará asignado a ese técnico."
                  : "⚠️ Esta vivienda no tiene técnico asignado."}
              </div>
            )}
          </div>
        )}

        <div style={estilos.tarjeta}>
          <h2 style={estilos.seccionTitulo}>
            Servicios Disponibles
          </h2>

          {SERVICIOS_DISPONIBLES.map((servicio) => {
            const activo = seleccionados.includes(
              servicio.nombre
            );

            return (
              <div
                key={servicio.nombre}
                style={{ marginBottom: 12 }}
              >
                <label style={estilos.check}>
                  <input
                    type="checkbox"
                    style={estilos.checkbox}
                    checked={activo}
                    disabled={guardando}
                    onChange={() =>
                      toggleServicio(servicio.nombre)
                    }
                  />

                  {servicio.nombre}{" "}
                  {servicio.precio !== null
                    ? `(${servicio.precio} €)`
                    : "(Precio personalizado)"}
                </label>

                {activo && servicio.precio === null && (
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Introduce el precio"
                    min="0"
                    step="0.01"
                    style={estilos.input}
                    disabled={guardando}
                    value={precios[servicio.nombre] || ""}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        [servicio.nombre]: e.target.value
                      })
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {seleccionados.length > 0 && (
          <div style={estilos.tarjeta}>
            <h2 style={estilos.seccionTitulo}>
              Resumen del Importe
            </h2>

            <div style={estilos.fila}>
              <span>Base imponible:</span>
              <span>{base.toFixed(2)} €</span>
            </div>

            <div style={estilos.fila}>
              <span>IVA (21%):</span>
              <span>{iva.toFixed(2)} €</span>
            </div>

            <div
              style={{
                ...estilos.fila,
                fontWeight: 700,
                color: "#4db8ff",
                fontSize: 17,
                borderTop:
                  "1px solid rgba(255,255,255,0.08)",
                marginTop: 8,
                paddingTop: 8
              }}
            >
              <span>Total a pagar:</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <p style={estilos.aviso}>
              Este formulario registra el cobro pendiente,
              pero no emite ni envía una factura fiscal.
              El aviso de pago se envía desde la ficha del
              cobro al generar el enlace de Stripe.
              FacturaDirecta emitirá la factura oficial
              después de confirmar el pago.
            </p>
          </div>
        )}

        <button
          onClick={crearServicioyFactura}
          disabled={guardando || cargando}
          style={{
            ...estilos.boton,
            opacity: guardando || cargando ? 0.6 : 1
          }}
        >
          {guardando
            ? "Procesando..."
            : "Registrar Servicio Extra"}
        </button>

        <button
          onClick={() => navigate("/facturas")}
          disabled={guardando}
          style={estilos.botonSec}
        >
          Ir al listado de Facturas
        </button>
      </div>
    </Menu>
  );
}

const estilos = {
  pagina: {
    padding: "20px 16px 40px",
    background: "#0a0f1a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif"
  },

  titulo: {
    color: "#4db8ff",
    marginBottom: 6,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.5px"
  },

  subtitulo: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 1.4
  },

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

  seccionTitulo: {
    color: "#4db8ff",
    marginBottom: 14,
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.2px"
  },

  etiqueta: {
    display: "block",
    fontSize: 12,
    color: "#9fb3c8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 600
  },

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

  check: {
    display: "flex",
    alignItems: "center",
    fontSize: 15,
    cursor: "pointer",
    userSelect: "none"
  },

  checkbox: {
    width: 20,
    height: 20,
    marginRight: 12,
    cursor: "pointer",
    accentColor: "#4db8ff",
    borderRadius: 4
  },

  input: {
    padding: "11px 14px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#fff",
    marginTop: 10,
    fontSize: 15,
    outline: "none",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
  },

  fila: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    fontSize: 15,
    color: "#cbd5e1"
  },

  boton: {
    width: "100%",
    padding: 15,
    background:
      "linear-gradient(135deg, #4db8ff 0%, #2b9ee6 100%)",
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

  ok: {
    marginBottom: 16,
    color: "#4ade80",
    background: "rgba(74, 222, 128, 0.12)",
    border: "1px solid rgba(74, 222, 128, 0.3)",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.4
  },

  error: {
    marginBottom: 16,
    color: "#ff6b6b",
    background: "rgba(255, 107, 107, 0.12)",
    border: "1px solid rgba(255, 107, 107, 0.3)",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.4
  },

  aviso: {
    marginTop: 16,
    color: "#ffc861",
    fontSize: 13.5,
    lineHeight: 1.5
  }
};
