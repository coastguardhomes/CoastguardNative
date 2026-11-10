import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

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

const SERVICIOS_EN = {
  apertura_vivienda: "Property access",
  supervision: "Supervision",
  cierre_vivienda: "Property closing",
  coste_tecnico: "Technician cost",
  urgencia: "Urgency / Emergency",
  visita_rapida: "Quick visit",
  inspeccion_tormenta: "Post-storm inspection",
  gestion_tecnico: "Technician Management",
};

const ESTADOS_SOLICITUD = {
  pendiente_aceptacion_cliente: "Pendiente de tu aceptación",
  aceptada_pendiente_presupuesto: "Solicitud aceptada · factura pendiente de generar",
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

const ESTADOS_SOLICITUD_EN = {
  pendiente_aceptacion_cliente: "Awaiting your acceptance",
  aceptada_pendiente_presupuesto: "Request accepted · invoice awaiting generation",
  presupuesto_enviado: "Quote awaiting your response",
  aceptado_pendiente_pago: "Quote accepted · awaiting payment",
  pendiente_aceptacion_gestion: "Previous status: awaiting acceptance",
  pendiente_pago_gestion: "Previous status: awaiting payment",
  gestion_pagada: "Previous status: management fee paid",
  rechazado: "Rejected",
  pagado: "Work paid",
  pagado_sin_tecnico: "Payment confirmed · administrative review",
  completado: "Completed",
  cancelado: "Cancelled",
};

const ESTADOS_EXTRA = {
  pendiente_aceptacion_cliente: "Pendiente de tu aceptación",
  aceptado_pendiente_pago: "Aceptado · pendiente de pago",
  rechazado_cliente: "Rechazado",
  pagado: "Pagado",
  completado: "Completado",
};

const ESTADOS_EXTRA_EN = {
  pendiente_aceptacion_cliente: "Awaiting your acceptance",
  aceptado_pendiente_pago: "Accepted · awaiting payment",
  rechazado_cliente: "Rejected",
  pagado: "Paid",
  completado: "Completed",
};

const dinero = (valor, language = "es") =>
  new Intl.NumberFormat(language === "en" ? "en-GB" : "es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(valor || 0));

const estaPagada = (factura) =>
  [factura?.estado_pago, factura?.estado].some((estado) =>
    ["pagada", "paid", "finalizado"].includes(
      String(estado || "").toLowerCase()
    )
  );

const fecha = (valor, language = "es") => {
  const unavailable =
    language === "en" ? "Date unavailable" : "Fecha no disponible";

  if (!valor) return unavailable;

  const parsed = new Date(valor);

  return Number.isNaN(parsed.getTime())
    ? unavailable
    : parsed.toLocaleString(language === "en" ? "en-GB" : "es-ES");
};

export default function ClientePresupuestos() {
  const { user } = useAuth();
  const location = useLocation();
  const { language } = useLanguage();

  const en = language === "en";
  const t = (es, english) => (en ? english : es);

  const servicioLabel = (codigo) =>
    en
      ? SERVICIOS_EN[codigo] || SERVICIOS[codigo] || codigo
      : SERVICIOS[codigo] || codigo;

  const estadoSolicitudLabel = (estado) =>
    en
      ? ESTADOS_SOLICITUD_EN[estado] || estado
      : ESTADOS_SOLICITUD[estado] || estado;

  const estadoExtraLabel = (estado) =>
    en
      ? ESTADOS_EXTRA_EN[estado] || estado
      : ESTADOS_EXTRA[estado] || estado;

  const estadoPresupuestoLabel = (estado) => {
    if (!en) return estado;

    const traducciones = {
      enviado: "Sent",
      aceptado: "Accepted",
      rechazado: "Rejected",
      pendiente: "Pending",
    };

    return traducciones[estado] || estado;
  };

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
        throw new Error(
          en
            ? "Your client record could not be found."
            : "No se encontró tu ficha de cliente."
        );
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
              "id,cliente_id,vivienda_id,servicios_solicitados,lineas_solicitadas,descripcion_cliente,estado,factura_gestion_id,extra_gestion_id,factura_trabajo_id,extra_trabajo_id,created_at,updated_at"
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
      setError(
        e.message ||
          t(
            "No se pudieron cargar tus solicitudes.",
            "Your requests could not be loaded."
          )
      );
    } finally {
      setCargando(false);
    }
  }, [user, en]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("pago") === "success") {
      setMensaje(
        t(
          "Stripe ha devuelto el pago como completado. La confirmación definitiva depende de la actualización de la factura.",
          "Stripe has returned the payment as completed. Final confirmation depends on the invoice update."
        )
      );
    } else if (params.get("pago") === "cancelled") {
      setMensaje(
        t(
          "El proceso de pago se ha cancelado. Si administración te ha enviado un enlace de pago, podrás utilizarlo de nuevo.",
          "The payment process was cancelled. If the administration team sent you a payment link, you can use it again."
        )
      );
    }
  }, [location.search, en]);

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

  const desgloseLineasAceptadas = (solicitud) => {
    const origen = Array.isArray(solicitud.lineas_solicitadas)
      ? solicitud.lineas_solicitadas
      : [];

    return origen.map((linea) => {
      const cantidad = Number(linea.cantidad ?? 1);
      const precioUnitario = Number(linea.precio_unitario);
      const subtotal = Number((cantidad * precioUnitario).toFixed(2));

      return {
        ...linea,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
        valida:
          Boolean(String(linea.concepto || "").trim()) &&
          Number.isFinite(cantidad) &&
          cantidad > 0 &&
          Number.isFinite(precioUnitario) &&
          precioUnitario > 0 &&
          Number.isFinite(subtotal),
      };
    });
  };

  const responderSolicitud = async (solicitud, decision) => {
    const verbo =
      decision === "aceptado"
        ? t("aceptar", "accept")
        : t("rechazar", "reject");

    const lineasAceptadas = desgloseLineasAceptadas(solicitud);
    const importesValidos =
      lineasAceptadas.length > 0 &&
      lineasAceptadas.every((linea) => linea.valida);

    if (decision === "aceptado" && !importesValidos) {
      setError(
        t(
          "No se puede aceptar esta solicitud porque falta un desglose económico válido. Contacta con administración.",
          "This request cannot be accepted because a valid itemised breakdown is missing. Please contact the administration team."
        )
      );
      return;
    }

    const baseAceptada = Number(
      lineasAceptadas.reduce((sum, linea) => sum + linea.subtotal, 0).toFixed(2)
    );
    const ivaAceptado = Number((baseAceptada * 0.21).toFixed(2));
    const totalAceptado = Number((baseAceptada + ivaAceptado).toFixed(2));

    const confirmacion =
      decision === "aceptado"
        ? en
          ? `Do you accept these items and amounts? Subtotal: ${dinero(baseAceptada, language)}; VAT (21%): ${dinero(ivaAceptado, language)}; total: ${dinero(totalAceptado, language)}. An invoice will be generated after acceptance. No technician will be assigned and no work will begin until payment is confirmed.`
          : `¿Aceptas estos conceptos e importes? Base imponible: ${dinero(baseAceptada, language)}; IVA (21%): ${dinero(ivaAceptado, language)}; total: ${dinero(totalAceptado, language)}. Administración generará la factura tras la aceptación. No se asignará técnico ni comenzará el trabajo hasta confirmar el pago.`
        : en
          ? `Do you confirm that you want to ${verbo} this request? Your response will be recorded.`
          : `¿Confirmas que deseas ${verbo} esta solicitud? Esta respuesta quedará registrada.`;

    if (!window.confirm(confirmacion)) {
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
          t(
            "Has aceptado los conceptos y los importes mostrados. Administración generará directamente la factura, sin necesidad de un segundo presupuesto. No se asignará técnico ni comenzará ningún trabajo hasta que el pago quede confirmado.",
            "You have accepted the items and amounts shown. The administration team will generate the invoice directly; no second quote is needed. No technician will be assigned and no work will begin until payment is confirmed."
          )
        );
      } else {
        setMensaje(
          t(
            "Has rechazado la solicitud. Administración ha recibido el aviso. No se ha generado factura ni orden de trabajo.",
            "You have rejected the request. The administration team has been notified. No invoice or work order has been created."
          )
        );
      }

      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error respondiendo a la solicitud:", e);
      setError(
        e.message ||
          t(
            "No se pudo registrar tu respuesta.",
            "Your response could not be recorded."
          )
      );
    } finally {
      setAccion("");
    }
  };

  const responderPresupuesto = async (presupuesto, decision) => {
    const verbo =
      decision === "aceptado"
        ? t("aceptar", "accept")
        : t("rechazar", "reject");

    const confirmacion = en
      ? `Do you confirm that you want to ${verbo} this quote?`
      : `¿Confirmas que deseas ${verbo} este presupuesto económico?`;

    if (!window.confirm(confirmacion)) {
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
          t(
            "Presupuesto aceptado. Se ha creado la factura del trabajo. Administración debe revisarla y enviarte el aviso o enlace de pago desde su gestión de facturas. El técnico no se asigna hasta que el pago quede confirmado.",
            "Quote accepted. The work invoice has been created. The administration team must review it and send you the payment notice or link from invoice management. A technician will not be assigned until payment is confirmed."
          )
        );
      } else {
        setMensaje(
          t(
            "Has rechazado el presupuesto económico. La decisión ha quedado registrada y no se ha creado una factura de trabajo.",
            "You have rejected the quote. Your decision has been recorded and no work invoice has been created."
          )
        );
      }

      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error respondiendo al presupuesto:", e);
      setError(
        e.message ||
          t(
            "No se pudo registrar tu respuesta.",
            "Your response could not be recorded."
          )
      );
    } finally {
      setAccion("");
    }
  };

  const responderExtra = async (extra, decision) => {
    const verbo =
      decision === "aceptado"
        ? t("aceptar", "accept")
        : t("rechazar", "reject");

    const confirmacion = en
      ? `Do you confirm that you want to ${verbo} this service?`
      : `¿Confirmas que deseas ${verbo} este servicio?`;

    if (!window.confirm(confirmacion)) {
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
            ? t(
                "Has aceptado Gestión del técnico. Se ha creado su factura independiente. No genera asignación ni orden técnica. Administración gestionará el aviso de pago.",
                "You have accepted Technician Management. Its separate invoice has been created. This does not assign a technician or create a work order. The administration team will manage the payment notice."
              )
            : t(
                "Has aceptado el servicio. Se ha creado la factura correspondiente. Administración gestionará el aviso de pago y el técnico solo se asignará cuando el pago quede confirmado.",
                "You have accepted the service. The corresponding invoice has been created. The administration team will manage the payment notice, and a technician will only be assigned once payment is confirmed."
              )
        );
      } else {
        setMensaje(
          t(
            "Has rechazado el servicio. Administración ha recibido la respuesta.",
            "You have rejected the service. The administration team has received your response."
          )
        );
      }

      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error respondiendo al servicio extra:", e);
      setError(
        e.message ||
          t(
            "No se pudo registrar tu respuesta.",
            "Your response could not be recorded."
          )
      );
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
          {t(
            "La factura está pendiente de actualización.",
            "The invoice is awaiting an update."
          )}
        </p>
      );
    }

    if (estaPagada(factura)) {
      return (
        <p style={styles.paid}>
          ✓ {etiqueta}: {t("pago confirmado", "payment confirmed")} (
          {dinero(factura.total, language)})
        </p>
      );
    }

    return (
      <div style={styles.paymentNotice}>
        <strong>
          {etiqueta}: {dinero(factura.total, language)}
        </strong>
        <span>
          {t(
            "Pendiente de pago. Administración debe enviarte el aviso o enlace correspondiente desde la gestión de facturas.",
            "Awaiting payment. The administration team must send you the relevant notice or link from invoice management."
          )}
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
    const lineasAceptadas = desgloseLineasAceptadas(solicitud);
    const importesValidos =
      lineasAceptadas.length > 0 &&
      lineasAceptadas.every((linea) => linea.valida);
    const baseAceptada = Number(
      lineasAceptadas.reduce((sum, linea) => sum + linea.subtotal, 0).toFixed(2)
    );
    const ivaAceptado = Number((baseAceptada * 0.21).toFixed(2));
    const totalAceptado = Number((baseAceptada + ivaAceptado).toFixed(2));

    return (
      <article key={solicitud.id} style={styles.card}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.cardTitle}>
              {t("Solicitud", "Request")}{" "}
              {String(solicitud.id).slice(0, 8).toUpperCase()}
            </h3>
            <p style={styles.muted}>
              {fecha(solicitud.created_at, language)}
            </p>
          </div>

          <span style={styles.status}>
            {estadoSolicitudLabel(solicitud.estado)}
          </span>
        </div>

        <p style={styles.bodyText}>
          <strong>{t("Vivienda:", "Property:")}</strong>{" "}
          {vivienda?.direccion || `Vivienda #${solicitud.vivienda_id}`}
        </p>

        <p style={styles.bodyText}>
          <strong>
            {t("Servicios solicitados:", "Requested services:")}
          </strong>{" "}
          {(solicitud.servicios_solicitados || [])
            .map((codigo) => servicioLabel(codigo))
            .join(", ")}
        </p>

        {solicitud.descripcion_cliente && (
          <div style={styles.descriptionBox}>
            <strong>
              {t(
                "Descripción e indicaciones de administración",
                "Description and instructions from the administration team"
              )}
            </strong>
            <p>{solicitud.descripcion_cliente}</p>
          </div>
        )}

        {pendienteAceptacion && (
          <div style={styles.responseBox}>
            <strong>
              {t(
                "Revisa los conceptos y los importes antes de aceptar.",
                "Review the items and amounts before accepting."
              )}
            </strong>

            {importesValidos ? (
              <>
                {lineasAceptadas.map((linea, index) => (
                  <div key={linea.codigo || index} style={styles.lineRow}>
                    <span>
                      {linea.concepto} ·{" "}
                      {Number(linea.cantidad).toLocaleString(
                        en ? "en-GB" : "es-ES"
                      )}{" "}
                      × {dinero(linea.precio_unitario, language)}
                    </span>
                    <strong>{dinero(linea.subtotal, language)}</strong>
                  </div>
                ))}

                <div style={styles.totalRow}>
                  <span>{t("Base imponible", "Subtotal")}</span>
                  <strong>{dinero(baseAceptada, language)}</strong>
                </div>
                <div style={styles.totalRow}>
                  <span>{t("IVA (21%)", "VAT (21%)")}</span>
                  <strong>{dinero(ivaAceptado, language)}</strong>
                </div>
                <div style={styles.grandTotal}>
                  <span>{t("Total que aceptas", "Total you are accepting")}</span>
                  <strong>{dinero(totalAceptado, language)}</strong>
                </div>

                <p>
                  {t(
                    "Al aceptar, confirmas estos conceptos y estos importes. Administración generará directamente la factura, sin enviarte un segundo presupuesto. La factura quedará pendiente de pago. No se asignará técnico ni comenzará ningún trabajo hasta que el pago esté confirmado.",
                    "By accepting, you agree to these items and amounts. The administration team will generate the invoice directly without sending a second quote. The invoice will be due for payment. No technician will be assigned and no work will begin until payment is confirmed."
                  )}
                </p>
              </>
            ) : (
              <p>
                {t(
                  "No se puede aceptar todavía: falta un desglose económico válido. Contacta con administración para que revise la solicitud.",
                  "You cannot accept this request yet because its itemised amounts are incomplete or invalid. Please contact the administration team."
                )}
              </p>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.acceptButton}
                disabled={Boolean(accion) || !importesValidos}
                onClick={() => responderSolicitud(solicitud, "aceptado")}
              >
                {accion === `solicitud-${solicitud.id}`
                  ? t("Registrando…", "Recording…")
                  : t("Aceptar conceptos e importes", "Accept items and amounts")}
              </button>

              <button
                type="button"
                style={styles.rejectButton}
                disabled={Boolean(accion)}
                onClick={() => responderSolicitud(solicitud, "rechazado")}
              >
                {t("Rechazar solicitud", "Reject request")}
              </button>
            </div>
          </div>
        )}

        {solicitud.estado === "aceptada_pendiente_presupuesto" && (
          <p style={styles.info}>
            {t(
              "Has aceptado los conceptos y sus importes. Administración generará directamente la factura y te enviará el aviso de pago. No se asignará técnico ni comenzará el trabajo hasta confirmar el pago.",
              "You have accepted the items and amounts. The administration team will generate the invoice directly and send you the payment notice. No technician will be assigned and no work will begin until payment is confirmed."
            )}
          </p>
        )}

        {presupuesto && (
          <div style={styles.quoteBox}>
            <div style={styles.cardTop}>
              <h4 style={styles.quoteTitle}>
                {t("Presupuesto económico · versión", "Quote · version")}{" "}
                {presupuesto.version}
              </h4>
              <span style={styles.status}>
                {estadoPresupuestoLabel(presupuesto.estado)}
              </span>
            </div>

            {lineasPresupuesto.map((linea) => (
              <div key={linea.id} style={styles.lineRow}>
                <span>
                  {linea.concepto} ·{" "}
                  {Number(linea.cantidad).toLocaleString(
                    en ? "en-GB" : "es-ES"
                  )}{" "}
                  × {dinero(linea.precio_unitario, language)}
                </span>
                <strong>{dinero(linea.subtotal, language)}</strong>
              </div>
            ))}

            {presupuesto.nota_cliente && (
              <p style={styles.bodyText}>
                <strong>{t("Nota de administración:", "Administration note:")}</strong>{" "}
                {presupuesto.nota_cliente}
              </p>
            )}

            <div style={styles.totalRow}>
              <span>{t("Base imponible", "Subtotal")}</span>
              <strong>{dinero(presupuesto.base, language)}</strong>
            </div>
            <div style={styles.totalRow}>
              <span>{t("IVA (21%)", "VAT (21%)")}</span>
              <strong>{dinero(presupuesto.iva, language)}</strong>
            </div>
            <div style={styles.grandTotal}>
              <span>{t("Total del trabajo", "Work total")}</span>
              <strong>{dinero(presupuesto.total, language)}</strong>
            </div>

            {presupuesto.estado === "enviado" &&
              solicitud.estado === "presupuesto_enviado" && (
                <div style={styles.responseBox}>
                  <strong>
                    {t(
                      "Revisa el presupuesto antes de responder.",
                      "Review the quote before responding."
                    )}
                  </strong>
                  <p>
                    {t(
                      "Si lo aceptas, se generará la factura del trabajo. El pago se tramitará posteriormente mediante el aviso que envíe administración.",
                      "If you accept, the work invoice will be created. Payment will be processed later through the notice sent by the administration team."
                    )}
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
                        ? t("Registrando…", "Recording…")
                        : t("Aceptar presupuesto", "Accept quote")}
                    </button>

                    <button
                      type="button"
                      style={styles.rejectButton}
                      disabled={Boolean(accion)}
                      onClick={() =>
                        responderPresupuesto(presupuesto, "rechazado")
                      }
                    >
                      {t("Rechazar presupuesto", "Reject quote")}
                    </button>
                  </div>
                </div>
              )}

            {presupuesto.estado === "aceptado" && (
              <p style={styles.paid}>
                ✓ {t("Has aceptado este presupuesto.", "You have accepted this quote.")}
              </p>
            )}

            {presupuesto.estado === "rechazado" && (
              <p style={styles.muted}>
                {t(
                  "Has rechazado este presupuesto. No se ha generado el cobro correspondiente a estos trabajos.",
                  "You have rejected this quote. No charge has been generated for this work."
                )}
              </p>
            )}
          </div>
        )}

        {renderEstadoFactura(
          solicitud.factura_trabajo_id,
          t("Factura de los trabajos", "Work invoice")
        )}

        {solicitud.estado === "pagado" && (
          <p style={styles.paid}>
            {t(
              "El pago del trabajo está confirmado. La asignación técnica depende del proceso de la aplicación.",
              "Payment for the work is confirmed. Technician assignment depends on the app's process."
            )}
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
      ? codigos.map((codigo) => servicioLabel(codigo)).join(", ")
      : extra.descripcion || t("Servicio extra", "Extra service");

    return (
      <article key={extra.id} style={styles.card}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.cardTitle}>{titulo}</h3>
            <p style={styles.muted}>
              {fecha(extra.creado_en, language)}
            </p>
          </div>

          <span style={styles.status}>
            {estadoExtraLabel(extra.estado)}
          </span>
        </div>

        <p style={styles.bodyText}>
          <strong>{t("Vivienda:", "Property:")}</strong>{" "}
          {extra.direccion ||
            viviendaPorId[String(extra.vivienda_id)]?.direccion ||
            t("Vivienda asociada", "Associated property")}
        </p>

        {extra.descripcion && (
          <p style={styles.bodyText}>
            <strong>{t("Descripción:", "Description:")}</strong>{" "}
            {extra.descripcion}
          </p>
        )}

        {pendiente && (
          <div style={styles.responseBox}>
            <strong>
              {esGestion
                ? t(
                    "Solicitud independiente de Gestión del técnico",
                    "Separate Technician Management request"
                  )
                : t(
                    "Solicitud de servicio extra",
                    "Extra service request"
                  )}
            </strong>

            {esGestion ? (
              <p>
                {t(
                  "Base: 25,00 € · IVA: 5,25 € · Total: 30,25 €. Esta gestión es independiente de cualquier presupuesto y no genera asignación ni orden técnica.",
                  "Subtotal: €25.00 · VAT: €5.25 · Total: €30.25. This management service is separate from any quote and does not assign a technician or create a work order."
                )}
              </p>
            ) : (
              <p>
                {t("Importe del servicio:", "Service amount:")}{" "}
                {dinero(extra.precio, language)}{" "}
                {t(
                  "antes de IVA, salvo que la solicitud indique otra cosa. Si aceptas, se generará la factura correspondiente. El técnico solo se asignará después de confirmar el pago.",
                  "before VAT, unless the request states otherwise. If you accept, the corresponding invoice will be created. A technician will only be assigned after payment is confirmed."
                )}
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
                  ? t("Registrando…", "Recording…")
                  : t("Aceptar", "Accept")}
              </button>

              <button
                type="button"
                style={styles.rejectButton}
                disabled={Boolean(accion)}
                onClick={() => responderExtra(extra, "rechazado")}
              >
                {t("Rechazar", "Reject")}
              </button>
            </div>
          </div>
        )}

        {extra.factura_id &&
          renderEstadoFactura(
            extra.factura_id,
            esGestion
              ? t("Factura de Gestión", "Management invoice")
              : t("Factura del servicio", "Service invoice")
          )}

        {extra.estado === "aceptado_pendiente_pago" && (
          <p style={styles.info}>
            {t(
              "Has aceptado este servicio. La factura está pendiente de pago y administración gestionará el aviso correspondiente.",
              "You have accepted this service. The invoice is awaiting payment and the administration team will manage the relevant notice."
            )}
            {esGestion
              ? t(
                  " El pago de Gestión no genera una orden ni asigna un técnico.",
                  " The Management payment does not create a work order or assign a technician."
                )
              : t(
                  " La asignación técnica solo se realizará después de confirmar el pago.",
                  " Technician assignment will only take place after payment is confirmed."
                )}
          </p>
        )}
      </article>
    );
  };

  return (
    <Menu>
      <div style={styles.page}>
        <h1 style={styles.title}>
          {t("Mis solicitudes y presupuestos", "My requests and quotes")}
        </h1>

        <p style={styles.subtitle}>
          {t(
            "Aquí puedes consultar las solicitudes que te envía administración, aceptar o rechazar servicios y revisar los presupuestos económicos.",
            "Here you can review requests sent by the administration team, accept or reject services, and review quotes."
          )}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {mensaje && <div style={styles.success}>{mensaje}</div>}

        <section>
          <h2 style={styles.heading}>
            {t("Solicitudes de presupuesto", "Quote requests")}
          </h2>

          {cargando ? (
            <p style={styles.muted}>
              {t("Cargando solicitudes…", "Loading requests…")}
            </p>
          ) : solicitudes.length === 0 ? (
            <div style={styles.card}>
              <p style={styles.muted}>
                {t(
                  "No tienes solicitudes de presupuesto en este momento.",
                  "You have no quote requests at the moment."
                )}
              </p>
            </div>
          ) : (
            solicitudes.map(renderSolicitudPresupuesto)
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>
            {t(
              "Servicios extra y Gestión del técnico",
              "Extra services and Technician Management"
            )}
          </h2>

          {cargando ? (
            <p style={styles.muted}>
              {t("Cargando servicios…", "Loading services…")}
            </p>
          ) : extras.length === 0 ? (
            <div style={styles.card}>
              <p style={styles.muted}>
                {t(
                  "No tienes servicios extra pendientes ni registrados.",
                  "You have no pending or registered extra services."
                )}
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
