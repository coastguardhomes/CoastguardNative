import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdf } from "../../lib/urlPdf";
import { useParams } from "react-router-dom";

export default function VerPDFInspeccion() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarPDF() {
      // No existe ninguna tabla "pdf_inspecciones": el PDF de una inspección
      // se guarda en la columna inspecciones.pdf_url.
      const { data, error } = await supabase
        .from("inspecciones")
        .select("pdf_url")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error cargando PDF de la inspección:", error);
        setMensaje("Error cargando PDF de esta inspección");
        setLoading(false);
        return;
      }

      if (!data?.pdf_url) {
        setMensaje("Esta inspección todavía no tiene PDF generado.");
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
          PDF de la Inspección #{id}
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {loading ? (
          <p style={{ opacity: 0.8 }}>Cargando PDF...</p>
        ) : !pdfUrl ? (
          <p style={{ opacity: 0.8 }}>
            No hay PDF generado todavía para esta inspección.
          </p>
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
              title={`PDF inspección ${id}`}
              style={{
                width: "100%",
                height: "500px",
                border: "2px solid #4db8ff",
                borderRadius: "12px",
                background: "#fff",
              }}
            />

            <a
              href={pdfUrl}
              download
              style={{ display: "block", marginTop: "20px", width: "100%" }}
            >
              <button
                style={{
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
      </div>
    </Menu>
  );
}
