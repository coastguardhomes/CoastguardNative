import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function VerPDF() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarPDF() {
      const { data, error } = await supabase
        .from("pdf_inspecciones")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        setMensaje("Error cargando PDF");
        setLoading(false);
        return;
      }

      setPdfUrl(data.url);
      setLoading(false);
    }

    cargarPDF();
  }, []);

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
          PDF de Inspección
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
          <p style={{ opacity: 0.8 }}>No hay PDF disponible.</p>
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

            <a href={pdfUrl} download style={{ width: "100%", display: "block" }}>
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
      </div>
    </Menu>
  );
}
