import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA =
  "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO =
  "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY =
  "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 12px rgba(224, 176, 52, 0.6)",
};

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
    if (typeof valor !== "string" || !valor.trim()) {
      return null;
    }

    const referencia = valor.trim();

    // Mantener compatibilidad con PDF devueltos como Data URI.
    if (/^data:/i.test(referencia)) {
      return referencia;
    }

    // Resolver rutas de Storage y URL antiguas o firmadas.
    // El helper detecta el bucket y renueva los enlaces de Storage.
    try {
      return await resolverUrlPdfSegura(
        referencia,
        "contratos",
        3600
      );
    } catch (error) {
      console.error(
        "Error resolviendo PDF del contrato:",
        error
      );
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

  // Ver o generar el PDF actualizado del contrato en tiempo real
  const verOPaginarPdf = async (contrato) => {
    try {
      setActionLoading(contrato.id);

      // Si ya existe una ruta/URL, resolverla de forma segura.
      if (contrato.pdf_url) {
        const pdfUrl = await obtenerUrlPdf(
          contrato.pdf_url
        );

        if (pdfUrl) {
          window.open(pdfUrl, "_blank");
          return;
        }

        console.warn(
          "No se pudo resolver el PDF existente. Se intentará regenerar."
        );
      }

      // Si no existe una URL válida, invocamos la Edge Function.
      const { data, error: errPdf } =
        await supabase.functions.invoke("contrato-pdf", {
          body: {
            contrato_id: Number(contrato.id),
            contratoId: Number(contrato.id),
            id: Number(contrato.id),
          },
        });

      if (errPdf) throw errPdf;

      // Consultamos de nuevo para obtener el valor guardado.
      const { data: updatedContrato } =
        await supabase
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
        const finalPdfUrl =
          await obtenerUrlPdf(finalPdfValue);

        if (finalPdfUrl) {
          window.open(finalPdfUrl, "_blank");
          await cargarContratos();
          return;
        }
      }

      alert(
        "El PDF se procesó correctamente. Vuelve a pulsar 'Ver PDF'."
      );

      await cargarContratos();
    } catch (err) {
      console.error(
        "Error al visualizar PDF:",
        err
      );

      alert(
        "No se pudo generar/visualizar el PDF: " +
          (err.message || "Error desconocido")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Procesa y envía únicamente el contrato al cliente
  const generarYEnviarContrato = async (contrato) => {
    try {
      setActionLoading(contrato.id);

      const numericContratoId = Number(contrato.id);

      // 1. Generar PDF del contrato.
      let contratoPdfValue =
        contrato.pdf_url || null;

      try {
        const { data: resPdf, error: errPdf } =
          await supabase.functions.invoke(
            "contrato-pdf",
            {
              body: {
                contrato_id: numericContratoId,
                contratoId: numericContratoId,
                id: numericContratoId,
              },
            }
          );

        if (errPdf) {
          console.warn(
            "Aviso menor en generación PDF de contrato:",
            errPdf
          );
        }

        if (
          resPdf?.pdf_url ||
          resPdf?.pdfUrl ||
          resPdf?.url
        ) {
          contratoPdfValue =
            resPdf.pdf_url ||
            resPdf.pdfUrl ||
            resPdf.url;
        }
      } catch (errContratoPdf) {
        console.warn(
          "Aviso menor en generación PDF de contrato:",
          errContratoPdf
        );
      }

      // 1b. Consultamos la DB porque la Edge Function
      // puede haber actualizado pdf_url.
      const { data: contratoDb } =
        await supabase
          .from("contratos")
          .select("pdf_url")
          .eq("id", numericContratoId)
          .maybeSingle();

      if (contratoDb?.pdf_url) {
        contratoPdfValue =
          contratoDb.pdf_url;
      }

      // Para el correo necesitamos una URL utilizable,
      // no solamente la ruta interna de Storage.
      let contratoPdfUrl = null;

      if (contratoPdfValue) {
        contratoPdfUrl =
          await obtenerUrlPdf(
            contratoPdfValue
          );
      }

      // 2. Actualizar estado del contrato en DB.
      const estadoActual = String(
        contrato.estado || ""
      )
        .toLowerCase()
        .trim();

      if (
        estadoActual !== "firmado" &&
        estadoActual !== "firmado_cliente"
      ) {
        const { error: estadoError } =
          await supabase
            .from("contratos")
            .update({
              estado: "enviado_cliente",
            })
            .eq("id", numericContratoId);

        if (estadoError) {
          throw estadoError;
        }
      }

      // 3. Enviar Email.
      const { error: errEmail } =
        await supabase.functions.invoke(
          "enviar-email",
          {
            body: {
              contrato_id: numericContratoId,
              contratoId: numericContratoId,
              id: numericContratoId,
              pdf_url: contratoPdfUrl,
              contrato_pdf_url: contratoPdfUrl,
              tipo: "contrato",
            },
          }
        );

      if (errEmail) {
        alert(
          "Contrato procesado, pero el servicio de correo devolvió una advertencia."
        );
      } else {
        alert(
          "¡Contrato procesado y enviado al cliente con éxito!"
        );
      }

      await cargarContratos();
    } catch (err) {
      console.error(
        "Error al procesar el contrato:",
        err
      );

      alert(
        "Error al procesar: " +
          (err.message || "Error desconocido")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Cancela la suscripción recurrente de Stripe.
  // NO elimina el contrato ni las facturas históricas.
  const cancelarSuscripcion = async (contrato) => {
    const confirmado = window.confirm(
      "¿Cancelar la suscripción mensual de este contrato?\n\n" +
        "Stripe dejará de realizar los próximos cobros.\n\n" +
        "El contrato NO se borrará y el historial permanecerá guardado."
    );

    if (!confirmado) return;

    try {
      setActionLoading(contrato.id);

      const { data, error: err } =
        await supabase.functions.invoke(
          "cancelar-suscripcion",
          {
            body: {
              contractId: Number(contrato.id),
            },
          }
        );

      if (err) throw err;

      if (!data?.ok) {
        throw new Error(
          data?.error ||
            "No se pudo cancelar la suscripción."
        );
      }

      alert(
        "✅ Suscripción cancelada correctamente.\n\n" +
          "Stripe no volverá a cobrar este contrato."
      );

      await cargarContratos();
    } catch (err) {
      console.error(
        "Error cancelando suscripción:",
        err
      );

      alert(
        "No se pudo cancelar la suscripción: " +
          (err.message || "Error desconocido")
      );
    } finally {
      setActionLoading(null);
    }
  };

  const borrarContrato = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar este contrato?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(id);

      const { error: err } = await supabase
        .from("contratos")
        .delete()
        .eq("id", id);

      if (err) throw err;

      setContratos((prev) =>
        prev.filter((c) => c.id !== id)
      );
    } catch (err) {
      console.error(
        "Error borrando contrato:",
        err
      );

      alert(
        "No se pudo eliminar el contrato."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const obtenerBadgeEstado = (estado, pagado) => {
    const est = String(estado || "")
      .toLowerCase()
      .trim();

    if (est === "cancelado") {
      return {
        texto: "🛑 CANCELADO",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.2)",
        border: "rgba(239, 68, 68, 0.5)",
      };
    }

    if (
      pagado ||
      est === "firmado" ||
      est === "firmado_cliente" ||
      est === "completado"
    ) {
      return {
        texto: pagado
          ? "✅ FIRMADO Y PAGADO"
          : "✅ FIRMADO",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.2)",
        border: "rgba(52, 211, 153, 0.5)",
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
        <h1 style={estilos.titulo}>
          📋 Panel de Contratos (Admin)
        </h1>

        <button
          onClick={() =>
            navigate("/contratos/crear")
          }
          style={estilos.botonCrear}
        >
          ➕ Crear Nuevo Contrato
        </button>

        {error && (
          <p style={estilos.error}>
            {error}
          </p>
        )}

        {loading ? (
          <p style={estilos.texto}>
            Cargando contratos...
          </p>
        ) : contratos.length === 0 ? (
          <p style={estilos.texto}>
            No hay contratos registrados.
          </p>
        ) : (
          contratos.map((c) => {
            const badge =
              obtenerBadgeEstado(
                c.estado,
                c.pagado
              );

            const nombreCliente =
              c.clientes?.nombre ||
              "Sin cliente";

            const direccionCliente =
              c.clientes?.direccion ||
              "Sin dirección";

            const direccionVivienda =
              c.viviendas?.direccion ||
              "Sin vivienda";

            const estaProcesando =
              actionLoading === c.id;

            const tieneFirma = Boolean(
              c.firma_cliente ||
                c.firma_url
            );

            const estaCancelado =
              String(c.estado || "")
                .toLowerCase()
                .trim() === "cancelado";

            return (
              <div
                key={c.id}
                style={estilos.tarjeta}
              >
                <div style={estilos.infoBloque}>
                  <p style={estilos.lineaInfo}>
                    <span
                      style={estilos.etiqueta}
                    >
                      Cliente:
                    </span>{" "}
                    {nombreCliente}
                  </p>

                  <p style={estilos.lineaInfo}>
                    <span
                      style={estilos.etiqueta}
                    >
                      Dirección cliente:
                    </span>{" "}
                    {direccionCliente}
                  </p>

                  <p style={estilos.lineaInfo}>
                    <span
                      style={estilos.etiqueta}
                    >
                      Vivienda:
                    </span>{" "}
                    {direccionVivienda}
                  </p>
                </div>

                <div
                  style={
                    estilos.cabeceraContrato
                  }
                >
                  <span
                    style={
                      estilos.numeroContrato
                    }
                  >
                    Contrato #{c.id}
                  </span>

                  <span
                    style={{
                      ...estilos.badge,
                      color: badge.color,
                      backgroundColor:
                        badge.bg,
                      borderColor:
                        badge.border,
                    }}
                  >
                    {badge.texto}
                  </span>
                </div>

                <p style={estilos.fechaInfo}>
                  <span
                    style={estilos.etiqueta}
                  >
                    Inicio:
                  </span>{" "}
                  {String(
                    c.fecha_inicio || ""
                  ).slice(0, 10)}

                  {tieneFirma && (
                    <span
                      style={{
                        color: "#34d399",
                        marginLeft: "10px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ✍️ Firma registrada
                    </span>
                  )}
                </p>

                <div
                  style={estilos.gridBotones}
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/contratos/ver/${c.id}`
                      )
                    }
                    style={
                      estilos.botonGris
                    }
                  >
                    🔍 Ver Ficha
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      verOPaginarPdf(c)
                    }
                    disabled={
                      estaProcesando
                    }
                    style={{
                      ...estilos.botonGris,
                      borderColor:
                        tieneFirma
                          ? "#34d399"
                          : "#3f4459",
                      color: tieneFirma
                        ? "#34d399"
                        : "#fff",
                    }}
                  >
                    📄 Ver PDF
                  </button>
                </div>

                {!estaCancelado && (
                  <button
                    type="button"
                    onClick={() =>
                      cancelarSuscripcion(c)
                    }
                    disabled={
                      estaProcesando
                    }
                    style={{
                      ...estilos.botonCancelar,
                      opacity:
                        estaProcesando
                          ? 0.6
                          : 1,
                      cursor:
                        estaProcesando
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {estaProcesando
                      ? "⏳ Cancelando..."
                      : "🛑 Cancelar suscripción mensual"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    borrarContrato(c.id)
                  }
                  disabled={
                    estaProcesando
                  }
                  style={
                    estilos.botonBorrar
                  }
                >
                  🗑️ Eliminar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    generarYEnviarContrato(c)
                  }
                  disabled={
                    estaProcesando
                  }
                  style={{
                    ...estilos.botonVerde,
                    opacity:
                      estaProcesando
                        ? 0.6
                        : 1,
                    cursor:
                      estaProcesando
                        ? "not-allowed"
                        : "pointer",
                  }}
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
    background:
      "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
    color: "#fff",
    border: BORDE_DORADO_FINO,
    borderRadius: "14px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "20px",
    boxShadow:
      "0 4px 15px rgba(56, 189, 248, 0.3)",
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

  infoBloque: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  lineaInfo: {
    margin: 0,
    fontSize: "13px",
    color: "#e2e8f0",
  },

  etiqueta: {
    color: "#94a3b8",
    fontWeight: "600",
  },

  cabeceraContrato: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },

  numeroContrato: {
    fontSize: "16px",
    fontWeight: "900",
    color: "#38bdf8",
  },

  badge: {
    fontSize: "11px",
    fontWeight: "800",
    border: "1px solid",
    borderRadius: "20px",
    padding: "4px 10px",
    textTransform: "uppercase",
  },

  fechaInfo: {
    margin: 0,
    fontSize: "13px",
    color: "#e2e8f0",
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
    background:
      "rgba(245, 158, 11, 0.15)",
    border:
      "1px solid rgba(245, 158, 11, 0.5)",
    color: "#f59e0b",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },

  botonBorrar: {
    width: "100%",
    padding: "10px",
    background:
      "rgba(220, 38, 38, 0.2)",
    border:
      "1px solid rgba(220, 38, 38, 0.5)",
    color: "#ef4444",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },

  botonVerde: {
    width: "100%",
    padding: "12px",
    background:
      "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    color: "#fff",
    border:
      "1px solid rgba(16, 185, 129, 0.5)",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
  },

  texto: {
    color: "#aaa",
    fontSize: "13px",
    textAlign: "center",
  },

  error: {
    marginBottom: "16px",
    padding: "12px",
    background:
      "rgba(239, 68, 68, 0.15)",
    border:
      "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
    borderRadius: "12px",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "13px",
  },
};
