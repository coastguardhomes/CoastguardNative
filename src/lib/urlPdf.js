
import { supabase } from "./supabase";

/**
 * Resuelve una ruta o URL antigua de Storage mediante una URL firmada.
 *
 * Esta función es asíncrona: debe utilizarse con await.
 * No genera URLs públicas.
 *
 * Para archivos que deban permanecer privados, el usuario autenticado
 * debe tener permiso de acceso al objeto según las políticas de Storage.
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
 * - URL antiguas públicas de Storage.
 * - URL antiguas firmadas o autenticadas de Storage.
 * - URL externas que no sean de Supabase Storage, que se conservan.
 *
 * Las URL de Storage solo se resuelven si pertenecen al proyecto
 * Supabase configurado en VITE_SUPABASE_URL.
 *
 * La firma temporal no concede permisos nuevos: el usuario actual
 * debe tener permiso para acceder al objeto.
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

    // No interpretar URLs de otros servidores como objetos
    // del proyecto Supabase actual.
    if (
      url.origin !== urlProyecto.origin ||
      url.username ||
      url.password
    ) {
      // Rechazar URLs de Storage de otros servidores.
      // Conservar enlaces externos que no sean de Storage.
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

    // Si no es una URL de objeto de Storage reconocible,
    // conservar el comportamiento anterior.
    if (!coincidencia) {
      return valorLimpio;
    }

    try {
      bucketArchivo = decodeURIComponent(coincidencia[1]);

      // Decodificar cada segmento por separado para no convertir
      // barras codificadas del nombre en separadores de ruta.
      rutaArchivo = coincidencia[2]
        .split("/")
        .map((segmento) => decodeURIComponent(segmento))
        .join("/");
    } catch {
      return null;
    }
  } else {
    // Para rutas guardadas en la base de datos.
    rutaArchivo = valorLimpio.replace(/^\/+/, "");

    // Admitir referencias con el bucket incluido al principio.
    if (rutaArchivo.startsWith(`${bucketArchivo}/`)) {
      rutaArchivo = rutaArchivo.slice(
        bucketArchivo.length + 1
      );
    }
  }

  if (
    !bucketArchivo ||
    !rutaArchivo ||
    !rutaArchivo.trim()
  ) {
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketArchivo)
      .createSignedUrl(
        rutaArchivo,
        Math.floor(duracion)
      );

    if (error) {
      console.error(
        "Error generando URL temporal de Storage:",
        error.message
      );

      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error(
      "Error inesperado generando URL temporal de Storage:",
      error
    );

    return null;
  }
}
