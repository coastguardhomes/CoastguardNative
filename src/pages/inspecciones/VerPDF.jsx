import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdf } from "../../lib/urlPdf";

export default function VerPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarPDF() {
      let query = supabase.from("inspecciones").select("id, pdf_url");

      // 🔥 Si recibimos un ID específico por ruta, lo filtramos; si no, pillamos el último
      if (id) {
        query = query.eq("id", id).maybeSingle();
      } else {
        query = query.not("pdf_url", "is", null).order("id", { ascending: false }).limit(1).maybeSingle();
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error cargando PDF:", error);
        setMensaje("Error cargando PDF");
        setLoading(false);
        return;
      }

      if (!data?.pdf_url) {
        setMensaje("Todavía no hay ningún informe PDF generado para esta inspección.");
        setLoading(false);
        return;
      }

      setPdfUrl(resolverUrlPdf(data.pdf_url));
      setLoading(false);
    }

    cargarPDF();
  }, [id]);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          PDF de Inspección {id ? `#${id}` : ""}
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {mensaje}
          </p>
        )}

        {loading ? (
          <p style={{ opacity: 0.8, textAlign: "center" }}>Cargando PDF...</p>
        ) : !pdfUrl ? (
          <p style={{ opacity: 0.8, textAlign: "center" }}>No hay PDF disponible.</p>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 12px rgba(0,153,255,0.2)",
              marginBottom: "25px",
            }}
          >
            <iframe
              src={pdfUrl}
              title="PDF Inspección"
              style={{
                width: "100%",
                height: "500px",
                border: "2px solid #4db8ff",
                borderRadius: "12px",
                background: "#fff",
              }}
            />

            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer" style={{ width: "100%", display: "block" }}>
              <button
                style={{
                  marginTop: "20px",
                  padding: "14px",
                  width: "100%",
                  background: "#4db8ff",
                  color: "#000",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "17px",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(0,153,255,0.4)",
                }}
              >
                Descargar PDF
              </button>
            </a>
          </div>
        )}

        {id && (
          <button
            onClick={() => navigate(`/inspecciones/${id}`)}
            style={{
              marginTop: "10px",
              padding: "14px",
              width: "100%",
              background: "transparent",
              color: "#4db8ff",
              borderRadius: "10px",
              border: "1px solid #4db8ff",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            ← Volver a la inspección
          </button>
        )}
      </div>
    </Menu>
  );
}
