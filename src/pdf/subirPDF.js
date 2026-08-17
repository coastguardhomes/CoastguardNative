import { supabase } from "../lib/supabase";

/**
 * Sube un PDF a Supabase y guarda su URL en la inspección
 * Versión estable WEB + APP (2026) - Corregido para permitir actualizaciones
 */
export async function subirPDF(inspeccionId, pdfBlob) {
  if (!inspeccionId || !pdfBlob) {
    return {
      ok: false,
      mensaje: "ID o PDF inválidos",
      error: "Parámetros incompletos",
    };
  }

  // Validación robusta del PDF (Android/iOS envían blobs sin type)
  const esPDF =
    pdfBlob.type === "application/pdf" ||
    pdfBlob.type === "" ||
    pdfBlob.name?.endsWith(".pdf") ||
    pdfBlob.size > 100; // evita PDFs corruptos de 0 bytes

  if (!esPDF) {
    return {
      ok: false,
      mensaje: "El archivo no es un PDF válido",
      error: "Tipo incorrecto",
    };
  }

  // Verificar que la inspección existe
  const { data: inspeccion, error: inspeccionError } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("id", inspeccionId)
    .single();

  if (inspeccionError || !inspeccion) {
    return {
      ok: false,
      mensaje: "La inspección no existe",
      error: inspeccionError?.message || JSON.stringify(inspeccionError),
    };
  }

  const bucket = "pdfs";

  // Nombre único para evitar conflictos de caché en Supabase Storage
  const filePath = `inspecciones/inspeccion_${inspeccionId}_${Date.now()}.pdf`;

  // SUBIR PDF
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    return {
      ok: false,
      mensaje: "Error subiendo PDF",
      error: uploadError.message || JSON.stringify(uploadError),
    };
  }

  // OBTENER URL PÚBLICA
  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (urlError || !urlData?.publicUrl) {
    return {
      ok: false,
      mensaje: "Error obteniendo URL pública del PDF",
      error: urlError?.message || JSON.stringify(urlError),
    };
  }

  const publicUrl = urlData.publicUrl;

  // GUARDAR URL EN LA INSPECCIÓN
  const { error: updateError } = await supabase
    .from("inspecciones")
    .update({
      pdf_url: publicUrl,
      firmado_en: new Date().toISOString(),
    })
    .eq("id", inspeccionId);

  if (updateError) {
    return {
      ok: false,
      mensaje: "PDF subido pero error guardando URL en inspección",
      error: updateError.message || JSON.stringify(updateError),
    };
  }

  return {
    ok: true,
    mensaje: "PDF subido y guardado correctamente",
    url: publicUrl,
    id: inspeccionId,
    filePath,
    mime: "application/pdf",
  };
}
