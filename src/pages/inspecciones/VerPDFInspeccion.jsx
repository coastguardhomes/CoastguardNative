import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";

export default function VerPDFInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPDF() {
      try {
        // Buscar el PDF en Supabase Storage
        const { data, error } = await supabase.storage
          .from("pdfs-inspecciones")
          .createSignedUrl(`inspeccion-${id}.pdf`, 3600);

        if (error) {
          console.error("Error cargando PDF:", error);
        } else {
          setPdfUrl(data.signedUrl);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      }

      setLoading(false);
    }

    cargarPDF();
  }, [id]);

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando PDF…
        </div>
      </Menu>
    );
  }

  if (!pdfUrl) {
    return (
      <Menu>
        <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#fff", padding: "20px" }}>
          <h2>No se encontró el PDF de esta inspección</h2>
          <Link to={`/inspecciones/${id}`} style={{ color: "#4db8ff" }}>Volver a la inspección</Link>
        </div>
      </Menu>
    );
  }

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
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          PDF de la Inspección #{id}
        </h1>

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
              height: "70vh",
              border: "2px solid #4db8ff",
              borderRadius: "12px",
              background: "#fff",
            }}
          />

          <a
            href={pdfUrl}
            download={`inspeccion-${id}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: "100%", display: "block", textDecoration: "none" }}
          >
            <button
              style={{
                marginTop: "20px",
                padding: "14px",
                width: "100%",
                background: "#4ade80",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(74,222,128,0.4)",
              }}
            >
              Descargar PDF
            </button>
          </a>
        </div>

        <button
          onClick={() => navigate(`/inspecciones/${id}`)}
          style={{
            padding: "14px",
            width: "100%",
            background: "transparent",
            color: "#4db8ff",
            borderRadius: "10px",
            border: "1px solid #4db8ff",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          ← Volver a la inspección
        </button>
      </div>
    </Menu>
  );
}
