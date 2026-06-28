import { supabase } from "../supabaseClient";

export async function marcarPagada(id) {
  const { error } = await supabase
    .from("facturas")
    .update({ estado: "pagada" })
    .eq("id", id);

  if (error) throw error;
}
