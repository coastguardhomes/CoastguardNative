
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu.jsx";
import { supabase } from "../../lib/supabase";

const SERVICIOS_DISPONIBLES = [
  { codigo: "urgencia", nombre: "Urgencia / Emergencia", tipo: "directo", precio: 50, etiqueta: "50 €" },
  { codigo: "apertura_vivienda", nombre: "Apertura de vivienda", tipo: "presupuesto", etiqueta: "Presupuesto" },
  { codigo: "supervision", nombre: "Supervisión", tipo: "presupuesto", etiqueta: "Desde 35 €/hora o fracción" },
  { codigo: "cierre_vivienda", nombre: "Cierre de vivienda", tipo: "presupuesto", etiqueta: "Presupuesto" },
  { codigo: "gestion_tecnico", nombre: "Gestión de presupuesto", tipo: "gestion", etiqueta: "25 € + IVA (30,25 €)" },
  { codigo: "visita_rapida", nombre: "Visita rápida", tipo: "directo", precio: 25, etiqueta: "25 €" },
  { codigo: "inspeccion_tormenta", nombre: "Inspección posterior a tormenta", tipo: "directo", precio: 35, etiqueta: "35 €" },
  { codigo: "coste_tecnico", nombre: "Coste del técnico", tipo: "variable", etiqueta: "Precio variable" },
];

const IVA = 0.21;
const redondear = (n) => Math.round(Number(n || 0) * 100) / 100;
const dinero = (n) => `${Number(n || 0).toFixed(2).replace(".", ",")} €`;

