import { supabase } from "../../supabaseClient";

export async function obtenerfactura(id) {
  const { data, error } = await supabase
    .from("facturas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
