import { supabase } from "../lib/supabase";

/**
 * Guarda la URL del PDF en una inspección
 * Versión estable WEB + APP (2026) - Corregida para permitir actualizaciones
 */
export async function guardarURL(inspeccionId, url) {
  if (!inspeccionId || !url) {
    return {
      ok: false,
      mensaje: "ID o URL inválidos",
      error: "Parámetros incompletos",
    };
  }

  // Validación robusta de URL PDF (soporta dominios de Supabase y extensiones .pdf)
  const esPDF =
    typeof url === "string" &&
    (url.includes(".pdf") || url.includes("supabase.co") || url.startsWith("http"));

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
    .select("id")
    .eq("id", inspeccionId)
    .single();

  if (existeError || !existe) {
    return {
      ok: false,
      mensaje: "La inspección no existe",
      error: existeError?.message || JSON.stringify(existeError),
    };
  }

  // Guardar URL + fecha de firmado (permitiendo actualizar si se regenera el PDF)
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
