import { supabase } from "../supabaseClient";

export async function subirPDF(inspeccionId, pdfBlob) {
  if (!inspeccionId || !pdfBlob) {
    return {
      ok: false,
      mensaje: "ID o PDF inválidos",
      error: "Parámetros incompletos",
    };
  }

  const bucket = "inspecciones";
  const filePath = `pdfs/inspeccion_${inspeccionId}.pdf`;

  // SUBIR PDF
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
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
      error: urlError?.message || urlError || "URL no generada",
    };
  }

  return {
    ok: true,
    mensaje: "PDF subido correctamente",
    url: urlData.publicUrl,
  };
}
