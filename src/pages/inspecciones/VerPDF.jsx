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
      <div style={{ padding: 20, color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>PDF de Inspección</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        {loading ? (
          <p>Cargando PDF...</p>
        ) : !pdfUrl ? (
          <p>No hay PDF disponible.</p>
        ) : (
          <>
            <iframe
              src={pdfUrl}
              title="PDF Inspección"
              style={{
                width: "100%",
                height: "500px",
                border: "1px solid #4db8ff",
                borderRadius: "8px",
                marginTop: "15px",
              }}
            />

            <a
              href={pdfUrl}
              download
              style={{ display: "inline-block", marginTop: "15px", width: "100%" }}
            >
              <button
                style={{
                  padding: "12px",
                  width: "100%",
                  background: "#4db8ff",
                  color: "#000",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Descargar PDF
              </button>
            </a>
          </>
        )}
      </div>
    </Menu>
  );
}
