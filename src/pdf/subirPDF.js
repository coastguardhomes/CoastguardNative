import { supabase } from "../supabaseClient";

export async function subirPDF(inspeccionId, pdfBlob) {
  const filePath = `pdfs/inspeccion_${inspeccionId}.pdf`;

  // SUBIR PDF
  const { error: uploadError } = await supabase.storage
    .from("inspecciones")
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return {
      ok: false,
      mensaje: "Error subiendo PDF",
      error: uploadError,
    };
  }

  // OBTENER URL PÚBLICA
  const { data } = supabase.storage
    .from("inspecciones")
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    return {
      ok: false,
      mensaje: "Error obteniendo URL pública del PDF",
      error: null,
    };
  }

  return {
    ok: true,
    mensaje: "PDF subido correctamente",
    url: data.publicUrl,
  };
}
