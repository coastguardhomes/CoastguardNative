import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerPDF() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarPDF = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("inspecciones")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (data?.pdf_url) {
      setPdfUrl(data.pdf_url);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarPDF();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Cargando PDF...</p>;

  if (!pdfUrl)
    return (
      <div style={{ padding: 20 }}>
        <h1>PDF no disponible</h1>
        <p>Esta inspección aún no tiene un PDF generado.</p>

        <button
          onClick={() => (window.location.href = `/inspecciones/${id}`)}
          style={{
            padding: "10px 15px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          Volver
        </button>
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h1>PDF de la Inspección</h1>

      <iframe
        src={pdfUrl}
        style={{
          width: "100%",
          height: "85vh",
          border: "1px solid #ccc",
          borderRadius: 8,
          marginTop: 20,
        }}
      />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={() => window.open(pdfUrl, "_blank")}
          style={{
            padding: "10px 15px",
            background: "#0A84FF",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Descargar PDF
        </button>

        <button
          onClick={() => (window.location.href = `/inspecciones/${id}`)}
          style={{
            padding: "10px 15px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}