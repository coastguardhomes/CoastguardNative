import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    cargarContrato();
  }, [id]);

  const cargarContrato = async () => {
    try {
      setCargando(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("contratos")
        .select("pdf_url")
        .eq("id", id)
        .single();

      if (error || !data?.pdf_url) {
        setErrorMsg("No se encontró el archivo del contrato.");
        setResolvedPdfUrl(null);
      } else {
        setResolvedPdfUrl(data.pdf_url);
      }
    } catch (err) {
      console.error("Error cargando contrato:", err);
      setErrorMsg("Error cargando el contrato.");
      setResolvedPdfUrl(null);
    } finally {
      setCargando(false);
    }
  };

  const isHtmlDocument = resolvedPdfUrl && (
    resolvedPdfUrl.endsWith(".html") || 
    resolvedPdfUrl.includes(".html?") || 
    resolvedPdfUrl.includes("text/html")
  );

  return (
    <Menu>
      <div style={{ minHeight: "100vh", background: "#0a0f1a", padding: "15px", color: "#fff" }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            padding: "10px 16px", 
            background: "rgba(255,255,255,0.1)", 
            color: "#fff", 
            border: "1px solid rgba(255,255,255,0.2)", 
            borderRadius: "8px", 
            cursor: "pointer", 
            marginBottom: "15px" 
          }}
        >
          ⬅️ Volver
        </button>

        <h2 style={{ textAlign: "center", color: "#4db8ff", marginBottom: "15px" }}>
          📄 Contrato #{id}
        </h2>

        {cargando ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Cargando contrato...</p>
        ) : errorMsg ? (
          <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
            <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>{errorMsg}</p>
          </div>
        ) : !resolvedPdfUrl ? (
          <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
            <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>No hay ningún archivo generado para este contrato.</p>
            <p style={{ color: "#94a3b8", fontSize: "12px" }}>Vuelve al panel y pulsa en "Generar PDF / Ver Contrato".</p>
          </div>
        ) : isHtmlDocument ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <iframe
              src={resolvedPdfUrl}
              title={`Contrato ${id}`}
              style={{
                width: "100%",
                maxWidth: "800px",
                height: "80vh",
                border: "none",
                borderRadius: 12,
                background: "#ffffff",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)"
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
            <div style={{ marginTop: 16 }}>
              <a 
                href={resolvedPdfUrl} 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: "#4db8ff", textDecoration: "underline" }}
              >
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Document
              file={resolvedPdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p style={{ color: "#94a3b8" }}>Cargando documento...</p>}
              error={<p style={{ color: "#ff4d4d" }}>Error al renderizar el documento en el visor.</p>}
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div key={index} style={{ marginBottom: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={Math.min(window.innerWidth - 40, 700)}
                  />
                </div>
              ))}
            </Document>

            <div style={{ marginTop: 16 }}>
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#4db8ff", textDecoration: "underline" }}
              >
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        )}
      </div>
    </Menu>
  );
}
