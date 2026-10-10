
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
    console.error("Error cargando fotos de inspección:", error);
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

        // Si falla la firma, conservar la URL original para no
        // romper la visualización mientras el bucket siga público.
        return urlSegura || foto.url || null;
      } catch (errorFirma) {
        console.error(
          "Error generando URL de la foto:",
          errorFirma
        );

        return foto.url || null;
      }
    })
  );

  return fotos.filter(Boolean);
}
