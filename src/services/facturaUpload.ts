import { supabase } from "./supabase";

export async function subirFacturaPDF(facturaId, pdfUri) {
  const pdfFile = await fetch(pdfUri).then(res => res.blob());

  const { error } = await supabase.storage
    .from("facturas")
    .upload(`factura_${facturaId}.pdf`, pdfFile, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("facturas")
    .getPublicUrl(`factura_${facturaId}.pdf`);

  return urlData.publicUrl;
}
