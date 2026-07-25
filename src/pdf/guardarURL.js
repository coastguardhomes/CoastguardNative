import { supabase } from "../lib/supabase";

export async function guardarURL(inspeccionId, url) {
  if (!inspeccionId || !url) {
    return {
      ok: false,
      mensaje: "ID o URL inválidos",
      error: "Parámetros incompletos",
    };
  }

  // Verificar que la inspección existe
  const { data: existe, error: existeError } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("id", inspeccionId)
    .single();

  if (existeError || !existe) {
    return {
      ok: false,
      mensaje: "La inspección no existe",
      error: existeError?.message || "No encontrada",
    };
  }

  // Guardar URL
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
