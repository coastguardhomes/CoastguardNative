// src/pages/inspecciones/VerPDFInspeccion.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext";

const BUCKET_PDFS = "pdfs";
const BUCKET_LEGACY = "pdf_inspecciones";

const textos = {
  es: {
    titulo: "PDF de la inspección",
    cargando: "Cargando PDF…",
    errorConsulta:
      "No se pudo consultar la inspección. Comprueba tus permisos e inténtalo de nuevo.",
    noEncontrada: "No se encontró la inspección solicitada.",
    noPdf:
      "No se encontró un PDF para esta inspección. Comprueba que el informe se haya generado y guardado correctamente.",
    errorCarga: "Se produjo un error al cargar el PDF.",
    faltaId: "Falta el identificador de la inspección.",
    ninguno: "No hay ningún PDF disponible.",
    tituloIframe: "Informe PDF de la inspección",
    abrirDescargar: "Abrir o descargar PDF",
    volverInspeccion: "← Volver a la inspección",
    volverListado: "Volver al listado de inspecciones",
  },
  en: {
    titulo: "Inspection PDF",
    cargando: "Loading PDF…",
    errorConsulta:
      "The inspection could not be retrieved. Check your permissions and try again.",
    noEncontrada: "The requested inspection could not be found.",
    noPdf:
      "No PDF was found for this inspection. Check that the report was generated and saved correctly.",
    errorCarga: "An error occurred while loading the PDF.",
    faltaId: "The inspection ID is missing.",
    ninguno: "No PDF is available.",
    tituloIframe: "Inspection PDF report",
    abrirDescargar: "Open or download PDF",
    volverInspeccion: "← Back to inspection",
    volverListado: "Back to inspections list",
  },
  fr: {
    titulo: "PDF de l’inspection",
    cargando: "Chargement du PDF…",
    errorConsulta:
      "Impossible de consulter l’inspection. Vérifiez vos autorisations et réessayez.",
    noEncontrada: "L’inspection demandée est introuvable.",
    noPdf:
      "Aucun PDF n’a été trouvé pour cette inspection. Vérifiez que le rapport a bien été généré et enregistré.",
    errorCarga: "Une erreur s’est produite lors du chargement du PDF.",
    faltaId: "L’identifiant de l’inspection est manquant.",
    ninguno: "Aucun PDF n’est disponible.",
    tituloIframe: "Rapport PDF de l’inspection",
    abrirDescargar: "Ouvrir ou télécharger le PDF",
    volverInspeccion: "← Retour à l’inspection",
    volverListado: "Retour à la liste des inspections",
  },
};

async function obtenerUrlPdf(valor) {
  if (!valor || typeof valor !== "string") return null;

  const valorLimpio = valor.trim();
  if (!valorLimpio) return null;

  // Convierte rutas o URL antiguas de Storage en enlaces temporales.
  return await resolverUrlPdfSegura(valorLimpio, BUCKET_PDFS, 3600);
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

  // Intentar recuperar los archivos históricos por sus nombres conocidos.
  for (const candidato of candidatos) {
    const { data, error } = await supabase.storage
      .from(candidato.bucket)
      .createSignedUrl(candidato.ruta, 3600);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  }

  // Los informes actuales pueden llevar una marca de tiempo en el nombre.
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
  const { language } = useLanguage();

  const t = textos[language] || textos.es;

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
          throw new Error(t.errorConsulta);
        }

        if (!inspeccion) {
          throw new Error(t.noEncontrada);
        }

        let url = await obtenerUrlPdf(inspeccion.pdf_url);

        // Si no hay una URL utilizable, intentar recuperar el documento antiguo.
        if (!url) {
          url = await buscarPdfAntiguo(id);
        }

        if (cancelado) return;

        if (url) {
          setPdfUrl(url);
        } else {
          setMensaje(t.noPdf);
        }
      } catch (error) {
        if (cancelado) return;

        console.error("Error cargando PDF de inspección:", error);

        setMensaje(
          error?.message || t.errorCarga
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
      setMensaje(t.faltaId);
      setLoading(false);
    }

    return () => {
      cancelado = true;
    };
  }, [id, t]);

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
          {t.titulo} {id ? `#${id}` : ""}
        </h1>

        {loading ? (
          <p style={{ textAlign: "center" }}>{t.cargando}</p>
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
              {mensaje || t.ninguno}
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
              title={t.tituloIframe}
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
              {t.abrirDescargar}
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
          {t.volverInspeccion}
        </button>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/inspecciones" style={{ color: "#9fb3c8" }}>
            {t.volverListado}
          </Link>
        </div>
      </div>
    </Menu>
  );
}
