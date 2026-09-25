import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };

export default function ClienteFacturasLista() {
const navigate = useNavigate();
const { user } = useAuth();
const { t } = useLanguage();
const [facturas, setFacturas] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function cargar() {
if (!user) return;

  const { data, error } = await supabase
    .from("facturas")
    .select("*")
    .order("fecha", { ascending: false });

  if (!error) setFacturas(data || []);
  setLoading(false);
}

cargar();

}, [user]);

const obtenerBadgeEstadoAdmin = (estado) => {
switch (estado?.toLowerCase()) {
case "pagada":
case "finalizado":
return {
label: t("estadoPagada") || "PAGADA",
bg: "rgba(16, 185, 129, 0.2)",
border: "1px solid #10b981",
color: "#34d399"
};

  case "enviado_cliente":
  case "enviada":
    return {
      label: t("estadoEnviadaCliente") || "ENVIADA",
      bg: "rgba(59, 130, 246, 0.2)",
      border: "1px solid #3b82f6",
      color: "#60a5fa"
    };

  case "cancelada":
    return {
      label: t("estadoCancelada") || "CANCELADA",
      bg: "rgba(239, 68, 68, 0.2)",
      border: "1px solid #ef4444",
      color: "#f87171"
    };

  default:
    return {
      label: t("estadoPendiente") || "PENDIENTE DE PAGO",
      bg: "rgba(245, 158, 11, 0.2)",
      border: "1px solid #f59e0b",
      color: "#fbbf24"
    };
}

};

const obtenerBadgeTecnico = (estadoTecnico) => {
if (
estadoTecnico === "completado" ||
estadoTecnico === "finalizado"
) {
return {
label: t("estadoTrabajoCompletado") || "Inspección Lista",
bg: "rgba(59, 130, 246, 0.2)",
border: "1px solid #3b82f6",
color: "#60a5fa"
};
}

return {
  label: t("estadoPendienteRevision") || "En proceso",
  bg: "rgba(148, 163, 184, 0.15)",
  border: "1px solid #64748b",
  color: "#94a3b8"
};

};

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
<h1
style={{
fontSize: "24px",
fontWeight: "900",
marginBottom: "15px",
...TEXTO_DORADO_BRILLO,
textAlign: "center",
textTransform: "uppercase"
}}
>
Mis Avisos de Cobro y Facturas
</h1>

    <p
      style={{
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "12px",
        marginBottom: "25px"
      }}
    >
      Consulte sus avisos de cobro pendientes y facturas oficiales emitidas.
    </p>

    {loading ? (
      <p
        style={{
          textAlign: "center",
          ...TEXTO_DORADO_BRILLO
        }}
      >
        {t("cargandoFacturas") || "Cargando documentos..."}
      </p>
    ) : facturas.length === 0 ? (
      <p
        style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "14px"
        }}
      >
        {t("noHayFacturasRegistradas") ||
          "No hay documentos registrados."}
      </p>
    ) : (
      facturas.map((f) => {
        /*
         * El pago puede quedar registrado en estado_pago
         * aunque estado tenga otro valor.
         *
         * Se consideran pagadas ambas situaciones:
         * - estado = pagada
         * - estado_pago = pagada
         */
        const esPagada =
          f.estado_pago?.toLowerCase() === "pagada" ||
          f.estado?.toLowerCase() === "pagada" ||
          f.estado?.toLowerCase() === "finalizado";

        const tipoDoc = esPagada
          ? "Factura"
          : "Aviso de Cobro";

        const estadoParaBadge = esPagada
          ? "pagada"
          : f.estado;

        const badgeAdmin =
          obtenerBadgeEstadoAdmin(estadoParaBadge);

        const badgeTec =
          obtenerBadgeTecnico(f.estado_tecnico);

        return (
          <div
            key={f.id}
            onClick={() =>
              navigate(`/cliente/factura/${f.id}`)
            }
            style={{
              background: FONDO_TARJETA,
              padding: "18px",
              borderRadius: "16px",
              border: BORDE_DORADO_FINO,
              boxShadow: SOMBRA_LUXURY,
              marginBottom: "16px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              boxSizing: "border-box"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: COLOR_DORADO
                }}
              >
                {tipoDoc} {f.numero || `#${f.id}`}
              </span>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "800",
                  background: badgeAdmin.bg,
                  border: badgeAdmin.border,
                  color: badgeAdmin.color
                }}
              >
                {badgeAdmin.label}
              </span>
            </div>

            {f.descripcion && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#e2e8f0",
                  marginBottom: "10px",
                  lineHeight: "1.4"
                }}
              >
                {f.descripcion}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
                paddingTop: "10px",
                borderTop:
                  "1px solid rgba(255,255,255,0.08)"
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    display: "block"
                  }}
                >
                  {t("fecha") || "Fecha"}
                </span>

                <span
                  style={{
                    fontSize: "13px",
                    color: "#fff"
                  }}
                >
                  {String(f.fecha || "").slice(0, 10) || "—"}
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    display: "block",
                    textAlign: "right"
                  }}
                >
                  {t("total") || "Total"}
                </span>

                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "900",
                    color: COLOR_DORADO
                  }}
                >
                  {f.total != null
                    ? `${Number(f.total).toFixed(2)} €`
                    : "—"}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "10px",
                textAlign: "right"
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "700",
                  background: badgeTec.bg,
                  border: badgeTec.border,
                  color: badgeTec.color
                }}
              >
                {badgeTec.label}
              </span>
            </div>
          </div>
        );
      })
    )}
  </div>
</Menu>

);
}
