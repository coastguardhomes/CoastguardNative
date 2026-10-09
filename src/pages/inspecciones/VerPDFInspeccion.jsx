
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";

const BUCKET_PDFS = "pdfs";
const BUCKET_LEGACY = "pdf_inspecciones";

function obtenerUrlPdf(valor) {
  if (!valor || typeof valor !== "string") return null;

  const valorLimpio = valor.trim();
  if (!valorLimpio) return null;

  // Si ya está guardada una URL completa, conservarla.
  if (/^https?:\/\//i.test(valorLimpio)) {
    return valorLimpio;
  }

  // Si solo está guardada la ruta, usar el bucket actual.
  const { data } = supabase.storage
    .from(BUCKET_PDFS)
    .getPublicUrl(valorLimpio.replace(/^\/+/, ""));

  return data?.publicUrl || null;
}

async function buscarPdfAntiguo(id) {
  if (!id) return null;

  // Nombres utilizados en versiones anteriores.
  const candidatos = [
    {
      bucket: BUCKET_LEGACY,
      ruta: `informe_${id}.pdf`,
    },
    {
      bucket: BUCKET_LEGACY,
      ruta: `inspeccion-${id}.pdf`,
    },
    {
      bucket: BUCKET_PDFS,
      ruta: `inspecciones/inspeccion_${id}.pdf`,
    },
  ];

  // Los archivos antiguos pueden tener cualquiera de estos nombres.
  for (const candidato of candidatos) {
    const { data, error } = await supabase.storage
      .from(candidato.bucket)
      .createSignedUrl(candidato.ruta, 3600);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  }

  // Los informes actuales se guardan con una marca de tiempo.
  const { data: archivos, error: errorLista } = await supabase.storage
    .from(BUCKET_PDFS)
    .list("inspecciones", {
      limit: 100,
      search: `inspeccion_${id}_`,
    });

  if (!errorLista && archivos?.length) {
    const archivosPdf = archivos
      .filter((archivo) => archivo.name?.toLowerCase().endsWith(".pdf"))
      .sort((a, b) => {
        const fechaA = new Date(a.created_at || 0).getTime();
        const fechaB = new Date(b.created_at || 0).getTime();
        return fechaB - fechaA;
      });

    for (const archivo of archivosPdf) {
      const ruta = `inspecciones/${archivo.name}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_PDFS)
        .createSignedUrl(ruta, 3600);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }
  }

  return null;
}

export default function VerPDFInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarPDF() {
      setLoading(true);
      setPdfUrl(null);
      setMensaje("");

      try {
        // La URL guardada en la inspección tiene prioridad.
        const { data: inspeccion, error } = await supabase
          .from("inspecciones")
          .select("id, pdf_url")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Error consultando la inspección:", error);
          throw new Error(
            "No se pudo consultar la inspección. Comprueba tus permisos e inténtalo de nuevo."
          );
        }

        if (!inspeccion) {
          throw new Error("No se encontró la inspección solicitada.");
        }

        let url = obtenerUrlPdf(inspeccion.pdf_url);

        // Si no hay URL guardada, intentar recuperar el documento antiguo.
        if (!url) {
          url = await buscarPdfAntiguo(id);
        }

        if (cancelado) return;

        if (url) {
          setPdfUrl(url);
        } else {
          setMensaje(
            "No se encontró un PDF para esta inspección. " +
              "Comprueba que el informe se haya generado y guardado correctamente."
          );
        }
      } catch (error) {
        if (cancelado) return;

        console.error("Error cargando PDF de inspección:", error);
        setMensaje(
          error?.message || "Se produjo un error al cargar el PDF."
        );
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    if (id) {
      cargarPDF();
    } else {
      setMensaje("Falta el identificador de la inspección.");
      setLoading(false);
    }

    return () => {
      cancelado = true;
    };
  }, [id]);

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
            textAlign: "center",
          }}
        >
          PDF de la inspección {id ? `#${id}` : ""}
        </h1>

        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando PDF…</p>
        ) : !pdfUrl ? (
          <div>
            <p
              role="alert"
              style={{
                color: "#fbbf24",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              {mensaje || "No hay ningún PDF disponible."}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "20px",
            }}
          >
            <iframe
              src={pdfUrl}
              title="Informe PDF de la inspección"
              style={{
                width: "100%",
                height: "70vh",
                border: "1px solid #4db8ff",
                borderRadius: "10px",
                background: "#fff",
              }}
            />

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                marginTop: "16px",
                padding: "14px",
                background: "#4ade80",
                color: "#000",
                borderRadius: "10px",
                fontWeight: "700",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Abrir o descargar PDF
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(`/inspecciones/ver/${id}`)}
          style={{
            padding: "14px",
            width: "100%",
            background: "transparent",
            color: "#4db8ff",
            borderRadius: "10px",
            border: "1px solid #4db8ff",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ← Volver a la inspección
        </button>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/inspecciones" style={{ color: "#9fb3c8" }}>
            Volver al listado de inspecciones
          </Link>
        </div>
      </div>
    </Menu>
  );
}
