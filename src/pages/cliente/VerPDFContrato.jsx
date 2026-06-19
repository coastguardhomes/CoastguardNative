import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function VerPDFContrato() {
  const { id } = useParams(); // ID del contrato
  const navigate = useNavigate();
  const [pdfURL, setPdfURL] = useState("");

  const cargarPDF = async () => {
    // 1. Cargar contrato
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
      console.warn("El contrato no tiene PDF generado.");
      return;
    }

    // 2. Obtener URL pública del PDF
    const { data: publicData } = supabase.storage
      .from("contratos")
      .getPublicUrl(data.pdf_url);

    setPdfURL(publicData.publicUrl);
  };

  useEffect(() => {
    cargarPDF();
  }, []);

  if (!pdfURL) {
    return <p style={{ padding: 20 }}>Cargando PDF...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Contrato PDF #{id}</h2>

      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 14px",
          backgroundColor: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Volver
      </button>

      <iframe
        src={pdfURL}
        title="PDF Contrato"
        style={{
          width: "100%",
          height: "80vh",
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      />

      <button
        onClick={() => window.open(pdfURL, "_blank")}
        style={{
          padding: "10px 16px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: 12,
        }}
      >
        Abrir en nueva pestaña
      </button>
    </div>
  );
}
