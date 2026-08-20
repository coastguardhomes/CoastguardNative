import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#0a0f1a";
const FONDO_TARJETA = "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))";
const BORDE_DORADO = "1px solid rgba(255, 215, 0, 0.3)";
const TEXTO_DORADO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(255,215,0,0.5)" };

const botonEstilo = {
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "12px",
  fontWeight: "600",
  fontSize: "15px",
  border: BORDE_DORADO,
  background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
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
  const [cargando,setCargando] = useState(true);

  const cargarContrato = async () => {
    setCargando(true);
    try {
      // maybeSingle evita que la app colapse o se quede congelada por tiempos de respuesta en móvil
      const { data: contratoData, error: contratoError } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (contratoError || !contratoData) {
        console.error("Error cargando contrato:", contratoError);
        setContrato({ error: true, mensaje: contratoError?.message || "Contrato no encontrado" });
        return;
      }

      setContrato(contratoData);

      if (contratoData.cliente_id) {
        const { data: clienteData } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", contratoData.cliente_id)
          .maybeSingle();

        if (clienteData) setCliente(clienteData);
      }
    } catch (err) {
      console.error("Excepción en contrato:", err);
      setContrato({ error: true, mensaje: err.message });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarContrato();
    }
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

  if (cargando) {
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
          <h3 style={TEXTO_DORADO}>{t("clienteContratoCargando") || "Cargando contrato..."}</h3>
        </div>
      </Menu>
    );
  }

  if (!contrato || contrato.error) {
    return (
      <Menu>
        <div
          style={{
            minHeight: "100vh",
            background: FONDO_PRINCIPAL,
            color: "#ff4d4d",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>No se pudo cargar el contrato</h3>
          <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "20px" }}>{contrato?.mensaje || "Comprueba tu conexión"}</p>
          <button onClick={() => navigate(-1)} style={{ ...botonEstilo, width: "auto", padding: "10px 20px" }}>
            ← Volver
          </button>
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
            ...TEXTO_DORADO,
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          {t("clienteContratoTitulo") || "Contrato del Cliente"}
        </h2>

        {/* Datos del Cliente */}
        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "14px",
            border: BORDE_DORADO,
            boxShadow: "0 0 15px rgba(255, 215, 0, 0.15)",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ ...TEXTO_DORADO, marginBottom: "10px", fontSize: "20px", marginTop: 0 }}>
            {t("clienteContratoDatosCliente") || "Datos del Cliente"}
          </h3>
          <p style={{ margin: "6px 0" }}><strong>Nombre:</strong> {cliente?.nombre || contrato?.cliente_nombre || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>Dirección:</strong> {cliente?.direccion || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>Teléfono:</strong> {cliente?.telefono || "—"}</p>
        </div>

        {/* Detalles del Contrato */}
        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "14px",
            border: BORDE_DORADO,
            boxShadow: "0 0 15px rgba(255, 215, 0, 0.15)",
          }}
        >
          <h3 style={{ ...TEXTO_DORADO, marginBottom: "10px", fontSize: "20px", marginTop: 0 }}>
            {t("clienteContratoDetalles") || "Detalles del Contrato"}
          </h3>

          <p style={{ margin: "6px 0" }}>
            <strong>Tipo de servicio:</strong> Cada {contrato.frecuencia || 30} días
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Precio mensual:</strong> {contrato.precio != null ? `${contrato.precio} €` : "—"}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Fecha inicio:</strong> {contrato.fecha_inicio || "—"}
          </p>
          <p style={{ margin: "6px 0 16px 0" }}>
            <strong>Estado:</strong>{" "}
            <span style={{ color: esFirmado ? "#4dff88" : "#ffb84d", fontWeight: "bold", textShadow: esFirmado ? "0 0 8px rgba(77,255,136,0.4)" : "0 0 8px rgba(255,184,77,0.4)" }}>
              {esFirmado ? "✅ Firmado" : "⏳ Pendiente de firma"}
            </span>
          </p>

          <button
            onClick={() => manejarAbrirPDF(contrato?.pdf_url)}
            style={{
              ...botonEstilo,
              background: "rgba(10, 15, 26, 0.8)",
              border: BORDE_DORADO,
              color: COLOR_DORADO,
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
                ? "linear-gradient(135deg, #4ade80 0%, #166534 100%)"
                : "rgba(255,255,255,0.08)",
              color: esFirmado ? "#ffffff" : "#888",
              cursor: esFirmado ? "pointer" : "not-allowed",
              border: esFirmado ? "1px solid rgba(74, 222, 128, 0.5)" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: esFirmado ? "0 4px 15px rgba(74, 222, 128, 0.3)" : "none",
            }}
          >
            {enviando ? "Enviando..." : "📤 Enviar contrato al Admin"}
          </button>

          <button
            onClick={() => manejarAbrirPDF(contrato?.pdf_url)}
            style={{
              ...botonEstilo,
              background: "rgba(10, 15, 26, 0.8)",
              border: BORDE_DORADO,
              color: COLOR_DORADO,
            }}
          >
            📄 Ver contrato firmado (PDF)
          </button>
        </div>
      </div>
    </Menu>
  );
}
