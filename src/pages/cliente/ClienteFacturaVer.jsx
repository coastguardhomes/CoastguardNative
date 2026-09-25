import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.8)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };
const DEGRADADO_AZUL_BOTON = "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteFacturaVer() {
const { t } = useLanguage();
const { id } = useParams();
const [factura, setFactura] = useState(null);
const [lineas, setLineas] = useState([]);
const [loading, setLoading] = useState(true);
const [mensaje, setMensaje] = useState("");

useEffect(() => {
async function cargar() {
const { data, error } = await supabase
.from("facturas")
.select("*")
.eq("id", id)
.maybeSingle();

  if (error || !data) {
    setMensaje(t("facturaNoEncontrada") || "Documento no encontrado.");
    setLoading(false);
    return;
  }

  setFactura(data);

  const { data: lineasData } = await supabase
    .from("facturas_lineas")
    .select("*")
    .eq("factura_id", id);

  setLineas(lineasData || []);
  setLoading(false);
}

cargar();

}, [id, t]);

const obtenerBadgesEstado = (estado) => {
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
      label: t("estadoEnviadaCliente") || "ENVIADA",
      color: "#60a5fa",
      bg: "rgba(59, 130, 246, 0.15)",
      border: "1px solid #3b82f6"
    };

  default:
    return {
      label: t("estadoPendiente") || "PENDIENTE DE PAGO",
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
height: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center"
}}
>
<h3 style={TEXTO_DORADO_BRILLO}>
{t("cargandoPanel") || "Cargando información..."}
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

let fotos = [];

if (Array.isArray(factura.fotos)) {
fotos = factura.fotos;
} else if (typeof factura.fotos === "string") {
try {
fotos = JSON.parse(factura.fotos);
} catch (e) {
fotos = [factura.fotos];
}
}

/*

* IMPORTANTE:
* El pago puede quedar reflejado en estado_pago aunque
* otro proceso haya cambiado estado.
* 
* Consideramos pagada si cualquiera de los dos campos
* confirma el pago.
  */
  const esPagada =
  factura.estado_pago?.toLowerCase() === "pagada" ||
  factura.estado?.toLowerCase() === "pagada" ||
  factura.estado?.toLowerCase() === "finalizado";

const estadoParaMostrar =
esPagada
? "pagada"
: factura.estado;

const tipoDocumento = esPagada ? "Factura" : "Aviso de Cobro";

const tieneInfoTecnica =
factura.materiales ||
factura.tiempo_empleado ||
(Array.isArray(fotos) && fotos.length > 0);

const badgeEstado = obtenerBadgesEstado(estadoParaMostrar);

