Archivo completo corregido: "src/lib/cargarFotosInspeccion.js"

import { supabase } from "../supabaseClient";
import { resolverUrlPdfSegura } from "./urlPdf";

function normalizarReferencias(fila) {
  if (!fila) return [];

  const valores = [
    fila.url,
    fila.archivo,
    fila.url_foto,
    fila.foto_url,
    fila.url_storage_o_path,
    fila.path,
  ];

  return valores
    .filter((valor) => typeof valor === "string" && valor.trim())
    .map((valor) => valor.trim());
}

function obtenerBucketYRuta(valor) {
  const referencia = String(valor || "").trim();

  if (!referencia) return null;

  // Las URL completas permiten identificar el bucket original.
  if (/^https?:\/\//i.test(referencia)) {
    const coincidencia = referencia.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?.*)?$/i
    );

    if (coincidencia) {
      try {
        return {
          bucket: decodeURIComponent(coincidencia[1]),
          ruta: coincidencia[2]
            .split("/")
            .map((segmento) => decodeURIComponent(segmento))
            .join("/"),
        };
      } catch {
        return null;
      }
    }

    // Las URL externas se conservan; el resolver decidirá si son válidas.
    return {
      bucket: "fotos",
      ruta: referencia,
    };
  }

  const ruta = referencia.replace(/^\/+/, "");

  // Compatibilidad con referencias que incluyen el bucket.
  for (const bucket of ["fotos", "extras", "facturas"]) {
    if (ruta.startsWith(`${bucket}/`)) {
      return {
        bucket,
        ruta: ruta.slice(bucket.length + 1),
      };
    }
  }

  // Las fotos normales antiguas usan el bucket fotos.
  return {
    bucket: "fotos",
    ruta,
  };
}

async function consultarTabla(nombreTabla, inspeccionId) {
  const { data, error } = await supabase
    .from(nombreTabla)
    .select("*")
    .eq("inspeccion_id", String(inspeccionId));

  if (error) {
    console.warn(
      `No se pudieron consultar las fotos de ${nombreTabla}:`,
      error.message
    );
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function cargarFotosInspeccion(inspeccionId) {
  if (!inspeccionId) return [];

  try {
    // Las instalaciones anteriores han guardado referencias en ambas tablas.
    const [fotosInspeccion, fotos] = await Promise.all([
      consultarTabla("fotos_inspeccion", inspeccionId),
      consultarTabla("fotos", inspeccionId),
    ]);

    const filas = [...fotosInspeccion, ...fotos];
    const referencias = [];

    for (const fila of filas) {
      for (const referencia of normalizarReferencias(fila)) {
        referencias.push(referencia);
      }
    }

    // También se admiten referencias guardadas directamente en inspecciones.fotos.
    const { data: inspeccion, error: errorInspeccion } = await supabase
      .from("inspecciones")
      .select("fotos")
      .eq("id", inspeccionId)
      .maybeSingle();

    if (errorInspeccion) {
      console.warn(
        "No se pudieron consultar las fotos de la inspección:",
        errorInspeccion.message
      );
    } else if (Array.isArray(inspeccion?.fotos)) {
      for (const foto of inspeccion.fotos) {
        if (typeof foto === "string" && foto.trim()) {
          referencias.push(foto.trim());
        } else if (foto && typeof foto === "object") {
          referencias.push(...normalizarReferencias(foto));
        }
      }
    }

    const referenciasUnicas = [...new Set(referencias)];
    const resultados = await Promise.all(
      referenciasUnicas.map(async (referencia) => {
        const objeto = obtenerBucketYRuta(referencia);

        if (!objeto?.ruta) return null;

        try {
          const urlSegura = await resolverUrlPdfSegura(
            objeto.ruta,
            objeto.bucket,
            3600
          );

          return urlSegura || null;
        } catch (errorFirma) {
          console.warn(
            "No se pudo generar el enlace temporal de una fotografía:",
            errorFirma?.message || errorFirma
          );
          return null;
        }
      })
    );

    return resultados.filter(
      (url) => typeof url === "string" && url.length > 0
    );
  } catch (error) {
    console.error(
      "Error cargando las fotografías de la inspección:",
      error
    );
    return [];
  }
}
