import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState(null);

  useEffect(() => {
    cargarYResolverContrato();
  }, [id]);

  const cargarYResolverContrato = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("contratos")
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
        const cleanPath = rawPath.replace(/^contratos\//, "");
        const { data: signedData } = await supabase.storage
          .from("contratos")
          .createSignedUrl(cleanPath, 3600);

        finalUrl = signedData?.signedUrl || null;
      }

      if (finalUrl) {
        finalUrl = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }

      setResolvedPdfUrl(finalUrl);
    } catch (err) {
      console.error("Error al cargar contrato:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Menu>
      <div style={{ minHeight: "100vh", background: "#0a0f1a", padding: "15px", color: "#fff" }}>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", marginBottom: "15px" }}>
          ⬅️ Volver
        </button>

        <h2 style={{ textAlign: "center", color: "#4db8ff", marginBottom: "15px" }}>📄 Contrato #{id}</h2>

        {cargando ? (
          <p style={{ textAlign: "center" }}>Cargando PDF...</p>
        ) : !resolvedPdfUrl ? (
          <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
            <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>No hay ningún archivo PDF generado para este contrato.</p>
            <p style={{ color: "#94a3b8", fontSize: "12px" }}>Vuelve al panel y pulsa en "Generar PDF / Ver Contrato".</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Document
              file={resolvedPdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p>Cargando visor...</p>}
              error={<p style={{ color: "#ff4d4d" }}>Error al renderizar el PDF.</p>}
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
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
