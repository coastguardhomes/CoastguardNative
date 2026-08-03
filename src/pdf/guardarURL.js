import { supabase } from "../lib/supabase";

/**
 * Guarda la URL del PDF en una inspección
 * CoastGuard versión optimizada
 */
export async function guardarURL(inspeccionId, url) {
  if (!inspeccionId || !url) {
    return {
      ok: false,
      mensaje: "ID o URL inválidos",
      error: "Parámetros incompletos",
    };
  }

  // Validación básica de URL PDF
  const esPDF = url.endsWith(".pdf") || url.includes(".pdf?");
  if (!esPDF) {
    return {
      ok: false,
      mensaje: "La URL no parece ser un PDF válido",
      error: "Formato incorrecto",
    };
  }

  // Verificar que la inspección existe
  const { data: existe, error: existeError } = await supabase
    .from("inspecciones")
    .select("id, pdf_url")
    .eq("id", inspeccionId)
    .single();

  if (existeError || !existe) {
    return {
      ok: false,
      mensaje: "La inspección no existe",
      error: existeError?.message || "No encontrada",
    };
  }

  // Si ya tiene PDF, evitar reemplazarlo
  if (existe.pdf_url) {
    return {
      ok: true,
      mensaje: "La inspección ya tenía PDF, no se reemplazó",
      url: existe.pdf_url,
      id: inspeccionId,
    };
  }

  // Guardar URL + fecha de firmado
  const { error } = await supabase
    .from("inspecciones")
    .update({
      pdf_url: url,
      firmado_en: new Date().toISOString(),
    })
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
    id: inspeccionId,
  };
}
