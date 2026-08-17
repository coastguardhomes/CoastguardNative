import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarContrato();
  }, [id]);

  const cargarContrato = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("Error al cargar el contrato: " + error.message);
    } else {
      setContrato(data);
    }
    setCargando(false);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  let rawPdfUrl = contrato?.pdf_url || contrato?.firma_url;

  // BLINDAJE: Si por error se guardó código HTML o texto en lugar de una URL de PDF, lo anulamos para que no pete la app
  if (rawPdfUrl && (rawPdfUrl.includes("<!DOCTYPE") || rawPdfUrl.includes("<html") || rawPdfUrl.includes("{"))) {
    rawPdfUrl = null;
  }

  return (
    <Menu>
      <div style={{ minHeight: "100vh", background: "#0a0f1a", padding: "15px", color: "#fff", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          
          <button
            onClick={() => navigate(-1)}
            style={{ padding: "10px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", marginBottom: "15px" }}
          >
            ⬅️ Volver
          </button>

          <h2 style={{ textAlign: "center", color: "#4db8ff", marginBottom: "15px" }}>
            📄 Contrato #{id}
          </h2>

          {cargando ? (
            <p style={{ textAlign: "center" }}>Cargando datos...</p>
          ) : !rawPdfUrl ? (
            <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
              <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>No hay ningún archivo PDF válido asociado a este contrato.</p>
              <p style={{ color: "#94a3b8", fontSize: "12px" }}>El campo en la base de datos contiene texto plano o está vacío.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#1a2332", padding: "10px", borderRadius: "12px", overflowX: "auto" }}>
              <Document
                file={rawPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p style={{ color: "#fff" }}>Cargando PDF en la app...</p>}
                error={<p style={{ color: "#ff4d4d" }}>Error al renderizar el archivo PDF.</p>}
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={Math.min(window.innerWidth - 50, 550)}
                    style={{ marginBottom: "10px" }}
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
    </Menu>
  );
}
