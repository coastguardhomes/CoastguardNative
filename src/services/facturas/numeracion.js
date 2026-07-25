import { supabase } from "../../supabaseClient";

export async function generarNumeroFactura() {
  const { data, error } = await supabase
    .from("facturas")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (error) return "CG-000001";

  const ultimoId = data.length ? data[0].id : 0;
  const nuevo = ultimoId + 1;

  return `CG-${String(nuevo).padStart(6, "0")}`;
}
