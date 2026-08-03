import { supabase } from "../lib/supabase";

/**
 * Guarda la URL del PDF en una inspección
 * Versión estable WEB + APP (2026)
 */
export async function guardarURL(inspeccionId, url) {
  if (!inspeccionId || !url) {
    return {
      ok: false,
      mensaje: "ID o URL inválidos",
      error: "Parámetros incompletos",
    };
  }

  // Validación robusta de URL PDF (Supabase genera URLs con parámetros)
  const esPDF =
    url.includes(".pdf") || // soporta ?t=12345
    url.startsWith("https://") || // URLs públicas
    url.startsWith("http://");

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
      error: existeError?.message || JSON.stringify(existeError),
    };
  }

  // Si ya tiene PDF, evitar reemplazarlo (pero permitir override si el técnico lo necesita)
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
      error: error.message || JSON.stringify(error),
    };
  }

  return {
    ok: true,
    mensaje: "URL del PDF guardada correctamente",
    url,
    id: inspeccionId,
    mime: "application/pdf",
  };
}
