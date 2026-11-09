import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";

const SERVICIOS = [
  { codigo: "apertura_vivienda", nombre: "Apertura de vivienda" },
  { codigo: "supervision", nombre: "Supervisión (por hora o fracción)" },
  { codigo: "cierre_vivienda", nombre: "Cierre de vivienda" },
  { codigo: "coste_tecnico", nombre: "Coste del técnico" },
];

const ESTADOS = {
  pendiente_pago_gestion: "Pendiente de pago de la gestión",
  gestion_pagada: "Gestión pagada · preparando presupuesto",
  presupuesto_enviado: "Presupuesto pendiente de tu respuesta",
  aceptado_pendiente_pago: "Presupuesto aceptado · pendiente de pago",
  rechazado: "Presupuesto rechazado",
  pagado: "Trabajo pagado · técnico asignado",
  pagado_sin_tecnico: "Pago confirmado · requiere asignación administrativa",
  completado: "Trabajo completado",
  cancelado: "Solicitud cancelada",
};

const dinero = (valor) => `${Number(valor || 0).toFixed(2)} €`;

const estaPagada = (factura) =>
  [factura?.estado_pago, factura?.estado].some((estado) =>
    ["pagada", "paid", "finalizado"].includes(
      String(estado || "").toLowerCase()
    )
  );

