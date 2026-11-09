import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";

const CATALOGO = [
  { codigo: "apertura_vivienda", concepto: "Apertura de vivienda", precio: 30 },
  { codigo: "supervision", concepto: "Supervisión (por hora o fracción)", precio: 35 },
  { codigo: "cierre_vivienda", concepto: "Cierre de vivienda", precio: 30 },
  { codigo: "coste_tecnico", concepto: "Coste del técnico", precio: "" },
];

const ESTADOS = {
  pendiente_aceptacion_cliente: "Pendiente de aceptación del cliente",
  aceptada_pendiente_presupuesto: "Aceptada · preparar presupuesto",
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
  const [solicitudes, setSolicitudes] = useState([]);
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
          "id,cliente_id,vivienda_id,servicios_solicitados,descripcion_cliente,estado,factura_gestion_id,extra_gestion_id,factura_trabajo_id,extra_trabajo_id,gestion_pagada_en,trabajo_pagado_en,created_at,updated_at"
        )
        .order("created_at", { ascending: false });

      if (errorSolicitudes) throw errorSolicitudes;

      const lista = solicitudesData || [];
      setSolicitudes(lista);

      if (!lista.length) {
        setClientes([]);
        setViviendas([]);
        setPresupuestos([]);
        setLineas([]);
        setFacturas([]);
        setEventos([]);
        return;
      }

      const clienteIds = [...new Set(lista.map((s) => s.cliente_id))];
      const viviendaIds = [...new Set(lista.map((s) => s.vivienda_id))];
      const solicitudIds = lista.map((s) => s.id);

      const facturaIds = [
        ...new Set(
          lista
            .flatMap((s) => [
              s.factura_gestion_id,
              s.factura_trabajo_id,
            ])
            .filter(Boolean)
        ),
      ];

      const [
        clientesResult,
        viviendasResult,
        presupuestosResult,
        facturasResult,
        eventosResult,
      ] = await Promise.all([
        supabase
          .from("clientes")
          .select("id,nombre,email,telefono")
          .in("id", clienteIds),

        supabase
          .from("viviendas")
          .select("id,direccion")
          .in("id", viviendaIds),

        supabase
          .from("presupuestos")
          .select(
            "id,solicitud_id,version,estado,base,iva,total,nota_cliente,created_at,sent_at,responded_at,decision"
          )
          .in("solicitud_id", solicitudIds)
          .order("version", { ascending: false }),

        facturaIds.length
          ? supabase
              .from("facturas")
              .select("id,numero,estado,estado_pago,total")
              .in("id", facturaIds)
          : Promise.resolve({ data: [], error: null }),

        supabase
          .from("presupuesto_eventos")
          .select("id,solicitud_id,presupuesto_id,evento,created_at")
          .in("solicitud_id", solicitudIds)
          .order("created_at", { ascending: false }),
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

  const renderFactura = (id, label) => {
    if (!id) return null;

    const f = facturaMap[String(id)];

    if (!f) {
      return (
        <p style={styles.muted}>
          {label}: factura #{id}.
        </p>
      );
    }

    return (
      <p style={facturaPagada(f) ? styles.paid : styles.muted}>
        {label}: {f.numero || `#${f.id}`} · {dinero(f.total)} ·{" "}
        {facturaPagada(f) ? "pagada" : "pendiente de pago"}
      </p>
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

        {cargando ? (
          <p style={styles.muted}>Cargando solicitudes…</p>
        ) : solicitudes.length === 0 ? (
          <div style={styles.card}>
            <p style={styles.muted}>
              No hay solicitudes de presupuesto registradas.
            </p>
          </div>
        ) : (
          solicitudes.map((solicitud) => {
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

            const editor =
              formularios[solicitud.id] ||
              crearFormulario(solicitud);

            const puedePreparar = [
              "aceptada_pendiente_presupuesto",
              "presupuesto_enviado",
            ].includes(solicitud.estado);

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
                        CATALOGO.find(
                          (c) => c.codigo === codigo
                        )?.concepto || codigo
                    )
                    .join(", ")}
                </p>

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

                {puedePreparar && (
                  <div style={styles.editorWrap}>
                    {editorAbierto !== solicitud.id ? (
                      <button
                        type="button"
                        style={styles.primaryButton}
                        onClick={() => abrirEditor(solicitud)}
                      >
                        {solicitud.estado ===
                        "presupuesto_enviado"
                          ? "Preparar nueva versión"
                          : "Preparar y enviar presupuesto"}
                      </button>
                    ) : (
                      <div>
                        <h3 style={styles.quoteTitle}>
                          Líneas del presupuesto
                        </h3>

                        <p style={styles.muted}>
                          Puedes incluir cualquier combinación de
                          apertura, supervisión, cierre y coste del
                          técnico. La gestión inicial de 25 € no se
                          añade aquí.
                        </p>

                        {CATALOGO.map((item) => {
                          const linea = editor[item.codigo] || {
                            seleccionado: false,
                            concepto: item.concepto,
                            cantidad: "1",
                            precio_unitario: item.precio,
                          };

                          return (
                            <div
                              key={item.codigo}
                              style={styles.editorLine}
                            >
                              <label style={styles.check}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    linea.seleccionado
                                  )}
                                  onChange={(e) =>
                                    actualizarLinea(
                                      solicitud.id,
                                      item.codigo,
                                      "seleccionado",
                                      e.target.checked
                                    )
                                  }
                                />

                                <span>{item.concepto}</span>
                              </label>

                              {linea.seleccionado && (
                                <div style={styles.fields}>
                                  <input
                                    aria-label={`Concepto ${item.concepto}`}
                                    value={linea.concepto}
                                    onChange={(e) =>
                                      actualizarLinea(
                                        solicitud.id,
                                        item.codigo,
                                        "concepto",
                                        e.target.value
                                      )
                                    }
                                    style={styles.field}
                                    maxLength={180}
                                  />

                                  <input
                                    aria-label="Cantidad"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={linea.cantidad}
                                    onChange={(e) =>
                                      actualizarLinea(
                                        solicitud.id,
                                        item.codigo,
                                        "cantidad",
                                        e.target.value
                                      )
                                    }
                                    style={styles.fieldSmall}
                                  />

                                  <input
                                    aria-label="Precio unitario"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Precio €"
                                    value={linea.precio_unitario}
                                    onChange={(e) =>
                                      actualizarLinea(
                                        solicitud.id,
                                        item.codigo,
                                        "precio_unitario",
                                        e.target.value
                                      )
                                    }
                                    style={styles.fieldSmall}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <label style={styles.label}>
                          Nota para el cliente (opcional)
                        </label>

                        <textarea
                          rows={3}
                          maxLength={2000}
                          value={notas[solicitud.id] || ""}
                          onChange={(e) =>
                            setNotas((prev) => ({
                              ...prev,
                              [solicitud.id]: e.target.value,
                            }))
                          }
                          style={styles.textarea}
                        />

                        <div style={styles.actions}>
                          <button
                            type="button"
                            style={styles.primaryButton}
                            disabled={
                              guardando === solicitud.id
                            }
                            onClick={() =>
                              enviarPresupuesto(solicitud)
                            }
                          >
                            {guardando === solicitud.id
                              ? "Enviando…"
                              : "Enviar presupuesto al cliente"}
                          </button>

                          <button
                            type="button"
                            style={styles.secondaryButton}
                            disabled={
                              guardando === solicitud.id
                            }
                            onClick={() =>
                              setEditorAbierto("")
                            }
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
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
                    ✓ El cliente ha aceptado la solicitud. Ya puedes
                    preparar el presupuesto económico. La Gestión del
                    técnico es independiente y no es un requisito.
                  </p>
                )}

                {solicitud.estado === "pendiente_pago_gestion" && (
                  <p style={styles.warning}>
                    Esta solicitud pertenece al flujo anterior vinculado
                    a Gestión. No se puede preparar desde el nuevo
                    circuito; revisa el registro antes de tramitarlo.
                  </p>
                )}

                {solicitud.estado ===
                  "aceptado_pendiente_pago" && (
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
