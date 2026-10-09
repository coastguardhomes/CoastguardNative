import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";

/**
 * Botón reutilizable para generar y guardar el informe PDF.
 * Funciona con inspecciones y contratos.
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

        // 3. Subir el PDF a Storage con un nombre único.
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

        // 4. Obtener la URL pública del archivo.
        const { data: urlData } = supabase.storage
          .from("pdfs")
          .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
          throw new Error(
            "No se pudo obtener la URL del PDF."
          );
        }

        // 5. Guardar únicamente la columna existente pdf_url.
        const { data: inspeccionActualizada, error: updateError } =
          await supabase
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

        // 6. Avisar a la pantalla que el PDF ya está guardado.
        if (typeof onGenerado === "function") {
          onGenerado(publicUrl);
        }

        alert("Informe PDF de inspección generado y guardado correctamente.");
      } else if (tipo === "contrato") {
        // FLUJO DE CONTRATOS: se conserva independiente.

        const { data: contrato, error } = await supabase
          .from("contratos")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !contrato) {
          throw new Error(
            error?.message || "No se encontró el contrato."
          );
        }

        // Mantiene aquí el comportamiento original del proyecto.
        const blob = new Blob(["Contrato PDF #" + id], {
          type: "application/pdf",
        });

        const filePath = `contrato_${id}_${Date.now()}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from("contratos")
          .upload(filePath, blob, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Error al subir el contrato: ${uploadError.message}`
          );
        }

        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("contratos")
            .createSignedUrl(filePath, 3600);

        if (signedError || !signedData?.signedUrl) {
          throw new Error(
            signedError?.message ||
              "No se pudo generar la URL segura del contrato."
          );
        }

        const { error: updateError } = await supabase
          .from("contratos")
          .update({
            pdf_url: filePath,
          })
          .eq("id", id);

        if (updateError) {
          throw new Error(
            `Error al guardar el contrato: ${updateError.message}`
          );
        }

        if (typeof onGenerado === "function") {
          onGenerado(signedData.signedUrl);
        }

        alert("Contrato PDF generado y guardado correctamente.");
      } else {
        throw new Error(`Tipo de documento no válido: ${tipo}`);
      }
    } catch (e) {
      console.error("Error generando PDF:", e);

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
