import { supabase } from "../lib/supabase";

/**
 * Guarda la URL o ruta del PDF en una inspección.
 * Compatible con WEB + APP.
 *
 * Mantiene el formato de respuesta existente para no romper
 * los componentes que utilizan esta función.
 */
export async function guardarURL(inspeccionId, url) {
  if (
    inspeccionId === null ||
    inspeccionId === undefined ||
    String(inspeccionId).trim() === "" ||
    typeof url !== "string" ||
    !url.trim()
  ) {
    return {
      ok: false,
      mensaje: "ID o URL inválidos",
      error: "Parámetros incompletos",
    };
  }

  const urlLimpia = url.trim();

  // Validación compatible con URLs antiguas y rutas internas
  // de archivos PDF en Supabase Storage.
  const esPDF =
    urlLimpia.toLowerCase().includes(".pdf") ||
    /^https?:\/\//i.test(urlLimpia);

  if (!esPDF) {
    return {
      ok: false,
      mensaje: "La URL no parece ser un PDF válido",
      error: "Formato incorrecto",
    };
  }

  // Verificar que la inspección existe y es accesible.
  const {
    data: existe,
    error: existeError,
  } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("id", inspeccionId)
    .maybeSingle();

  if (existeError || !existe) {
    return {
      ok: false,
      mensaje: "La inspección no existe o no es accesible",
      error:
        existeError?.message ||
        "No se encontró la inspección",
    };
  }

  // Actualizar únicamente pdf_url.
  // No se modifica firmado_en ni otras columnas.
  const {
    data: actualizada,
    error: updateError,
  } = await supabase
    .from("inspecciones")
    .update({
      pdf_url: urlLimpia,
    })
    .eq("id", inspeccionId)
    .select("id")
    .maybeSingle();

  if (updateError || !actualizada) {
    return {
      ok: false,
      mensaje: "Error guardando la URL del PDF",
      error:
        updateError?.message ||
        "La base de datos no confirmó la actualización. Comprueba los permisos de la inspección.",
    };
  }

  return {
    ok: true,
    mensaje: "URL del PDF guardada correctamente",
    url: urlLimpia,
    id: inspeccionId,
    mime: "application/pdf",
  };
}
