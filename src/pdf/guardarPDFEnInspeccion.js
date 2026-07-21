import { supabase } from "../lib/supabase";

export async function guardarPDFEnInspeccion(id, pdfBlob) {
  if (!id || !pdfBlob) {
    throw new Error("ID o PDF inválido");
  }

  const filePath = `inspecciones/${id}.pdf`;

  // SUBIR PDF
  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(filePath, pdfBlob, { upsert: true });

  if (uploadError) {
    throw new Error("Error subiendo PDF: " + uploadError.message);
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
    .update({ pdf_url: publicUrl })
    .eq("id", id);

  if (updateError) {
    throw new Error("PDF subido pero error guardando URL en inspección");
  }

  return publicUrl;
}
