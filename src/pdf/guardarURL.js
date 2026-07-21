import { supabase } from "../supabaseClient";

export async function guardarURL(inspeccionId, url) {
  const { error } = await supabase
    .from("inspecciones")
    .update({ pdf_url: url })
    .eq("id", inspeccionId);

  if (error) {
    return {
      ok: false,
      mensaje: "Error guardando URL del PDF",
      error,
    };
  }

  return {
    ok: true,
    mensaje: "URL del PDF guardada correctamente",
  };
}
