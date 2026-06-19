import { supabase } from "../supabaseClient";

export async function cargarFotosInspeccion(inspeccionId) {
  const { data, error } = await supabase
    .from("fotos_inspeccion")
    .select("url")
    .eq("inspeccion_id", inspeccionId);

  if (error) return [];
  return data.map(f => f.url);
}
