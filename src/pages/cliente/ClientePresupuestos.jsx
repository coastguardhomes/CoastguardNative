
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";

const SERVICIOS = {
  apertura_vivienda: "Apertura de vivienda",
  supervision: "Supervisión",
  cierre_vivienda: "Cierre de vivienda",
  coste_tecnico: "Coste del técnico",
  urgencia: "Urgencia / Emergencia",
  visita_rapida: "Visita rápida",
  inspeccion_tormenta: "Inspección posterior a tormenta",
  gestion_tecnico: "Gestión del técnico",
};

const ESTADOS_SOLICITUD = {
  pendiente_aceptacion_cliente: "Pendiente de tu aceptación",
  aceptada_pendiente_presupuesto: "Solicitud aceptada · preparando presupuesto",
  presupuesto_enviado: "Presupuesto pendiente de tu respuesta",
  aceptado_pendiente_pago: "Presupuesto aceptado · pendiente de pago",
  pendiente_aceptacion_gestion: "Estado anterior: pendiente de aceptación",
  pendiente_pago_gestion: "Estado anterior: pendiente de pago",
  gestion_pagada: "Estado anterior: gestión pagada",
  rechazado: "Rechazado",
  pagado: "Trabajo pagado",
  pagado_sin_tecnico: "Pago confirmado · revisión administrativa",
  completado: "Completado",
  cancelado: "Cancelado",
};

const ESTADOS_EXTRA = {
  pendiente_aceptacion_cliente: "Pendiente de tu aceptación",
  aceptado_pendiente_pago: "Aceptado · pendiente de pago",
  rechazado_cliente: "Rechazado",
  pagado: "Pagado",
  completado: "Completado",
};

const dinero = (valor) =>
  `${Number(valor || 0).toFixed(2).replace(".", ",")} €`;

const estaPagada = (factura) =>
  [factura?.estado_pago, factura?.estado].some((estado) =>
    ["pagada", "paid", "finalizado"].includes(
      String(estado || "").toLowerCase()
    )
  );

const fecha = (valor) => {
  if (!valor) return "Fecha no disponible";
  const parsed = new Date(valor);
  return Number.isNaN(parsed.getTime())
    ? "Fecha no disponible"
    : parsed.toLocaleString("es-ES");
};

