import { supabase } from "../supabaseClient";

export async function guardarURL(inspeccionId, url) {
  await supabase
    .from("inspecciones")
    .update({ pdf_url: url })
    .eq("id", inspeccionId);
}
