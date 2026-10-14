
import { supabase } from "./supabase";
import { resolverUrlPdfSegura } from "./urlPdf";

/**
 * Carga las fotografías asociadas a una inspección y devuelve
 * sus URL listas para mostrarse o incluirse en el PDF.
 *
 * Consulta las dos tablas históricas de fotografías y también
 * el campo fotos de la inspección.
 */
export async function cargarFotosInspeccion(inspeccionId) {
  if (
    inspeccionId === null ||
    inspeccionId === undefined ||
    String(inspeccionId).trim() === ""
  ) {
    return [];
  }

  const id = String(inspeccionId).trim();

  const [resultadoInspeccion, resultadoFotosInspeccion, resultadoFotos] =
    await Promise.all([
      supabase
        .from("inspecciones")
        .select("fotos")
        .eq("id", id)
        .maybeSingle(),

      supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", id),

      supabase
        .from("fotos")
        .select("*")
        .eq("inspeccion_id", id),
    ]);

  const errores = [
    resultadoInspeccion.error,
    resultadoFotosInspeccion.error,
    resultadoFotos.error,
  ].filter(Boolean);

  if (errores.length === 3) {
    console.error(
      "No se pudieron consultar las fotografías de la inspección:",
      errores
    );
    return [];
  }

  const referencias = [];

  const agregarReferencia = (valor, bucket = "fotos") => {
    if (!valor) return;

    if (typeof valor === "string") {
      const referencia = valor.trim();

      if (referencia) {
        referencias.push({ valor: referencia, bucket });
      }

      return;
    }

    if (Array.isArray(valor)) {
      valor.forEach((elemento) => agregarReferencia(elemento, bucket));
      return;
    }

    if (typeof valor === "object") {
      const bucketReferencia =
        valor.bucket ||
        valor.bucket_id ||
        valor.bucketId ||
        bucket;

      const referencia =
        valor.url ||
        valor.archivo ||
        valor.url_foto ||
        valor.foto_url ||
        valor.url_storage_o_path ||
        valor.path ||
        valor.ruta ||
        valor.name;

      if (typeof referencia === "string" && referencia.trim()) {
        referencias.push({
          valor: referencia.trim(),
          bucket: bucketReferencia,
        });
      }
    }
  };

  if (!resultadoInspeccion.error) {
    agregarReferencia(resultadoInspeccion.data?.fotos, "fotos");
  }

  if (!resultadoFotosInspeccion.error) {
    (resultadoFotosInspeccion.data || []).forEach((foto) => {
      agregarReferencia(foto.archivo || foto.url, "fotos");
    });
  }

  if (!resultadoFotos.error) {
    (resultadoFotos.data || []).forEach((foto) => {
      agregarReferencia(foto.url, "fotos");
    });
  }

  const referenciasUnicas = [];
  const vistas = new Set();

  for (const referencia of referencias) {
    const clave = `${referencia.bucket}:${referencia.valor}`;

    if (!vistas.has(clave)) {
      vistas.add(clave);
      referenciasUnicas.push(referencia);
    }
  }

  const urls = await Promise.all(
    referenciasUnicas.map(async ({ valor, bucket }) => {
      try {
        const url = await resolverUrlPdfSegura(valor, bucket, 3600);
        return typeof url === "string" && url.trim() ? url : null;
      } catch (error) {
        console.error(
          "No se pudo resolver una fotografía de la inspección:",
          error
        );
        return null;
      }
    })
  );

  return [...new Set(urls.filter(Boolean))];
}

export default cargarFotosInspeccion;
