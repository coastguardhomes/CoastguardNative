
import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";
import { useAuth } from "../../context/AuthContext";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { useLanguage } from "../../context/LanguageContext";
import { traducirObservacionInspeccion } from "../../lib/traducirObservacionesInspeccion";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";

const FONDO_TARJETA =
  "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";

const BORDE_DORADO_FINO =
  "1px solid rgba(224, 176, 52, 0.4)";

const BORDE_DORADO_INTENSO =
  "1px solid rgba(224, 176, 52, 0.8)";

const SOMBRA_LUXURY =
  "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";

const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 15px rgba(224, 176, 52, 0.7)",
};

const DEGRADADO_AZUL_BOTON =
  "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteInspeccionVer() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [fotosUrlsFirmadas, setFotosUrlsFirmadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [fotoModal, setFotoModal] = useState(null);
  const [esExtra, setEsExtra] = useState(false);
  const [clienteId, setClienteId] = useState(null);
  const [idiomaCliente, setIdiomaCliente] = useState("es");
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (id && user) {
      cargarDetalles();
    }
  }, [id, user]);

  useEffect(() => {
    let cancelado = false;

    async function cargarUrlPdfSegura() {
      setPdfUrl(null);

      if (!inspeccion?.pdf_url) {
        return;
      }

      try {
        const url = await resolverUrlPdfSegura(
          inspeccion.pdf_url,
          "pdfs",
          3600
        );

        if (!cancelado) {
          setPdfUrl(url || null);
        }
      } catch (error) {
        console.error(
          "Error obteniendo el enlace seguro del PDF:",
          error
        );

        if (!cancelado) {
          setPdfUrl(null);
        }
      }
    }

    cargarUrlPdfSegura();

    return () => {
      cancelado = true;
    };
  }, [inspeccion?.pdf_url]);

  /*
   * Las inspecciones normales usan "fotos".
   * Las fotos nuevas de extras usan "extras".
   * Se mantienen las rutas antiguas de "facturas".
   */
  useEffect(() => {
    let cancelado = false;

    async function cargarUrlsFirmadas() {
      setFotosUrlsFirmadas([]);

      if (!Array.isArray(fotos) || fotos.length === 0) {
        return;
      }

      const urls = await Promise.all(
        fotos.map(async (foto, index) => {
          if (!foto) {
            return null;
          }

          const rawUrl =
            typeof foto === "string"
              ? foto.trim()
              : foto.url_foto ||
                foto.url ||
                foto.path ||
                foto.foto_url ||
                foto.archivo ||
                foto.url_storage_o_path ||
                "";

          if (!rawUrl || typeof rawUrl !== "string") {
            return null;
          }

          if (
            rawUrl.startsWith("data:") ||
            rawUrl.startsWith("blob:")
          ) {
            return rawUrl;
          }

          try {
            let referencia = rawUrl;
            let bucket = esExtra ? "extras" : "fotos";

            if (
              !referencia.startsWith("http://") &&
              !referencia.startsWith("https://")
            ) {
              referencia = referencia.replace(/^\/+/, "");

              if (esExtra) {
                if (referencia.startsWith("facturas/")) {
                  bucket = "facturas";
                  referencia = referencia.slice("facturas/".length);
                } else if (referencia.startsWith("extras/")) {
                  bucket = "extras";
                  referencia = referencia.slice("extras/".length);
                } else if (referencia.startsWith("inspecciones/")) {
                  bucket = "facturas";
                } else {
                  bucket = "extras";
                }
              } else if (referencia.startsWith("fotos/")) {
                referencia = referencia.slice("fotos/".length);
              }
            }

            const url = await resolverUrlPdfSegura(
              referencia,
              bucket,
              3600
            );

            if (url) {
              return url;
            }

            console.error(
              "No se pudo resolver la fotografía " +
                (index + 1) +
                " del informe."
            );

            return null;
          } catch (error) {
            console.error(
              "Error resolviendo la fotografía " +
                (index + 1) +
                ":",
              error
            );

            return null;
          }
        })
      );

      if (!cancelado) {
        setFotosUrlsFirmadas(urls);
      }
    }

    cargarUrlsFirmadas();

    return () => {
      cancelado = true;
    };
  }, [fotos, esExtra]);

  function parsearFotos(fotosRaw) {
    if (!fotosRaw) {
      return [];
    }

    if (Array.isArray(fotosRaw)) {
      return fotosRaw;
    }

    if (typeof fotosRaw === "string") {
      try {
        const parsed = JSON.parse(fotosRaw);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        if (parsed && typeof parsed === "object") {
          return [parsed];
        }

        return parsed ? [parsed] : [];
      } catch {
        return fotosRaw.trim() ? [fotosRaw] : [];
      }
    }

    if (typeof fotosRaw === "object") {
      return [fotosRaw];
    }

    return [];
  }

  async function cargarDetalles() {
    setLoading(true);
    setErrorMsg("");

    try {
      let { data: cliente } = await supabase
        .from("clientes")
        .select("id, idioma")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (!cliente) {
        const { data: clienteById } = await supabase
          .from("clientes")
          .select("id, idioma")
          .eq("user_id", user.id)
          .maybeSingle();

        cliente = clienteById;
      }

      if (!cliente?.id) {
        setErrorMsg(
          t("perfilClienteNoEncontrado") ||
            "No se encontró el perfil del cliente."
        );
        return;
      }

      const clienteIdActual = cliente.id;
      setClienteId(clienteIdActual);
      setIdiomaCliente(cliente.idioma === "en" ? "en" : "es");

      /*
       * 1. Inspección normal.
       * Solo se muestran inspecciones finalizadas
       * que pertenecen al cliente autenticado.
       */
      let { data: insp } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .eq("cliente_id", clienteIdActual)
        .eq("estado", "finalizada")
        .maybeSingle();

      let esExtraActual = false;
      let fotosEncontradas = [];

      /*
       * 2. Extra enviado al cliente.
       */
      if (!insp) {
        const { data: extra } = await supabase
          .from("extras")
          .select("*")
          .eq("id", id)
          .eq("cliente_id", clienteIdActual)
          .eq("estado", "enviado_cliente")
          .maybeSingle();

        if (extra) {
          esExtraActual = true;
          fotosEncontradas = parsearFotos(extra.fotos);

          let factura = null;

          if (extra.factura_id) {
            const { data: facturaData } = await supabase
              .from("facturas")
              .select("*")
              .eq("id", extra.factura_id)
              .eq("cliente_id", clienteIdActual)
              .maybeSingle();

            factura = facturaData;
          }

          if (
            fotosEncontradas.length === 0 &&
            factura?.fotos
          ) {
            fotosEncontradas = parsearFotos(factura.fotos);
          }

          insp = {
            id: extra.id,
            fecha: extra.updated_at || extra.created_at,
            estado: "ENVIADO AL CLIENTE",
            direccion:
              extra.direccion ||
              factura?.direccion ||
              "Servicio Extra",
            notas_tecnico:
              extra.descripcion ||
              extra.observaciones ||
              factura?.descripcion ||
              "Sin descripción",
            materiales:
              extra.materiales ||
              factura?.materiales,
            tiempo_empleado:
              extra.tiempo_empleado ||
              factura?.tiempo_empleado,
            pdf_url:
              extra.pdf_url ||
              factura?.pdf_url,
            extra_id: extra.id,
            factura_id: extra.factura_id || null,
          };

          /*
           * Abrir un extra con aviso lo marca como visto.
           * No se elimina el extra.
           */
          if (extra.alerta && !extra.alerta_vista) {
            const { error: errorAvisoExtra } = await supabase
              .from("extras")
              .update({ alerta_vista: true })
              .eq("id", extra.id)
              .eq("cliente_id", clienteIdActual);

            if (errorAvisoExtra) {
              console.error(
                "No se pudo marcar el aviso del extra como visto:",
                errorAvisoExtra
              );
            }
          }

          if (extra.factura_id) {
            const { error: errorAvisoFactura } = await supabase
              .from("facturas")
              .update({ alerta_vista: true })
              .eq("id", extra.factura_id)
              .eq("cliente_id", clienteIdActual);

            if (errorAvisoFactura) {
              console.error(
                "No se pudo marcar el aviso de la factura como visto:",
                errorAvisoFactura
              );
            }
          }
        }
      }

      /*
       * 3. Fotos de inspección normal.
       */
      if (insp && !esExtraActual) {
        if (insp.fotos) {
          fotosEncontradas = parsearFotos(insp.fotos);
        }

        if (fotosEncontradas.length === 0) {
          try {
            const fotosCargadas = await cargarFotosInspeccion(id);

            if (fotosCargadas?.length) {
              fotosEncontradas = fotosCargadas;
            }
          } catch (error) {
            console.error(
              "Error cargando las fotos de la inspección:",
              error
            );
          }
        }

        if (fotosEncontradas.length === 0) {
          const { data: fotosData, error: errorFotos } =
            await supabase
              .from("fotos")
              .select("*")
              .eq("inspeccion_id", String(id));

          if (errorFotos) {
            console.error(
              "Error consultando la tabla fotos:",
              errorFotos
            );
          }

          if (fotosData?.length) {
            fotosEncontradas = fotosData;
          }
        }
      }

      if (!insp) {
        setErrorMsg(
          t("informeNoEncontradoPermisos") ||
            "No se encontró el informe o no tienes permiso para verlo."
        );
        return;
      }

      setEsExtra(esExtraActual);
      setInspeccion(insp);
      setFotos(fotosEncontradas || []);

      if (!esExtraActual && insp.vivienda_id) {
        const { data: viv, error: errorVivienda } =
          await supabase
            .from("viviendas")
            .select("direccion, ciudad")
            .eq("id", insp.vivienda_id)
            .maybeSingle();

        if (errorVivienda) {
          console.error(
            "Error cargando la vivienda:",
            errorVivienda
          );
        }

        setVivienda(viv || null);
      } else {
        setVivienda(null);
      }
    } catch (err) {
      console.error("Error al cargar detalles:", err);

      setErrorMsg(
        t("errorConexionCargarInformacion") ||
          "Error al cargar la información."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Quitar aviso de un extra sin borrar el informe,
   * las fotografías, el PDF ni la factura.
   */
  async function borrarInforme() {
    if (!esExtra) {
      return;
    }

    if (
      !window.confirm(
        "¿Quieres quitar este aviso? El informe no se borrará."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("extras")
        .update({
          visto: true,
          alerta_vista: true,
        })
        .eq("id", id)
        .eq("cliente_id", clienteId);

      if (error) {
        throw error;
      }

      if (inspeccion?.factura_id) {
        const { error: errorFactura } = await supabase
          .from("facturas")
          .update({ alerta_vista: true })
          .eq("id", inspeccion.factura_id)
          .eq("cliente_id", clienteId);

        if (errorFactura) {
          console.error(
            "No se pudo marcar el aviso de factura:",
            errorFactura
          );
        }
      }

      alert("Aviso eliminado. El informe sigue guardado.");
      navigate("/cliente/inspecciones");
    } catch (err) {
      console.error("Error al quitar aviso:", err);

      alert(
        t("errorEliminarInforme") ||
          "No se pudo quitar el aviso."
      );
    }
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>
            {t("cargandoInformacion") ||
              "Cargando información..."}
          </h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
          minWidth: 0,
          boxSizing: "border-box",
          overflowWrap: "anywhere",
        }}
      >
        <Link
          to="/cliente/inspecciones"
          style={{
            ...TEXTO_DORADO_BRILLO,
            textDecoration: "none",
            fontWeight: "700",
            display: "inline-block",
            marginBottom: "20px",
            maxWidth: "100%",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          ← {t("volverMisInformes") || "Volver a mis informes"}
        </Link>

        {errorMsg && (
          <div
            style={{
              padding: "14px",
              background: "rgba(255,107,107,0.2)",
              border: "1px solid #ff6b6b",
              color: "#ff6b6b",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "20px",
              minWidth: 0,
              boxSizing: "border-box",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {errorMsg}
          </div>
        )}

        {inspeccion && (
          <>
            <div
              style={{
                background: FONDO_TARJETA,
                padding: "18px",
                borderRadius: "16px",
                border: BORDE_DORADO_INTENSO,
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                boxShadow: SOMBRA_LUXURY,
                minWidth: 0,
                boxSizing: "border-box",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  flex: "1 1 180px",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                <h2
                  style={{
                    ...TEXTO_DORADO_BRILLO,
                    fontSize: "18px",
                    margin: 0,
                    fontWeight: "900",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {esExtra
                    ? "Servicio extra"
                    : t("informeLabel") || "Informe"}{" "}
                  #{String(inspeccion.id).slice(0, 8)}
                </h2>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontWeight: "600",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {t("fecha") || "Fecha"}:{" "}
                  {inspeccion.fecha
                    ? String(inspeccion.fecha).slice(0, 10)
                    : "-"}
                </span>
              </div>

              <span
                style={{
                  padding: "6px 12px",
                  border: BORDE_DORADO_FINO,
                  background: "rgba(224, 176, 52, 0.1)",
                  color: COLOR_DORADO,
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {inspeccion.estado}
              </span>
            </div>

            <div
              style={{
                background: FONDO_TARJETA,
                padding: "18px",
                borderRadius: "16px",
                border: BORDE_DORADO_FINO,
                marginBottom: "20px",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <h4
                style={{
                  color: COLOR_DORADO,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  fontWeight: "800",
                }}
              >
                {t("ubicacionVivienda") || "Ubicación"}
              </h4>

              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#fff",
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {vivienda?.direccion ||
                  inspeccion.direccion ||
                  "Dirección no especificada"}
              </p>

              {vivienda?.ciudad && (
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#94a3b8",
                    fontSize: "13px",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {vivienda.ciudad}
                </p>
              )}
            </div>

            <div
              style={{
                background: FONDO_TARJETA,
                padding: "18px",
                borderRadius: "16px",
                border: BORDE_DORADO_FINO,
                marginBottom: "20px",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <h4
                style={{
                  color: COLOR_DORADO,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  fontWeight: "800",
                }}
              >
                {t("descripcionTrabajoObservaciones") ||
                  "Descripción / Observaciones"}
              </h4>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#e2e8f0",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {traducirObservacionInspeccion(
                  inspeccion.notas_tecnico ||
                    inspeccion.observaciones ||
                    "Sin observaciones registradas.",
                  idiomaCliente
                )}
              </p>

              {inspeccion.materiales && (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <strong style={{ color: COLOR_DORADO }}>
                    {t("materialesUsados") || "Materiales:"}
                  </strong>{" "}
                  {inspeccion.materiales}
                </p>
              )}

              {inspeccion.tiempo_empleado && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <strong style={{ color: COLOR_DORADO }}>
                    {t("tiempoEmpleadoLabel") || "Tiempo empleado:"}
                  </strong>{" "}
                  {inspeccion.tiempo_empleado}
                </p>
              )}
            </div>

            <div
              style={{
                background: FONDO_TARJETA,
                padding: "18px",
                borderRadius: "16px",
                border: BORDE_DORADO_FINO,
                marginBottom: "20px",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <h4
                style={{
                  color: COLOR_DORADO,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  fontWeight: "800",
                }}
              >
                {t("fotografiasAdjuntas") || "Fotografías"}
              </h4>

              {fotos.length === 0 ? (
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  {t("noHayFotografiasInforme") ||
                    "No hay fotografías."}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "10px",
                    minWidth: 0,
                  }}
                >
                  {fotos.map((foto, idx) => {
                    const imgUrl = fotosUrlsFirmadas[idx];

                    if (!imgUrl) {
                      return null;
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => setFotoModal(imgUrl)}
                        style={{
                          cursor: "pointer",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: BORDE_DORADO_FINO,
                          minWidth: 0,
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={"Foto " + (idx + 1)}
                          style={{
                            width: "100%",
                            height: "90px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {inspeccion.pdf_url && pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px",
                  background: DEGRADADO_AZUL_BOTON,
                  border: BORDE_DORADO_INTENSO,
                  color: "#ffffff",
                  borderRadius: "16px",
                  fontWeight: "900",
                  textDecoration: "none",
                  marginBottom: "16px",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {esExtra
                  ? "📄 Ver factura / PDF"
                  : t("verInformePdf") || "Ver informe PDF"}
              </a>
            )}

            {esExtra && (
              <button
                onClick={borrarInforme}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(255, 71, 87, 0.15)",
                  color: "#ff4757",
                  border: "1px solid rgba(255, 71, 87, 0.4)",
                  borderRadius: "16px",
                  fontWeight: "900",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginBottom: "12px",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                🗑️ {t("borrarEsteInforme") || "Quitar aviso"}
              </button>
            )}
          </>
        )}

        {fotoModal && (
          <div
            onClick={() => setFotoModal(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(3, 5, 9, 0.92)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "100%",
                maxHeight: "90vh",
                textAlign: "center",
              }}
            >
              <button
                onClick={() => setFotoModal(null)}
                style={{
                  position: "absolute",
                  top: "-45px",
                  right: "0px",
                  background: DEGRADADO_AZUL_BOTON,
                  border: BORDE_DORADO_FINO,
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                ✕ {t("cerrar") || "Cerrar"}
              </button>

              <img
                src={fotoModal}
                alt={t("fotoAmpliada") || "Foto ampliada"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "14px",
                  objectFit: "contain",
                  border: BORDE_DORADO_INTENSO,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Menu>
  );
}
