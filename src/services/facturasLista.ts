import { supabase } from "./supabase";

export async function obtenerFacturas() {
  const { data, error } = await supabase
    .from("facturas")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}
