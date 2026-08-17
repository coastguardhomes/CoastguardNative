import { supabase } from "../lib/supabase";

/**
 * Sube un PDF a Supabase y guarda su URL en la inspección
 * Versión estable WEB + APP (2026) - Corregido para permitir actualizaciones
 */
export async function guardarPDFEnInspeccion(id, pdfBlob) {
  if (!id || !pdfBlob) {
    throw new Error("ID o PDF inválido");
  }

  // Validación robusta del PDF (Android/iOS envían blobs sin type)
  const esPDF =
    pdfBlob.type === "application/pdf" ||
    pdfBlob.type === "" ||
    pdfBlob.name?.endsWith(".pdf") ||
    pdfBlob.size > 100; // evita PDFs corruptos de 0 bytes

  if (!esPDF) {
    throw new Error("El archivo no es un PDF válido");
  }

  // Verificar que la inspección existe
  const { data: inspeccionExiste, error: existeError } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("id", id)
    .single();

  if (existeError || !inspeccionExiste) {
    throw new Error("La inspección no existe");
  }

  // Nombre único para evitar conflictos de caché en Supabase Storage
  const filePath = `inspecciones/inspeccion_${id}_${Date.now()}.pdf`;

  // SUBIR PDF
  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(filePath, pdfBlob, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(
      "Error subiendo PDF: " +
        (uploadError.message || JSON.stringify(uploadError))
    );
  }

  // OBTENER URL PÚBLICA
  const { data: urlData, error: urlError } = await supabase.storage
    .from("pdfs")
    .getPublicUrl(filePath);

  if (urlError || !urlData?.publicUrl) {
    throw new Error("Error obteniendo URL pública del PDF");
  }

  const publicUrl = urlData.publicUrl;

  // GUARDAR URL EN LA INSPECCIÓN
  const { error: updateError } = await supabase
    .from("inspecciones")
    .update({
      pdf_url: publicUrl,
      firmado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(
      "PDF subido pero error guardando URL en inspección: " +
        (updateError.message || JSON.stringify(updateError))
    );
  }

  return {
    ok: true,
    id,
    url: publicUrl,
    filePath,
    mime: "application/pdf",
  };
}
