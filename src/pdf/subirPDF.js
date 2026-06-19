import { supabase } from "../supabaseClient";

export async function subirPDF(inspeccionId, pdfBlob) {
  const filePath = \`pdfs/inspeccion_\${inspeccionId}.pdf\`;

  const { error } = await supabase.storage
    .from("inspecciones")
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("inspecciones")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
