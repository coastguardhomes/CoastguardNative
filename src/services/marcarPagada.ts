import supabase from "../lib/supabaseClient";

export async function marcarPagada(facturaId: string) {
  const { data, error } = await supabase.functions.invoke("marcar-pagada", {
    body: { facturaId },
  });

  if (error) {
    console.error("Error al marcar pagada:", error);
    return null;
  }

  return data;
}
