import { supabase } from "../lib/supabase";

export async function subirPDF(inspeccionId, pdfBlob) {
  if (!inspeccionId || !pdfBlob) {
    return {
      ok: false,
      mensaje: "ID o PDF inválidos",
      error: "Parámetros incompletos",
    };
  }

  if (pdfBlob.type !== "application/pdf") {
    return {
      ok: false,
      mensaje: "El archivo no es un PDF válido",
      error: "Tipo incorrecto",
    };
  }

  const bucket = "pdfs";
  const filePath = `inspecciones/inspeccion_${inspeccionId}.pdf`;

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
      error: uploadError.message || uploadError,
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
      error: urlError?.message || "URL no generada",
    };
  }

  const publicUrl = urlData.publicUrl;

  // GUARDAR URL EN LA INSPECCIÓN
  const { error: updateError } = await supabase
    .from("inspecciones")
    .update({ pdf_url: publicUrl })
    .eq("id", inspeccionId);

  if (updateError) {
    return {
      ok: false,
      mensaje: "PDF subido pero error guardando URL en inspección",
      error: updateError.message || updateError,
    };
  }

  return {
    ok: true,
    mensaje: "PDF subido y guardado correctamente",
    url: publicUrl,
    filePath,
  };
}
