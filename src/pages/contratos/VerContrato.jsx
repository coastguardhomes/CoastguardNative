import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

// Configuración del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    cargarYResolverContrato();
  }, [id]);

  const cargarYResolverContrato = async () => {
    try {
      setCargando(true);
      setErrorMsg(null);

      // CORRECCIÓN: Consultar la tabla "inspecciones" donde realmente se guarda el PDF
      const { data, error } = await supabase
        .from("inspecciones")
        .select("pdf_url")
        .eq("id", id)
        .single();

      if (error || !data || !data.pdf_url) {
        setResolvedPdfUrl(null);
        setCargando(false);
        return;
      }

      const rawPath = data.pdf_url;
      let finalUrl = null;

      if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
        finalUrl = rawPath;
      } else {
        const cleanPath = rawPath.replace(/^pdfs\//, "");
        const { data: signedData, error: signedError } = await supabase.storage
          .from("pdfs")
          .createSignedUrl(cleanPath, 3600);

        if (signedError) {
          throw new Error("No se pudo generar la URL firmada del documento.");
        }

        finalUrl = signedData?.signedUrl || null;
      }

      // Evitar caché agresiva en Web/App
      if (finalUrl) {
        finalUrl = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }

      setResolvedPdfUrl(finalUrl);
    } catch (err) {
      console.error("Error al cargar PDF:", err);
      setErrorMsg("No se pudo cargar el documento correctamente.");
    } finally {
      setCargando(false);
    }
  };

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
          📄 Informe Inspección #{id}
        </h2>

        {cargando ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Cargando visor de PDF...</p>
        ) : errorMsg ? (
          <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
            <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>{errorMsg}</p>
          </div>
        ) : !resolvedPdfUrl ? (
          <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
            <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>No hay ningún archivo PDF generado para esta inspección.</p>
            <p style={{ color: "#94a3b8", fontSize: "12px" }}>Vuelve al panel y pulsa en "Generar informe PDF".</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Document
              file={resolvedPdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p style={{ color: "#94a3b8" }}>Cargando páginas del PDF...</p>}
              error={<p style={{ color: "#ff4d4d" }}>Error al renderizar el PDF en el visor.</p>}
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div key={index} style={{ marginBottom: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={Math.min(window.innerWidth - 40, 550)}
                  />
                </div>
              ))}
            </Document>
          </div>
        )}
      </div>
    </Menu>
  );
}
