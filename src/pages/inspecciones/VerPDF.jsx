import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function VerPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdfURL, setPdfURL] = useState("");

  const cargarPDF = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando PDF:", error);
      return;
    }

    setPdfURL(data.pdf_url);
  };

  useEffect(() => {
    cargarPDF();
  }, []);

  if (!pdfURL) {
    return <p style={{ padding: 20 }}>Cargando PDF...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>PDF de la Inspección</h2>

      <iframe
        src={pdfURL}
        title="PDF Inspección"
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
          marginRight: 10,
        }}
      >
        Abrir en nueva pestaña
      </button>

      <button
        onClick={() => navigate(`/inspecciones/detalle/${id}`)}
        style={{
          padding: "10px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: 12,
        }}
      >
        Volver
      </button>
    </div>
  );
}
