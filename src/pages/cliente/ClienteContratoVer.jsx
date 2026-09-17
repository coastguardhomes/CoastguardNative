import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

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
  marginTop: "10px",
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
  const [cargando, setCargando] = useState(true);
  const [pagandoStripe, setPagandoStripe] = useState(false);

  const cargarContrato = async () => {
    setCargando(true);
    try {
      const { data: contratoData, error: contratoError } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (contratoError || !contratoData) {
        console.error("Error cargando contrato:", contratoError);
        setContrato({ error: true, mensaje: contratoError?.message || t("contratoNoEncontrado") });
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

  const est = String(contrato?.estado || "").toLowerCase().trim();
  const tieneFirma = Boolean(
    (contrato?.firma_cliente && contrato.firma_cliente.trim() !== "") ||
    (contrato?.firma_url && contrato.firma_url.trim() !== "")
  );

  const esFirmado = tieneFirma || est === "firmado" || est === "enviado_al_admin" || est === "activo";
  const yaEnviadoAdmin = est === "enviado_al_admin" || est === "activo";
  const yaPagado = contrato?.pagado === true || est === "activo" || est === "pagado";

  const enviarAlAdmin = async () => {
    if (!esFirmado) {
      alert(t("alertaDebesFirmar") || "Debes firmar el contrato antes de enviarlo al administrador.");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase
        .from("contratos")
        .update({ estado: "enviado_al_admin" })
        .eq("id", id);

      if (error) {
        alert((t("alertaErrorAdmin") || "Error: ") + error.message);
      } else {
        try {
          await supabase.functions.invoke("contrato-pdf", {
            body: { contrato_id: Number(id), id: Number(id) }
          });
        } catch (fErr) {
          console.log("PDF notificado.");
        }

        alert(t("alertaContratoEnviado") || "¡Contrato firmado enviado al administrador!");
        await cargarContrato();
      }
    } catch (err) {
      console.error("Error enviando contrato al admin:", err);
      alert("Error al enviar: " + (err.message || "Error desconocido"));
    } finally {
      setEnviando(false);
    }
  };

  const manejarPagoStripe = async () => {
    if (!contrato?.precio || Number(contrato.precio) <= 0) {
      alert("Este contrato no tiene un precio mensual válido configurado.");
      return;
    }

    setPagandoStripe(true);
    try {
      const amountInCents = Math.round(Number(contrato.precio) * 100);
      const customerEmail = cliente?.email || contrato?.cliente_email || "";
      const clientId = contrato?.cliente_id || cliente?.id || null;

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          amount: amountInCents,
          customerEmail: customerEmail,
          clientId: clientId,
          contractId: Number(id),
          originUrl: window.location.origin
        }
      });

      if (error) {
        let errorMsg = error.message;
        try {
          const body = await error.context?.json();
          if (body?.error) errorMsg = body.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      if (data?.url) {
        // 📱 LÓGICA MULTIPLATAFORMA INTELIGENTE:
        if (Capacitor.isNativePlatform()) {
          // En la APK de Android abre el navegador seguro integrado
          await Browser.open({ url: data.url });
        } else {
          // En web / iPhone abre la redirección estándar limpia
          window.location.href = data.url;
        }
      } else {
        throw new Error("No se ha recibido la URL de redirección de Stripe.");
      }
    } catch (err) {
      console.error("Error al iniciar pago con Stripe:", err);
      alert("Error de Stripe: " + (err.message || "Error desconocido"));
    } finally {
      setPagandoStripe(false);
    }
  };

  const manejarAbrirPDF = (url) => {
    if (!url) {
      alert(t("alertaNoPdfAdmin") || "El PDF del contrato aún no está disponible.");
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
          <h3 style={TEXTO_DORADO}>{t("clienteContratoCargando")}</h3>
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
          <h3 style={{ marginBottom: "10px" }}>{t("noSePudoCargarContrato")}</h3>
          <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "20px" }}>{contrato?.mensaje || t("compruebaTuConexion")}</p>
          <button onClick={() => navigate(-1)} style={{ ...botonEstilo, width: "auto", padding: "10px 20px" }}>
            {t("volver")}
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
          {t("clienteContratoTitulo")}
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
            {t("clienteContratoDatosCliente")}
          </h3>
          <p style={{ margin: "6px 0" }}><strong>{t("nombre")}:</strong> {cliente?.nombre || contrato?.cliente_nombre || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>{t("direccion")}:</strong> {cliente?.direccion || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>{t("telefono")}:</strong> {cliente?.telefono || "—"}</p>
        </div>

        {/* Detalles del Contrato */}
        <div
          style={{
            background: FONDO_TARJETA,
            padding: "25px 20px",
            borderRadius: "14px",
            border: BORDE_DORADO,
            boxShadow: "0 0 15px rgba(255, 215, 0, 0.15)",
          }}
        >
          <h3 style={{ ...TEXTO_DORADO, marginBottom: "10px", fontSize: "20px", marginTop: 0 }}>
            {t("clienteContratoDetalles")}
          </h3>

          <p style={{ margin: "6px 0" }}>
            <strong>{t("tipoServicio")}:</strong> {contrato.frecuencia || 30} {t("dias")}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>{t("precioMensual")}:</strong> {contrato.precio != null ? `${contrato.precio} €` : "—"}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>{t("fechaInicio")}:</strong> {contrato.fecha_inicio || "—"}
          </p>
          <p style={{ margin: "6px 0 16px 0" }}>
            <strong>{t("estado")}:</strong>{" "}
            <span style={{ color: esFirmado ? "#4dff88" : "#ffb84d", fontWeight: "bold", textShadow: esFirmado ? "0 0 8px rgba(77,255,136,0.4)" : "0 0 8px rgba(255,184,77,0.4)" }}>
              {yaPagado ? `✅ Activo / Pagado` : esFirmado ? `✅ ${t("firmado") || "Firmado"}` : `⏳ ${t("pendienteFirma") || "Pendiente de firma"}`}
            </span>
          </p>

          {/* BOTÓN 1: Ver contrato en PDF */}
          <button
            onClick={() => manejarAbrirPDF(contrato?.pdf_url)}
            style={{
              ...botonEstilo,
              background: "rgba(10, 15, 26, 0.8)",
              border: BORDE_DORADO,
              color: COLOR_DORADO,
            }}
          >
            📄 {esFirmado ? (t("verContratoFirmadoPdf") || "Ver contrato firmado (PDF)") : (t("verContratoAntesFirmar") || "Ver contrato antes de firmar")}
          </button>

          {/* BOTÓN 2: Dibujar / Cambiar Firma */}
          <button
            onClick={() => navigate(`/cliente/firma/${id}`)}
            style={botonEstilo}
          >
            ✍️ {esFirmado ? "Cambiar / Volver a Firmar" : (t("firmaDelCliente") || "Firma del Cliente")}
          </button>

          {/* BOTÓN 3: Pagar con Stripe (Tarjeta y SEPA) - Solo se muestra si NO está pagado */}
          {!yaPagado && contrato.precio != null && Number(contrato.precio) > 0 && (
            <button
              onClick={manejarPagoStripe}
              disabled={pagandoStripe}
              style={{
                ...botonEstilo,
                background: "linear-gradient(135deg, #635bff 0%, #4338ca 100%)",
                border: "1px solid rgba(99, 91, 255, 0.5)",
                boxShadow: "0 4px 15px rgba(99, 91, 255, 0.3)",
              }}
            >
              {pagandoStripe ? "Conectando con Stripe..." : `💳 Suscribirse y Pagar (${contrato.precio} €/mes)`}
            </button>
          )}

          {/* BOTÓN 4: Enviar al Admin - Se bloquea si ya fue enviado */}
          <button
            onClick={enviarAlAdmin}
            disabled={enviando || yaEnviadoAdmin}
            style={{
              ...botonEstilo,
              background: yaEnviadoAdmin
                ? "rgba(255,255,255,0.1)"
                : esFirmado
                  ? "linear-gradient(135deg, #4ade80 0%, #166534 100%)"
                  : "rgba(255,255,255,0.08)",
              color: yaEnviadoAdmin ? "#34d399" : esFirmado ? "#ffffff" : "#888",
              cursor: (esFirmado && !yaEnviadoAdmin) ? "pointer" : "not-allowed",
              border: esFirmado ? "1px solid rgba(74, 222, 128, 0.5)" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: esFirmado ? "0 4px 15px rgba(74, 222, 128, 0.3)" : "none",
            }}
          >
            {enviando 
              ? (t("enviando") || "Enviando...") 
              : yaEnviadoAdmin 
                ? "✅ Enviado al Administrador" 
                : (t("enviarAlAdminBtn") || "✉️ Enviar al Administrador")}
          </button>
        </div>
      </div>
    </Menu>
  );
}
