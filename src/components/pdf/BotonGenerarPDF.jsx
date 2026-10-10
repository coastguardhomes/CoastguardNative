import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";

/**
 * Botón reutilizable para generar y guardar documentos PDF.
 * Conserva el flujo de inspecciones y utiliza la función existente
 * contrato-pdf para generar los contratos.
 */
export default function BotonGenerarPDF({
  id,
  tipo = "inspeccion",
  onGenerado,
}) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    if (!id) {
      alert("Falta el identificador del registro.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (tipo === "inspeccion") {
        // 1. Obtener la inspección.
        const { data: inspeccion, error } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !inspeccion) {
          throw new Error(
            error?.message || "No se encontró la inspección."
          );
        }

        // 2. Cargar las fotos y generar el PDF.
        const fotos = await cargarFotosInspeccion(id);

        const blob = await generarPDFCliente({
          ...inspeccion,
          fotos,
        });

        if (!blob || blob.size === 0) {
          throw new Error("El PDF generado está vacío.");
        }

        // 3. Subir el PDF al bucket existente.
        const filePath =
          `inspecciones/inspeccion_${id}_${Date.now()}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, blob, {
            contentType: "application/pdf",
            upsert: false,
            cacheControl: "3600",
          });

        if (uploadError) {
          throw new Error(
            `Error al subir el PDF: ${uploadError.message}`
          );
        }

        // 4. Mantener la referencia histórica en pdf_url
        // para no romper los componentes que aún la utilizan.
        const { data: urlData } = supabase.storage
          .from("pdfs")
          .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
          throw new Error(
            "El PDF se ha subido, pero no se pudo obtener su referencia."
          );
        }

        // 5. Crear un enlace temporal para mostrar el PDF.
        const {
          data: signedData,
          error: signedError,
        } = await supabase.storage
          .from("pdfs")
          .createSignedUrl(filePath, 3600);

        if (signedError || !signedData?.signedUrl) {
          throw new Error(
            signedError?.message ||
              "No se pudo generar el enlace temporal del PDF. Comprueba los permisos de Storage."
          );
        }

        // 6. Actualizar únicamente la columna existente pdf_url.
        const {
          data: inspeccionActualizada,
          error: updateError,
        } = await supabase
          .from("inspecciones")
          .update({
            pdf_url: publicUrl,
          })
          .eq("id", id)
          .select("id, pdf_url")
          .maybeSingle();

        if (updateError) {
          throw new Error(
            `El PDF se subió, pero no se pudo guardar su URL: ${updateError.message}`
          );
        }

        if (!inspeccionActualizada) {
          throw new Error(
            "El PDF se subió, pero la base de datos no confirmó la actualización. Comprueba los permisos de la inspección antes de volver a generarlo."
          );
        }

        // 7. Devolver el enlace temporal a la pantalla.
        if (typeof onGenerado === "function") {
          onGenerado(signedData.signedUrl);
        }

        alert("Informe PDF generado y guardado correctamente.");
      } else if (tipo === "contrato") {
        // 1. Comprobar que el contrato existe.
        const { data: contrato, error } = await supabase
          .from("contratos")
          .select("id")
          .eq("id", id)
          .maybeSingle();

        if (error || !contrato) {
          throw new Error(
            error?.message || "No se encontró el contrato."
          );
        }

        // 2. Utilizar el generador de contratos que ya existe.
        // Esta función se encarga de generar el documento
        // y actualizar contratos.pdf_url.
        const { data: resultado, error: funcionError } =
          await supabase.functions.invoke("contrato-pdf", {
            body: {
              contratoId: Number(id),
              contrato_id: Number(id),
              id: Number(id),
            },
          });

        if (funcionError) {
          throw new Error(
            funcionError.message ||
              "No se pudo generar el contrato."
          );
        }

        if (resultado?.error) {
          throw new Error(resultado.error);
        }

        const urlContrato =
          resultado?.url ||
          resultado?.pdf_url ||
          resultado?.pdfUrl;

        if (!urlContrato) {
          throw new Error(
            "La función de contratos no devolvió la referencia del documento."
          );
        }

        // 3. Entregar el documento generado a la pantalla.
        if (typeof onGenerado === "function") {
          onGenerado(urlContrato);
        }

        alert("Contrato generado y guardado correctamente.");
      } else {
        throw new Error(
          `Tipo de documento no válido: ${tipo}`
        );
      }
    } catch (e) {
      console.error("Error generando documento PDF:", e);

      alert(
        `No se pudo generar el documento: ${
          e?.message || "Error desconocido."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="cg-btn cg-btn-accent w-full mt-4"
      disabled={loading}
      onClick={handlePDF}
    >
      {loading
        ? "Generando PDF..."
        : tipo === "contrato"
          ? "Generar PDF / Ver Contrato"
          : "Generar PDF"}
    </button>
  );
}
