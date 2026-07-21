import { supabase } from "../supabaseClient";

export async function guardarURL(inspeccionId, url) {
  if (!inspeccionId || !url) {
    return {
      ok: false,
      mensaje: "ID o URL inválidos",
      error: "Parámetros incompletos",
    };
  }

  const { error } = await supabase
    .from("inspecciones")
    .update({ pdf_url: url })
    .eq("id", inspeccionId);

  if (error) {
    return {
      ok: false,
      mensaje: "Error guardando URL del PDF",
      error: error.message || error,
    };
  }

  return {
    ok: true,
    mensaje: "URL del PDF guardada correctamente",
    url,
  };
}
