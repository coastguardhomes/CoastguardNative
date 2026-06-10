import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function VerPDF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
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

      setPdfUrl(data.pdf_url);
    };

    cargarPDF();
  }, [id]);

  return (
    <LayoutWithMenu>
      <div style={{ padding: 20 }}>
        <h2>Ver PDF</h2>

        {!pdfUrl && <p>Cargando PDF...</p>}

        {pdfUrl && (
          <iframe
            src={pdfUrl}
            style={{ width: "100%", height: "90vh", border: "none" }}
          ></iframe>
        )}

        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    </LayoutWithMenu>
  );
}
