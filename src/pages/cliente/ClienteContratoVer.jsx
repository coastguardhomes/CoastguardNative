import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import GenerarPDFContrato from "./GenerarPDFContrato.jsx";

const botonEstilo = {
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "12px",
  fontWeight: "600",
  fontSize: "15px",
  border: "none",
};

export default function ClienteContratoVer() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Se recarga cada vez que entras a la vista
  useEffect(() => {
    cargarContrato();
  }, [id]);

  // Se considera firmado si existe firma_url O si el estado ya cambió
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

  const abrirPDF = () => {
    const url = esFirmado && contrato?.firma_url ? contrato.firma_url : contrato?.pdf_url;
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("No hay archivo PDF o firma disponible para visualizar.");
    }
  };

  if (!contrato) {
    return (
      <Menu>
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t("clienteContratoCargando") || "Cargando contrato..."}
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          {t("clienteContratoTitulo") || "Contrato del Cliente"}
        </h2>

        {/* Datos del Cliente */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#4db8ff", marginBottom: "10px", fontSize: "20px", marginTop: 0 }}>
            {t("clienteContratoDatosCliente") || "Datos del Cliente"}
          </h3>
          <p style={{ margin: "6px 0" }}><strong>Nombre:</strong> {cliente?.nombre || contrato?.cliente_nombre || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>Dirección:</strong> {cliente?.direccion || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>Teléfono:</strong> {cliente?.telefono || "—"}</p>
        </div>

        {/* Detalles del Contrato */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          <h3 style={{ color: "#4db8ff", marginBottom: "10px", fontSize: "20px", marginTop: 0 }}>
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
            <span style={{ color: esFirmado ? "#4dff88" : "#ffb84d", fontWeight: "bold" }}>
              {esFirmado ? "✅ Firmado" : "⏳ Pendiente de firma"}
            </span>
          </p>

          {/* 1. Botón Firma del Cliente */}
          <button
            onClick={() => navigate(`/cliente/firma/${id}`)}
            style={{
              ...botonEstilo,
              background: "#4db8ff",
              color: "#0a0f1a",
            }}
          >
            ✍️ {esFirmado ? "Ver / Cambiar Firma" : "Firma del Cliente"}
          </button>

          {/* 2. Botón Enviar al Admin (Se ilumina en VERDE cuando esFirmado es true) */}
          <button
            onClick={enviarAlAdmin}
            disabled={!esFirmado || enviando}
            style={{
              ...botonEstilo,
              background: esFirmado ? "#4cd964" : "rgba(255,255,255,0.15)",
              color: esFirmado ? "#0a0f1a" : "#888",
              cursor: esFirmado ? "pointer" : "not-allowed",
            }}
          >
            {enviando ? "Enviando..." : "📤 Enviar contrato al Admin"}
          </button>

          {/* 3. Generador de PDF */}
          <GenerarPDFContrato
            contrato={contrato}
            cliente={cliente}
            onGenerado={cargarContrato}
          />

          {/* 4. Ver PDF */}
          <button
            onClick={abrirPDF}
            style={{
              ...botonEstilo,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            📄 Contrato PDF
          </button>
        </div>
      </div>
    </Menu>
  );
}
