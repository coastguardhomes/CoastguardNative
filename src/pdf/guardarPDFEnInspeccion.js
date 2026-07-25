import { supabase } from "../lib/supabase";

export async function guardarPDFEnInspeccion(id, pdfBlob) {
  if (!id || !pdfBlob) {
    throw new Error("ID o PDF inválido");
  }

  if (pdfBlob.type !== "application/pdf") {
    throw new Error("El archivo no es un PDF válido");
  }

  // Verificar que la inspección existe
  const { data: inspeccionExiste } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("id", id)
    .single();

  if (!inspeccionExiste) {
    throw new Error("La inspección no existe");
  }

  const filePath = `inspecciones/${id}.pdf`;

  // SUBIR PDF
  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(filePath, pdfBlob, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "3600",
    });

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

  return {
    ok: true,
    id,
    url: publicUrl,
    filePath,
  };
}
