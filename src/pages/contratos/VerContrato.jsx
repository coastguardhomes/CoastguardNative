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
      // Solo traemos el PDF, ignoramos la firma aquí. La firma se pintó en el PDF al generarlo.
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

      // Generar URL firmada para acceder al bucket privado
      const cleanPath = rawPath.replace(/^contratos\//, "");
      const { data: signedData } = await supabase.storage
        .from("contratos")
        .createSignedUrl(cleanPath, 3600);

      finalUrl = signedData?.signedUrl || null;

      // Aplicar bypass de caché SOLO al PDF
      if (finalUrl) {
        finalUrl = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }

      setResolvedPdfUrl(finalUrl);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Menu>
      <div style={{ minHeight: "100vh", background: "#0a0f1a", padding: "15px", color: "#fff" }}>
        <button onClick={() => navigate(-1)} style={{ padding: "10px", background: "#333", color: "#fff", border: "none", borderRadius: "5px", marginBottom: "10px" }}>⬅️ Volver</button>
        
        {cargando ? <p>Cargando PDF...</p> : !resolvedPdfUrl ? <p>No hay PDF disponible.</p> : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Document file={resolvedPdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} width={Math.min(window.innerWidth - 40, 600)} />
                </div>
              ))}
            </Document>
          </div>
        )}
      </div>
    </Menu>
  );
}
