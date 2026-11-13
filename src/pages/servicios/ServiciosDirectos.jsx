import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu.jsx";
import { supabase } from "../../lib/supabase";

const SERVICIOS_DISPONIBLES = [
  { codigo: "urgencia", nombre: "Urgencia / Emergencia", tipo: "fijo", precio: 50, etiqueta: "50 €" },
  { codigo: "apertura_vivienda", nombre: "Apertura de vivienda", tipo: "fijo", precio: 30, etiqueta: "30 €" },
  { codigo: "supervision", nombre: "Supervisión", tipo: "supervision", precio: 35, etiqueta: "35 €/hora o fracción" },
  { codigo: "cierre_vivienda", nombre: "Cierre de vivienda", tipo: "fijo", precio: 30, etiqueta: "30 €" },
  { codigo: "gestion_tecnico", nombre: "Gestión de presupuesto", tipo: "fijo", precio: 25, etiqueta: "25 € + IVA" },
  { codigo: "visita_rapida", nombre: "Visita rápida", tipo: "fijo", precio: 25, etiqueta: "25 €" },
  { codigo: "inspeccion_tormenta", nombre: "Inspección posterior a tormenta", tipo: "fijo", precio: 35, etiqueta: "35 €" },
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
  const [horasSupervision, setHorasSupervision] = useState("1");
  const [adicionalVisitaRapida, setAdicionalVisitaRapida] = useState("");
  const [descripcionVisitaRapida, setDescripcionVisitaRapida] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [resultadoUnificado, setResultadoUnificado] = useState(null);

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

  const costeTecnicoSeleccionado = seleccionados.includes("coste_tecnico");
  const supervisionSeleccionada = seleccionados.includes("supervision");
  const visitaRapidaSeleccionada = seleccionados.includes("visita_rapida");

  const precioCosteNumerico = redondear(precioCosteTecnico);
  const ivaCosteTecnico = redondear(precioCosteNumerico * IVA);
  const totalCosteTecnico = redondear(precioCosteNumerico + ivaCosteTecnico);
  const precioCosteValido =
    precioCosteTecnico.trim() !== "" &&
    Number.isFinite(Number(precioCosteTecnico)) &&
    precioCosteNumerico > 0 &&
    precioCosteNumerico <= 100000;

  const horasSupervisionNumericas = Number(horasSupervision);
  const cantidadSupervisionValida =
    horasSupervision.trim() !== "" &&
    Number.isFinite(horasSupervisionNumericas) &&
    horasSupervisionNumericas > 0 &&
    horasSupervisionNumericas <= 1000;
  const cantidadSupervision = cantidadSupervisionValida
    ? Math.ceil(horasSupervisionNumericas)
    : 0;

  const adicionalVisitaNumerico = redondear(adicionalVisitaRapida);
  const adicionalVisitaValido =
    adicionalVisitaRapida.trim() === "" ||
    (Number.isFinite(Number(adicionalVisitaRapida)) &&
      adicionalVisitaNumerico >= 0 &&
      adicionalVisitaNumerico <= 99975);
  const precioVisitaRapida = redondear(25 + adicionalVisitaNumerico);
  const conceptoVisitaRapida =
    adicionalVisitaNumerico > 0
      ? `Visita rápida (base 25,00 € + adicional ${dinero(adicionalVisitaNumerico)})`
      : "Visita rápida";

  const lineasSeleccionadas = SERVICIOS_DISPONIBLES
    .filter((servicio) => seleccionados.includes(servicio.codigo))
    .map((servicio) => ({
      codigo: servicio.codigo,
      concepto:
        servicio.codigo === "visita_rapida"
          ? conceptoVisitaRapida
          : servicio.nombre,
      cantidad: servicio.codigo === "supervision" ? cantidadSupervision : 1,
      precio_unitario:
        servicio.codigo === "coste_tecnico"
          ? precioCosteNumerico
          : servicio.codigo === "visita_rapida"
            ? precioVisitaRapida
            : servicio.precio,
    }));

  const lineasCalculables = lineasSeleccionadas.filter(
    (linea) =>
      (linea.codigo !== "coste_tecnico" || precioCosteValido) &&
      (linea.codigo !== "supervision" || cantidadSupervisionValida) &&
      (linea.codigo !== "visita_rapida" || adicionalVisitaValido)
  );
  const baseConjunta = redondear(
    lineasCalculables.reduce(
      (total, linea) => total + linea.cantidad * linea.precio_unitario,
      0
    )
  );
  const ivaConjunto = redondear(baseConjunta * IVA);
  const totalConjunto = redondear(baseConjunta + ivaConjunto);

  const alternarServicio = (codigo) => {
    setSeleccionados((actuales) =>
      actuales.includes(codigo)
        ? actuales.filter((x) => x !== codigo)
        : [...actuales, codigo]
    );

    if (codigo === "coste_tecnico" && seleccionados.includes(codigo)) {
      setPrecioCosteTecnico("");
    }
    if (codigo === "supervision" && seleccionados.includes(codigo)) {
      setHorasSupervision("1");
    }
    if (codigo === "visita_rapida" && seleccionados.includes(codigo)) {
      setAdicionalVisitaRapida("");
      setDescripcionVisitaRapida("");
    }
    setResultadoUnificado(null);

    setError("");
    setMensaje("");
  };

  const registrarServicios = async () => {
    setError("");
    setMensaje("");
    setResultadoUnificado(null);

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
    if (supervisionSeleccionada && !cantidadSupervisionValida) {
      return setError(
        "Introduce una duración válida para Supervisión, superior a 0 y no superior a 1.000 horas."
      );
    }
    if (visitaRapidaSeleccionada && !adicionalVisitaValido) {
      return setError(
        "Introduce un importe adicional válido para Visita rápida, entre 0 € y 99.975 €."
      );
    }

    const descripcionCompleta = [
      descripcionPresupuesto.trim(),
      descripcionVisitaRapida.trim()
        ? `Detalle de Visita rápida: ${descripcionVisitaRapida.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    if (descripcionCompleta.length > 2000) {
      return setError(
        "La descripción conjunta no puede superar los 2.000 caracteres. Reduce el texto general o el detalle de Visita rápida."
      );
    }

    const requiereTecnico = lineasSeleccionadas.some((linea) =>
      ["urgencia", "visita_rapida", "inspeccion_tormenta", "coste_tecnico"].includes(
        linea.codigo
      )
    );
    if (requiereTecnico && !viviendaSeleccionada.tecnico_id) {
      return setError(
        "Los servicios seleccionados requieren un técnico asignado a la vivienda."
      );
    }

    setGuardando(true);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "admin_solicitar_presupuesto_unificado",
        {
          p_cliente_id: clienteSeleccionado.id,
          p_vivienda_id: viviendaSeleccionada.id,
          p_lineas: lineasSeleccionadas,
          p_descripcion: descripcionCompleta || null,
        }
      );

      if (rpcError) throw rpcError;
      if (!data || data.error || !data.solicitud_id) {
        throw new Error(data?.error || "La solicitud no devolvió confirmación.");
      }

      setResultadoUnificado(data);
      setMensaje(
        "Todos los extras se han registrado juntos en una única solicitud. El cliente recibirá un único presupuesto con todos los conceptos seleccionados."
      );
      setSeleccionados([]);
      setPrecioCosteTecnico("");
      setHorasSupervision("1");
      setAdicionalVisitaRapida("");
      setDescripcionVisitaRapida("");
      setDescripcionPresupuesto("");
    } catch (e) {
      setError(
        e.message ||
          "No se pudo registrar la solicitud conjunta. Comprueba el estado antes de volver a enviarla."
      );
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
          Selecciona un cliente, una vivienda y todos los extras que quieras incluir en una única solicitud y presupuesto conjunto.
        </p>

        {mensaje && <div style={estilos.ok}>{mensaje}</div>}
        {error && <div style={estilos.error}>{error}</div>}

        {resultadoUnificado && (
          <div style={estilos.ok}>
            <strong>Solicitud conjunta registrada correctamente.</strong>
            <p>
              Solicitud:{" "}
              {String(resultadoUnificado.solicitud_id || "").slice(0, 8) ||
                "Registrada"}
            </p>
            <p>
              Todos los extras seleccionados están incluidos en una única
              solicitud. El presupuesto económico se preparará para que el
              cliente pueda aceptarlo.
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
              setResultadoUnificado(null);
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
            Todos los extras marcados se agruparán en una única solicitud y se
            calcularán en esta pantalla. Supervisión se cobra a 35 € por hora o
            fracción; Gestión de presupuesto tiene un precio base de 25 € + IVA.
          </p>

          {SERVICIOS_DISPONIBLES.map((servicio) => {
            const activo = seleccionados.includes(servicio.codigo);
            const esSupervision = servicio.tipo === "supervision";
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

                {servicio.codigo === "visita_rapida" && activo && (
                  <div style={estilos.campoVariable}>
                    <label style={estilos.etiqueta}>
                      Importe adicional opcional (además de los 25 € de base)
                    </label>
                    <div style={estilos.contenedorPrecio}>
                      <input
                        type="number"
                        min="0"
                        max="99975"
                        step="0.01"
                        inputMode="decimal"
                        style={estilos.inputPrecio}
                        value={adicionalVisitaRapida}
                        onChange={(e) => setAdicionalVisitaRapida(e.target.value)}
                        placeholder="0,00 si no hay adicional"
                        disabled={bloqueado}
                      />
                      <span style={estilos.sufijoPrecio}>€</span>
                    </div>
                    <p style={estilos.detalleServicio}>
                      Si lo dejas vacío o introduces 0 €, se cobrarán únicamente
                      los 25 € de Visita rápida. Si añades un importe, se sumará
                      al precio base dentro de la misma línea del presupuesto.
                    </p>
                    <label style={estilos.etiqueta}>
                      Descripción del encargo para el cliente
                    </label>
                    <textarea
                      style={estilos.textarea}
                      value={descripcionVisitaRapida}
                      onChange={(e) => setDescripcionVisitaRapida(e.target.value)}
                      placeholder="Explica qué compra, gestión, desplazamiento o tarea se realizará. El cliente verá esta descripción en el presupuesto."
                      maxLength={1500}
                      rows={3}
                      disabled={bloqueado}
                    />
                    <p style={estilos.detalleServicio}>
                      El sistema aplica actualmente IVA del 21 % al importe total.
                      No incluyas productos sujetos a un tipo de IVA distinto
                      hasta que exista un desglose fiscal por producto.
                    </p>
                    {!adicionalVisitaValido && (
                      <p style={{ ...estilos.detalleServicio, color: "#fca5a5" }}>
                        El adicional debe estar entre 0 € y 99.975 €.
                      </p>
                    )}
                    {adicionalVisitaValido && (
                      <div style={estilos.resumenVariable}>
                        <div style={estilos.fila}>
                          <span>Visita rápida (base)</span>
                          <span>{dinero(25)}</span>
                        </div>
                        {adicionalVisitaNumerico > 0 && (
                          <div style={estilos.fila}>
                            <span>Importe adicional</span>
                            <span>{dinero(adicionalVisitaNumerico)}</span>
                          </div>
                        )}
                        <div style={estilos.total}>
                          <span>Base de Visita rápida</span>
                          <span>{dinero(precioVisitaRapida)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {esSupervision && activo && (
                  <div style={estilos.campoVariable}>
                    <label style={estilos.etiqueta}>
                      Duración estimada de Supervisión (horas)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      max="1000"
                      step="0.01"
                      inputMode="decimal"
                      style={estilos.inputPrecio}
                      value={horasSupervision}
                      onChange={(e) => setHorasSupervision(e.target.value)}
                      disabled={bloqueado}
                    />
                    <p style={estilos.detalleServicio}>
                      Se cobra a 35 € por hora o fracción. Cantidad facturable:
                      {" "}{cantidadSupervisionValida ? cantidadSupervision : "—"} hora(s).
                    </p>
                  </div>
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
                      Se incluirá junto con los demás extras en la misma
                      solicitud y presupuesto conjunto.
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
            La descripción se guarda en la solicitud conjunta y se muestra al
            cliente junto con todos los extras seleccionados.
          </p>
        </div>

        {seleccionados.length > 0 && (
          <div style={estilos.tarjeta}>
            <h2 style={estilos.seccionTitulo}>
              Resumen conjunto de todos los extras
            </h2>

            {lineasSeleccionadas.map((linea) => {
              const servicio = SERVICIOS_DISPONIBLES.find(
                (item) => item.codigo === linea.codigo
              );
              const importeValido =
                (linea.codigo !== "coste_tecnico" || precioCosteValido) &&
                (linea.codigo !== "supervision" || cantidadSupervisionValida) &&
                (linea.codigo !== "visita_rapida" || adicionalVisitaValido);
              return (
                <div key={linea.codigo} style={estilos.fila}>
                  <span>
                    {linea.concepto || servicio?.nombre || linea.codigo}
                    {linea.codigo === "supervision"
                      ? ` · ${linea.cantidad} hora(s)`
                      : ""}
                    {linea.codigo === "coste_tecnico" && !precioCosteValido
                      ? " · introduce el precio"
                      : ""}
                  </span>
                  <span>
                    {importeValido
                      ? dinero(linea.cantidad * linea.precio_unitario)
                      : "—"}
                  </span>
                </div>
              );
            })}

            <div style={estilos.fila}>
              <span>Base imponible conjunta</span>
              <span>{dinero(baseConjunta)}</span>
            </div>
            <div style={estilos.fila}>
              <span>IVA (21%)</span>
              <span>{dinero(ivaConjunto)}</span>
            </div>
            <div style={estilos.total}>
              <span>Total conjunto con IVA</span>
              <span>{dinero(totalConjunto)}</span>
            </div>
            <p style={estilos.aviso}>
              El cálculo se actualiza al marcar extras y modificar cantidades
              o precios. Todos los conceptos se enviarán juntos en una única
              solicitud.
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
            (costeTecnicoSeleccionado && !precioCosteValido) ||
            (supervisionSeleccionada && !cantidadSupervisionValida) ||
            (visitaRapidaSeleccionada && !adicionalVisitaValido)
          }
          style={{
            ...estilos.boton,
            opacity:
              bloqueado ||
              !clienteId ||
              !viviendaId ||
              seleccionados.length === 0 ||
              (costeTecnicoSeleccionado && !precioCosteValido) ||
              (supervisionSeleccionada && !cantidadSupervisionValida) ||
              (visitaRapidaSeleccionada && !adicionalVisitaValido)
                ? 0.6
                : 1,
          }}
        >
          {guardando ? "Procesando..." : "Enviar solicitud y presupuesto conjunto"}
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
