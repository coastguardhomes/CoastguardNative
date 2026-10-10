import { supabase } from "./supabase";

/**
 * Devuelve una URL abrible para un `pdf_url` guardado en la base de datos.
 *
 * Esta función se mantiene para no romper los componentes que todavía
 * dependen de ella. No genera enlaces seguros para buckets privados.
 */
export function resolverUrlPdf(valor, bucket = "pdfs") {
  if (!valor || typeof valor !== "string") return null;

  const valorLimpio = valor.trim();
  if (!valorLimpio) return null;

  // Mantener el comportamiento anterior para las URL absolutas.
  if (/^https?:\/\//i.test(valorLimpio)) {
    return valorLimpio;
  }

  const ruta = valorLimpio.replace(/^\/+/, "");

  // Permitir valores que incluyan el nombre del bucket al principio.
  const rutaArchivo = ruta.startsWith(`${bucket}/`)
    ? ruta.slice(bucket.length + 1)
    : ruta;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(rutaArchivo);

  return data?.publicUrl || null;
}

/**
 * Genera una URL temporal para abrir un archivo de Storage.
 *
 * Acepta:
 * - Una ruta relativa dentro del bucket.
 * - Una URL pública antigua de Supabase Storage.
 * - Una URL firmada antigua de Supabase Storage.
 * - Una URL externa que no pertenezca a Supabase Storage.
 *
 * Para los archivos de Supabase, intenta generar una URL firmada nueva.
 * Para una URL externa, conserva la dirección original.
 *
 * IMPORTANTE:
 * La creación de una URL firmada requiere que el usuario tenga permisos
 * de lectura sobre el objeto según las políticas de Storage.
 */
export async function resolverUrlPdfSegura(
  valor,
  bucket = "pdfs",
  expiresIn = 3600
) {
  if (!valor || typeof valor !== "string") {
    return null;
  }

  const valorLimpio = valor.trim();

  if (!valorLimpio) {
    return null;
  }

  let bucketArchivo = bucket;
  let rutaArchivo = valorLimpio;
  let esStorageSupabase = false;

  if (/^https?:\/\//i.test(valorLimpio)) {
    let url;

    try {
      url = new URL(valorLimpio);
    } catch {
      return null;
    }

    /*
     * Reconoce las URL de objetos de Supabase Storage:
     * /storage/v1/object/public/BUCKET/RUTA
     * /storage/v1/object/sign/BUCKET/RUTA
     * /storage/v1/object/authenticated/BUCKET/RUTA
     */
    const coincidencia = url.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i
    );

    if (!coincidencia) {
      // No es una URL de objeto de Storage: conservarla como externa.
      return valorLimpio;
    }

    try {
      bucketArchivo = decodeURIComponent(coincidencia[1]);
      rutaArchivo = decodeURIComponent(coincidencia[2]);
    } catch {
      return null;
    }

    esStorageSupabase = true;
  } else {
    rutaArchivo = valorLimpio.replace(/^\/+/, "");

    /*
     * Algunas versiones guardaban el bucket junto con la ruta.
     * Si coincide con el bucket solicitado, quitar ese prefijo.
     */
    if (rutaArchivo.startsWith(`${bucketArchivo}/`)) {
      rutaArchivo = rutaArchivo.slice(bucketArchivo.length + 1);
    }

    esStorageSupabase = true;
  }

  if (!esStorageSupabase || !bucketArchivo || !rutaArchivo) {
    return null;
  }

  const duracion = Number(expiresIn);

  if (
    !Number.isFinite(duracion) ||
    duracion <= 0 ||
    duracion > 604800
  ) {
    throw new Error(
      "La duración del enlace debe estar entre 1 y 604800 segundos."
    );
  }

  const { data, error } = await supabase.storage
    .from(bucketArchivo)
    .createSignedUrl(rutaArchivo, Math.floor(duracion));

  if (error) {
    console.error(
      "Error generando URL segura del PDF:",
      error.message
    );

    return null;
  }

  return data?.signedUrl || null;
}