export default function ClientePresupuestos() {
  const { user } = useAuth();
  const location = useLocation();

  const [cliente, setCliente] = useState(null);
  const [viviendas, setViviendas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [facturas, setFacturas] = useState([]);

  const [viviendaId, setViviendaId] = useState("");
  const [servicios, setServicios] = useState([]);
  const [descripcion, setDescripcion] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [accion, setAccion] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = useCallback(async () => {
    if (!user?.id) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");

    try {
      const {
        data: clienteActual,
        error: errorCliente,
      } = await supabase
        .from("clientes")
        .select("id, nombre, usuario_id, user_id")
        .or(`usuario_id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      if (errorCliente) throw errorCliente;

      if (!clienteActual?.id) {
        throw new Error("No se encontró tu ficha de cliente.");
      }

      setCliente(clienteActual);

      const [viviendasResult, solicitudesResult] =
        await Promise.all([
          supabase
            .from("viviendas")
            .select("id, direccion, activa, tecnico_id")
            .eq("cliente_id", clienteActual.id)
            .eq("activa", true)
            .order("direccion"),

          supabase
            .from("solicitudes_presupuesto")
            .select(
              "id,cliente_id,vivienda_id,servicios_solicitados,descripcion_cliente,estado,factura_gestion_id,extra_gestion_id,factura_trabajo_id,extra_trabajo_id,gestion_pagada_en,trabajo_pagado_en,created_at,updated_at"
            )
            .eq("cliente_id", clienteActual.id)
            .order("created_at", { ascending: false }),
        ]);

      if (viviendasResult.error) throw viviendasResult.error;
      if (solicitudesResult.error) throw solicitudesResult.error;

      const listaSolicitudes = solicitudesResult.data || [];

      setViviendas(viviendasResult.data || []);
      setSolicitudes(listaSolicitudes);

      const solicitudIds = listaSolicitudes.map((s) => s.id);

      if (!solicitudIds.length) {
        setPresupuestos([]);
        setLineas([]);
        setFacturas([]);
        return;
      }

      const {
        data: presupuestosData,
        error: errorPresupuestos,
      } = await supabase
        .from("presupuestos")
        .select(
          "id,solicitud_id,version,estado,base,iva,total,nota_cliente,created_at,sent_at,responded_at,decision"
        )
        .in("solicitud_id", solicitudIds)
        .order("version", { ascending: false });

      if (errorPresupuestos) throw errorPresupuestos;

      const listaPresupuestos = presupuestosData || [];

      setPresupuestos(listaPresupuestos);

      const presupuestoIds = listaPresupuestos.map((p) => p.id);

      if (presupuestoIds.length) {
        const {
          data: lineasData,
          error: errorLineas,
        } = await supabase
          .from("presupuesto_lineas")
          .select("*")
          .in("presupuesto_id", presupuestoIds)
          .order("created_at");

        if (errorLineas) throw errorLineas;

        setLineas(lineasData || []);
      } else {
        setLineas([]);
      }

      const facturaIds = [
        ...new Set(
          listaSolicitudes
            .flatMap((s) => [
              s.factura_gestion_id,
              s.factura_trabajo_id,
            ])
            .filter(Boolean)
        ),
      ];

      if (facturaIds.length) {
        const {
          data: facturasData,
          error: errorFacturas,
        } = await supabase
          .from("facturas")
          .select(
            "id, numero, estado, estado_pago, total, descripcion"
          )
          .in("id", facturaIds);

        if (errorFacturas) throw errorFacturas;

        setFacturas(facturasData || []);
      } else {
        setFacturas([]);
      }
    } catch (e) {
      console.error(
        "Error cargando presupuestos del cliente:",
        e
      );

      setError(
        e.message || "No se pudieron cargar tus presupuestos."
      );
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("pago") === "success") {
      setMensaje(
        "Stripe ha devuelto el pago como completado. Estamos actualizando la factura; si todavía aparece pendiente, espera unos segundos y vuelve a cargar esta pantalla."
      );
    } else if (params.get("pago") === "cancelled") {
      setMensaje(
        "El proceso de pago se ha cancelado. Puedes volver a intentarlo cuando quieras."
      );
    }
  }, [location.search]);

  const facturaPorId = useMemo(
    () =>
      Object.fromEntries(
        facturas.map((f) => [String(f.id), f])
      ),
    [facturas]
  );

  const alternarServicio = (codigo) => {
    setServicios((actuales) =>
      actuales.includes(codigo)
        ? actuales.filter((x) => x !== codigo)
        : [...actuales, codigo]
    );
  };

  const crearSolicitud = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!viviendaId) {
      return setError("Selecciona la vivienda.");
    }

    if (!servicios.length) {
      return setError("Selecciona al menos un servicio.");
    }

    const vivienda = viviendas.find(
      (v) => String(v.id) === String(viviendaId)
    );

    if (!vivienda) {
      return setError(
        "No se encontró la vivienda seleccionada."
      );
    }

    if (!vivienda.tecnico_id) {
      return setError(
        "Esta vivienda todavía no tiene un técnico activo asignado. Contacta con administración para que pueda tramitar la solicitud."
      );
    }

    setGuardando(true);

    try {
      const {
        data,
        error: rpcError,
      } = await supabase.rpc("solicitar_presupuesto", {
        p_vivienda_id: Number(viviendaId),
        p_servicios: servicios,
        p_descripcion: descripcion.trim() || null,
      });

      if (rpcError) throw rpcError;

      setMensaje(
        `Solicitud creada. El primer cobro de gestión es de ${dinero(
          data?.total || 30.25
        )} (25,00 € + IVA). Este pago solo cubre la gestión del presupuesto; no incluye los trabajos ni se descuenta del presupuesto posterior.`
      );

      setViviendaId("");
      setServicios([]);
      setDescripcion("");

      await cargarDatos();
    } catch (e) {
      console.error(
        "Error creando solicitud de presupuesto:",
        e
      );

      setError(
        e.message || "No se pudo crear la solicitud."
      );
    } finally {
      setGuardando(false);
    }
  };

  const responder = async (presupuesto, decision) => {
    const verbo =
      decision === "aceptado" ? "aceptar" : "rechazar";

    if (
      !window.confirm(
        `¿Confirmas que deseas ${verbo} este presupuesto? La decisión quedará registrada en la aplicación.`
      )
    ) {
      return;
    }

    setAccion(presupuesto.id);
    setError("");
    setMensaje("");

    try {
      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "cliente_responder_presupuesto",
        {
          p_presupuesto_id: presupuesto.id,
          p_version: presupuesto.version,
          p_decision: decision,
        }
      );

      if (rpcError) throw rpcError;

      if (decision === "aceptado") {
        setMensaje(
          "Presupuesto aceptado. Se ha creado una segunda factura independiente para los trabajos aceptados. El técnico no se asignará hasta que el pago de esa factura quede confirmado."
        );
      } else {
        setMensaje(
          "Has rechazado el presupuesto. La decisión ha quedado registrada y no se ha creado una factura de trabajo."
        );
      }

      await cargarDatos();
    } catch (e) {
      console.error(
        "Error respondiendo al presupuesto:",
        e
      );

      setError(
        e.message || "No se pudo registrar tu respuesta."
      );
    } finally {
      setAccion("");
    }
  };

  const pagarFactura = async (facturaId) => {
    setAccion(`pago-${facturaId}`);
    setError("");

    try {
      const {
        data,
        error: invokeError,
      } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            facturaId: Number(facturaId),
          },
        }
      );

      if (invokeError) throw invokeError;

      const url = String(data?.url || "").trim();

      if (!url) {
        throw new Error(
          data?.error ||
            "Stripe no devolvió el enlace de pago."
        );
      }

      window.location.assign(url);
    } catch (e) {
      console.error(
        "Error creando el pago de presupuesto:",
        e
      );

      setError(
        e.message || "No se pudo iniciar el pago."
      );

      setAccion("");
    }
  };

  const renderPago = (facturaId, etiqueta) => {
    if (!facturaId) return null;

    const factura = facturaPorId[String(facturaId)];

    if (!factura) {
      return (
        <p style={styles.muted}>
          Cargando estado del aviso de pago #{facturaId}…
        </p>
      );
    }

    if (estaPagada(factura)) {
      return (
        <p style={styles.paid}>
          ✓ {etiqueta}: pagada ({dinero(factura.total)})
        </p>
      );
    }

    return (
      <div style={styles.paymentRow}>
        <span>
          {etiqueta}: {dinero(factura.total)} · pendiente
        </span>

        <button
          type="button"
          style={styles.payButton}
          disabled={accion === `pago-${facturaId}`}
          onClick={() => pagarFactura(facturaId)}
        >
          {accion === `pago-${facturaId}`
            ? "Abriendo Stripe…"
            : "Pagar ahora"}
        </button>
      </div>
    );
  };

  const ultimoPresupuesto = (solicitudId) =>
    presupuestos
      .filter((p) => p.solicitud_id === solicitudId)
      .sort(
        (a, b) => Number(b.version) - Number(a.version)
      )[0] || null;

  return (
    <Menu>
      <div style={styles.page}>
        <h1 style={styles.title}>
          Mis solicitudes y presupuestos
        </h1>

        <p style={styles.subtitle}>
          Solicita un trabajo, paga la gestión inicial, consulta
          el presupuesto y acepta o rechaza desde esta aplicación.
        </p>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {mensaje && (
          <div style={styles.success}>{mensaje}</div>
        )}

        <form
          onSubmit={crearSolicitud}
          style={styles.card}
        >
          <h2 style={styles.heading}>
            Solicitar un presupuesto
          </h2>

          <label style={styles.label}>
            Vivienda
          </label>

          <select
            value={viviendaId}
            onChange={(e) => setViviendaId(e.target.value)}
            style={styles.input}
            disabled={guardando || cargando}
          >
            <option value="">
              Selecciona una vivienda
            </option>

            {viviendas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.direccion || `Vivienda #${v.id}`}
                {!v.tecnico_id
                  ? " — sin técnico asignado"
                  : ""}
              </option>
            ))}
          </select>

          <label style={styles.label}>
            ¿Qué trabajo necesitas?
          </label>

          <div style={styles.checkList}>
            {SERVICIOS.map((servicio) => (
              <label
                key={servicio.codigo}
                style={styles.checkItem}
              >
                <input
                  type="checkbox"
                  checked={servicios.includes(
                    servicio.codigo
                  )}
                  onChange={() =>
                    alternarServicio(servicio.codigo)
                  }
                  disabled={guardando}
                />

                <span>{servicio.nombre}</span>
              </label>
            ))}
          </div>

          <label style={styles.label}>
            Detalles adicionales (opcional)
          </label>

          <textarea
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            maxLength={2000}
            rows={3}
            style={styles.textarea}
            placeholder="Describe brevemente qué necesitas…"
            disabled={guardando}
          />

          <div style={styles.feeNotice}>
            <strong>
              Primer cobro: 30,25 € (IVA incluido).
            </strong>

            <span>
              Corresponde únicamente a la gestión para
              contactar con el técnico y obtener el presupuesto.
              No incluye los trabajos, no se descuenta del
              segundo presupuesto y no asigna todavía un técnico.
            </span>
          </div>

          <button
            type="submit"
            disabled={guardando || cargando || !cliente}
            style={styles.primaryButton}
          >
            {guardando
              ? "Creando solicitud…"
              : "Solicitar presupuesto y generar cobro de gestión"}
          </button>
        </form>

        <section>
          <h2 style={styles.heading}>
            Historial de solicitudes
          </h2>

          {cargando ? (
            <p style={styles.muted}>
              Cargando solicitudes…
            </p>
          ) : solicitudes.length === 0 ? (
            <div style={styles.card}>
              <p style={styles.muted}>
                Todavía no tienes solicitudes de presupuesto.
              </p>
            </div>
          ) : (
            solicitudes.map((solicitud) => {
              const presupuesto = ultimoPresupuesto(
                solicitud.id
              );

              const lineasPresupuesto = presupuesto
                ? lineas.filter(
                    (l) =>
                      l.presupuesto_id === presupuesto.id
                  )
                : [];

              const facturaGestion =
                facturaPorId[
                  String(solicitud.factura_gestion_id)
                ];

              const facturaTrabajo =
                facturaPorId[
                  String(solicitud.factura_trabajo_id)
                ];

              return (
                <article
                  key={solicitud.id}
                  style={styles.card}
                >
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.cardTitle}>
                        Solicitud{" "}
                        {String(solicitud.id)
                          .slice(0, 8)
                          .toUpperCase()}
                      </h3>

                      <p style={styles.muted}>
                        {new Date(
                          solicitud.created_at
                        ).toLocaleString("es-ES")}
                      </p>
                    </div>

                    <span style={styles.status}>
                      {ESTADOS[solicitud.estado] ||
                        solicitud.estado}
                    </span>
                  </div>

                  <p style={styles.bodyText}>
                    <strong>Servicios solicitados:</strong>{" "}
                    {(solicitud.servicios_solicitados || [])
                      .map(
                        (codigo) =>
                          SERVICIOS.find(
                            (s) => s.codigo === codigo
                          )?.nombre || codigo
                      )
                      .join(", ")}
                  </p>

                  {solicitud.descripcion_cliente && (
                    <p style={styles.bodyText}>
                      <strong>Detalles:</strong>{" "}
                      {solicitud.descripcion_cliente}
                    </p>
                  )}

                  {renderPago(
                    solicitud.factura_gestion_id,
                    "Gestión inicial"
                  )}

                  {presupuesto && (
                    <div style={styles.quoteBox}>
                      <div style={styles.cardTop}>
                        <h4 style={styles.quoteTitle}>
                          Presupuesto · versión{" "}
                          {presupuesto.version}
                        </h4>

                        <span style={styles.status}>
                          {presupuesto.estado}
                        </span>
                      </div>

                      {lineasPresupuesto.map((linea) => (
                        <div
                          key={linea.id}
                          style={styles.lineRow}
                        >
                          <span>
                            {linea.concepto} ·{" "}
                            {Number(
                              linea.cantidad
                            ).toFixed(2)}{" "}
                            ×{" "}
                            {dinero(
                              linea.precio_unitario
                            )}
                          </span>

                          <strong>
                            {dinero(linea.subtotal)}
                          </strong>
                        </div>
                      ))}

                      {presupuesto.nota_cliente && (
                        <p style={styles.bodyText}>
                          <strong>Nota:</strong>{" "}
                          {presupuesto.nota_cliente}
                        </p>
                      )}

                      <div style={styles.totalRow}>
                        <span>Base imponible</span>
                        <strong>
                          {dinero(presupuesto.base)}
                        </strong>
                      </div>

                      <div style={styles.totalRow}>
                        <span>IVA (21%)</span>
                        <strong>
                          {dinero(presupuesto.iva)}
                        </strong>
                      </div>

                      <div style={styles.grandTotal}>
                        <span>Total del trabajo</span>
                        <strong>
                          {dinero(presupuesto.total)}
                        </strong>
                      </div>

                      {presupuesto.estado === "enviado" &&
                        solicitud.estado ===
                          "presupuesto_enviado" && (
                          <div style={styles.actions}>
                            <button
                              type="button"
                              style={styles.acceptButton}
                              disabled={Boolean(accion)}
                              onClick={() =>
                                responder(
                                  presupuesto,
                                  "aceptado"
                                )
                              }
                            >
                              {accion === presupuesto.id
                                ? "Registrando…"
                                : "Aceptar presupuesto"}
                            </button>

                            <button
                              type="button"
                              style={styles.rejectButton}
                              disabled={Boolean(accion)}
                              onClick={() =>
                                responder(
                                  presupuesto,
                                  "rechazado"
                                )
                              }
                            >
                              {accion === presupuesto.id
                                ? "Registrando…"
                                : "Rechazar presupuesto"}
                            </button>
                          </div>
                        )}

                      {presupuesto.estado === "aceptado" && (
                        <p style={styles.paid}>
                          ✓ Aceptación registrada el{" "}
                          {presupuesto.responded_at
                            ? new Date(
                                presupuesto.responded_at
                              ).toLocaleString("es-ES")
                            : ""}
                        </p>
                      )}

                      {presupuesto.estado === "rechazado" && (
                        <p style={styles.muted}>
                          Presupuesto rechazado. No se ha
                          generado el cobro de los trabajos.
                        </p>
                      )}
                    </div>
                  )}

                  {solicitud.factura_trabajo_id &&
                    renderPago(
                      solicitud.factura_trabajo_id,
                      "Trabajos aceptados"
                    )}

                  {facturaTrabajo &&
                    estaPagada(facturaTrabajo) && (
                      <p style={styles.paid}>
                        El pago del trabajo está confirmado.
                        El técnico se asigna mediante el
                        proceso automático de la aplicación.
                      </p>
                    )}

                  {!facturaGestion &&
                    solicitud.factura_gestion_id && (
                      <p style={styles.muted}>
                        El aviso de gestión está registrándose.
                      </p>
                    )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </Menu>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 16px 110px",
    background: "#030509",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  },

  title: {
    color: "#e0b034",
    fontSize: 24,
    fontWeight: 900,
    margin: "0 0 8px",
    textShadow: "0 0 12px rgba(224,176,52,.35)",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.5,
    margin: "0 0 20px",
  },

  heading: {
    color: "#e0b034",
    fontSize: 17,
    margin: "0 0 14px",
    fontWeight: 800,
  },

  card: {
    background:
      "linear-gradient(145deg,#0b1320 0%,#04070d 100%)",
    border: "1px solid rgba(224,176,52,.35)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,.3)",
  },

  label: {
    display: "block",
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 800,
    margin: "12px 0 7px",
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#111d2e",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 9,
    padding: 12,
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#111d2e",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 9,
    padding: 12,
    fontSize: 14,
    resize: "vertical",
  },

  checkList: {
    display: "grid",
    gap: 9,
    margin: "10px 0",
  },

  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#e2e8f0",
    fontSize: 14,
    padding: "8px 0",
  },

  feeNotice: {
    display: "grid",
    gap: 5,
    padding: 12,
    borderRadius: 10,
    background: "rgba(245,158,11,.09)",
    border: "1px solid rgba(245,158,11,.35)",
    color: "#fbbf24",
    fontSize: 12,
    lineHeight: 1.5,
    margin: "14px 0",
  },

  primaryButton: {
    width: "100%",
    border: 0,
    borderRadius: 10,
    padding: 14,
    background:
      "linear-gradient(135deg,#e0b034,#b88918)",
    color: "#090b10",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
  },

  status: {
    display: "inline-block",
    color: "#fbbf24",
    background: "rgba(245,158,11,.1)",
    border: "1px solid rgba(245,158,11,.35)",
    borderRadius: 8,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    maxWidth: 180,
    textAlign: "center",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },

  cardTitle: {
    color: "#e0b034",
    margin: 0,
    fontSize: 15,
    fontWeight: 900,
  },

  quoteTitle: {
    color: "#38bdf8",
    margin: 0,
    fontSize: 14,
    fontWeight: 900,
  },

  muted: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.5,
    margin: "6px 0",
  },

  bodyText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
  },

  quoteBox: {
    border: "1px solid rgba(56,189,248,.28)",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    background: "rgba(8,24,40,.55)",
  },

  lineRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#cbd5e1",
    fontSize: 12,
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,.06)",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#cbd5e1",
    fontSize: 12,
    paddingTop: 8,
  },

  grandTotal: {
    display: "flex",
    justifyContent: "space-between",
    color: "#e0b034",
    fontSize: 16,
    fontWeight: 900,
    borderTop: "1px solid rgba(224,176,52,.3)",
    marginTop: 10,
    paddingTop: 12,
  },

  actions: {
    display: "flex",
    gap: 9,
    flexWrap: "wrap",
    marginTop: 14,
  },

  acceptButton: {
    flex: 1,
    minWidth: 130,
    border: 0,
    borderRadius: 9,
    padding: 12,
    background: "#059669",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  rejectButton: {
    flex: 1,
    minWidth: 130,
    border: "1px solid #ef4444",
    borderRadius: 9,
    padding: 12,
    background: "rgba(127,29,29,.2)",
    color: "#fca5a5",
    fontWeight: 900,
    cursor: "pointer",
  },

  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: 10,
    marginTop: 12,
    background: "rgba(245,158,11,.08)",
    borderRadius: 9,
    color: "#fbbf24",
    fontSize: 12,
  },

  payButton: {
    border: 0,
    borderRadius: 8,
    padding: "10px 14px",
    background: "#38bdf8",
    color: "#06111d",
    fontWeight: 900,
    cursor: "pointer",
  },

  paid: {
    color: "#34d399",
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1.5,
  },

  error: {
    background: "rgba(127,29,29,.22)",
    border: "1px solid rgba(248,113,113,.45)",
    color: "#fca5a5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 13,
  },

  success: {
    background: "rgba(6,95,70,.22)",
    border: "1px solid rgba(52,211,153,.4)",
    color: "#6ee7b7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 1.5,
  },
};
