import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";

export default function VerPDFInspeccion() {
  const { id } = useParams(); // id de inspección
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPDF() {
      const { data, error } = await supabase
        .from("pdf_inspecciones")
        .select("*")
        .eq("inspeccion_id", id)
        .single();

      if (error) {
        setLoading(false);
        return;
      }

      setPdfUrl(data.url);
      setLoading(false);
    }

    cargarPDF();
  }, [id]);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          PDF de la Inspección #{id}
        </h1>

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
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            }}
          >
            <iframe
              src={pdfUrl}
              title={`PDF inspección ${id}`}
              style={{
                width: "100%",
                height: "500px",
                border: "1px solid #4db8ff",
                borderRadius: "8px",
              }}
            />

            <a
              href={pdfUrl}
              download
              style={{ display: "inline-block", marginTop: "15px" }}
            >
              <button
                style={{
                  padding: "10px 15px",
                  background: "#4db8ff",
                  color: "#fff",
                  borderRadius: "6px",
                  border: "none",
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
