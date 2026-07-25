import { supabase } from "../supabaseClient";

export async function cargarFotosInspeccion(inspeccionId) {
  if (!inspeccionId) return [];

  const { data, error } = await supabase
    .from("fotos_inspeccion")
    .select("url")
    .eq("inspeccion_id", inspeccionId)
    .order("id", { ascending: false });

  if (error || !data) return [];

  return data.map(f => f.url);
}
