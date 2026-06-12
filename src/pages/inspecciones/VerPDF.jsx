import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [urlPDF, setUrlPDF] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ============================
  // CARGAR PDF DESDE SUPABASE
  // ============================
  const cargarPDF = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando PDF:", error);
      alert("Error cargando PDF");
      navigate(`/inspecciones/${id}`);
      return;
    }

    if (!data?.pdf_url) {
      alert("Esta inspección no tiene PDF generado.");
      navigate(`/inspecciones/${id}`);
      return;
    }

    setUrlPDF(data.pdf_url);
    setCargando(false);
  };

  useEffect(() => {
    cargarPDF();
  }, [id]);

  if (cargando) {
    return (
      <div style={{ padding: 16 }}>
        <h1>PDF</h1>
        <p>Cargando PDF...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Informe PDF</h1>

      {/* Visor PDF PRO */}
      <iframe
        src={urlPDF}
        title="PDF"
        style={{
          width: "100%",
          height: "80vh",
          border: "1px solid #334155",
          borderRadius: 8,
          background: "#1e293b",
        }}
      ></iframe>

      {/* Botón volver */}
      <button
        onClick={() => navigate(`/inspecciones/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        Volver
      </button>
    </div>
  );
}
