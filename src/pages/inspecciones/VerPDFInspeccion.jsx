import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../../lib/supabase";

export default function VerPDFInspeccion() {
  const { id } = useParams();
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
    );
  }

  if (!pdfUrl) {
    return (
      <div className="p-4">
        <h2>No se encontró el PDF de esta inspección</h2>
        <Link to="/inspecciones">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>PDF de la Inspección #{id}</h1>

      <iframe
        src={pdfUrl}
        title="PDF Inspección"
        style={{
          width: "100%",
          height: "80vh",
          border: "1px solid #ccc",
          marginTop: "20px",
        }}
      />

      <div style={{ marginTop: "20px" }}>
        <a
          href={pdfUrl}
          download={`inspeccion-${id}.pdf`}
          className="btn btn-success"
        >
          Descargar PDF
        </a>

        <Link
          to={`/inspecciones/ver/${id}`}
          className="btn btn-secondary"
          style={{ marginLeft: "10px" }}
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
