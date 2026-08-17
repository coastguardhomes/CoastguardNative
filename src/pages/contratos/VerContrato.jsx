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
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState(null);

  useEffect(() => {
    cargarYResolverContrato();
  }, [id]);

  const cargarYResolverContrato = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Error al cargar el contrato: " + (error?.message || "No encontrado"));
        setCargando(false);
        return;
      }

      setContrato(data);

      const rawPath = data.firma_url || data.pdf_url;

      if (!rawPath) {
        setResolvedPdfUrl(null);
        setCargando(false);
        return;
      }

      if (rawPath.includes("<!DOCTYPE") || rawPath.includes("<html") || rawPath.includes("{")) {
        setResolvedPdfUrl(null);
        setCargando(false);
        return;
      }

      let finalUrl = null;

      if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
        finalUrl = rawPath;
      } else {
        const cleanPath = rawPath.replace(/^contratos\//, "");

        const { data: signedData, error: signedErr } = await supabase.storage
          .from("contratos")
          .createSignedUrl(cleanPath, 3600);

        if (signedData?.signedUrl && !signedErr) {
          finalUrl = signedData.signedUrl;
        } else {
          const { data: publicData } = supabase.storage
            .from("contratos")
            .getPublicUrl(cleanPath);
          finalUrl = publicData?.publicUrl || null;
        }
      }

      // Solución Fallo 4: Evitar caché en navegadores móviles con timestamp
      if (finalUrl) {
        const separator = finalUrl.includes("?") ? "&" : "?";
        finalUrl = `${finalUrl}${separator}t=${Date.now()}`;
      }

      setResolvedPdfUrl(finalUrl);
    } catch (err) {
      console.error("Error al procesar la URL del contrato:", err);
    } finally {
      setCargando(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

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
          ) : !resolvedPdfUrl ? (
            <div style={{ textAlign: "center", padding: "20px", background: "#1a2332", borderRadius: "12px" }}>
              <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>No hay ningún archivo PDF válido asociado a este contrato.</p>
              <p style={{ color: "#94a3b8", fontSize: "12px" }}>El campo en la base de datos está vacío o la ruta de Storage no existe.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#1a2332", padding: "10px", borderRadius: "12px", overflowX: "auto" }}>
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 14px",
                  background: "#4db8ff",
                  color: "#000",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textDecoration: "none",
                  marginBottom: "15px",
                  fontSize: "14px"
                }}
              >
                ↗️ Abrir PDF en nueva pestaña
              </a>

              <Document
                file={resolvedPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p style={{ color: "#fff" }}>Cargando PDF en la app...</p>}
                error={<p style={{ color: "#ff4d4d" }}>Error al renderizar el archivo PDF.</p>}
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <div key={`page_wrapper_${index + 1}`} style={{ position: "relative", width: "100%", marginBottom: "10px", display: "flex", justifyContent: "center" }}>
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={Math.min(window.innerWidth - 50, 550)}
                    />
                    {contrato?.sello_url && (
                      <img
                        src={contrato.sello_url}
                        alt="Sello"
                        style={{
                          position: "absolute",
                          right: "5%",
                          bottom: "5%",
                          width: "clamp(56px, 18%, 120px)",
                          height: "auto",
                          pointerEvents: "none",
                          opacity: 0.95,
                          zIndex: 10
                        }}
                      />
                    )}
                  </div>
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
    </Menu>
  );
}
