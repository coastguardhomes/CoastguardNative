import { supabase } from "../../supabaseClient";

export async function enviarFacturaEmail(email, pdfUrl) {
  const { error } = await supabase.functions.invoke("enviar-factura", {
    body: { email, pdfUrl }
  });

  if (error) return false;
  return true;
}
