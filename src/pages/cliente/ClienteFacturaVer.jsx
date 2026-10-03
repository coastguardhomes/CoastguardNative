import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

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
  textShadow:
    "0 0 12px rgba(224, 176, 52, 0.6)",
};

const DEGRADADO_AZUL_BOTON =
  "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteFacturaVer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { t } = useLanguage();

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function cargarFactura() {
      if (!user || !id) {
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");

        /*
         * Localizamos primero al cliente autenticado.
         *
         * IMPORTANTE:
         * Nunca confiamos solamente en el ID recibido por URL.
         */
        let { data: cliente } = await supabase
          .from("clientes")
          .select("id")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (!cliente) {
          const { data: clienteByUserId } =
            await supabase
              .from("clientes")
              .select("id")
              .eq("user_id", user.id)
              .maybeSingle();

          cliente = clienteByUserId;
        }

        if (!cliente?.id) {
          setErrorMsg(
            "No se encontró el perfil del cliente."
          );
          return;
        }

        /*
         * Solo podemos cargar una factura que pertenezca
         * al cliente autenticado.
         */
        const { data, error } = await supabase
          .from("facturas")
          .select("*")
          .eq("id", id)
          .eq("cliente_id", cliente.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setErrorMsg(
            "No se encontró esta factura o no tienes permiso para verla."
          );
          return;
        }

        setFactura(data);

        /*
         * Si la factura tiene un aviso pendiente,
         * abrirla lo marca como visto.
         *
         * NO se modifica:
         * - estado
         * - estado_pago
         * - total
         * - número
         * - PDF
         */
        if (
          data.alerta &&
          !data.alerta_vista
        ) {
          await supabase
            .from("facturas")
            .update({
              alerta_vista: true,
            })
            .eq("id", data.id)
            .eq(
              "cliente_id",
              cliente.id
            );
        }
      } catch (err) {
        console.error(
          "Error cargando factura:",
          err
        );

        setErrorMsg(
          "No se pudo cargar la factura."
        );
      } finally {
        setLoading(false);
      }
    }

    cargarFactura();
  }, [id, user]);

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            minHeight: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <h3
            style={
              TEXTO_DORADO_BRILLO
            }
          >
            {t("cargandoInformacion") ||
              "Cargando factura..."}
          </h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          color: "#fff",
          padding: "20px",
          paddingBottom: "100px",
          boxSizing: "border-box",
          fontFamily:
            "Inter, sans-serif",
        }}
      >
        <button
          onClick={() =>
            navigate("/cliente/facturas")
          }
          style={{
            background: "transparent",
            border: "none",
            color: COLOR_DORADO,
            cursor: "pointer",
            fontWeight: "800",
            fontSize: "14px",
            padding: "5px 0",
            marginBottom: "20px",
          }}
        >
          ←{" "}
          {t("volver") ||
            "Volver a facturas"}
        </button>

        {errorMsg ? (
          <div
            style={{
              background:
                "rgba(255,107,107,0.12)",
              border:
                "1px solid rgba(255,107,107,0.5)",
              borderRadius: "16px",
              padding: "20px",
              color: "#ff6b6b",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        ) : factura ? (
          <>
            <div
              style={{
                background:
                  FONDO_TARJETA,
                border:
                  BORDE_DORADO_INTENSO,
                borderRadius: "20px",
                padding: "20px",
                boxShadow:
                  SOMBRA_LUXURY,
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      textTransform:
                        "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Documento
                  </div>

                  <h1
                    style={{
                      ...TEXTO_DORADO_BRILLO,
                      fontSize: "23px",
                      margin: 0,
                      fontWeight: "900",
                    }}
                  >
                    Factura{" "}
                    {factura.numero ||
                      `#${factura.id}`}
                  </h1>
                </div>

                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: "10px",
                    background:
                      factura.estado_pago?.toLowerCase() ===
                        "pagada" ||
                      factura.estado?.toLowerCase() ===
                        "pagada"
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(245,158,11,0.15)",
                    border:
                      factura.estado_pago?.toLowerCase() ===
                        "pagada" ||
                      factura.estado?.toLowerCase() ===
                        "pagada"
                        ? "1px solid rgba(16,185,129,0.5)"
                        : "1px solid rgba(245,158,11,0.5)",
                    color:
                      factura.estado_pago?.toLowerCase() ===
                        "pagada" ||
                      factura.estado?.toLowerCase() ===
                        "pagada"
                        ? "#34d399"
                        : "#fbbf24",
                    fontSize: "10px",
                    fontWeight: "900",
                    textTransform:
                      "uppercase",
                  }}
                >
                  {factura.estado_pago ||
                    factura.estado ||
                    "PENDIENTE"}
                </span>
              </div>
            </div>

            <div
              style={{
                background:
                  FONDO_TARJETA,
                border:
                  BORDE_DORADO_FINO,
                borderRadius: "18px",
                padding: "18px",
                marginBottom: "18px",
                boxShadow:
                  SOMBRA_LUXURY,
              }}
            >
              <h2
                style={{
                  color: COLOR_DORADO,
                  fontSize: "12px",
                  textTransform:
                    "uppercase",
                  margin:
                    "0 0 14px 0",
                }}
              >
                Datos de la factura
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Fila
                  etiqueta="Número"
                  valor={
                    factura.numero ||
                    `#${factura.id}`
                  }
                />

                <Fila
                  etiqueta="Fecha"
                  valor={
                    String(
                      factura.fecha ||
                        factura.created_at ||
                        ""
                    ).slice(0, 10) ||
                    "—"
                  }
                />

                <Fila
                  etiqueta="Descripción"
                  valor={
                    factura.descripcion ||
                    factura.concepto ||
                    "—"
                  }
                />

                <Fila
                  etiqueta="Estado"
                  valor={
                    factura.estado_pago ||
                    factura.estado ||
                    "—"
                  }
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "15px",
                    paddingTop: "12px",
                    marginTop: "4px",
                    borderTop:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                    }}
                  >
                    Total
                  </span>

                  <strong
                    style={{
                      color: COLOR_DORADO,
                      fontSize: "24px",
                      fontWeight: "900",
                    }}
                  >
                    {factura.total != null
                      ? `${Number(
                          factura.total
                        ).toFixed(2)} €`
                      : "—"}
                  </strong>
                </div>
              </div>
            </div>

            {factura.pdf_url ? (
              <a
                href={factura.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding: "16px",
                  borderRadius: "16px",
                  background:
                    DEGRADADO_AZUL_BOTON,
                  border:
                    BORDE_DORADO_INTENSO,
                  color: "#fff",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "900",
                  boxShadow:
                    "0 6px 20px rgba(56,189,248,0.3)",
                  marginBottom: "12px",
                }}
              >
                📄 Descargar factura PDF
              </a>
            ) : (
              <div
                style={{
                  padding: "15px",
                  borderRadius: "14px",
                  background:
                    "rgba(245,158,11,0.1)",
                  border:
                    "1px solid rgba(245,158,11,0.4)",
                  color: "#fbbf24",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                El PDF de esta factura todavía no está disponible.
              </div>
            )}
          </>
        ) : null}
      </div>
    </Menu>
  );
}

function Fila({
  etiqueta,
  valor,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "flex-start",
        gap: "15px",
        paddingBottom: "10px",
        borderBottom:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          color: "#94a3b8",
          fontSize: "12px",
        }}
      >
        {etiqueta}
      </span>

      <span
        style={{
          color: "#fff",
          fontSize: "13px",
          fontWeight: "700",
          textAlign: "right",
          maxWidth: "65%",
          whiteSpace: "pre-wrap",
        }}
      >
        {valor}
      </span>
    </div>
  );
}
