
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";

// Solo estos tres conceptos pertenecen al presupuesto económico de trabajos.
const CATALOGO = [
  { codigo: "apertura_vivienda", concepto: "Apertura de vivienda", precio: 30 },
  { codigo: "supervision", concepto: "Supervisión (por hora o fracción)", precio: 35 },
  { codigo: "cierre_vivienda", concepto: "Cierre de vivienda", precio: 30 },
];

// Se mantienen nombres para mostrar correctamente solicitudes históricas.
const NOMBRES_SERVICIOS = {
  apertura_vivienda: "Apertura de vivienda",
  supervision: "Supervisión (por hora o fracción)",
  cierre_vivienda: "Cierre de vivienda",
  coste_tecnico: "Coste del técnico",
};

const ESTADOS = {
  pendiente_aceptacion_cliente: "Pendiente de aceptación del cliente",
  aceptada_pendiente_presupuesto: "Aceptada · factura pendiente de generar",
  pendiente_pago_gestion: "Gestión pendiente (flujo anterior)",
  gestion_pagada: "Gestión pagada (flujo anterior)",
  presupuesto_enviado: "Presupuesto enviado al cliente",
  aceptado_pendiente_pago: "Aceptado · pendiente de pago del trabajo",
  rechazado: "Rechazado por el cliente",
  pagado: "Trabajo pagado · técnico asignado",
  pagado_sin_tecnico: "Pago confirmado · falta asignar técnico",
  completado: "Completado",
  cancelado: "Cancelado",
};

const dinero = (valor) => `${Number(valor || 0).toFixed(2)} €`;

const facturaPagada = (f) =>
  [f?.estado_pago, f?.estado].some((x) =>
    ["pagada", "paid", "finalizado"].includes(
      String(x || "").toLowerCase()
    )
  );

function crearFormulario(solicitud) {
  const seleccion = solicitud.servicios_solicitados || [];

  return Object.fromEntries(
    CATALOGO.map((item) => [
      item.codigo,
      {
        seleccionado: seleccion.includes(item.codigo),
        concepto: item.concepto,
        cantidad: "1",
        precio_unitario: item.precio,
      },
    ])
  );
}

