import { supabase } from "../lib/supabase"

export async function guardarPDFEnInspeccion(id, pdfBlob) {
  const filePath = `inspecciones/${id}.pdf`

  const { data, error } = await supabase.storage
    .from("pdfs")
    .upload(filePath, pdfBlob, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from("pdfs")
    .getPublicUrl(filePath)

  await supabase
    .from("inspecciones")
    .update({ pdf_url: urlData.publicUrl })
    .eq("id", id)

  return urlData.publicUrl
}
