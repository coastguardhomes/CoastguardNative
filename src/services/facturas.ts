import { supabase } from "./supabase";

export async function obtenerFactura(facturaId) {
  const { data, error } = await supabase
    .from("facturas")
    .select("*")
    .eq("id", facturaId)
    .single();

  if (error) throw error;
  return data;
}
