import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function VerPDF() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPDF() {
      const { data, error } = await supabase
        .from("pdf_inspecciones")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (error) {
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

            <a href={pdfUrl} download style={{ display: "inline-block", marginTop: "15px" }}>
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
          </>
        )}
      </div>
    </Menu>
  );
}