export default function ServiciosDirectos() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [viviendaId, setViviendaId] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [descripcionPresupuesto, setDescripcionPresupuesto] = useState("");
  const [precioCosteTecnico, setPrecioCosteTecnico] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [resultadoDirecto, setResultadoDirecto] = useState(null);
  const [resultadoCosteTecnico, setResultadoCosteTecnico] = useState(null);
  const [resultadoPresupuesto, setResultadoPresupuesto] = useState(null);
  const [resultadoGestion, setResultadoGestion] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setCargando(true);
      setError("");

      try {
        const [clientesResult, viviendasResult] = await Promise.all([
          supabase
            .from("clientes")
            .select("id,nombre,direccion,email")
            .order("nombre"),
          supabase
            .from("viviendas")
            .select("id,cliente_id,direccion,activa,tecnico_id")
            .eq("activa", true)
            .order("id", { ascending: false }),
        ]);

        if (clientesResult.error) throw clientesResult.error;
        if (viviendasResult.error) throw viviendasResult.error;

        if (!cancelado) {
          setClientes(clientesResult.data || []);
          setViviendas(viviendasResult.data || []);
        }
      } catch (e) {
        if (!cancelado) {
          setError(e.message || "No se pudieron cargar clientes y viviendas.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarDatos();
    return () => {
      cancelado = true;
    };
  }, []);

  const viviendasCliente = useMemo(
    () => viviendas.filter((v) => String(v.cliente_id) === String(clienteId)),
    [viviendas, clienteId]
  );

  const clienteSeleccionado = clientes.find(
    (c) => String(c.id) === String(clienteId)
  );

  const viviendaSeleccionada = viviendasCliente.find(
    (v) => String(v.id) === String(viviendaId)
  );

  const serviciosDirectos = SERVICIOS_DISPONIBLES.filter(
    (s) => s.tipo === "directo" && seleccionados.includes(s.codigo)
  );

  const serviciosPresupuesto = SERVICIOS_DISPONIBLES.filter(
    (s) => s.tipo === "presupuesto" && seleccionados.includes(s.codigo)
  ).map((s) => s.codigo);

  const gestionSeleccionada = seleccionados.includes("gestion_tecnico");
  const costeTecnicoSeleccionado = seleccionados.includes("coste_tecnico");

  const precioCosteNumerico = redondear(precioCosteTecnico);
  const precioCosteValido =
    precioCosteTecnico.trim() !== "" &&
    Number.isFinite(Number(precioCosteTecnico)) &&
    precioCosteNumerico > 0 &&
    precioCosteNumerico <= 100000;

  const ivaCosteTecnico = precioCosteValido
    ? redondear(precioCosteNumerico * IVA)
    : 0;

  const totalCosteTecnico = precioCosteValido
    ? redondear(precioCosteNumerico + ivaCosteTecnico)
    : 0;

  const baseDirectos = redondear(
    serviciosDirectos.reduce((total, servicio) => total + servicio.precio, 0)
  );
  const ivaDirectos = redondear(baseDirectos * IVA);
  const totalDirectos = redondear(baseDirectos + ivaDirectos);

  const alternarServicio = (codigo) => {
    setSeleccionados((actuales) =>
      actuales.includes(codigo)
        ? actuales.filter((x) => x !== codigo)
        : [...actuales, codigo]
    );

    if (codigo === "coste_tecnico" && seleccionados.includes(codigo)) {
      setPrecioCosteTecnico("");
      setResultadoCosteTecnico(null);
    }

    setError("");
    setMensaje("");
  };

  const registrarServicios = async () => {
    setError("");
    setMensaje("");
    setResultadoDirecto(null);
    setResultadoCosteTecnico(null);
    setResultadoPresupuesto(null);
    setResultadoGestion(null);

    if (!clienteId) return setError("Selecciona el cliente.");

    if (!viviendaId || !viviendaSeleccionada) {
      return setError("Selecciona una vivienda del cliente.");
    }

    if (!seleccionados.length) {
      return setError("Selecciona al menos un servicio extra.");
    }

    if (!clienteSeleccionado) {
      return setError("No se encontró el cliente seleccionado.");
    }

    if (costeTecnicoSeleccionado && !precioCosteValido) {
      return setError(
        "Introduce un precio válido para el coste del técnico, superior a 0 € y no superior a 100.000 €."
      );
    }

    if (
      (serviciosDirectos.length > 0 || costeTecnicoSeleccionado) &&
      !viviendaSeleccionada.tecnico_id
    ) {
      return setError(
        "Los servicios directos y el coste del técnico requieren un técnico asignado a la vivienda."
      );
    }

    setGuardando(true);

    const mensajesExito = [];
    const errores = [];
    const codigosProcesados = [];

    try {
      // 1. Servicios directos de precio fijo.
      if (serviciosDirectos.length > 0) {
        try {
          const lineas = serviciosDirectos.map((servicio) => ({
            codigo: servicio.codigo,
            precio_unitario: servicio.precio,
          }));

          const { data, error: rpcError } = await supabase.rpc(
            "admin_crear_extra_directo",
            {
              p_cliente_id: clienteId,
              p_vivienda_id: Number(viviendaId),
              p_lineas: lineas,
            }
          );

          if (rpcError) throw rpcError;

          setResultadoDirecto(data);
          mensajesExito.push(
            "Los servicios directos se han enviado al cliente para su aceptación. Todavía no hay factura ni asignación técnica."
          );

          serviciosDirectos.forEach((s) => codigosProcesados.push(s.codigo));
        } catch (e) {
          errores.push(
            "Servicios directos: " + (e.message || "no se pudieron registrar.")
          );
        }
      }

      // 2. Coste del técnico: extra independiente con precio variable.
      // Se envía en una llamada separada porque Supabase exige que este
      // concepto no se mezcle con otros servicios directos.
      if (costeTecnicoSeleccionado) {
        try {
          const { data, error: rpcError } = await supabase.rpc(
            "admin_crear_extra_directo",
            {
              p_cliente_id: clienteId,
              p_vivienda_id: Number(viviendaId),
              p_lineas: [
                {
                  codigo: "coste_tecnico",
                  precio_unitario: precioCosteNumerico,
                },
              ],
            }
          );

          if (rpcError) throw rpcError;

          setResultadoCosteTecnico(data);
          mensajesExito.push(
            `El coste del técnico (${dinero(precioCosteNumerico)} + IVA) se ha enviado al cliente para su aceptación. La factura se generará cuando acepte.`
          );

          codigosProcesados.push("coste_tecnico");
        } catch (e) {
          errores.push(
            "Coste del técnico: " +
              (e.message || "no se pudo registrar.")
          );
        }
      }

      // 3. Solicitud presupuestable.
      if (serviciosPresupuesto.length > 0) {
        try {
          const { data, error: rpcError } = await supabase.rpc(
            "admin_solicitar_presupuesto",
            {
              p_cliente_id: clienteId,
              p_vivienda_id: Number(viviendaId),
              p_servicios: serviciosPresupuesto,
              p_descripcion: descripcionPresupuesto.trim() || null,
            }
          );

          if (rpcError) throw rpcError;

          setResultadoPresupuesto(data);
          mensajesExito.push(
            "La solicitud de presupuesto se ha enviado al cliente. Cuando la acepte, podrás preparar el presupuesto económico. No se ha creado factura ni orden de trabajo."
          );

          serviciosPresupuesto.forEach((codigo) => codigosProcesados.push(codigo));
        } catch (e) {
          errores.push(
            "Solicitud de presupuesto: " +
              (e.message || "no se pudo registrar.")
          );
        }
      }

      // 4. Gestión de presupuesto: fija, independiente y sin técnico.
      if (gestionSeleccionada) {
        try {
          const { data, error: rpcError } = await supabase.rpc(
            "admin_solicitar_gestion_tecnico",
            {
              p_cliente_id: clienteId,
              p_vivienda_id: Number(viviendaId),
            }
          );

          if (rpcError) throw rpcError;

          setResultadoGestion(data);
          mensajesExito.push(
            "La Gestión de presupuesto se ha solicitado por separado. El cliente deberá aceptarla; no genera orden ni asigna técnico."
          );

          codigosProcesados.push("gestion_tecnico");
        } catch (e) {
          errores.push(
            "Gestión de presupuesto: " +
              (e.message || "no se pudo registrar.")
          );
        }
      }

      if (codigosProcesados.length > 0) {
        setSeleccionados((actuales) =>
          actuales.filter((codigo) => !codigosProcesados.includes(codigo))
        );

        if (codigosProcesados.includes("coste_tecnico")) {
          setPrecioCosteTecnico("");
        }

        if (serviciosPresupuesto.length > 0 &&
            codigosProcesados.some((codigo) => serviciosPresupuesto.includes(codigo))) {
          setDescripcionPresupuesto("");
        }
      }

      if (mensajesExito.length > 0) {
        setMensaje(mensajesExito.join(" "));
      }

      if (errores.length > 0) {
        setError(errores.join(" "));
      }
    } finally {
      setGuardando(false);
    }
  };

  const bloqueado = cargando || guardando;

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>Registrar Servicio Extra</h1>

        <p style={estilos.subtitulo}>
          Selecciona un cliente, una vivienda y los extras que quieras
          tramitar. Cada tipo seguirá su circuito independiente.
        </p>

        {mensaje && <div style={estilos.ok}>{mensaje}</div>}
        {error && <div style={estilos.error}>{error}</div>}

        {resultadoDirecto && (
          <div style={estilos.ok}>
            <strong>Servicios directos registrados.</strong>
            <p>
              Extra: {resultadoDirecto.extra_id || "Registrado"} · Base:{" "}
              {dinero(resultadoDirecto.base)} · Total con IVA:{" "}
              {dinero(resultadoDirecto.total)}
            </p>
            <p>
              El cliente debe aceptar la solicitud. Administración enviará el
              aviso de pago desde VerFactura después de la aceptación.
            </p>
          </div>
        )}

        {resultadoCosteTecnico && (
          <div style={estilos.ok}>
            <strong>Coste del técnico registrado.</strong>
            <p>
              Extra: {resultadoCosteTecnico.extra_id || "Registrado"} · Base:{" "}
              {dinero(resultadoCosteTecnico.base)} · IVA:{" "}
              {dinero(resultadoCosteTecnico.iva)} · Total:{" "}
              {dinero(resultadoCosteTecnico.total)}
            </p>
            <p>
              El cliente debe aceptar el extra. Después se generará la factura
              y el técnico se asignará únicamente cuando se confirme el pago.
            </p>
          </div>
        )}

        {resultadoPresupuesto && (
          <div style={estilos.ok}>
            <strong>Solicitud de presupuesto enviada.</strong>
            <p>
              Solicitud:{" "}
              {String(resultadoPresupuesto.solicitud_id || "").slice(0, 8)}
            </p>
            <p>
              El cliente debe aceptar la solicitud antes de que administración
              prepare el presupuesto económico. Esta fase no crea factura,
              Gestión de presupuesto ni orden de trabajo.
            </p>
          </div>
        )}

        {resultadoGestion && (
          <div style={estilos.ok}>
            <strong>Gestión de presupuesto enviada para aceptación.</strong>
            <p>
              Extra: {resultadoGestion.extra_id || "Registrado"} · Base: 25,00
              € · IVA: 5,25 € · Total: 30,25 €.
            </p>
            <p>
              Es una solicitud independiente. No se vincula al presupuesto ni
              genera una orden o asignación técnica.
            </p>
          </div>
        )}

        <div style={estilos.tarjeta}>
          <h2 style={estilos.seccionTitulo}>Datos del Cliente</h2>

          <label style={estilos.etiqueta}>Cliente</label>
          <select
            style={estilos.select}
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setViviendaId("");
              setMensaje("");
              setError("");
              setResultadoDirecto(null);
              setResultadoCosteTecnico(null);
              setResultadoPresupuesto(null);
              setResultadoGestion(null);
            }}
            disabled={bloqueado}
          >
            <option value="">
              {cargando ? "Cargando clientes..." : "Selecciona un cliente"}
            </option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre || cliente.email}
                {cliente.direccion ? ` - ${cliente.direccion}` : ""}
              </option>
            ))}
          </select>

          {!cargando && clientes.length === 0 && (
            <p style={estilos.aviso}>
              No hay clientes disponibles. Crea uno primero en el módulo de
              Clientes.
            </p>
          )}

          {clienteId && (
            <>
              <label style={estilos.etiqueta}>Vivienda asociada</label>
              <select
                style={estilos.select}
                value={viviendaId}
                onChange={(e) => {
                  setViviendaId(e.target.value);
                  setMensaje("");
                  setError("");
                }}
                disabled={bloqueado}
              >
                <option value="">Selecciona una vivienda</option>
                {viviendasCliente.map((vivienda) => (
                  <option key={vivienda.id} value={vivienda.id}>
                    {vivienda.direccion || `Vivienda #${vivienda.id}`}
                    {!vivienda.tecnico_id ? " — sin técnico asignado" : ""}
                  </option>
                ))}
              </select>

              {viviendaSeleccionada && (
                <div
                  style={{
                    ...estilos.avisoTecnico,
                    color: viviendaSeleccionada.tecnico_id
                      ? "#4ade80"
                      : "#fca5a5",
                    borderColor: viviendaSeleccionada.tecnico_id
                      ? "rgba(74,222,128,.3)"
                      : "rgba(248,113,113,.35)",
                  }}
                >
                  {viviendaSeleccionada.tecnico_id
                    ? "✓ Vivienda con técnico asignado. Los servicios que lo requieren podrán continuar."
                    : "No hay técnico asignado. Gestión de presupuesto puede solicitarse igualmente; los servicios directos y el coste del técnico necesitarán técnico activo."}
                </div>
              )}
            </>
          )}
        </div>

        <div style={estilos.tarjeta}>
          <h2 style={estilos.seccionTitulo}>Servicios Disponibles</h2>

          <p style={estilos.aviso}>
            Apertura, supervisión y cierre necesitan solicitud de presupuesto.
            Coste del técnico es un extra independiente con precio variable.
            Gestión de presupuesto también es independiente y no asigna técnico.
          </p>

          {SERVICIOS_DISPONIBLES.map((servicio) => {
            const activo = seleccionados.includes(servicio.codigo);
            const esGestion = servicio.tipo === "gestion";
            const esPresupuesto = servicio.tipo === "presupuesto";
            const esVariable = servicio.tipo === "variable";

            return (
              <div key={servicio.codigo} style={estilos.servicio}>
                <label style={estilos.check}>
                  <input
                    type="checkbox"
                    style={estilos.checkbox}
                    checked={activo}
                    disabled={bloqueado}
                    onChange={() => alternarServicio(servicio.codigo)}
                  />
                  <span style={estilos.nombreServicio}>
                    {servicio.nombre}
                  </span>
                  <strong style={estilos.precioServicio}>
                    {servicio.etiqueta}
                  </strong>
                </label>

                {esGestion && activo && (
                  <p style={estilos.detalleServicio}>
                    Solicitud independiente de 25,00 € + IVA. El cliente debe
                    aceptarla antes de que se genere su factura. No crea orden
                    ni asigna técnico.
                  </p>
                )}

                {esPresupuesto && activo && (
                  <p style={estilos.detalleServicio}>
                    Se enviará al cliente para que acepte la solicitud. Después
                    administración preparará el presupuesto económico.
                  </p>
                )}

                {esVariable && activo && (
                  <div style={estilos.campoVariable}>
                    <label style={estilos.etiqueta}>
                      Precio del técnico (base imponible)
                    </label>
                    <div style={estilos.contenedorPrecio}>
                      <input
                        type="number"
                        min="0.01"
                        max="100000"
                        step="0.01"
                        inputMode="decimal"
                        style={estilos.inputPrecio}
                        value={precioCosteTecnico}
                        onChange={(e) => setPrecioCosteTecnico(e.target.value)}
                        placeholder="Introduce el precio en euros"
                        disabled={bloqueado}
                      />
                      <span style={estilos.sufijoPrecio}>€</span>
                    </div>

                    {precioCosteValido ? (
                      <div style={estilos.resumenVariable}>
                        <div style={estilos.fila}>
                          <span>Base imponible</span>
                          <span>{dinero(precioCosteNumerico)}</span>
                        </div>
                        <div style={estilos.fila}>
                          <span>IVA (21%)</span>
                          <span>{dinero(ivaCosteTecnico)}</span>
                        </div>
                        <div style={estilos.total}>
                          <span>Total con IVA</span>
                          <span>{dinero(totalCosteTecnico)}</span>
                        </div>
                      </div>
                    ) : (
                      <p style={estilos.detalleServicio}>
                        Introduce el importe que cobrarás por el trabajo del
                        técnico. Se calculará automáticamente el IVA del 21 %.
                      </p>
                    )}

                    <p style={estilos.detalleServicio}>
                      Se enviará como extra independiente. El cliente deberá
                      aceptarlo; la factura se generará después y el técnico
                      solo se asignará tras confirmarse el pago.
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <label style={estilos.etiqueta}>
            Descripción e indicaciones para el presupuesto
          </label>

          <textarea
            style={estilos.textarea}
            value={descripcionPresupuesto}
            onChange={(e) => setDescripcionPresupuesto(e.target.value)}
            placeholder="Escribe qué debe revisar, realizar o aceptar el cliente. Este texto se guardará y aparecerá en su solicitud."
            maxLength={2000}
            rows={4}
            disabled={bloqueado}
          />

          <p style={estilos.aviso}>
            La descripción se guarda en la solicitud y se muestra al cliente
            antes de responder. Solo se envía junto con los conceptos
            presupuestables seleccionados.
          </p>
        </div>

        {serviciosDirectos.length > 0 && (
          <div style={estilos.tarjeta}>
            <h2 style={estilos.seccionTitulo}>
              Resumen de servicios directos
            </h2>

            {serviciosDirectos.map((servicio) => (
              <div key={servicio.codigo} style={estilos.fila}>
                <span>{servicio.nombre}</span>
                <span>{dinero(servicio.precio)}</span>
              </div>
            ))}

            <div style={estilos.fila}>
              <span>Base imponible</span>
              <span>{dinero(baseDirectos)}</span>
            </div>
            <div style={estilos.fila}>
              <span>IVA (21%)</span>
              <span>{dinero(ivaDirectos)}</span>
            </div>
            <div style={estilos.total}>
              <span>Total servicios directos</span>
              <span>{dinero(totalDirectos)}</span>
            </div>

            <p style={estilos.aviso}>
              Este importe solo se convierte en factura cuando el cliente
              acepta. El técnico se asigna después de que Stripe confirme el
              pago.
            </p>
          </div>
        )}

        {gestionSeleccionada && (
          <div style={estilos.tarjetaGestion}>
            <h2 style={estilos.seccionTitulo}>
              Gestión de presupuesto · solicitud independiente
            </h2>
            <div style={estilos.fila}>
              <span>Base</span>
              <span>25,00 €</span>
            </div>
            <div style={estilos.fila}>
              <span>IVA (21%)</span>
              <span>5,25 €</span>
            </div>
            <div style={estilos.total}>
              <span>Total gestión</span>
              <span>30,25 €</span>
            </div>
            <p style={estilos.aviso}>
              No se descuenta del presupuesto ni se mezcla con el precio de los
              trabajos. No genera una orden ni asigna técnico.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={registrarServicios}
          disabled={
            bloqueado ||
            !clienteId ||
            !viviendaId ||
            seleccionados.length === 0 ||
            (costeTecnicoSeleccionado && !precioCosteValido)
          }
          style={{
            ...estilos.boton,
            opacity:
              bloqueado ||
              !clienteId ||
              !viviendaId ||
              seleccionados.length === 0 ||
              (costeTecnicoSeleccionado && !precioCosteValido)
                ? 0.6
                : 1,
          }}
        >
          {guardando ? "Procesando..." : "Registrar servicios seleccionados"}
        </button>

        <button
          type="button"
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
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  },
  titulo: {
    color: "#4db8ff",
    marginBottom: 6,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  subtitulo: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 1.4,
  },
  tarjeta: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
    marginBottom: 16,
  },
  tarjetaGestion: {
    background: "rgba(224,176,52,.07)",
    border: "1px solid rgba(224,176,52,.35)",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  seccionTitulo: {
    color: "#4db8ff",
    marginBottom: 14,
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.2px",
  },
  etiqueta: {
    display: "block",
    fontSize: 12,
    color: "#9fb3c8",
    margin: "16px 0 8px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 600,
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
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  servicio: {
    marginBottom: 12,
    padding: "11px 0",
    borderBottom: "1px solid rgba(255,255,255,.06)",
  },
  check: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: 20,
    height: 20,
    flexShrink: 0,
    cursor: "pointer",
    accentColor: "#4db8ff",
  },
  nombreServicio: {
    flex: 1,
    minWidth: 0,
  },
  precioServicio: {
    color: "#e0b034",
    fontSize: 13,
    textAlign: "right",
  },
  detalleServicio: {
    margin: "8px 0 0 30px",
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.5,
  },
  campoVariable: {
    margin: "12px 0 0 30px",
    padding: 14,
    borderRadius: 10,
    background: "rgba(77,184,255,.06)",
    border: "1px solid rgba(77,184,255,.2)",
  },
  contenedorPrecio: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  inputPrecio: {
    flex: 1,
    minWidth: 0,
    padding: "12px 14px",
    borderRadius: 9,
    border: "1px solid rgba(77,184,255,.35)",
    background: "#132033",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  },
  sufijoPrecio: {
    color: "#4db8ff",
    fontWeight: 700,
    fontSize: 16,
  },
  resumenVariable: {
    marginTop: 12,
    padding: "8px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,.035)",
  },
  textarea: {
    padding: "11px 14px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#fff",
    marginTop: 4,
    fontSize: 14,
    outline: "none",
    resize: "vertical",
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "8px 0",
    fontSize: 14,
    color: "#cbd5e1",
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    marginTop: 8,
    borderTop: "1px solid rgba(255,255,255,.1)",
    color: "#4db8ff",
    fontSize: 16,
    fontWeight: 800,
  },
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
    transition: "transform 0.1s ease, filter 0.2s",
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
  },
  ok: {
    marginBottom: 16,
    color: "#4ade80",
    background: "rgba(74, 222, 128, 0.12)",
    border: "1px solid rgba(74, 222, 128, 0.3)",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.5,
  },
  error: {
    marginBottom: 16,
    color: "#ff6b6b",
    background: "rgba(255, 107, 107, 0.12)",
    border: "1px solid rgba(255, 107, 107, 0.3)",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 1.5,
  },
  aviso: {
    marginTop: 12,
    color: "#ffc861",
    fontSize: 13,
    lineHeight: 1.5,
  },
  avisoTecnico: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.1)",
    fontSize: 13,
    lineHeight: 1.5,
  },
};
