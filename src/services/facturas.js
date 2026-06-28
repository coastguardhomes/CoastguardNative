import { supabase } from "../supabaseClient";

export async function obtenerFactura(id) {
  const { data, error } = await supabase
    .from("facturas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
