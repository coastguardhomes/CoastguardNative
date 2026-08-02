import { supabase } from "../lib/supabase";

/**
 * Sube un PDF a Supabase y guarda su URL en la inspección
 * CoastGuard versión optimizada
 */
export async function guardarPDFEnInspeccion(id, pdfBlob) {
  if (!id || !pdfBlob) {
    throw new Error("ID o PDF inválido");
  }

  // Validación robusta del PDF
  const esPDF =
    pdfBlob.type === "application/pdf" ||
    pdfBlob.type === "" || // Android/iOS a veces no envían type
    pdfBlob.name?.endsWith(".pdf");

  if (!esPDF) {
    throw new Error("El archivo no es un PDF válido");
  }

  // Verificar que la inspección existe
  const { data: inspeccionExiste, error: existeError } = await supabase
    .from("inspecciones")
    .select("id, pdf_url")
    .eq("id", id)
    .single();

  if (existeError || !inspeccionExiste) {
    throw new Error("La inspección no existe");
  }

  const filePath = `inspecciones/${id}.pdf`;

  // Si ya existe un PDF, evitar subirlo de nuevo
  if (inspeccionExiste.pdf_url) {
    return {
      ok: true,
      id,
      url: inspeccionExiste.pdf_url,
      filePath,
      mensaje: "PDF ya existía, no se subió de nuevo",
    };
  }

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
    .update({
      pdf_url: publicUrl,
      firmado_en: new Date().toISOString(), // opcional
    })
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
