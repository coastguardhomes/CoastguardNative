
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { traducirObservacionInspeccion } from "../../lib/traducirObservacionesInspeccion";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY =
  "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 12px rgba(224, 176, 52, 0.6)",
};

const ESTILO_TEXTO_AJUSTABLE = {
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

export default function ClienteInspeccionesLista() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [idiomaCliente, setIdiomaCliente] = useState("es");

  useEffect(() => {
    let cancelado = false;

    async function cargarTodo() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        let { data: clienteData, error: errorCliente } = await supabase
          .from("clientes")
          .select("id, idioma")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (errorCliente) {
          throw errorCliente;
        }

        // Compatibilidad con perfiles que usan user_id.
        if (!clienteData) {
          const { data: clienteByUserId, error } = await supabase
            .from("clientes")
            .select("id, idioma")
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) {
            throw error;
          }

          clienteData = clienteByUserId;
        }

        // Último recurso para registros vinculados mediante id.
        if (!clienteData) {
          const { data: clienteById, error } = await supabase
            .from("clientes")
            .select("id, idioma")
            .eq("id", user.id)
            .maybeSingle();

          if (error) {
            throw error;
          }

          clienteData = clienteById;
        }

        if (!clienteData) {
          if (!cancelado) {
            setErrorMsg(t("errorPerfilClienteAsociado"));
          }
          return;
        }

        const clienteId = clienteData.id;
        const idioma = String(clienteData.idioma || "es")
          .trim()
          .toLowerCase();

        if (!cancelado) {
          setIdiomaCliente(idioma);
        }

        /*
         * Las inspecciones normales solo se muestran cuando
         * su estado indica que han sido finalizadas/publicadas.
         *
         * Los extras solo se muestran después de que administración
         * los haya enviado expresamente al cliente.
         */
        const [resInspecciones, resExtras] = await Promise.all([
          supabase
            .from("inspecciones")
            .select("*")
            .eq("cliente_id", clienteId)
            .eq("estado", "finalizada"),

          supabase
            .from("extras")
            .select("*")
            .eq("cliente_id", clienteId)
            .eq("estado", "enviado_cliente"),
        ]);

        if (resInspecciones.error) {
          console.error(
            "Error al cargar las inspecciones del cliente:",
            resInspecciones.error
          );
        }

        if (resExtras.error) {
          console.error(
            "Error al cargar los servicios extra del cliente:",
            resExtras.error
          );
        }

        const listaInspecciones = (resInspecciones.data || []).map(
          (item) => ({
            ...item,
            tipo: "inspeccion",
            fechaOrden: new Date(item.created_at || item.fecha || 0),
          })
        );

        const listaExtras = (resExtras.data || []).map((item) => ({
          ...item,
          tipo: "extra",
          fechaOrden: new Date(item.created_at || 0),
        }));

        const combinados = [...listaInspecciones, ...listaExtras].sort(
          (a, b) => b.fechaOrden - a.fechaOrden
        );

        if (!cancelado) {
          setElementos(combinados);
        }
      } catch (err) {
        console.error("Error al cargar el listado del cliente:", err);

        if (!cancelado) {
          setErrorMsg(t("errorCargarDatos"));
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    cargarTodo();

    return () => {
      cancelado = true;
    };
  }, [user, t]);

  /*
   * Abre el informe PDF del trabajo extra.
   *
   * extras.pdf_url contiene la ruta del archivo dentro del bucket
   * privado "pdfs", por lo que primero se obtiene una URL firmada.
   *
   * No se consulta ni se modifica facturas.pdf_url.
   */
  const manejarAbrirPdfExtra = async (e, extra) => {
    e.stopPropagation();

    if (!extra?.pdf_url) {
      window.alert("Este trabajo extra todavía no tiene un informe PDF disponible.");
      return;
    }

    // Abrimos la pestaña durante el clic para evitar bloqueos del navegador.
    const ventana = window.open("about:blank", "_blank");

    if (!ventana) {
      window.alert(
        "El navegador ha bloqueado la nueva pestaña. Permite las ventanas emergentes e inténtalo de nuevo."
      );
      return;
    }

    try {
      const urlSegura = await resolverUrlPdfSegura(
        extra.pdf_url,
        "pdfs"
      );

      if (!urlSegura) {
        throw new Error("No se pudo obtener la URL segura del informe.");
      }

      ventana.location.href = urlSegura;
    } catch (error) {
      console.error("Error al abrir el informe PDF del extra:", error);

      ventana.close();

      window.alert(
        "No se ha podido abrir el informe PDF. Comprueba que el documento existe y que tienes permisos para acceder a él."
      );
    }
  };

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            color: COLOR_DORADO,
            background: FONDO_PRINCIPAL,
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>{t("cargandoListado")}</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "16px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter",
          paddingBottom: "110px",
          boxSizing: "border-box",
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        <h1
          style={{
            fontSize: "16px",
            fontWeight: "900",
            ...TEXTO_DORADO_BRILLO,
            marginBottom: "20px",
            textTransform: "uppercase",
            ...ESTILO_TEXTO_AJUSTABLE,
          }}
        >
          {t("misInspeccionesInformesTitulo")}
        </h1>

        {errorMsg && (
          <div
            style={{
              color: "#ef4444",
              marginBottom: "15px",
              fontSize: "12px",
              ...ESTILO_TEXTO_AJUSTABLE,
            }}
          >
            {errorMsg}
          </div>
        )}

        {elementos.length === 0 ? (
          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              textAlign: "center",
              marginTop: "40px",
              ...ESTILO_TEXTO_AJUSTABLE,
            }}
          >
            {t("noHayInspeccionesInformes")}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minWidth: 0,
            }}
          >
            {elementos.map((item) => {
              const esExtra = item.tipo === "extra";

              /*
               * En inspecciones normales se utiliza primero
               * notas_tecnico, igual que en la ficha individual.
               *
               * En extras se conserva el orden de campos anterior.
               */
              const textoCrudo = esExtra
                ? item.observaciones ||
                  item.comentarios ||
                  item.descripcion ||
                  item.detalle ||
                  item.nota ||
                  ""
                : item.notas_tecnico ||
                  item.observaciones ||
                  item.comentarios ||
                  item.descripcion ||
                  item.detalle ||
                  item.nota ||
                  "";

              const descripcionOriginal = textoCrudo
                ? textoCrudo.replace(/Factura\s*[^:]*:\s*/i, "")
                : "";

              const descripcionLimpia = descripcionOriginal
                ? traducirObservacionInspeccion(
                    descripcionOriginal,
                    idiomaCliente
                  )
                : t("informeDisponible");

              const tituloItem = esExtra
                ? t("servicioExtraTrabajo")
                : item.titulo || item.nombre || t("inspeccionLabel");

              const fechaFormateada = item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : item.fecha
                  ? new Date(item.fecha).toLocaleDateString()
                  : "Reciente";

              return (
                <div
                  key={`${item.tipo}-${item.id}`}
                  onClick={() => navigate(`/cliente/inspeccion/${item.id}`)}
                  style={{
                    background: FONDO_TARJETA,
                    border: BORDE_DORADO_FINO,
                    borderRadius: "16px",
                    padding: "16px",
                    cursor: "pointer",
                    boxShadow: SOMBRA_LUXURY,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowWrap: "anywhere",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#fff",
                        flex: "1 1 140px",
                        ...ESTILO_TEXTO_AJUSTABLE,
                      }}
                    >
                      {tituloItem}
                    </span>

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        background: esExtra
                          ? "rgba(224, 176, 52, 0.2)"
                          : "rgba(16, 185, 129, 0.15)",
                        color: esExtra ? COLOR_DORADO : "#34d399",
                        border: esExtra
                          ? BORDE_DORADO_FINO
                          : "1px solid rgba(16, 185, 129, 0.4)",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        flexShrink: 1,
                      }}
                    >
                      {esExtra
                        ? t("extraBadge")
                        : item.estado || t("estadoAprobado")}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      minWidth: 0,
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: "#cbd5e1" }}>
                      {t("detalleLabel")}
                    </strong>{" "}
                    {descripcionLimpia.substring(0, 70)}
                    {descripcionLimpia.length > 70 ? "..." : ""}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#64748b",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        ...ESTILO_TEXTO_AJUSTABLE,
                        flex: "1 1 120px",
                      }}
                    >
                      {t("fecha")}: {fechaFormateada}
                    </span>

                    <span
                      style={{
                        color: COLOR_DORADO,
                        fontWeight: "700",
                        ...ESTILO_TEXTO_AJUSTABLE,
                      }}
                    >
                      {t("verDetalleFlecha")}
                    </span>
                  </div>

                  {esExtra && item.pdf_url && (
                    <button
                      type="button"
                      onClick={(e) => manejarAbrirPdfExtra(e, item)}
                      style={{
                        width: "100%",
                        marginTop: "6px",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(224, 176, 52, 0.75)",
                        background:
                          "linear-gradient(135deg, rgba(224, 176, 52, 0.2), rgba(224, 176, 52, 0.08))",
                        color: COLOR_DORADO,
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      📄 Ver informe PDF
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Menu>
  );
}