const lineasParaMostrar =
lineas.length > 0
? lineas.map((l) => ({
id: l.id,
concepto:
l.descripcion ||
l.concepto ||
(t("servicioInspeccion") || "Servicio / Inspección"),
precio: l.total ?? l.importe ?? l.precio ?? 0
}))
: factura.descripcion
? factura.descripcion.split(",").map((desc, idx) => ({
id: "desc-${idx}",
concepto: desc.trim(),
precio:
Number(factura.total || 0) /
factura.descripcion.split(",").length
}))
: [];

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
<div style={{ marginBottom: "16px" }}>
<Link
to="/cliente/facturas"
style={{
color: COLOR_DORADO,
textDecoration: "none",
fontWeight: "700",
fontSize: "12px"
}}
>
{t("volverSimple") || "← Volver a mis documentos"}
</Link>
</div>

    <h1
      style={{
        fontSize: "22px",
        fontWeight: "900",
        marginBottom: "20px",
        ...TEXTO_DORADO_BRILLO,
        textTransform: "uppercase",
        textAlign: "center"
      }}
    >
      {tipoDocumento} {factura.numero || `#${factura.id}`}
    </h1>

    {!esPagada && (
      <div
        style={{
          background: "rgba(224, 176, 52, 0.1)",
          border: BORDE_DORADO_FINO,
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          textAlign: "center"
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: COLOR_DORADO,
            margin: 0,
            fontWeight: "700"
          }}
        >
          ⚠️ Este documento es un <strong>Aviso de Cobro</strong> previo al
          servicio. La factura oficial se emitirá y enviará automáticamente
          una vez confirmado el pago.
        </p>
      </div>
    )}

    <div
      style={{
        background: FONDO_TARJETA,
        border: BORDE_DORADO_FINO,
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: SOMBRA_LUXURY
      }}
    >
      <p style={{ marginBottom: 8, fontSize: "14px" }}>
        <strong style={{ color: COLOR_DORADO }}>
          {t("fecha") || "Fecha"}:
        </strong>{" "}
        {String(factura.fecha || "").slice(0, 10) || "—"}
      </p>

      <p style={{ marginBottom: 8, fontSize: "14px" }}>
        <strong style={{ color: COLOR_DORADO }}>
          {t("descripcion") || "Concepto"}:
        </strong>{" "}
        {factura.descripcion || "—"}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "12px"
        }}
      >
        <strong style={{ color: COLOR_DORADO, fontSize: "14px" }}>
          {t("estado") || "Estado"}:
        </strong>

        <span
          style={{
            padding: "3px 10px",
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
    </div>

    {tieneInfoTecnica && (
      <div
        style={{
          background: FONDO_TARJETA,
          border: BORDE_DORADO_FINO,
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "20px",
          boxShadow: SOMBRA_LUXURY
        }}
      >
        <h2
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: "15px",
            marginBottom: 12,
            fontWeight: "800",
            textTransform: "uppercase"
          }}
        >
          {t("evidenciaDelTrabajo") ||
            "Evidencia del Trabajo e Inspección"}
        </h2>

        {factura.materiales && (
          <p style={{ marginBottom: 8, fontSize: "13px" }}>
            <strong style={{ color: COLOR_DORADO }}>
              {t("materialesUtilizados") || "Materiales:"}
            </strong>{" "}
            {factura.materiales}
          </p>
        )}

        {factura.tiempo_empleado && (
          <p style={{ marginBottom: 8, fontSize: "13px" }}>
            <strong style={{ color: COLOR_DORADO }}>
              {t("tiempoEmpleado") || "Tiempo empleado:"}
            </strong>{" "}
            {factura.tiempo_empleado}
          </p>
        )}

        {fotos.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <strong
              style={{
                color: COLOR_DORADO,
                fontSize: "12px",
                textTransform: "uppercase"
              }}
            >
              {t("fotografiasInspeccion") || "Fotografías:"}
            </strong>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "8px"
              }}
            >
              {fotos.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={url}
                    alt={`Evidencia ${idx}`}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: BORDE_DORADO_FINO
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    {lineasParaMostrar.length > 0 && (
      <div style={{ margin: "20px 0" }}>
        <h2
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: 16,
            marginBottom: 12,
            fontWeight: "800",
            textTransform: "uppercase"
          }}
        >
          {t("detalle") || "Detalle"}
        </h2>

        {lineasParaMostrar.map((l) => (
          <div
            key={l.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: FONDO_TARJETA,
              border: BORDE_DORADO_FINO,
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "8px",
              boxShadow: SOMBRA_LUXURY
            }}
          >
            <span style={{ fontSize: "13px", color: "#e2e8f0" }}>
              {l.concepto}
            </span>

            <span
              style={{
                fontWeight: "700",
                color: COLOR_DORADO,
                fontSize: "14px"
              }}
            >
              {Number(l.precio || 0).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>
    )}

    <div
      style={{
        background: FONDO_TARJETA,
        border: BORDE_DORADO_FINO,
        padding: "18px",
        borderRadius: "16px",
        marginBottom: "20px",
        boxShadow: SOMBRA_LUXURY
      }}
    >
      <p
        style={{
          marginBottom: 6,
          fontSize: "13px",
          color: "#cbd5e1"
        }}
      >
        {t("base") || "Base"}:{" "}
        {Number(factura.base || 0).toFixed(2)} €
      </p>

      <p
        style={{
          marginBottom: 8,
          fontSize: "13px",
          color: "#cbd5e1"
        }}
      >
        {t("iva") || "IVA (21%)"}:{" "}
        {Number(factura.iva || 0).toFixed(2)} €
      </p>

      <p
        style={{
          fontWeight: 900,
          fontSize: "18px",
          color: COLOR_DORADO,
          textShadow: "0 0 10px rgba(224,176,52,0.5)",
          margin: 0
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
        rel="noreferrer"
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
          boxShadow:
            "0 6px 20px rgba(56, 189, 248, 0.4), 0 0 15px rgba(224, 176, 52, 0.3)",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          textTransform: "uppercase",
          fontSize: "13px"
        }}
      >
        {esPagada
          ? "📄 Ver Factura Oficial (Stripe)"
          : "📄 Ver Aviso de Cobro"}
      </a>
    ) : (
      <p
        style={{
          opacity: 0.8,
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "13px"
        }}
      >
        {esPagada
          ? "El PDF de la factura oficial se está generando en Stripe."
          : "El documento PDF del aviso de cobro estará disponible en breve."}
      </p>
    )}
  </div>
</Menu>

);
}
