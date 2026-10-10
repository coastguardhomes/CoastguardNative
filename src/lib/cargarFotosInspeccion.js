
import { supabase } from "../supabaseClient";
import { resolverUrlPdfSegura } from "./urlPdf";

export async function cargarFotosInspeccion(inspeccionId) {
  if (!inspeccionId) return [];

  const { data, error } = await supabase
    .from("fotos_inspeccion")
    .select("id, url, archivo")
    .eq("inspeccion_id", inspeccionId)
    .order("id", { ascending: false });

  if (error || !data) {
    console.error(
      "Error cargando fotos de inspección:",
      error
    );
    return [];
  }

  const fotos = await Promise.all(
    data.map(async (foto) => {
      const referencia = foto.url || foto.archivo;

      if (!referencia) return null;

      try {
        const urlSegura = await resolverUrlPdfSegura(
          referencia,
          "fotos",
          3600
        );

        if (!urlSegura) return null;

        return {
          ...foto,
          url: urlSegura,
        };
      } catch (errorFirma) {
        console.error(
          "Error generando URL temporal de la foto:",
          errorFirma
        );

        return null;
      }
    })
  );

  return fotos.filter(Boolean);
}
