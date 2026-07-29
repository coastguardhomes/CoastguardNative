import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function VerPDFContrato() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfURL, setPdfURL] = useState("");

  const cargarPDF = async () => {
    const { data, error } = await supabase
      .from("contratos")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando PDF del contrato:", error);
      return;
    }

    if (!data?.pdf_url) {
      console.warn(t("pdfNoGenerado"));
      return;
    }

    const { data: publicData } = supabase.storage
      .from("contratos")
      .getPublicUrl(data.pdf_url);

    setPdfURL(publicData.publicUrl);
  };

  useEffect(() => {
    cargarPDF();
  }, []);

  if (!pdfURL) {
    return (
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
        {t("pdfCargando")}
      </div>
    );
  }

  return (
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
        {t("pdfTituloVista")} #{id}
      </h2>

      <button
        onClick={() => navigate(-1)}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "600",
          fontSize: "15px",
        }}
      >
        {t("pdfVolver")}
      </button>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "10px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          marginBottom: "20px",
        }}
      >
        <iframe
          src={pdfURL}
          title={t("pdfTituloIframe")}
          style={{
            width: "100%",
            height: "70vh",
            border: "none",
            borderRadius: "10px",
            background: "#fff",
          }}
        />
      </div>

      <button
        onClick={() => window.open(pdfURL, "_blank")}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "16px",
          boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        }}
      >
        {t("pdfAbrirNuevaPestana")}
      </button>
    </div>
  );
}
