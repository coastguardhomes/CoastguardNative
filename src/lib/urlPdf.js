
import { supabase } from "./supabase";

/**
 * Resuelve una ruta o URL antigua de Storage mediante una URL firmada.
 *
 * Mantiene compatibilidad con la API anterior.
 */
export async function resolverUrlPdf(
  valor,
  bucket = "pdfs",
  expiresIn = 3600
) {
  return resolverUrlPdfSegura(valor, bucket, expiresIn);
}

/**
 * Genera una URL temporal de Supabase Storage.
 *
 * Admite:
 * - Rutas relativas dentro de un bucket.
 * - Rutas que incluyen el nombre del bucket como carpeta.
 * - URL antiguas públicas de Storage.
 * - URL antiguas firmadas o autenticadas de Storage.
 * - URL externas que no sean de Supabase Storage.
 *
 * IMPORTANTE:
 * Primero intenta siempre la ruta exacta.
 * Algunas rutas contienen el nombre del bucket como
 * una carpeta real dentro del almacenamiento.
 */
export async function resolverUrlPdfSegura(
  valor,
  bucket = "pdfs",
  expiresIn = 3600
) {
  if (
    !valor ||
    typeof valor !== "string" ||
    typeof bucket !== "string" ||
    !bucket.trim()
  ) {
    return null;
  }

  const valorLimpio = valor.trim();
  const bucketPredeterminado = bucket.trim();

  if (!valorLimpio) {
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

  let bucketArchivo = bucketPredeterminado;
  let rutaArchivo = valorLimpio;
  let esUrlStorage = false;

  if (/^https?:\/\//i.test(valorLimpio)) {
    let url;
    let urlProyecto;

    try {
      url = new URL(valorLimpio);
      urlProyecto = new URL(
        import.meta.env.VITE_SUPABASE_URL
      );
    } catch {
      return null;
    }

    if (
      url.origin !== urlProyecto.origin ||
      url.username ||
      url.password
    ) {
      if (
        /\/storage\/v1\/object\/(?:public|sign|authenticated)\//i.test(
          url.pathname
        )
      ) {
        return null;
      }

      return valorLimpio;
    }

    const coincidencia = url.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i
    );

    if (!coincidencia) {
      return valorLimpio;
    }

    try {
      bucketArchivo = decodeURIComponent(
        coincidencia[1]
      );

      rutaArchivo = coincidencia[2]
        .split("/")
        .map((segmento) =>
          decodeURIComponent(segmento)
        )
        .join("/");

      esUrlStorage = true;
    } catch {
      return null;
    }
  } else {
    rutaArchivo = valorLimpio.replace(/^\/+/, "");
  }

  if (
    !bucketArchivo ||
    !rutaArchivo ||
    !rutaArchivo.trim()
  ) {
    return null;
  }

  /*
   * Orden de resolución:
   *
   * 1. Ruta exacta tal como está guardada.
   * 2. Ruta sin el prefijo del bucket, únicamente
   *    como compatibilidad con referencias antiguas.
   *
   * No se elimina el prefijo antes del primer intento,
   * porque puede ser una carpeta real del archivo.
   */
  const rutasIntento = [rutaArchivo];

  if (
    !esUrlStorage &&
    rutaArchivo.startsWith(`${bucketArchivo}/`)
  ) {
    const rutaAntigua = rutaArchivo.slice(
      bucketArchivo.length + 1
    );

    if (
      rutaAntigua &&
      rutaAntigua !== rutaArchivo
    ) {
      rutasIntento.push(rutaAntigua);
    }
  }

  let ultimoError = null;

  for (const ruta of rutasIntento) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketArchivo)
        .createSignedUrl(
          ruta,
          Math.floor(duracion)
        );

      if (error) {
        ultimoError = error;
        continue;
      }

      if (data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (error) {
      ultimoError = error;
    }
  }

  console.error(
    "No se pudo generar una URL temporal de Storage:",
    {
      bucket: bucketArchivo,
      rutasIntentadas: rutasIntento,
      error: ultimoError?.message || null,
    }
  );

  return null;
}
