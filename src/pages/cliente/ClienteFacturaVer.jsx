import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

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
  textShadow: "0 0 15px rgba(224, 176, 52, 0.7)"
};
const DEGRADADO_AZUL_BOTON =
  "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteFacturaVer() {
  const { t } = useLanguage();
  const { id } = useParams();

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      setMensaje("");

      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setMensaje(
          t("facturaNoEncontrada") ||
            "Factura no encontrada."
        );
        setLoading(false);
        return;
      }

      setFactura(data);
      setLoading(false);
    }

    cargar();
  }, [id, t]);

  const obtenerBadgeEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case "pagada":
      case "finalizado":
        return {
          label: t("estadoPagada") || "PAGADA",
          color: "#34d399",
          bg: "rgba(16, 185, 129, 0.15)",
          border: "1px solid #10b981"
        };

      case "enviado_cliente":
      case "enviada":
        return {
          label:
            t("estadoEnviadaCliente") ||
            "ENVIADA",
          color: "#60a5fa",
          bg: "rgba(59, 130, 246, 0.15)",
          border: "1px solid #3b82f6"
        };

      default:
        return {
          label:
            t("estadoPendiente") ||
            "PENDIENTE DE PAGO",
          color: COLOR_DORADO,
          bg: "rgba(245, 158, 11, 0.15)",
          border: BORDE_DORADO_FINO
        };
    }
  };

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            padding: 20,
            color: COLOR_DORADO,
            textAlign: "center",
            background: FONDO_PRINCIPAL,
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>
            {t("cargandoPanel") ||
              "Cargando factura..."}
          </h3>
        </div>
      </Menu>
    );
  }

  if (!factura) {
    return (
      <Menu>
        <div
          style={{
            padding: 20,
            color: "#fff",
            textAlign: "center",
            background: FONDO_PRINCIPAL,
            minHeight: "100vh"
          }}
        >
          <h1
            style={{
              ...TEXTO_DORADO_BRILLO,
              fontSize: "22px",
              marginBottom: "15px"
            }}
          >
            {mensaje}
          </h1>

          <Link
            to="/cliente/facturas"
            style={{
              color: COLOR_DORADO,
              textDecoration: "none",
              fontWeight: "700"
            }}
          >
            {t("volverSimple") || "← Volver"}
          </Link>
        </div>
      </Menu>
    );
  }

  const esPagada =
    factura.estado_pago?.toLowerCase() === "pagada" ||
    factura.estado?.toLowerCase() === "pagada" ||
    factura.estado?.toLowerCase() === "finalizado";

  const badgeEstado = obtenerBadgeEstado(
    esPagada ? "pagada" : factura.estado
  );

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box"
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/cliente/facturas"
            style={{
              color: COLOR_DORADO,
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "12px"
            }}
          >
            {t("volverSimple") ||
              "← Volver a mis facturas"}
          </Link>
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: "900",
            marginBottom: "24px",
            ...TEXTO_DORADO_BRILLO,
            textTransform: "uppercase",
            textAlign: "center"
          }}
        >
          Factura {factura.numero || `#${factura.id}`}
        </h1>

        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "20px",
            boxShadow: SOMBRA_LUXURY
          }}
        >
          <p
            style={{
              marginBottom: "12px",
              fontSize: "14px"
            }}
          >
            <strong
              style={{ color: COLOR_DORADO }}
            >
              {t("fecha") || "Fecha"}:
            </strong>{" "}
            {String(factura.fecha || "")
              .slice(0, 10) || "—"}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px"
            }}
          >
            <strong
              style={{
                color: COLOR_DORADO,
                fontSize: "14px"
              }}
            >
              {t("estado") || "Estado"}:
            </strong>

            <span
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "800",
                color: badgeEstado.color,
                background: badgeEstado.bg,
                border: badgeEstado.border
              }}
            >
              {badgeEstado.label}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontWeight: 900,
              fontSize: "20px",
              color: COLOR_DORADO,
              textShadow:
                "0 0 10px rgba(224,176,52,0.5)"
            }}
          >
            {t("total") || "Total"}:{" "}
            {Number(factura.total || 0).toFixed(2)} €
          </p>
        </div>

        {factura.pdf_url ? (
          <a
            href={factura.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              padding: "15px",
              background: DEGRADADO_AZUL_BOTON,
              border: BORDE_DORADO_INTENSO,
              color: "#ffffff",
              borderRadius: "16px",
              fontWeight: "900",
              textDecoration: "none",
              boxShadow:
                "0 6px 20px rgba(56, 189, 248, 0.4), 0 0 15px rgba(224, 176, 52, 0.3)",
              textShadow:
                "0 1px 3px rgba(0,0,0,0.6)",
              textTransform: "uppercase",
              fontSize: "14px"
            }}
          >
            📄 Descargar factura
          </a>
        ) : (
          <div
            style={{
              background: FONDO_TARJETA,
              border: BORDE_DORADO_FINO,
              borderRadius: "16px",
              padding: "18px",
              textAlign: "center",
              boxShadow: SOMBRA_LUXURY
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "13px"
              }}
            >
              La factura PDF todavía no está
              disponible.
            </p>
          </div>
        )}
      </div>
    </Menu>
  );
}
