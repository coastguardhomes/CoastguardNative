
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 12px rgba(224, 176, 52, 0.6)",
};

const VERSION_CONTRATO_V4 = "CONTRATO_SERVICIOS_V4_2026-11-22";

export default function Contratos() {
  const navigate = useNavigate();

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    cargarContratos();
  }, []);

  const obtenerUrlPdf = async (valor) => {
    if (typeof valor !== "string" || !valor.trim()) return null;
    const referencia = valor.trim();

    if (/^data:/i.test(referencia)) return referencia;

    try {
      return await resolverUrlPdfSegura(referencia, "contratos", 3600);
    } catch (err) {
      console.error("Error resolviendo PDF del contrato:", err);
      return null;
    }
  };

  const cargarContratos = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: err } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes ( id, nombre, email, direccion ),
          viviendas ( id, ciudad, direccion, localidad )
        `)
        .order("id", { ascending: false });

      if (err) throw err;
      setContratos(data || []);
    } catch (err) {
      console.error("Error cargando contratos:", err);
      setError("No se pudieron cargar los contratos.");
    } finally {
      setLoading(false);
    }
  };

  const verOPaginarPdf = async (contrato) => {
    try {
      setActionLoading(contrato.id);

      if (contrato.pdf_url) {
        const pdfUrl = await obtenerUrlPdf(contrato.pdf_url);
        if (pdfUrl) {
          window.open(pdfUrl, "_blank");
          return;
        }
      }

      const { data, error: errPdf } = await supabase.functions.invoke(
        "contrato-pdf",
        {
          body: {
            contrato_id: Number(contrato.id),
            contratoId: Number(contrato.id),
            id: Number(contrato.id),
          },
        }
      );

      if (errPdf) throw errPdf;

      const { data: updatedContrato } = await supabase
        .from("contratos")
        .select("pdf_url")
        .eq("id", contrato.id)
        .single();

      const finalPdfValue =
        updatedContrato?.pdf_url ||
        data?.pdf_url ||
        data?.pdfUrl ||
        data?.url;

      if (finalPdfValue) {
        const finalPdfUrl = await obtenerUrlPdf(finalPdfValue);
        if (finalPdfUrl) {
          window.open(finalPdfUrl, "_blank");
          await cargarContratos();
          return;
        }
      }

      alert("El PDF se procesó correctamente. Vuelve a pulsar 'Ver PDF'.");
      await cargarContratos();
    } catch (err) {
      console.error("Error al visualizar PDF:", err);
      alert("No se pudo generar/visualizar el PDF: " + (err.message || "Error desconocido"));
    } finally {
      setActionLoading(null);
    }
  };

  const generarYEnviarContrato = async (contrato) => {
    try {
      setActionLoading(contrato.id);

      const numericContratoId = Number(contrato.id);
      let contratoPdfValue = contrato.pdf_url || null;

      try {
        const { data: resPdf, error: errPdf } =
          await supabase.functions.invoke("contrato-pdf", {
            body: {
              contrato_id: numericContratoId,
              contratoId: numericContratoId,
              id: numericContratoId,
            },
          });

        if (errPdf) console.warn("Aviso en generación PDF:", errPdf);

        if (resPdf?.pdf_url || resPdf?.pdfUrl || resPdf?.url) {
          contratoPdfValue = resPdf.pdf_url || resPdf.pdfUrl || resPdf.url;
        }
      } catch (err) {
        console.warn("Aviso en generación PDF:", err);
      }

      const { data: contratoDb } = await supabase
        .from("contratos")
        .select("pdf_url")
        .eq("id", numericContratoId)
        .maybeSingle();

      if (contratoDb?.pdf_url) contratoPdfValue = contratoDb.pdf_url;

      let contratoPdfUrl = null;
      if (contratoPdfValue) {
        contratoPdfUrl = await obtenerUrlPdf(contratoPdfValue);
      }

      const estadoActual = String(contrato.estado || "").toLowerCase().trim();

      const tieneFirmaRegistrada = Boolean(
        contrato.aceptacion_contrato === true ||
        contrato.firma_cliente ||
        contrato.firma_url ||
        contrato.firma ||
        contrato.firmado_en ||
        contrato.fecha_firma ||
        ["firmado", "firmado_cliente", "enviado_al_admin", "activo", "completado"].includes(estadoActual)
      );

      if (!tieneFirmaRegistrada) {
        const { error: estadoError } = await supabase
          .from("contratos")
          .update({ estado: "enviado_cliente" })
          .eq("id", numericContratoId);

        if (estadoError) throw estadoError;
      }

      const { error: errEmail } = await supabase.functions.invoke("enviar-email", {
        body: {
          contrato_id: numericContratoId,
          contratoId: numericContratoId,
          id: numericContratoId,
          pdf_url: contratoPdfUrl,
          contrato_pdf_url: contratoPdfUrl,
          tipo: "contrato",
        },
      });

      if (errEmail) {
        alert("Contrato procesado, pero el servicio de correo devolvió una advertencia.");
      } else {
        alert("¡Contrato procesado y enviado al cliente con éxito!");
      }

      await cargarContratos();
    } catch (err) {
      console.error("Error al procesar el contrato:", err);
      alert("Error al procesar: " + (err.message || "Error desconocido"));
    } finally {
      setActionLoading(null);
    }
  };

  const cancelarSuscripcion = async (contrato) => {
    const esContratoV4 =
      contrato.version_condiciones === VERSION_CONTRATO_V4;

    const tieneCompromisoAnual =
      esContratoV4 && contrato.permanencia_anual === true;

    const mensajeCompromiso = tieneCompromisoAnual
      ? "\n\nEste contrato tiene un compromiso inicial de 12 meses. La solicitud se tramitará mediante el procedimiento de cancelación vigente. Esta pantalla no calcula ni aplica automáticamente ninguna compensación por baja anticipada."
      : "";

    const confirmado = window.confirm(
      "¿Solicitar la cancelación de este contrato?\n\n" +
      "La baja se programará con un mes de preaviso. El servicio y la facturación continuarán hasta la fecha efectiva indicada por Stripe." +
      mensajeCompromiso +
      "\n\nEl contrato y sus evidencias NO se borrarán."
    );

    if (!confirmado) return;

    try {
      setActionLoading(contrato.id);

      const { data, error: err } = await supabase.functions.invoke(
        "cancelar-suscripcion",
        { body: { contractId: Number(contrato.id) } }
      );

      if (err) throw err;
      if (!data?.ok) {
        throw new Error(data?.error || "No se pudo cancelar la suscripción.");
      }

      const fechaEfectiva = data?.cancelacion_efectiva_en
        ? new Date(data.cancelacion_efectiva_en).toLocaleString("es-ES")
        : "pendiente de confirmación";

      alert(
        "✅ Solicitud de cancelación registrada.\n\n" +
        "El contrato seguirá activo durante el preaviso.\n" +
        "Fecha efectiva prevista: " + fechaEfectiva + ".\n\n" +
        "No se ha eliminado el contrato ni su historial."
      );

      await cargarContratos();
    } catch (err) {
      console.error("Error cancelando suscripción:", err);
      alert("No se pudo cancelar la suscripción: " + (err.message || "Error desconocido"));
    } finally {
      setActionLoading(null);
    }
  };

  const borrarContrato = async (contrato) => {
    if (contrato.pagado === true) {
      alert("Este contrato está pagado. Stripe confirmó el pago y no se puede borrar.");
      return;
    }

    const confirmado = window.confirm(
      "¿Eliminar este contrato impagado?\n\n" +
      "Se eliminarán también sus eventos de firma asociados. " +
      "Las facturas se conservarán cuando deban mantenerse por motivos fiscales."
    );

    if (!confirmado) return;

    try {
      setActionLoading(contrato.id);

      // RPC transaccional: comprueba de nuevo el pago en Supabase
      // y elimina contrato y eventos de firma de forma atómica.
      const { error: err } = await supabase.rpc(
        "eliminar_contrato_impago",
        { p_contrato_id: Number(contrato.id) }
      );

      if (err) throw err;

      setContratos((prev) =>
        prev.filter((c) => Number(c.id) !== Number(contrato.id))
      );

      alert("Contrato impagado eliminado correctamente.");
    } catch (err) {
      console.error("Error borrando contrato:", err);
      alert(
        "No se pudo eliminar el contrato: " +
        (err.message || "Error desconocido")
      );
      await cargarContratos();
    } finally {
      setActionLoading(null);
    }
  };

  const obtenerBadgeEstado = (estado, pagado) => {
    const est = String(estado || "").toLowerCase().trim();

    if (est === "cancelado") {
      return {
        texto: "🛑 CANCELADO",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.2)",
        border: "rgba(239, 68, 68, 0.5)",
      };
    }

    if (pagado === true) {
      return {
        texto: "✅ PAGADO",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.2)",
        border: "rgba(52, 211, 153, 0.5)",
      };
    }

    if (
      est === "firmado" ||
      est === "firmado_cliente" ||
      est === "enviado_al_admin" ||
      est === "activo" ||
      est === "completado"
    ) {
      return {
        texto: "✍️ FIRMADO — PENDIENTE DE PAGO",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.12)",
        border: "rgba(52, 211, 153, 0.4)",
      };
    }

    if (
      est === "enviado_cliente" ||
      est === "enviado_al_cliente" ||
      est === "enviada"
    ) {
      return {
        texto: "📩 ENVIADO AL CLIENTE",
        color: "#60a5fa",
        bg: "rgba(96, 165, 250, 0.2)",
        border: "rgba(96, 165, 250, 0.5)",
      };
    }

    return {
      texto: "⏳ PENDIENTE",
      color: COLOR_DORADO,
      bg: "rgba(224, 176, 52, 0.2)",
      border: "rgba(224, 176, 52, 0.5)",
    };
  };

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>📋 Panel de Contratos (Admin)</h1>

        <button
          onClick={() => navigate("/contratos/crear")}
          style={estilos.botonCrear}
        >
          ➕ Crear Nuevo Contrato
        </button>

        {error && <p style={estilos.error}>{error}</p>}

        {loading ? (
          <p style={estilos.texto}>Cargando contratos...</p>
        ) : contratos.length === 0 ? (
          <p style={estilos.texto}>No hay contratos registrados.</p>
        ) : (
          contratos.map((c) => {
            const badge = obtenerBadgeEstado(c.estado, c.pagado);
            const estaProcesando = actionLoading === c.id;

            const tieneFirma = Boolean(
              c.aceptacion_contrato === true ||
              c.firma_cliente ||
              c.firma_url ||
              c.firma ||
              c.firmado_en ||
              c.fecha_firma ||
              ["firmado", "firmado_cliente", "enviado_al_admin", "activo", "completado"].includes(
                String(c.estado || "").toLowerCase().trim()
              )
            );

            const estaCancelado =
              String(c.estado || "").toLowerCase().trim() === "cancelado";

            const cancelacionProgramada = Boolean(
              c.cancelacion_solicitada_en && c.cancelacion_efectiva_en
            );

            const esContratoV4 =
              c.version_condiciones === VERSION_CONTRATO_V4;

            const tieneCompromisoAnual =
              esContratoV4 && c.permanencia_anual === true;

            const precioOrdinario = Number(
              c.precio_sin_descuento ?? c.precio ?? 0
            );

            const descuentoCompromiso = Number(
              c.descuento_compromiso_pct ?? 0
            );

            const precioMensualContratado = Number(c.precio ?? 0);

            const fechaFinCompromiso =
              tieneCompromisoAnual && c.fecha_fin
                ? String(c.fecha_fin).slice(0, 10)
                : null;

            return (
              <div key={c.id} style={estilos.tarjeta}>
                <div style={estilos.infoBloque}>
                  <p style={estilos.lineaInfo}>
                    <span style={estilos.etiqueta}>Cliente:</span>{" "}
                    {c.clientes?.nombre || "Sin cliente"}
                  </p>
                  <p style={estilos.lineaInfo}>
                    <span style={estilos.etiqueta}>Dirección cliente:</span>{" "}
                    {c.clientes?.direccion || "Sin dirección"}
                  </p>
                  <p style={estilos.lineaInfo}>
                    <span style={estilos.etiqueta}>Vivienda:</span>{" "}
                    {c.viviendas?.direccion || "Sin vivienda"}
                  </p>
                </div>

                <div style={estilos.cabeceraContrato}>
                  <span style={estilos.numeroContrato}>Contrato #{c.id}</span>
                  <span
                    style={{
                      ...estilos.badge,
                      color: badge.color,
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                    }}
                  >
                    {badge.texto}
                  </span>
                </div>

                <p style={estilos.fechaInfo}>
                  <span style={estilos.etiqueta}>Inicio:</span>{" "}
                  {String(c.fecha_inicio || "").slice(0, 10)}
                  {tieneFirma && (
                    <span style={estilos.firmaRegistrada}>
                      ✍️ Firma registrada
                    </span>
                  )}
                </p>

                {esContratoV4 ? (
                  <div style={estilos.bloqueV4}>
                    <strong style={{ color: "#38bdf8" }}>
                      Modalidad contractual V4
                    </strong>
                    <div style={{ marginTop: "7px" }}>
                      {tieneCompromisoAnual
                        ? "Mensual con compromiso inicial de 12 meses"
                        : "Mensual flexible, sin permanencia"}
                    </div>
                    <div>Cobro: mensual</div>

                    {tieneCompromisoAnual && (
                      <>
                        <div>Fin del compromiso inicial: {fechaFinCompromiso || "No consta fecha"}</div>
                        <div>Descuento mensual: {descuentoCompromiso.toFixed(2)}%</div>
                        <div>Precio ordinario mensual (sin IVA): {precioOrdinario.toFixed(2)} €</div>
                        <div>Precio mensual contratado (sin IVA): {precioMensualContratado.toFixed(2)} €</div>
                        <div style={{ marginTop: "6px" }}>
                          Al terminar los 12 meses iniciales, el contrato continúa mes a mes, sin iniciar otra permanencia anual automática.
                        </div>
                      </>
                    )}

                    {!tieneCompromisoAnual && (
                      <div>
                        No tiene fecha de vencimiento por permanencia. Continúa mes a mes hasta que se solicite la baja conforme al preaviso aplicable.
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p style={estilos.fechaInfo}>
                      <span style={estilos.etiqueta}>Fin del período:</span>{" "}
                      {String(c.fecha_fin || "—").slice(0, 10)}
                    </p>
                    <p style={estilos.fechaInfo}>
                      <span style={estilos.etiqueta}>Renovación anual:</span>{" "}
                      {c.renovacion_automatica === true && c.renovacion_aceptada_en
                        ? "Aceptada y registrada"
                        : "No consta aceptación expresa"}
                    </p>
                  </>
                )}

                {cancelacionProgramada && (
                  <div style={estilos.cancelacionProgramada}>
                    <strong>Cancelación programada</strong>
                    <div>
                      Solicitada: {new Date(c.cancelacion_solicitada_en).toLocaleString("es-ES")}
                    </div>
                    <div>
                      Fecha efectiva: {new Date(c.cancelacion_efectiva_en).toLocaleString("es-ES")}
                    </div>
                    El contrato permanece activo durante el preaviso.
                  </div>
                )}

                <div style={estilos.gridBotones}>
                  <button
                    type="button"
                    onClick={() => navigate(`/contratos/ver/${c.id}`)}
                    style={estilos.botonGris}
                  >
                    🔍 Ver Ficha
                  </button>

                  <button
                    type="button"
                    onClick={() => verOPaginarPdf(c)}
                    disabled={estaProcesando}
                    style={{
                      ...estilos.botonGris,
                      borderColor: tieneFirma ? "#34d399" : "#3f4459",
                      color: tieneFirma ? "#34d399" : "#fff",
                    }}
                  >
                    📄 Ver PDF
                  </button>
                </div>

                {!estaCancelado && !cancelacionProgramada && c.pagado === true && (
                  <button
                    type="button"
                    onClick={() => cancelarSuscripcion(c)}
                    disabled={estaProcesando}
                    style={estilos.botonCancelar}
                  >
                    {estaProcesando
                      ? "⏳ Cancelando..."
                      : "🛑 Solicitar cancelación (1 mes)"}
                  </button>
                )}

                {c.pagado === true ? (
                  <button
                    type="button"
                    disabled
                    title="Stripe ha confirmado el pago. El contrato está protegido."
                    style={estilos.botonProtegido}
                  >
                    🔒 Contrato pagado — borrado bloqueado
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => borrarContrato(c)}
                    disabled={estaProcesando}
                    style={{
                      ...estilos.botonBorrar,
                      opacity: estaProcesando ? 0.6 : 1,
                      cursor: estaProcesando ? "wait" : "pointer",
                    }}
                  >
                    {estaProcesando
                      ? "⏳ Procesando..."
                      : "🗑️ Eliminar contrato impagado"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => generarYEnviarContrato(c)}
                  disabled={estaProcesando}
                  style={estilos.botonVerde}
                >
                  {estaProcesando
                    ? "⏳ Procesando..."
                    : "⚡ Generar y Enviar Contrato"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </Menu>
  );
}

const estilos = {
  pagina: {
    padding: "20px",
    background: FONDO_PRINCIPAL,
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    paddingBottom: "100px",
    boxSizing: "border-box",
  },
  titulo: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: "20px",
    fontWeight: "900",
    marginBottom: "20px",
    textAlign: "center",
  },
  botonCrear: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
    color: "#fff",
    border: BORDE_DORADO_FINO,
    borderRadius: "14px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
  },
  tarjeta: {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: SOMBRA_LUXURY,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxSizing: "border-box",
  },
  infoBloque: { display: "flex", flexDirection: "column", gap: "4px" },
  lineaInfo: { margin: 0, fontSize: "13px", color: "#e2e8f0" },
  etiqueta: { color: "#94a3b8", fontWeight: "600" },
  cabeceraContrato: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  numeroContrato: { fontSize: "16px", fontWeight: "900", color: "#38bdf8" },
  badge: {
    fontSize: "11px",
    fontWeight: "800",
    border: "1px solid",
    borderRadius: "20px",
    padding: "4px 10px",
    textTransform: "uppercase",
  },
  fechaInfo: { margin: 0, fontSize: "13px", color: "#e2e8f0" },
  firmaRegistrada: {
    color: "#34d399",
    marginLeft: "10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  bloqueV4: {
    padding: "12px",
    borderRadius: "8px",
    background: "rgba(56,189,248,0.08)",
    border: "1px solid rgba(56,189,248,0.3)",
    color: "#dbeafe",
    fontSize: "13px",
    lineHeight: 1.65,
  },
  cancelacionProgramada: {
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.4)",
    color: "#fbbf24",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  gridBotones: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "4px",
  },
  botonGris: {
    padding: "10px",
    background: "#2a2d3d",
    color: "#fff",
    border: "1px solid #3f4459",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },
  botonCancelar: {
    width: "100%",
    padding: "11px",
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid rgba(245, 158, 11, 0.5)",
    color: "#f59e0b",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },
  botonBorrar: {
    width: "100%",
    padding: "10px",
    background: "rgba(220, 38, 38, 0.2)",
    border: "1px solid rgba(220, 38, 38, 0.5)",
    color: "#ef4444",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },
  botonProtegido: {
    width: "100%",
    padding: "10px",
    background: "rgba(52, 211, 153, 0.12)",
    border: "1px solid rgba(52, 211, 153, 0.45)",
    color: "#34d399",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "not-allowed",
  },
  botonVerde: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    color: "#fff",
    border: "1px solid rgba(16, 185, 129, 0.5)",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
  },
  texto: { color: "#aaa", fontSize: "13px", textAlign: "center" },
  error: {
    marginBottom: "16px",
    padding: "12px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
    borderRadius: "12px",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "13px",
  },
};
