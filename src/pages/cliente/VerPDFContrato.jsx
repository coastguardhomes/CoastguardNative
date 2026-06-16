import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function VerPDFContrato() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPDF = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("pdf_url")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setPdfUrl(data?.pdf_url || null);
      setLoading(false);
    };

    cargarPDF();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Cargando PDF...</p>;

  if (!pdfUrl)
    return (
      <p style={{ padding: 20 }}>
        Este contrato aún no tiene PDF generado.
      </p>
    );

  return (
    <div style={{ padding: 10 }}>
      <h2>Contrato PDF #{id}</h2>

      {/* Botón Volver */}
      <button
        onClick={() => window.history.back()}
        style={{
          background: "#444",
          color: "white",
          padding: "8px 16px",
          borderRadius: 6,
          marginBottom: 15,
        }}
      >
        Volver
      </button>

      <iframe
        src={pdfUrl}
        title="PDF del contrato"
        style={{
          width: "100%",
          height: "90vh",
          border: "none",
          marginTop: 10,
        }}
      />
    </div>
  );
}
