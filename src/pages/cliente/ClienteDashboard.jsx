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
  const [alertaExtraId, setAlertaExtraId] = useState(null);
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
          resAlertasExtras,
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
            .order("created_at", { ascending: false }),

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
           * Solo se consideran incidencias extra marcadas expresamente
           * como alerta y todavía no revisadas por el cliente.
           */
          supabase
            .from("extras")
            .select("id, created_at")
            .eq("cliente_id", clienteId)
            .eq("estado", "enviado_cliente")
            .eq("alerta", true)
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

        if (resAlertasExtras.error) {
          console.error(
            "Error al cargar las incidencias extra:",
            resAlertasExtras.error
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
        setAlertaExtraId(resAlertasExtras.data?.[0]?.id || null);

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
   * Cada botón abre su informe correspondiente.
   * ClienteInspeccionVer marca la alerta como vista al abrirla.
   */
  const manejarClickAlertaInspeccion = () => {
    if (!alertaInspeccionId) return;
    navigate(`/cliente/inspeccion/${alertaInspeccionId}`);
  };

  const manejarClickAlertaExtra = () => {
    if (!alertaExtraId) return;
    navigate(`/cliente/inspeccion/${alertaExtraId}`);
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

        {/* Botones independientes de alerta e incidencia extra */}
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
          <p
            style={{
              color: COLOR_DORADO,
              fontSize: "12px",
              fontWeight: "800",
              margin: "0 0 10px",
              textAlign: "center",
            }}
          >
            Pulse el botón correspondiente para revisar una incidencia en su vivienda.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "10px",
            }}
          >
            {[
              {
                id: "inspeccion",
                label: "Alerta",
                pendiente: Boolean(alertaInspeccionId),
                onClick: manejarClickAlertaInspeccion,
              },
              {
                id: "extra",
                label: "Incidencia extra",
                pendiente: Boolean(alertaExtraId),
                onClick: manejarClickAlertaExtra,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                style={{
                  position: "relative",
                  minWidth: 0,
                  padding: "13px 8px",
                  border: item.pendiente
                    ? "1px solid rgba(248, 113, 113, 0.95)"
                    : "1px solid rgba(56, 189, 248, 0.55)",
                  borderRadius: "10px",
                  background: item.pendiente
                    ? "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)"
                    : DEGRADADO_AZUL_BOTON,
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "900",
                  cursor: "pointer",
                  boxShadow: item.pendiente
                    ? "0 0 14px rgba(239, 68, 68, 0.28)"
                    : "0 5px 14px rgba(30, 58, 138, 0.25)",
                }}
              >
                {item.label}

                {item.pendiente && (
                  <span
                    aria-label="1 incidencia pendiente"
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-7px",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#fff",
                      color: "#dc2626",
                      border: "1px solid #dc2626",
                      fontSize: "11px",
                      fontWeight: "900",
                      lineHeight: 1,
                    }}
                  >
                    1
                  </span>
                )}
              </button>
            ))}
          </div>

          {(alertaInspeccionId || alertaExtraId) && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                marginTop: "10px",
                color: COLOR_DORADO,
                fontSize: "12px",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  animation: "coastguard-alerta-parpadeo 1.25s ease-in-out infinite",
                }}
              >
                ⚠
              </span>
              Incidencia pendiente de revisión
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes coastguard-alerta-parpadeo {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.25; }
            }
          `}
        </style>

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
            onClick={manejarClickAlertaInspeccion}
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
