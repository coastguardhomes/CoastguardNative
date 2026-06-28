import { supabase } from "../supabaseClient";

export async function subirFacturaPDF(id, blob) {
  const { error } = await supabase.storage
    .from("facturas")
    .upload(`factura_${id}.pdf`, blob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("facturas")
    .getPublicUrl(`factura_${id}.pdf`);

  return data.publicUrl;
}