export default function PresupuestosAdmin() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [gestionExtras, setGestionExtras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [formularios, setFormularios] = useState({});
  const [notas, setNotas] = useState({});
  const [editorAbierto, setEditorAbierto] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const {
        data: solicitudesData,
        error: errorSolicitudes,
      } = await supabase
        .from("solicitudes_presupuesto")
        .select(
          "id,cliente_id,vivienda_id,servicios_solicitados,lineas_solicitadas,descripcion_cliente,estado,factura_gestion_id,extra_gestion_id,factura_trabajo_id,extra_trabajo_id,gestion_pagada_en,trabajo_pagado_en,created_at,updated_at"
        )
        .order("created_at", { ascending: false });

      if (errorSolicitudes) throw errorSolicitudes;

      const lista = solicitudesData || [];
      setSolicitudes(lista);

      // Gestión y Coste del técnico son extras independientes.
      const columnasExtras =
        "id,cliente_id,vivienda_id,descripcion,servicios_codigos,estado,estado_admin,factura_id,precio,creado_en,solicitud_presupuesto_id,tecnico_id";

      const [extrasGestionResult, extrasCosteResult] =
        await Promise.all([
          supabase
            .from("extras")
            .select(columnasExtras)
            .contains("servicios_codigos", ["gestion_tecnico"])
            .is("solicitud_presupuesto_id", null)
            .order("creado_en", { ascending: false }),

          supabase
            .from("extras")
            .select(columnasExtras)
            .contains("servicios_codigos", ["coste_tecnico"])
            .is("solicitud_presupuesto_id", null)
            .order("creado_en", { ascending: false }),
        ]);

      if (extrasGestionResult.error) throw extrasGestionResult.error;
      if (extrasCosteResult.error) throw extrasCosteResult.error;

      const extrasGestionLista = [
        ...(extrasGestionResult.data || []),
        ...(extrasCosteResult.data || []),
      ].sort(
        (a, b) =>
          new Date(b.creado_en || 0).getTime() -
          new Date(a.creado_en || 0).getTime()
      );

      setGestionExtras(extrasGestionLista);

      if (!lista.length && !extrasGestionLista.length) {
        setClientes([]);
        setViviendas([]);
        setPresupuestos([]);
        setLineas([]);
        setFacturas([]);
        setEventos([]);
        return;
      }

      const clienteIds = [
        ...new Set(
          [
            ...lista.map((s) => s.cliente_id),
            ...extrasGestionLista.map((e) => e.cliente_id),
          ].filter(Boolean)
        ),
      ];

      const viviendaIds = [
        ...new Set(
          [
            ...lista.map((s) => s.vivienda_id),
            ...extrasGestionLista.map((e) => e.vivienda_id),
          ].filter(Boolean)
        ),
      ];

      const solicitudIds = lista.map((s) => s.id);

      const facturaIds = [
        ...new Set(
          [
            ...lista.flatMap((s) => [
              s.factura_gestion_id,
              s.factura_trabajo_id,
            ]),
            ...extrasGestionLista.map((e) => e.factura_id),
          ].filter(Boolean)
        ),
      ];

      const [
        clientesResult,
        viviendasResult,
        presupuestosResult,
        facturasResult,
        eventosResult,
      ] = await Promise.all([
        clienteIds.length
          ? supabase
              .from("clientes")
              .select("id,nombre,email,telefono")
              .in("id", clienteIds)
          : Promise.resolve({ data: [], error: null }),

        viviendaIds.length
          ? supabase
              .from("viviendas")
              .select("id,direccion")
              .in("id", viviendaIds)
          : Promise.resolve({ data: [], error: null }),

        solicitudIds.length
          ? supabase
              .from("presupuestos")
              .select(
                "id,solicitud_id,version,estado,base,iva,total,nota_cliente,created_at,sent_at,responded_at,decision"
              )
              .in("solicitud_id", solicitudIds)
              .order("version", { ascending: false })
          : Promise.resolve({ data: [], error: null }),

        facturaIds.length
          ? supabase
              .from("facturas")
              .select("id,numero,estado,estado_pago,total")
              .in("id", facturaIds)
          : Promise.resolve({ data: [], error: null }),

        solicitudIds.length
          ? supabase
              .from("presupuesto_eventos")
              .select("id,solicitud_id,presupuesto_id,evento,created_at")
              .in("solicitud_id", solicitudIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (clientesResult.error) throw clientesResult.error;
      if (viviendasResult.error) throw viviendasResult.error;
      if (presupuestosResult.error) throw presupuestosResult.error;
      if (facturasResult.error) throw facturasResult.error;
      if (eventosResult.error) throw eventosResult.error;

      const listaPresupuestos = presupuestosResult.data || [];

      setClientes(clientesResult.data || []);
      setViviendas(viviendasResult.data || []);
      setPresupuestos(listaPresupuestos);
      setFacturas(facturasResult.data || []);
      setEventos(eventosResult.data || []);

      const presupuestoIds = listaPresupuestos.map((p) => p.id);

      if (presupuestoIds.length) {
        const {
          data: lineasData,
          error: lineasError,
        } = await supabase
          .from("presupuesto_lineas")
          .select("*")
          .in("presupuesto_id", presupuestoIds)
          .order("created_at");

        if (lineasError) throw lineasError;

        setLineas(lineasData || []);
      } else {
        setLineas([]);
      }
    } catch (e) {
      console.error("Error cargando gestión de presupuestos:", e);
      setError(e.message || "No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c])),
    [clientes]
  );

  const viviendaMap = useMemo(
    () => Object.fromEntries(viviendas.map((v) => [v.id, v])),
    [viviendas]
  );

  const facturaMap = useMemo(
    () => Object.fromEntries(facturas.map((f) => [String(f.id), f])),
    [facturas]
  );

  // Ordena cada solicitud por la fecha de su presupuesto más reciente.
  // Si no tiene presupuesto, utiliza la fecha original de la solicitud.
  const solicitudesOrdenadas = useMemo(() => {
    const ultimaFechaPorSolicitud = new Map();

    presupuestos.forEach((presupuesto) => {
      const fecha = presupuesto.sent_at || presupuesto.created_at;
      const timestamp = fecha ? new Date(fecha).getTime() : 0;

      if (!Number.isFinite(timestamp)) return;

      const anterior =
        ultimaFechaPorSolicitud.get(presupuesto.solicitud_id) || 0;

      if (timestamp > anterior) {
        ultimaFechaPorSolicitud.set(
          presupuesto.solicitud_id,
          timestamp
        );
      }
    });

    return [...solicitudes].sort((a, b) => {
      const fechaCreacionA = new Date(a.created_at || 0).getTime();
      const fechaCreacionB = new Date(b.created_at || 0).getTime();

      const fechaA =
        ultimaFechaPorSolicitud.get(a.id) ||
        (Number.isFinite(fechaCreacionA) ? fechaCreacionA : 0);

      const fechaB =
        ultimaFechaPorSolicitud.get(b.id) ||
        (Number.isFinite(fechaCreacionB) ? fechaCreacionB : 0);

      return fechaB - fechaA;
    });
  }, [solicitudes, presupuestos]);

  // En Presupuestos solo se muestran extras independientes sin factura.
  // Los extras que ya tienen factura se conservan y se consultan desde Facturas.
  const gestionExtrasPendientes = useMemo(
    () => gestionExtras.filter((extra) => !extra.factura_id),
    [gestionExtras]
  );

  // Una solicitud deja de mostrarse aquí cuando ya tiene factura de trabajo.
  // Tener factura de gestión NO la oculta: puede quedar pendiente la factura del trabajo.
  const solicitudesPendientes = useMemo(
    () =>
      solicitudesOrdenadas.filter(
        (solicitud) => !solicitud.factura_trabajo_id
      ),
    [solicitudesOrdenadas]
  );

  const presupuestosSolicitud = (solicitudId) =>
    presupuestos
      .filter((p) => p.solicitud_id === solicitudId)
      .sort((a, b) => Number(b.version) - Number(a.version));

  const abrirEditor = (solicitud) => {
    setEditorAbierto(solicitud.id);

    setFormularios((prev) => ({
      ...prev,
      [solicitud.id]:
        prev[solicitud.id] || crearFormulario(solicitud),
    }));

    setNotas((prev) => ({
      ...prev,
      [solicitud.id]: prev[solicitud.id] || "",
    }));

    setError("");
  };

  const actualizarLinea = (
    solicitudId,
    codigo,
    campo,
    valor
  ) => {
    setFormularios((prev) => ({
      ...prev,
      [solicitudId]: {
        ...(prev[solicitudId] || {}),
        [codigo]: {
          ...(prev[solicitudId]?.[codigo] || {}),
          [campo]: valor,
        },
      },
    }));
  };

  const enviarPresupuesto = async (solicitud) => {
    const formulario =
      formularios[solicitud.id] || crearFormulario(solicitud);

    const lineasSeleccionadas = CATALOGO
      .filter((item) => formulario[item.codigo]?.seleccionado)
      .map((item) => ({
        codigo: item.codigo,
        concepto: String(
          formulario[item.codigo]?.concepto || ""
        ).trim(),
        cantidad: Number(
          formulario[item.codigo]?.cantidad || 1
        ),
        precio_unitario: Number(
          String(
            formulario[item.codigo]?.precio_unitario ?? ""
          ).replace(",", ".")
        ),
      }));

    if (!lineasSeleccionadas.length) {
      setError(
        "Selecciona al menos un concepto para el presupuesto."
      );
      return;
    }

    const invalida = lineasSeleccionadas.find(
      (l) =>
        !l.concepto ||
        !Number.isFinite(l.cantidad) ||
        l.cantidad <= 0 ||
        !Number.isFinite(l.precio_unitario) ||
        l.precio_unitario <= 0
    );

    if (invalida) {
      setError(
        `Revisa el concepto «${invalida.concepto || invalida.codigo}»: la cantidad y el precio deben ser mayores que cero.`
      );
      return;
    }

    if (
      !window.confirm(
        "Se enviará esta versión del presupuesto al cliente y quedará bloqueada como evidencia. ¿Continuar?"
      )
    ) {
      return;
    }

    setGuardando(solicitud.id);
    setError("");
    setMensaje("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "admin_enviar_presupuesto",
        {
          p_solicitud_id: solicitud.id,
          p_lineas: lineasSeleccionadas,
          p_nota: notas[solicitud.id]?.trim() || null,
        }
      );

      if (rpcError) throw rpcError;

      setMensaje(
        `Presupuesto enviado correctamente. Identificador: ${String(
          data
        )
          .slice(0, 8)
          .toUpperCase()}.`
      );

      setEditorAbierto("");
      await cargar();
    } catch (e) {
      console.error("Error enviando presupuesto:", e);
      setError(e.message || "No se pudo enviar el presupuesto.");
    } finally {
      setGuardando("");
    }
  };

  // Generación directa de factura para solicitudes aceptadas.
  const generarFacturaSolicitud = async (solicitud) => {
    if (solicitud.factura_trabajo_id) {
      setError(
        "Esta solicitud ya tiene una factura de trabajo vinculada. No se creará otra."
      );
      return;
    }

    const lineas = Array.isArray(solicitud.lineas_solicitadas)
      ? solicitud.lineas_solicitadas
      : [];

    if (!lineas.length) {
      setError(
        "No se puede generar la factura: la solicitud no contiene conceptos económicos."
      );
      return;
    }

    if (
      !window.confirm(
        "El cliente ya ha aceptado los conceptos y los importes mostrados. Se generará directamente la factura de trabajo, sin enviar un segundo presupuesto. No se asignará técnico hasta que el pago esté confirmado. ¿Continuar?"
      )
    ) {
      return;
    }

    setGuardando(solicitud.id);
    setError("");
    setMensaje("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "admin_facturar_solicitud_aceptada",
        {
          p_solicitud_id: solicitud.id,
        }
      );

      if (rpcError) throw rpcError;

      const total = data?.total;

      setMensaje(
        `Factura de trabajo generada correctamente.${
          total != null ? ` Total: ${dinero(total)}.` : ""
        } El técnico todavía no está asignado; la asignación solo podrá realizarse después de confirmar el pago.`
      );

      await cargar();
    } catch (e) {
      console.error(
        "Error generando factura de solicitud aceptada:",
        e
      );
      setError(
        e.message || "No se pudo generar la factura de trabajo."
      );
    } finally {
      setGuardando("");
    }
  };

  const renderFactura = (id, label) => {
    if (!id) return null;

    const f = facturaMap[String(id)];

    if (!f) {
      return (
        <div style={styles.invoiceRow}>
          <p style={styles.muted}>
            {label}: factura #{id}.
          </p>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate(`/facturas/ver/${id}`)}
          >
            Abrir factura
          </button>
        </div>
      );
    }

    return (
      <div style={styles.invoiceRow}>
        <p style={facturaPagada(f) ? styles.paid : styles.muted}>
          {label}: {f.numero || `#${f.id}`} · {dinero(f.total)} ·{" "}
          {facturaPagada(f) ? "pagada" : "pendiente de pago"}
        </p>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => navigate(`/facturas/ver/${id}`)}
        >
          Abrir factura
        </button>
      </div>
    );
  };

  return (
    <Menu>
      <div style={styles.page}>
        <h1 style={styles.title}>Gestión de presupuestos</h1>

        <p style={styles.subtitle}>
          Administra las solicitudes, prepara versiones de
          presupuesto y consulta las decisiones y pagos registrados
          dentro de CoastGuard.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {mensaje && <div style={styles.success}>{mensaje}</div>}

        {/* GESTIÓN DE PRESUPUESTO: FLUJO INDEPENDIENTE */}
        <section style={styles.managementSection}>
          <h2 style={styles.sectionTitle}>
            Gestión de presupuesto y Coste del técnico
          </h2>

          <p style={styles.muted}>
            Gestión de presupuesto tiene un importe fijo de 30,25 € y no genera asignación técnica.
            Coste del técnico utiliza el importe variable indicado por administración y solo se asigna tras confirmar el pago.
          </p>

          {cargando ? (
            <p style={styles.muted}>Cargando gestiones…</p>
          ) : gestionExtrasPendientes.length === 0 ? (
            <p style={styles.muted}>
              No hay solicitudes independientes pendientes de facturación.
            </p>
          ) : (
            gestionExtrasPendientes.map((extra) => {
              const cliente = clienteMap[extra.cliente_id] || {};
              const vivienda = viviendaMap[extra.vivienda_id] || {};
              const codigosExtra = extra.servicios_codigos || [];

              const esGestion = codigosExtra.includes("gestion_tecnico");
              const esCosteTecnico = codigosExtra.includes("coste_tecnico");

              const conceptoExtra = esCosteTecnico
                ? "Coste del técnico"
                : "Gestión de presupuesto";

              const factura = extra.factura_id
                ? facturaMap[String(extra.factura_id)]
                : null;

              const estadoGestion = {
                pendiente_aceptacion_cliente:
                  "Pendiente de aceptación del cliente",
                aceptado_pendiente_pago:
                  "Aceptada · pendiente de pago",
                rechazado_cliente:
                  "Rechazada por el cliente",
                pagado: "Pagada",
                completado: "Completada",
              }[extra.estado] || extra.estado || "Estado no disponible";

              const aceptada =
                extra.estado === "aceptado_pendiente_pago";

              const rechazada =
                extra.estado === "rechazado_cliente";

              const pagada = facturaPagada(factura);

              const totalEstimado = esGestion
                ? 30.25
                : Number(extra.precio || 0) * 1.21;

              return (
                <article
                  key={extra.id}
                  style={styles.managementCard}
                >
                  <div style={styles.top}>
                    <div>
                      <h3 style={styles.cardTitle}>
                        {cliente.nombre || "Cliente"} ·{" "}
                        {vivienda.direccion ||
                          `Vivienda #${extra.vivienda_id || "—"}`}
                      </h3>

                      <p style={styles.muted}>
                        Solicitud #
                        {String(extra.id).slice(0, 8).toUpperCase()}
                        {extra.creado_en
                          ? ` · ${new Date(extra.creado_en).toLocaleString("es-ES")}`
                          : ""}
                      </p>

                      {cliente.email && (
                        <p style={styles.muted}>{cliente.email}</p>
                      )}
                    </div>

                    <span
                      style={
                        pagada
                          ? styles.statusPaid
                          : rechazada
                          ? styles.statusRejected
                          : styles.status
                      }
                    >
                      {estadoGestion}
                    </span>
                  </div>

                  <p style={styles.body}>
                    <strong>Concepto:</strong> {conceptoExtra}
                  </p>

                  <p style={styles.body}>
                    <strong>Importe:</strong>{" "}
                    {factura?.total != null
                      ? dinero(factura.total)
                      : dinero(totalEstimado)}
                    {factura
                      ? ` · ${pagada ? "Factura pagada" : "Factura pendiente de pago"}`
                      : aceptada
                      ? " · Factura vinculada no encontrada en el listado"
                      : ""}
                  </p>

                  {extra.factura_id ? (
                    <div style={styles.invoiceRow}>
                      <span style={styles.muted}>
                        Factura: {factura?.numero || `#${extra.factura_id}`}
                      </span>

                      <button
                        type="button"
                        style={styles.primaryButton}
                        onClick={() =>
                          navigate(`/facturas/ver/${extra.factura_id}`)
                        }
                      >
                        Abrir factura y gestionar pago
                      </button>
                    </div>
                  ) : aceptada ? (
                    <p style={styles.warning}>
                      La solicitud figura como aceptada, pero no tiene una
                      factura vinculada. Revisa este registro antes de cobrar.
                    </p>
                  ) : null}

                  {aceptada && !pagada && (
                    <p style={styles.warning}>
                      El cliente ya aceptó este extra. No vuelvas a enviarlo ni a crear otro registro; abre la factura para continuar con el aviso de pago.
                    </p>
                  )}

                  {esGestion && extra.tecnico_id && (
                    <p style={styles.error}>
                      Atención: Gestión de presupuesto no debería tener un técnico asociado.
                    </p>
                  )}

                  {esCosteTecnico && extra.tecnico_id && !pagada && (
                    <p style={styles.error}>
                      Atención: el técnico aparece asignado antes de confirmar el pago. Revisa este registro.
                    </p>
                  )}
                </article>
              );
            })
          )}
        </section>

        {/* PRESUPUESTOS ECONÓMICOS DE LOS TRABAJOS */}
        {cargando ? (
          <p style={styles.muted}>Cargando solicitudes…</p>
        ) : solicitudesPendientes.length === 0 ? (
          <div style={styles.card}>
            <p style={styles.muted}>
              No hay solicitudes de presupuesto pendientes de facturación.
            </p>
          </div>
        ) : (
          solicitudesPendientes.map((solicitud) => {
            const cliente =
              clienteMap[solicitud.cliente_id] || {};

            const vivienda =
              viviendaMap[solicitud.vivienda_id] || {};

            const versiones = presupuestosSolicitud(
              solicitud.id
            );

            const eventosSolicitud = eventos.filter(
              (e) => e.solicitud_id === solicitud.id
            );

            const lineasAceptadas = Array.isArray(
              solicitud.lineas_solicitadas
            )
              ? solicitud.lineas_solicitadas
              : [];

            const desgloseAceptado = lineasAceptadas.map((linea) => {
              const cantidad = Number(linea.cantidad ?? 1);
              const precio = Number(linea.precio_unitario);

              return {
                ...linea,
                cantidad,
                precio_unitario: precio,
                subtotal: Number(
                  (cantidad * precio).toFixed(2)
                ),
              };
            });

            const desgloseValido =
              desgloseAceptado.length > 0 &&
              desgloseAceptado.every((linea) =>
                Boolean(String(linea.concepto || "").trim()) &&
                Number.isFinite(linea.cantidad) &&
                linea.cantidad > 0 &&
                Number.isFinite(linea.precio_unitario) &&
                linea.precio_unitario > 0 &&
                Number.isFinite(linea.subtotal)
              );

            const baseAceptada = Number(
              desgloseAceptado
                .reduce((sum, linea) => sum + linea.subtotal, 0)
                .toFixed(2)
            );

            const ivaAceptado = Number(
              (baseAceptada * 0.21).toFixed(2)
            );

            const totalAceptado = Number(
              (baseAceptada + ivaAceptado).toFixed(2)
            );

            const puedeFacturar =
              solicitud.estado === "aceptada_pendiente_presupuesto" &&
              !solicitud.factura_trabajo_id;

            return (
              <article key={solicitud.id} style={styles.card}>
                <div style={styles.top}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      {cliente.nombre || "Cliente"} ·{" "}
                      {vivienda.direccion ||
                        `Vivienda #${solicitud.vivienda_id}`}
                    </h2>

                    <p style={styles.muted}>
                      Solicitud{" "}
                      {String(solicitud.id)
                        .slice(0, 8)
                        .toUpperCase()}{" "}
                      ·{" "}
                      {new Date(
                        solicitud.created_at
                      ).toLocaleString("es-ES")}
                    </p>

                    {cliente.email && (
                      <p style={styles.muted}>{cliente.email}</p>
                    )}
                  </div>

                  <span style={styles.status}>
                    {ESTADOS[solicitud.estado] ||
                      solicitud.estado}
                  </span>
                </div>

                <p style={styles.body}>
                  <strong>Servicios solicitados:</strong>{" "}
                  {(solicitud.servicios_solicitados || [])
                    .map(
                      (codigo) =>
                        NOMBRES_SERVICIOS[codigo] || codigo
                    )
                    .join(", ")}
                </p>

                {solicitud.estado === "cancelado" &&
                  (solicitud.servicios_solicitados || []).includes(
                    "coste_tecnico"
                  ) && (
                    <p style={styles.warning}>
                      Esta solicitud histórica de Coste del técnico se canceló
                      porque ese concepto no pertenece al flujo de presupuestos
                      económicos. Debe tramitarse desde Extras como importe
                      variable independiente. El registro y su historial se
                      conservan; no se ha creado factura ni orden de trabajo.
                    </p>
                  )}

                {solicitud.descripcion_cliente && (
                  <p style={styles.body}>
                    <strong>Detalles del cliente:</strong>{" "}
                    {solicitud.descripcion_cliente}
                  </p>
                )}

                {renderFactura(
                  solicitud.factura_gestion_id,
                  "Gestión inicial"
                )}

                {renderFactura(
                  solicitud.factura_trabajo_id,
                  "Factura de los trabajos"
                )}

                {versiones.map((presupuesto) => (
                  <div
                    key={presupuesto.id}
                    style={styles.quote}
                  >
                    <div style={styles.top}>
                      <strong style={styles.quoteTitle}>
                        Presupuesto · versión {presupuesto.version}
                      </strong>

                      <span style={styles.status}>
                        {presupuesto.estado}
                      </span>
                    </div>

                    {lineas
                      .filter(
                        (l) =>
                          l.presupuesto_id === presupuesto.id
                      )
                      .map((l) => (
                        <div key={l.id} style={styles.line}>
                          <span>
                            {l.concepto} ·{" "}
                            {Number(l.cantidad).toFixed(2)} ×{" "}
                            {dinero(l.precio_unitario)}
                          </span>

                          <strong>{dinero(l.subtotal)}</strong>
                        </div>
                      ))}

                    {presupuesto.nota_cliente && (
                      <p style={styles.body}>
                        Nota al cliente: {presupuesto.nota_cliente}
                      </p>
                    )}

                    <div style={styles.total}>
                      <span>
                        Base {dinero(presupuesto.base)} · IVA{" "}
                        {dinero(presupuesto.iva)}
                      </span>

                      <strong>
                        {dinero(presupuesto.total)}
                      </strong>
                    </div>

                    <p style={styles.muted}>
                      Enviado:{" "}
                      {new Date(
                        presupuesto.sent_at
                      ).toLocaleString("es-ES")}

                      {presupuesto.responded_at
                        ? ` · Respuesta: ${new Date(
                            presupuesto.responded_at
                          ).toLocaleString("es-ES")}`
                        : ""}
                    </p>
                  </div>
                ))}

                {/* FACTURACIÓN DIRECTA DE LA SOLICITUD ACEPTADA */}
                {puedeFacturar && (
                  <div style={styles.editorWrap}>
                    <h3 style={styles.quoteTitle}>
                      Conceptos e importes aceptados por el cliente
                    </h3>

                    {desgloseValido ? (
                      <>
                        {desgloseAceptado.map((linea, index) => (
                          <div
                            key={linea.codigo || index}
                            style={styles.line}
                          >
                            <span>
                              {linea.concepto} · {linea.cantidad} ×{" "}
                              {dinero(linea.precio_unitario)}
                            </span>

                            <strong>
                              {dinero(linea.subtotal)}
                            </strong>
                          </div>
                        ))}

                        <div style={styles.total}>
                          <span>Base imponible</span>
                          <strong>{dinero(baseAceptada)}</strong>
                        </div>

                        <div style={styles.total}>
                          <span>IVA (21%)</span>
                          <strong>{dinero(ivaAceptado)}</strong>
                        </div>

                        <div style={styles.total}>
                          <span>Total aceptado por el cliente</span>
                          <strong>{dinero(totalAceptado)}</strong>
                        </div>

                        <p style={styles.muted}>
                          El cliente ya ha aceptado este desglose. Genera
                          directamente la factura de trabajo; no envíes un
                          segundo presupuesto. La factura quedará pendiente
                          de pago. No se asignará técnico ni comenzará el
                          trabajo hasta que el pago esté confirmado.
                        </p>

                        <button
                          type="button"
                          style={styles.primaryButton}
                          disabled={guardando === solicitud.id}
                          onClick={() =>
                            generarFacturaSolicitud(solicitud)
                          }
                        >
                          {guardando === solicitud.id
                            ? "Generando factura…"
                            : "Generar factura de trabajo"}
                        </button>
                      </>
                    ) : (
                      <p style={styles.warning}>
                        No se puede generar la factura porque el desglose
                        aceptado falta o contiene conceptos, cantidades o
                        precios no válidos. No modifiques los importes
                        aceptados; revisa la solicitud y sus datos antes
                        de continuar.
                      </p>
                    )}
                  </div>
                )}

                {solicitud.estado === "pendiente_aceptacion_cliente" && (
                  <p style={styles.warning}>
                    La solicitud está pendiente de respuesta del cliente.
                    No se crea factura ni se asigna técnico en esta fase.
                  </p>
                )}

                {solicitud.estado === "aceptada_pendiente_presupuesto" && (
                  <p style={styles.paid}>
                    ✓ El cliente ha aceptado los conceptos y los importes.
                    La siguiente acción es generar directamente la factura
                    de trabajo. No se envía un segundo presupuesto ni se
                    asigna técnico antes de confirmar el pago.
                  </p>
                )}

                {solicitud.estado === "pendiente_pago_gestion" && (
                  <p style={styles.warning}>
                    Esta solicitud pertenece al flujo anterior vinculado
                    a Gestión. No se puede preparar desde el nuevo
                    circuito; revisa el registro antes de tramitarlo.
                  </p>
                )}

                {solicitud.estado === "aceptado_pendiente_pago" && (
                  <p style={styles.warning}>
                    El cliente ha aceptado. El técnico sigue sin
                    asignarse hasta que se confirme el pago de la
                    segunda factura.
                  </p>
                )}

                {solicitud.estado === "pagado" && (
                  <p style={styles.paid}>
                    ✓ Pago confirmado y técnico asignado por el
                    proceso automático.
                  </p>
                )}

                {solicitud.estado === "pagado_sin_tecnico" && (
                  <p style={styles.warning}>
                    El pago está confirmado, pero no hay un técnico
                    de destino disponible. Revisa la asignación de
                    la vivienda.
                  </p>
                )}

                {eventosSolicitud.length > 0 && (
                  <details style={styles.events}>
                    <summary>
                      Historial de eventos ({eventosSolicitud.length})
                    </summary>

                    {eventosSolicitud.map((ev) => (
                      <p key={ev.id} style={styles.muted}>
                        {new Date(
                          ev.created_at
                        ).toLocaleString("es-ES")}{" "}
                        · {ev.evento}
                      </p>
                    ))}
                  </details>
                )}
              </article>
            );
          })
        )}
      </div>
    </Menu>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 16px 110px",
    background: "#0a0f1a",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  },

  title: {
    color: "#4db8ff",
    fontSize: 25,
    fontWeight: 900,
    margin: "0 0 8px",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.5,
    margin: "0 0 20px",
  },

  card: {
    background: "rgba(255,255,255,.045)",
    border: "1px solid rgba(77,184,255,.2)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  cardTitle: {
    color: "#4db8ff",
    fontSize: 16,
    fontWeight: 900,
    margin: 0,
  },

  quoteTitle: {
    color: "#4db8ff",
    fontSize: 14,
    fontWeight: 900,
    margin: "0 0 8px",
  },

  status: {
    color: "#fbbf24",
    background: "rgba(245,158,11,.1)",
    border: "1px solid rgba(245,158,11,.3)",
    borderRadius: 8,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
  },

  statusPaid: {
    color: "#34d399",
    background: "rgba(16,185,129,.1)",
    border: "1px solid rgba(52,211,153,.3)",
    borderRadius: 8,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
  },

  statusRejected: {
    color: "#fca5a5",
    background: "rgba(239,68,68,.1)",
    border: "1px solid rgba(248,113,113,.3)",
    borderRadius: 8,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
  },

  muted: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.5,
    margin: "6px 0",
  },

  body: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
  },

  managementSection: {
    border: "1px solid rgba(234,179,8,.3)",
    background: "rgba(234,179,8,.035)",
    borderRadius: 15,
    padding: 14,
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#fbbf24",
    fontSize: 17,
    fontWeight: 900,
    margin: "0 0 8px",
  },

  managementCard: {
    border: "1px solid rgba(234,179,8,.2)",
    background: "rgba(8,15,26,.7)",
    borderRadius: 11,
    padding: 12,
    marginTop: 10,
  },

  invoiceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  quote: {
    border: "1px solid rgba(77,184,255,.22)",
    background: "rgba(8,25,42,.45)",
    borderRadius: 11,
    padding: 12,
    marginTop: 12,
  },

  line: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,.06)",
    color: "#cbd5e1",
    fontSize: 12,
  },

  total: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#e0b034",
    fontWeight: 900,
    paddingTop: 12,
  },

  editorWrap: {
    borderTop: "1px solid rgba(77,184,255,.2)",
    marginTop: 14,
    paddingTop: 14,
  },

  editorLine: {
    padding: "9px 0",
    borderBottom: "1px solid rgba(255,255,255,.07)",
  },

  check: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
  },

  fields: {
    display: "grid",
    gridTemplateColumns:
      "minmax(130px,2fr) minmax(75px,1fr) minmax(90px,1fr)",
    gap: 7,
    marginTop: 8,
  },

  field: {
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    padding: 9,
    borderRadius: 7,
    border: "1px solid rgba(255,255,255,.14)",
    background: "#111d2e",
    color: "#fff",
    fontSize: 12,
  },

  fieldSmall: {
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    padding: 9,
    borderRadius: 7,
    border: "1px solid rgba(255,255,255,.14)",
    background: "#111d2e",
    color: "#fff",
    fontSize: 12,
  },

  label: {
    display: "block",
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
    margin: "12px 0 7px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: 10,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.14)",
    background: "#111d2e",
    color: "#fff",
    fontSize: 13,
  },

  actions: {
    display: "flex",
    gap: 9,
    flexWrap: "wrap",
    marginTop: 12,
  },

  primaryButton: {
    border: 0,
    borderRadius: 9,
    padding: "12px 14px",
    background: "#4db8ff",
    color: "#07111d",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid rgba(255,255,255,.2)",
    borderRadius: 9,
    padding: "12px 14px",
    background: "transparent",
    color: "#cbd5e1",
    fontWeight: 700,
    cursor: "pointer",
  },

  warning: {
    color: "#fbbf24",
    fontSize: 12,
    lineHeight: 1.5,
  },

  paid: {
    color: "#34d399",
    fontSize: 13,
    fontWeight: 800,
  },

  events: {
    marginTop: 14,
    color: "#94a3b8",
    fontSize: 12,
  },

  error: {
    background: "rgba(127,29,29,.2)",
    border: "1px solid rgba(248,113,113,.4)",
    color: "#fca5a5",
    borderRadius: 9,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
  },

  success: {
    background: "rgba(6,95,70,.2)",
    border: "1px solid rgba(52,211,153,.35)",
    color: "#6ee7b7",
    borderRadius: 9,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
  },
};
