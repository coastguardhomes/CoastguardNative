import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import GenerarPDFContrato from "./GenerarPDFContrato.jsx";

const botonSecundario = {
  padding: "12px",
  width: "100%",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "12px",
  fontWeight: "600",
  fontSize: "15px",
};

export default function ClienteContratoVer() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);

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

    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", contratoData.cliente_id)
      .single();

    if (clienteError) {
      console.error("Error cargando cliente:", clienteError);
      return;
    }

    setCliente(clienteData);
  };

  useEffect(() => {
    cargarContrato();
  }, [id]);

  const abrirPDF = () => {
    if (contrato?.pdf_url) {
      window.open(contrato.pdf_url, "_blank");
    } else {
      alert("Primero debes hacer clic en 'Generar PDF del contrato'.");
    }
  };

  if (!contrato || !cliente) {
    return (
      <Menu>
        <div
          style={{
            height: "100%",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          {t("clienteContratoCargando")}
        </div>
      </Menu>
    );
  }

  const precioServicio =
    contrato.precio != null
      ? `${contrato.precio} €`
      : t("clienteContratoPrecioNoDisponible");

  const estaFirmado = Boolean(contrato.firma_url || contrato.estado === "firmado");

  return (
    <Menu>
      <div
        style={{
          height: "100%",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
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
          {t("clienteContratoTitulo")}
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
          <h3 style={{ color: "#4db8ff", marginBottom: "10px", fontSize: "20px" }}>
            {t("clienteContratoDatosCliente")}
          </h3>
          <p><strong>{t("clienteContratoNombre")}:</strong> {cliente.nombre}</p>
          <p><strong>{t("clienteContratoDireccion")}:</strong> {cliente.direccion}</p>
          <p><strong>{t("clienteContratoTelefono")}:</strong> {cliente.telefono}</p>
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
          <h3 style={{ color: "#4db8ff", marginBottom: "10px", fontSize: "20px" }}>
            {t("clienteContratoDetalles")}
          </h3>

          <p>
            <strong>{t("clienteContratoTipoServicio")}:</strong>{" "}
            {contrato.frecuencia ? `${t("contratoCadaDias")} ${contrato.frecuencia}` : "—"}
          </p>
          <p><strong>{t("clienteContratoPrecioMensual")}:</strong> {precioServicio}</p>
          <p><strong>{t("clienteContratoFechaInicio")}:</strong> {contrato.fecha_inicio || "—"}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span style={{ color: estaFirmado ? "#4dff88" : "#ffb84d" }}>
              {estaFirmado ? "✅ Firmado" : "⏳ Pendiente de firma"}
            </span>
          </p>

          {/* Botón para ir a dibujar la firma */}
          <button
            onClick={() => navigate(`/cliente/firma/${id}`)}
            style={{
              ...botonSecundario,
              background: estaFirmado ? "rgba(255,255,255,0.05)" : "#4db8ff",
              color: estaFirmado ? "#fff" : "#0a0f1a",
            }}
          >
            ✍️ {estaFirmado ? "Ver / Cambiar Firma" : t("clienteFirmaTitulo")}
          </button>

          {/* Generador de PDF */}
          <GenerarPDFContrato
            contrato={contrato}
            cliente={cliente}
            onGenerado={cargarContrato}
          />

          {/* Botón para abrir el PDF generado directamente */}
          <button
            onClick={abrirPDF}
            style={botonSecundario}
          >
            📄 {t("pdfTituloVista")}
          </button>
        </div>
      </div>
    </Menu>
  );
}
