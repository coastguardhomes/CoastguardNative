import { supabase } from "../supabaseClient";
import { resolverUrlPdfSegura } from "./urlPdf";

export async function cargarFotosInspeccion(inspeccionId) {
  if (!inspeccionId) return [];

  const { data, error } = await supabase
    .from("fotos_inspeccion")
    .select("url, archivo")
    .eq("inspeccion_id", inspeccionId)
    .order("id", { ascending: false });

  if (error || !data) {
    console.error(
      "Error cargando fotos de inspección:",
      error
    );
    return [];
  }

  const resultados = await Promise.all(
    data.map(async (foto) => {
      const referencia = foto.url || foto.archivo;

      if (!referencia) return null;

      try {
        const urlSegura = await resolverUrlPdfSegura(
          referencia,
          "fotos",
          3600
        );

        if (!urlSegura) {
          console.warn(
            "No se pudo generar una URL segura para una foto de inspección."
          );
          return null;
        }

        // Se mantiene el contrato original: cada elemento es una URL.
        return urlSegura;
      } catch (errorFirma) {
        console.error(
          "Error generando URL temporal de la foto:",
          errorFirma
        );
        return null;
      }
    })
  );

  return resultados.filter(
    (url) => typeof url === "string" && url.length > 0
  );
}