export default function ClientePresupuestos() {
  const { user } = useAuth();
  const location = useLocation();

  const [cliente, setCliente] = useState(null);
  const [viviendas, setViviendas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [extras, setExtras] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [facturas, setFacturas] = useState([]);

  const [cargando, setCargando] = useState(true);
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
        .select("id,nombre,usuario_id,user_id")
        .or(`usuario_id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      if (errorCliente) throw errorCliente;

      if (!clienteActual?.id) {
        throw new Error("No se encontró tu ficha de cliente.");
      }

      setCliente(clienteActual);

      const [viviendasResult, solicitudesResult, extrasResult] =
        await Promise.all([
          supabase
            .from("viviendas")
            .select("id,direccion,activa,tecnico_id")
            .eq("cliente_id", clienteActual.id)
            .eq("activa", true)
            .order("direccion"),

          supabase
            .from("solicitudes_presupuesto")
            .select(
              "id,cliente_id,vivienda_id,servicios_solicitados,descripcion_cliente,estado,factura_gestion_id,extra_gestion_id,factura_trabajo_id,extra_trabajo_id,created_at,updated_at"
            )
            .eq("cliente_id", clienteActual.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("extras")
            .select(
              "id,descripcion,precio,estado,cliente_id,direccion,factura_id,vivienda_id,tecnico_id,estado_admin,servicios_codigos,creado_en,solicitud_presupuesto_id,presupuesto_id,fase_presupuesto"
            )
            .eq("cliente_id", clienteActual.id)
            .is("solicitud_presupuesto_id", null)
            .order("creado_en", { ascending: false }),
        ]);

      if (viviendasResult.error) throw viviendasResult.error;
      if (solicitudesResult.error) throw solicitudesResult.error;
      if (extrasResult.error) throw extrasResult.error;

      const listaSolicitudes = solicitudesResult.data || [];
      const listaExtras = extrasResult.data || [];

      setViviendas(viviendasResult.data || []);
      setSolicitudes(listaSolicitudes);
      setExtras(listaExtras);

      const solicitudIds = listaSolicitudes.map((s) => s.id);

      let listaPresupuestos = [];

      if (solicitudIds.length) {
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

        listaPresupuestos = presupuestosData || [];
      }

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
          [
            ...listaSolicitudes.flatMap((s) => [
              s.factura_gestion_id,
              s.factura_trabajo_id,
            ]),
            ...listaExtras.map((e) => e.factura_id),
          ].filter(Boolean)
        ),
      ];

      if (facturaIds.length) {
        const {
          data: facturasData,
          error: errorFacturas,
        } = await supabase
          .from("facturas")
          .select("id,numero,estado,estado_pago,total,descripcion")
          .in("id", facturaIds);

        if (errorFacturas) throw errorFacturas;

        setFacturas(facturasData || []);
      } else {
        setFacturas([]);
      }
    } catch (e) {
      console.error("Error cargando solicitudes y presupuestos:", e);
      setError(e.message || "No se pudieron cargar tus solicitudes.");
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
        "Stripe ha devuelto el pago como completado. La confirmación definitiva depende de la actualización de la factura."
      );
    } else if (params.get("pago") === "cancelled") {
      setMensaje(
        "El proceso de pago se ha cancelado. Si administración te ha enviado un enlace de pago, podrás utilizarlo de nuevo."
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

  const viviendaPorId = useMemo(
    () =>
      Object.fromEntries(
        viviendas.map((v) => [String(v.id), v])
      ),
    [viviendas]
  );

  const responderSolicitud = async (solicitud, decision) => {
    const verbo = decision === "aceptado" ? "aceptar" : "rechazar";

    if (
      !window.confirm(
        `¿Confirmas que deseas ${verbo} esta solicitud? Esta respuesta quedará registrada.`
      )
    ) {
      return;
    }

    setAccion(`solicitud-${solicitud.id}`);
    setError("");
    setMensaje("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "cliente_responder_solicitud_presupuesto",
        {
          p_solicitud_id: solicitud.id,
          p_decision: decision,
        }
      );

      if (rpcError) throw rpcError;

      if (decision === "aceptado") {
        setMensaje(
          "Has aceptado la solicitud. Administración ha recibido el aviso y podrá preparar el presupuesto económico. Esta aceptación no genera factura, cobro ni orden de trabajo."
        );
      } else {
        setMensaje(
          "Has rechazado la solicitud. Administración ha recibido el aviso. No se ha generado factura ni orden de trabajo."
        );
      }

      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error respondiendo a la solicitud:", e);
      setError(e.message || "No se pudo registrar tu respuesta.");
    } finally {
      setAccion("");
    }
  };

  const responderPresupuesto = async (presupuesto, decision) => {
    const verbo = decision === "aceptado" ? "aceptar" : "rechazar";

    if (
      !window.confirm(
        `¿Confirmas que deseas ${verbo} este presupuesto económico?`
      )
    ) {
      return;
    }

    setAccion(`presupuesto-${presupuesto.id}`);
    setError("");
    setMensaje("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
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
          "Presupuesto aceptado. Se ha creado la factura del trabajo. Administración debe revisarla y enviarte el aviso o enlace de pago desde su gestión de facturas. El técnico no se asigna hasta que el pago quede confirmado."
        );
      } else {
        setMensaje(
          "Has rechazado el presupuesto económico. La decisión ha quedado registrada y no se ha creado una factura de trabajo."
        );
      }

      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error respondiendo al presupuesto:", e);
      setError(e.message || "No se pudo registrar tu respuesta.");
    } finally {
      setAccion("");
    }
  };

  const responderExtra = async (extra, decision) => {
    const verbo = decision === "aceptado" ? "aceptar" : "rechazar";

    if (
      !window.confirm(
        `¿Confirmas que deseas ${verbo} este servicio?`
      )
    ) {
      return;
    }

    setAccion(`extra-${extra.id}`);
    setError("");
    setMensaje("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "cliente_responder_extra",
        {
          p_extra_id: extra.id,
          p_decision: decision,
        }
      );

      if (rpcError) throw rpcError;

      const esGestion = (extra.servicios_codigos || []).includes(
        "gestion_tecnico"
      );

      if (decision === "aceptado") {
        setMensaje(
          esGestion
            ? "Has aceptado Gestión del técnico. Se ha creado su factura independiente. No genera asignación ni orden técnica. Administración gestionará el aviso de pago."
            : "Has aceptado el servicio. Se ha creado la factura correspondiente. Administración gestionará el aviso de pago y el técnico solo se asignará cuando el pago quede confirmado."
        );
      } else {
        setMensaje(
          "Has rechazado el servicio. Administración ha recibido la respuesta."
        );
      }

      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error respondiendo al servicio extra:", e);
      setError(e.message || "No se pudo registrar tu respuesta.");
    } finally {
      setAccion("");
    }
  };

  const ultimoPresupuesto = (solicitudId) =>
    presupuestos
      .filter((p) => p.solicitud_id === solicitudId)
      .sort((a, b) => Number(b.version) - Number(a.version))[0] || null;

  const renderEstadoFactura = (facturaId, etiqueta) => {
    if (!facturaId) return null;

    const factura = facturaPorId[String(facturaId)];

    if (!factura) {
      return (
        <p style={styles.muted}>
          La factura está pendiente de actualización.
        </p>
      );
    }

    if (estaPagada(factura)) {
      return (
        <p style={styles.paid}>
          ✓ {etiqueta}: pago confirmado ({dinero(factura.total)})
        </p>
      );
    }

    return (
      <div style={styles.paymentNotice}>
        <strong>
          {etiqueta}: {dinero(factura.total)}
        </strong>
        <span>
          Pendiente de pago. Administración debe enviarte el aviso o enlace
          correspondiente desde la gestión de facturas.
        </span>
      </div>
    );
  };

  const renderSolicitudPresupuesto = (solicitud) => {
    const presupuesto = ultimoPresupuesto(solicitud.id);
    const lineasPresupuesto = presupuesto
      ? lineas.filter((l) => l.presupuesto_id === presupuesto.id)
      : [];

    const vivienda = viviendaPorId[String(solicitud.vivienda_id)];
    const pendienteAceptacion =
      solicitud.estado === "pendiente_aceptacion_cliente";

    return (
      <article key={solicitud.id} style={styles.card}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.cardTitle}>
              Solicitud {String(solicitud.id).slice(0, 8).toUpperCase()}
            </h3>
            <p style={styles.muted}>{fecha(solicitud.created_at)}</p>
          </div>

          <span style={styles.status}>
            {ESTADOS_SOLICITUD[solicitud.estado] || solicitud.estado}
          </span>
        </div>

        <p style={styles.bodyText}>
          <strong>Vivienda:</strong>{" "}
          {vivienda?.direccion || `Vivienda #${solicitud.vivienda_id}`}
        </p>

        <p style={styles.bodyText}>
          <strong>Servicios solicitados:</strong>{" "}
          {(solicitud.servicios_solicitados || [])
            .map((codigo) => SERVICIOS[codigo] || codigo)
            .join(", ")}
        </p>

        {solicitud.descripcion_cliente && (
          <div style={styles.descriptionBox}>
            <strong>Descripción e indicaciones de administración</strong>
            <p>{solicitud.descripcion_cliente}</p>
          </div>
        )}

        {pendienteAceptacion && (
          <div style={styles.responseBox}>
            <strong>¿Aceptas que administración prepare este presupuesto?</strong>
            <p>
              Esta respuesta solo autoriza la preparación del presupuesto
              económico. No supone aceptar un precio, no genera un cobro y no
              crea una orden de trabajo. Recibirás el presupuesto final para
              revisarlo antes de decidir.
            </p>

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.acceptButton}
                disabled={Boolean(accion)}
                onClick={() => responderSolicitud(solicitud, "aceptado")}
              >
                {accion === `solicitud-${solicitud.id}`
                  ? "Registrando…"
                  : "Aceptar solicitud"}
              </button>

              <button
                type="button"
                style={styles.rejectButton}
                disabled={Boolean(accion)}
                onClick={() => responderSolicitud(solicitud, "rechazado")}
              >
                Rechazar solicitud
              </button>
            </div>
          </div>
        )}

        {solicitud.estado === "aceptada_pendiente_presupuesto" && (
          <p style={styles.info}>
            Has aceptado la solicitud. Administración está preparando el
            presupuesto económico. Todavía no hay factura ni pago pendiente.
          </p>
        )}

        {presupuesto && (
          <div style={styles.quoteBox}>
            <div style={styles.cardTop}>
              <h4 style={styles.quoteTitle}>
                Presupuesto económico · versión {presupuesto.version}
              </h4>
              <span style={styles.status}>{presupuesto.estado}</span>
            </div>

            {lineasPresupuesto.map((linea) => (
              <div key={linea.id} style={styles.lineRow}>
                <span>
                  {linea.concepto} · {Number(linea.cantidad).toLocaleString("es-ES")} ×{" "}
                  {dinero(linea.precio_unitario)}
                </span>
                <strong>{dinero(linea.subtotal)}</strong>
              </div>
            ))}

            {presupuesto.nota_cliente && (
              <p style={styles.bodyText}>
                <strong>Nota de administración:</strong>{" "}
                {presupuesto.nota_cliente}
              </p>
            )}

            <div style={styles.totalRow}>
              <span>Base imponible</span>
              <strong>{dinero(presupuesto.base)}</strong>
            </div>
            <div style={styles.totalRow}>
              <span>IVA (21%)</span>
              <strong>{dinero(presupuesto.iva)}</strong>
            </div>
            <div style={styles.grandTotal}>
              <span>Total del trabajo</span>
              <strong>{dinero(presupuesto.total)}</strong>
            </div>

            {presupuesto.estado === "enviado" &&
              solicitud.estado === "presupuesto_enviado" && (
                <div style={styles.responseBox}>
                  <strong>Revisa el presupuesto antes de responder.</strong>
                  <p>
                    Si lo aceptas, se generará la factura del trabajo. El pago
                    se tramitará posteriormente mediante el aviso que envíe
                    administración.
                  </p>

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={styles.acceptButton}
                      disabled={Boolean(accion)}
                      onClick={() =>
                        responderPresupuesto(presupuesto, "aceptado")
                      }
                    >
                      {accion === `presupuesto-${presupuesto.id}`
                        ? "Registrando…"
                        : "Aceptar presupuesto"}
                    </button>

                    <button
                      type="button"
                      style={styles.rejectButton}
                      disabled={Boolean(accion)}
                      onClick={() =>
                        responderPresupuesto(presupuesto, "rechazado")
                      }
                    >
                      Rechazar presupuesto
                    </button>
                  </div>
                </div>
              )}

            {presupuesto.estado === "aceptado" && (
              <p style={styles.paid}>
                ✓ Has aceptado este presupuesto.
              </p>
            )}

            {presupuesto.estado === "rechazado" && (
              <p style={styles.muted}>
                Has rechazado este presupuesto. No se ha generado el cobro
                correspondiente a estos trabajos.
              </p>
            )}
          </div>
        )}

        {renderEstadoFactura(
          solicitud.factura_trabajo_id,
          "Factura de los trabajos"
        )}

        {solicitud.estado === "pagado" && (
          <p style={styles.paid}>
            El pago del trabajo está confirmado. La asignación técnica depende
            del proceso de la aplicación.
          </p>
        )}
      </article>
    );
  };

  const renderExtra = (extra) => {
    const codigos = extra.servicios_codigos || [];
    const esGestion = codigos.includes("gestion_tecnico");
    const pendiente =
      extra.estado === "pendiente_aceptacion_cliente" &&
      !extra.factura_id;

    const titulo = codigos.length
      ? codigos.map((codigo) => SERVICIOS[codigo] || codigo).join(", ")
      : extra.descripcion || "Servicio extra";

    return (
      <article key={extra.id} style={styles.card}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.cardTitle}>{titulo}</h3>
            <p style={styles.muted}>{fecha(extra.creado_en)}</p>
          </div>

          <span style={styles.status}>
            {ESTADOS_EXTRA[extra.estado] || extra.estado}
          </span>
        </div>

        <p style={styles.bodyText}>
          <strong>Vivienda:</strong>{" "}
          {extra.direccion ||
            viviendaPorId[String(extra.vivienda_id)]?.direccion ||
            "Vivienda asociada"}
        </p>

        {extra.descripcion && (
          <p style={styles.bodyText}>
            <strong>Descripción:</strong> {extra.descripcion}
          </p>
        )}

        {pendiente && (
          <div style={styles.responseBox}>
            <strong>
              {esGestion
                ? "Solicitud independiente de Gestión del técnico"
                : "Solicitud de servicio extra"}
            </strong>

            {esGestion ? (
              <>
                <p>
                  Base: 25,00 € · IVA: 5,25 € · Total: 30,25 €. Esta gestión
                  es independiente de cualquier presupuesto y no genera
                  asignación ni orden técnica.
                </p>
              </>
            ) : (
              <p>
                Importe del servicio: {dinero(extra.precio)} antes de IVA,
                salvo que la solicitud indique otra cosa. Si aceptas, se
                generará la factura correspondiente. El técnico solo se
                asignará después de confirmar el pago.
              </p>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.acceptButton}
                disabled={Boolean(accion)}
                onClick={() => responderExtra(extra, "aceptado")}
              >
                {accion === `extra-${extra.id}`
                  ? "Registrando…"
                  : "Aceptar"}
              </button>

              <button
                type="button"
                style={styles.rejectButton}
                disabled={Boolean(accion)}
                onClick={() => responderExtra(extra, "rechazado")}
              >
                Rechazar
              </button>
            </div>
          </div>
        )}

        {extra.factura_id &&
          renderEstadoFactura(
            extra.factura_id,
            esGestion ? "Factura de Gestión" : "Factura del servicio"
          )}

        {extra.estado === "aceptado_pendiente_pago" && (
          <p style={styles.info}>
            Has aceptado este servicio. La factura está pendiente de pago y
            administración gestionará el aviso correspondiente.
            {esGestion
              ? " El pago de Gestión no genera una orden ni asigna un técnico."
              : " La asignación técnica solo se realizará después de confirmar el pago."}
          </p>
        )}
      </article>
    );
  };

  return (
    <Menu>
      <div style={styles.page}>
        <h1 style={styles.title}>Mis solicitudes y presupuestos</h1>

        <p style={styles.subtitle}>
          Aquí puedes consultar las solicitudes que te envía administración,
          aceptar o rechazar servicios y revisar los presupuestos económicos.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {mensaje && <div style={styles.success}>{mensaje}</div>}

        <section>
          <h2 style={styles.heading}>Solicitudes de presupuesto</h2>

          {cargando ? (
            <p style={styles.muted}>Cargando solicitudes…</p>
          ) : solicitudes.length === 0 ? (
            <div style={styles.card}>
              <p style={styles.muted}>
                No tienes solicitudes de presupuesto en este momento.
              </p>
            </div>
          ) : (
            solicitudes.map(renderSolicitudPresupuesto)
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>Servicios extra y Gestión del técnico</h2>

          {cargando ? (
            <p style={styles.muted}>Cargando servicios…</p>
          ) : extras.length === 0 ? (
            <div style={styles.card}>
              <p style={styles.muted}>
                No tienes servicios extra pendientes ni registrados.
              </p>
            </div>
          ) : (
            extras.map(renderExtra)
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

  section: {
    marginTop: 26,
  },

  card: {
    background: "linear-gradient(145deg,#0b1320 0%,#04070d 100%)",
    border: "1px solid rgba(224,176,52,.35)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,.3)",
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
    maxWidth: 190,
    textAlign: "center",
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

  descriptionBox: {
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    background: "rgba(56,189,248,.07)",
    border: "1px solid rgba(56,189,248,.25)",
    color: "#bae6fd",
    fontSize: 13,
    lineHeight: 1.5,
  },

  responseBox: {
    padding: 13,
    marginTop: 14,
    borderRadius: 10,
    background: "rgba(245,158,11,.07)",
    border: "1px solid rgba(245,158,11,.3)",
    color: "#fcd34d",
    fontSize: 13,
    lineHeight: 1.5,
  },

  info: {
    color: "#7dd3fc",
    background: "rgba(14,116,144,.12)",
    border: "1px solid rgba(56,189,248,.25)",
    borderRadius: 9,
    padding: 11,
    fontSize: 12,
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

  paymentNotice: {
    display: "grid",
    gap: 5,
    padding: 11,
    marginTop: 12,
    background: "rgba(245,158,11,.08)",
    border: "1px solid rgba(245,158,11,.25)",
    borderRadius: 9,
    color: "#fbbf24",
    fontSize: 12,
    lineHeight: 1.5,
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
