
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import logoReal from "../../assets/logo.jpeg";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA =
  "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";

const FONDO_BANNER_EXTRA =
  "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(11, 19, 32, 0.9) 100%)";

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

export default function ClienteDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [numInspecciones, setNumInspecciones] = useState(0);
  const [numAlertas, setNumAlertas] = useState(0);
  const [alertaInspeccionId, setAlertaInspeccionId] = useState(null);
  const [numViviendas, setNumViviendas] = useState(0);
  const [nuevosExtras, setNuevosExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagoExitoso, setPagoExitoso] = useState(false);

  const datosGrafico = [
    { dia: t("lun") || "Lun", inspecciones: 4 },
    { dia: t("mar") || "Mar", inspecciones: 3 },
    { dia: t("mie") || "Mie", inspecciones: 5 },
    { dia: t("jue") || "Jue", inspecciones: 7 },
    { dia: t("vie") || "Vie", inspecciones: 9 },
    { dia: t("sab") || "Sab", inspecciones: 6 },
    { dia: t("dom") || "Dom", inspecciones: 8 },
  ];

  useEffect(() => {
    async function cargarDatos() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let { data: clienteData } = await supabase
          .from("clientes")
          .select("*")
          .eq("usuario_id", user.id)
          .maybeSingle();

        // Compatibilidad con clientes vinculados mediante user_id.
        if (!clienteData) {
          const { data: clienteByUserId } = await supabase
            .from("clientes")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          clienteData = clienteByUserId;
        }

        // Compatibilidad con registros cuyo id coincide con el usuario.
        if (!clienteData) {
          const { data: clienteById } = await supabase
            .from("clientes")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          clienteData = clienteById;
        }

        if (!clienteData) {
          setLoading(false);
          return;
        }

        const clienteId = clienteData.id;

        const [
          resInspecciones,
          resAlertasInsp,
          resAlertasFacturas,
          resViviendas,
          resExtras,
        ] = await Promise.all([
          supabase
            .from("inspecciones")
            .select("*", { count: "exact", head: true })
            .eq("cliente_id", clienteId),

          supabase
            .from("inspecciones")
            .select("id, created_at")
            .eq("cliente_id", clienteId)
            .eq("alerta", true)
            .or("alerta_vista.is.null,alerta_vista.eq.false")
            .order("created_at", { ascending: false })
            .limit(1),

          supabase
            .from("facturas")
            .select("*", { count: "exact", head: true })
            .eq("cliente_id", clienteId)
            .eq("alerta", true)
            .or("alerta_vista.is.null,alerta_vista.eq.false"),

          supabase
            .from("viviendas")
            .select("*", { count: "exact", head: true })
            .eq("cliente_id", clienteId),

          /*
           * Mostramos únicamente los trabajos extra publicados al cliente
           * cuyo aviso del Dashboard todavía no se ha cerrado.
           *
           * alerta_vista controla el aviso, mientras que visto mantiene
           * su significado independiente en el registro del trabajo.
           */
          supabase
            .from("extras")
            .select("*")
            .eq("cliente_id", clienteId)
            .eq("estado", "enviado_cliente")
            .or("alerta_vista.is.null,alerta_vista.eq.false")
            .order("created_at", { ascending: false }),
        ]);

        if (resInspecciones.error) {
          console.error(
            "Error al cargar las inspecciones del cliente:",
            resInspecciones.error
          );
        }

        if (resAlertasInsp.error) {
          console.error(
            "Error al cargar alertas de inspección:",
            resAlertasInsp.error
          );
        }

        if (resAlertasFacturas.error) {
          console.error(
            "Error al cargar alertas de facturas:",
            resAlertasFacturas.error
          );
        }

        if (resViviendas.error) {
          console.error(
            "Error al cargar las viviendas:",
            resViviendas.error
          );
        }

        if (resExtras.error) {
          console.error(
            "Error al cargar los trabajos extra:",
            resExtras.error
          );
        }

        setNumInspecciones(resInspecciones.count || 0);

        setAlertaInspeccionId(
          resAlertasInsp.data?.[0]?.id || null
        );

        setNumAlertas(
          (resAlertasInsp.data?.length || 0) +
            (resAlertasFacturas.count || 0)
        );

        setNumViviendas(resViviendas.count || 0);
        setNuevosExtras(resExtras.data || []);

        const queryParams = new URLSearchParams(
          window.location.search
        );

        const facturaIdParam = queryParams.get("factura");

        if (
          queryParams.get("pagado") === "true" &&
          facturaIdParam
        ) {
          const { data: facturaData, error: facturaError } =
            await supabase
              .from("facturas")
              .select("*")
              .eq("id", facturaIdParam)
              .eq("cliente_id", clienteId)
              .maybeSingle();

          if (facturaError) {
            console.error(
              "Error al comprobar el pago:",
              facturaError
            );
          }

          if (
            facturaData &&
            (
              facturaData.estado === "pagada" ||
              facturaData.estado_pago === "pagada"
            )
          ) {
            setPagoExitoso(true);
          } else {
            setPagoExitoso(false);
          }

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (err) {
        console.error("Error en dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [user]);

  /*
   * Abre el detalle del trabajo extra para consultar su informe.
   * Conserva el marcado del trabajo como visto y el cierre de la alerta
   * relacionada con su factura.
   */
  const manejarVerFactura = async (extra) => {
    try {
      const updateExtra = {
        visto: true,
        alerta_vista: true,
      };

      const { error: errorExtra } = await supabase
        .from("extras")
        .update(updateExtra)
        .eq("id", extra.id);

      if (errorExtra) {
        throw errorExtra;
      }

      if (extra.factura_id) {
        const { error: errorFactura } = await supabase
          .from("facturas")
          .update({
            alerta_vista: true,
          })
          .eq("id", extra.factura_id);

        if (errorFactura) {
          console.error(
            "No se pudo marcar la alerta de la factura como vista:",
            errorFactura
          );
        }
      }

      setNuevosExtras((prev) =>
        prev.filter((item) => item.id !== extra.id)
      );
    } catch (err) {
      console.error(
        "Error al marcar el extra como visto:",
        err
      );
    }

    // Abre el detalle del extra, no el listado de facturas.
    navigate(`/cliente/inspeccion/${extra.id}`);
  };

  /*
   * Quita ÚNICAMENTE el aviso del Dashboard.
   *
   * No borra el trabajo extra.
   * No modifica visto.
   * No modifica la factura.
   * No modifica la inspección, las fotografías ni los documentos.
   *
   * Se cambia exclusivamente alerta_vista en el registro de extras.
   */
  const manejarEliminarAvisoExtra = async (e, extra) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "¿Quieres quitar este aviso del Dashboard? El trabajo, la inspección, las fotos y la factura se conservarán."
      )
    ) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("extras")
        .update({
          alerta_vista: true,
        })
        .eq("id", extra.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      /*
       * Supabase puede no devolver error si la actualización no afecta
       * ninguna fila. Comprobamos que realmente se actualizó el registro.
       */
      if (!data) {
        throw new Error(
          "No se pudo actualizar el aviso. Comprueba los permisos de Supabase (RLS) para la tabla extras."
        );
      }

      // Ocultamos solo el aviso de la interfaz después de confirmar el cambio.
      setNuevosExtras((prev) =>
        prev.filter((item) => item.id !== extra.id)
      );
    } catch (err) {
      console.error(
        "Error al quitar el aviso del Dashboard:",
        err
      );

      window.alert(
        "No se ha podido quitar el aviso. No se ha borrado ningún trabajo ni documento. Revisa los permisos de Supabase e inténtalo de nuevo."
      );
    }
  };

  /*
   * Si hay una alerta de inspección pendiente,
   * vamos directamente a esa inspección.
   */
  const manejarClickAlertas = () => {
    if (!alertaInspeccionId) {
      return;
    }

    navigate(`/cliente/inspeccion/${alertaInspeccionId}`);
  };

  const estiloTarjetaDato = {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    padding: "16px 12px",
    boxShadow: SOMBRA_LUXURY,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "105px",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>
            {t("cargandoPanel")}
          </h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "16px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          paddingBottom: "110px",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #0e1726 0%, #05080f 100%)",
            border: BORDE_DORADO_INTENSO,
            borderRadius: "20px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: SOMBRA_LUXURY,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                padding: "4px",
                background: "rgba(224, 176, 52, 0.15)",
                borderRadius: "12px",
                border: BORDE_DORADO_FINO,
                boxShadow: "0 0 10px rgba(224, 176, 52, 0.3)",
                flexShrink: 0,
              }}
            >
              <img
                src={logoReal}
                alt="Logo"
                style={{
                  height: "40px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: "10px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                {t("panelDeControl")}
              </span>

              <h1
                style={{
                  fontSize: "15px",
                  fontWeight: "900",
                  margin: 0,
                  textTransform: "uppercase",
                  ...TEXTO_DORADO_BRILLO,
                }}
              >
                {t("dashboardCliente")}
              </h1>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16, 185, 129, 0.15)",
              padding: "6px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                background: "#10b981",
                borderRadius: "50%",
              }}
            />

            <span
              style={{
                color: "#34d399",
                fontSize: "10px",
                fontWeight: "700",
              }}
            >
              {t("operativo")}
            </span>
          </div>
        </div>

        {pagoExitoso && (
          <div
            style={{
              background: "rgba(52, 211, 153, 0.15)",
              border: "1px solid #34d399",
              padding: "16px",
              borderRadius: "16px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#34d399",
                fontSize: "14px",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              ¡Pago realizado con éxito a través de Stripe! 🎉
            </p>

            <p
              style={{
                color: "#fff",
                fontSize: "11px",
                margin: "4px 0 0 0",
                opacity: 0.8,
              }}
            >
              Gracias por completar el pago. El servicio ha sido procesado correctamente.
            </p>
          </div>
        )}

        {/* Avisos compactos de trabajos extra */}
        {nuevosExtras.length > 0 && (
          <div
            style={{
              marginBottom: "14px",
              background: "rgba(11, 19, 32, 0.88)",
              border: "1px solid rgba(224, 176, 52, 0.45)",
              borderRadius: "12px",
              padding: "12px",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "18px" }}>
                📥
              </span>

              <div style={{ minWidth: 0, flex: 1 }}>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: COLOR_DORADO,
                    margin: 0,
                  }}
                >
                  {t("trabajosExtrasDisponibles")}
                </h3>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#cbd5e1",
                    margin: "2px 0 0",
                  }}
                >
                  {t("tienes")} {nuevosExtras.length}{" "}
                  {t("trabajosRegistrados")}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: 0,
              }}
            >
              {nuevosExtras.map((extra) => (
                <div
                  key={extra.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "9px",
                    borderRadius: "9px",
                    background: "rgba(30, 58, 138, 0.28)",
                    border: "1px solid rgba(224, 176, 52, 0.2)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => manejarVerFactura(extra)}
                    style={{
                      flex: "1 1 auto",
                      minWidth: 0,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    title="Ver informe del trabajo extra"
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "700",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {t("trabajoExtraFactura")}
                    </span>

                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#cbd5e1",
                        marginTop: "3px",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        lineHeight: 1.4,
                      }}
                    >
                      {extra.descripcion ||
                        extra.observaciones ||
                        t("verDetallesFotosFacturas")}
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "5px",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: COLOR_DORADO,
                      }}
                    >
                      Ver informe del trabajo extra →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) =>
                      manejarEliminarAvisoExtra(e, extra)
                    }
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.45)",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "#fecaca",
                      fontSize: "15px",
                      lineHeight: 1,
                    }}
                    title="Quitar solo este aviso"
                    aria-label="Quitar solo este aviso"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={estiloTarjetaDato}
            onClick={() => navigate("/cliente/inspecciones")}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "800",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              {t("inspecciones")}
            </span>

            <span
              style={{
                fontSize: "26px",
                fontWeight: "900",
                ...TEXTO_DORADO_BRILLO,
              }}
            >
              {numInspecciones}
            </span>
          </div>

          <div
            style={estiloTarjetaDato}
            onClick={manejarClickAlertas}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "800",
                color: numAlertas > 0 ? "#ef4444" : "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              {t("alertas")}
            </span>

            <span
              style={{
                fontSize: "26px",
                fontWeight: "900",
                color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO,
              }}
            >
              {numAlertas}
            </span>
          </div>

          <div
            style={estiloTarjetaDato}
            onClick={() => navigate("/cliente/contratos")}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "800",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Contrato
            </span>

            <span
              style={{
                fontSize: "26px",
                fontWeight: "900",
                ...TEXTO_DORADO_BRILLO,
              }}
            >
              {numViviendas}
            </span>
          </div>
        </div>

        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "20px",
            boxShadow: SOMBRA_LUXURY,
          }}
        >
          <h3
            style={{
              fontSize: "11px",
              color: COLOR_DORADO,
              margin: "0 0 14px 0",
              fontWeight: "800",
            }}
          >
            📊 {t("inspeccionesDiarias")}
          </h3>

          <div
            style={{
              width: "100%",
              height: 180,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={datosGrafico}
                margin={{
                  top: 10,
                  right: 10,
                  left: -25,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(224, 176, 52, 0.15)"
                />

                <XAxis
                  dataKey="dia"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#070b14",
                    border: BORDE_DORADO_FINO,
                    borderRadius: "12px",
                    color: COLOR_DORADO,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="inspecciones"
                  stroke={COLOR_DORADO}
                  strokeWidth={3.5}
                  dot={{
                    fill: COLOR_DORADO,
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Menu>
  );
}
