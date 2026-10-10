import { supabase } from "./supabase";

/**
 * Devuelve la URL pública de un archivo.
 *
 * Se conserva por compatibilidad con componentes antiguos.
 * No utilizar para archivos que deban permanecer privados.
 */
export function resolverUrlPdf(valor, bucket = "pdfs") {
  if (!valor || typeof valor !== "string") return null;

  const valorLimpio = valor.trim();

  if (!valorLimpio) return null;

  if (/^https?:\/\//i.test(valorLimpio)) {
    return valorLimpio;
  }

  let ruta = valorLimpio.replace(/^\/+/, "");

  if (ruta.startsWith(`${bucket}/`)) {
    ruta = ruta.slice(bucket.length + 1);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(ruta);

  return data?.publicUrl || null;
}

/**
 * Genera una URL temporal para un objeto de Supabase Storage.
 *
 * Admite:
 * - Rutas relativas dentro de un bucket.
 * - URL públicas antiguas de Supabase Storage.
 * - URL firmadas antiguas de Supabase Storage.
 * - URL autenticadas de Supabase Storage.
 * - URL externas, que se conservan sin modificarlas.
 *
 * La firma temporal solo funcionará si el usuario actual tiene
 * permisos de lectura sobre el objeto.
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

  if (/^https?:\/\//i.test(valorLimpio)) {
    let url;

    try {
      url = new URL(valorLimpio);
    } catch {
      return null;
    }

    const coincidencia = url.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i
    );

    // Conservar enlaces externos que no sean de objetos de Storage.
    if (!coincidencia) {
      return valorLimpio;
    }

    try {
      bucketArchivo = decodeURIComponent(coincidencia[1]);

      // No decodificar la ruta completa: podría contener barras
      // codificadas que forman parte del nombre de un objeto.
      rutaArchivo = coincidencia[2]
        .split("/")
        .map((segmento) => decodeURIComponent(segmento))
        .join("/");
    } catch {
      return null;
    }
  } else {
    rutaArchivo = valorLimpio.replace(/^\/+/, "");

    if (rutaArchivo.startsWith(`${bucketArchivo}/`)) {
      rutaArchivo = rutaArchivo.slice(bucketArchivo.length + 1);
    }
  }

  if (!bucketArchivo || !rutaArchivo) {
    return null;
  }

  const duracion = Number(expiresIn);

  if (
    !Number.isFinite(duracion) ||
    duracion < 1 ||
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
      "Error generando URL temporal de Storage:",
      error.message
    );

    return null;
  }

  return data?.signedUrl || null;
}
