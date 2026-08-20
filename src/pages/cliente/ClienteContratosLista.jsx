import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };
const DEGRADADO_AZUL_BOTON = "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

const botonEstilo = {
  padding: "14px",
  width: "100%",
  borderRadius: "16px",
  cursor: "pointer",
  marginTop: "12px",
  fontWeight: "900",
  fontSize: "14px",
  border: BORDE_DORADO_FINO,
  background: DEGRADADO_AZUL_BOTON,
  color: "#ffffff",
  boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
  transition: "all 0.2s ease",
};

export default function ClienteContratoVer() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargarContrato = async () => {
    const { data: contratoData, error: contratoError } = await supabase
      .from("contratos")
      .select("*")
      .eq("id", id)
      .single();

    if (contratoError) {
      console.error("Error cargando contrato:", contratoError);
      return;
    }

    setContrato(contratoData);

    if (contratoData.cliente_id) {
      const { data: clienteData } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", contratoData.cliente_id)
        .single();

      if (clienteData) setCliente(clienteData);
    }
  };

  useEffect(() => {
    cargarContrato();
  }, [id, location.key]);

  const esFirmado = Boolean(
    (contrato?.firma_url && contrato.firma_url.trim() !== "") ||
    contrato?.estado === "firmado" ||
    contrato?.estado === "enviado_al_admin"
  );

  const enviarAlAdmin = async () => {
    if (!esFirmado) {
      alert("Debes firmar el contrato antes de enviarlo.");
      return;
    }

    setEnviando(true);
    const { error } = await supabase
      .from("contratos")
      .update({ estado: "enviado_al_admin" })
      .eq("id", id);

    setEnviando(false);

    if (error) {
      alert("Error notificando al administrador: " + error.message);
    } else {
      alert("¡Contrato firmado enviado al administrador!");
      cargarContrato();
    }
  };

  const manejarAbrirPDF = (url) => {
    if (!url) {
      alert("El administrador aún no ha generado el PDF.");
      return;
    }

    if (url.startsWith("data:")) {
      try {
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
          })
          .catch(() => {
            window.open(url, "_blank");
          });
      } catch (e) {
        window.open(url, "_blank");
      }
    } else {
      window.open(url, "_blank");
    }
  };

  if (!contrato) {
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
            fontFamily: "Inter, sans-serif",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>{t("clienteContratoCargando") || "Cargando contrato..."}</h3>
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
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            ...TEXTO_DORADO_BRILLO,
            marginBottom: "25px",
            fontSize: "24px",
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          {t("clienteContratoTitulo") || "Contrato del Cliente"}
        </h2>

        {/* Datos del Cliente */}
        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "16px",
            border: BORDE_DORADO_FINO,
            boxShadow: SOMBRA_LUXURY,
            marginBottom: "20px",
          }}
        >
          <h3 style={{ ...TEXTO_DORADO_BRILLO, marginBottom: "12px", fontSize: "16px", marginTop: 0, fontWeight: "800", textTransform: "uppercase" }}>
            {t("clienteContratoDatosCliente") || "Datos del Cliente"}
          </h3>
          <p style={{ margin: "8px 0", fontSize: "14px" }}><strong style={{ color: COLOR_DORADO }}>Nombre:</strong> {cliente?.nombre || contrato?.cliente_nombre || "—"}</p>
          <p style={{ margin: "8px 0", fontSize: "14px" }}><strong style={{ color: COLOR_DORADO }}>Dirección:</strong> {cliente?.direccion || "—"}</p>
          <p style={{ margin: "8px 0", fontSize: "14px" }}><strong style={{ color: COLOR_DORADO }}>Teléfono:</strong> {cliente?.telefono || "—"}</p>
        </div>

        {/* Detalles del Contrato */}
        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "16px",
            border: BORDE_DORADO_FINO,
            boxShadow: SOMBRA_LUXURY,
          }}
        >
          <h3 style={{ ...TEXTO_DORADO_BRILLO, marginBottom: "12px", fontSize: "16px", marginTop: 0, fontWeight: "800", textTransform: "uppercase" }}>
            {t("clienteContratoDetalles") || "Detalles del Contrato"}
          </h3>

          <p style={{ margin: "8px 0", fontSize: "14px" }}>
            <strong style={{ color: COLOR_DORADO }}>Tipo de servicio:</strong> Cada {contrato.frecuencia || 30} días
          </p>
          <p style={{ margin: "8px 0", fontSize: "14px" }}>
            <strong style={{ color: COLOR_DORADO }}>Precio mensual:</strong> {contrato.precio != null ? `${contrato.precio} €` : "—"}
          </p>
          <p style={{ margin: "8px 0", fontSize: "14px" }}>
            <strong style={{ color: COLOR_DORADO }}>Fecha inicio:</strong> {contrato.fecha_inicio || "—"}
          </p>
          <p style={{ margin: "8px 0 16px 0", fontSize: "14px" }}>
            <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
            <span style={{ color: esFirmado ? "#34d399" : "#fbbf24", fontWeight: "900", textShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
              {esFirmado ? "✅ Firmado" : "⏳ Pendiente de firma"}
            </span>
          </p>

          <button
            onClick={() => manejarAbrirPDF(contrato?.pdf_url)}
            style={{
              ...botonEstilo,
              background: "rgba(11, 19, 32, 0.9)",
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            }}
          >
            📄 Ver contrato antes de firmar
          </button>

          <button
            onClick={() => navigate(`/cliente/firma/${id}`)}
            style={botonEstilo}
          >
            ✍️ {esFirmado ? "Ver / Cambiar Firma" : "Firma del Cliente"}
          </button>

          <button
            onClick={enviarAlAdmin}
            disabled={!esFirmado || enviando}
            style={{
              ...botonEstilo,
              background: esFirmado
                ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                : "rgba(255,255,255,0.05)",
              color: esFirmado ? "#ffffff" : "#64748b",
              cursor: esFirmado ? "pointer" : "not-allowed",
              border: esFirmado ? "1px solid rgba(16, 185, 129, 0.6)" : BORDE_DORADO_FINO,
              boxShadow: esFirmado ? "0 4px 15px rgba(16, 185, 129, 0.3)" : "none",
            }}
          >
            {enviando ? "Enviando..." : "📤 Enviar contrato al Admin"}
          </button>

          <button
            onClick={() => manejarAbrirPDF(contrato?.pdf_url)}
            style={{
              ...botonEstilo,
              background: "rgba(11, 19, 32, 0.9)",
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            }}
          >
            📄 Ver contrato firmado (PDF)
          </button>
        </div>
      </div>
    </Menu>
  );
}
