import { supabase } from "../lib/supabase";

/**
 * Sube un PDF a Supabase y guarda su URL en la inspección.
 * Compatible con WEB + APP.
 *
 * Mantiene `url` con el formato antiguo para no romper los
 * componentes existentes y devuelve `signedUrl` como alternativa
 * temporal para acceder al PDF cuando el bucket sea privado.
 */
export async function subirPDF(inspeccionId, pdfBlob) {
  if (!inspeccionId || !pdfBlob) {
    return {
      ok: false,
      mensaje: "ID o PDF inválidos",
      error: "Parámetros incompletos",
    };
  }

  // Comprobar que el archivo tiene contenido.
  if (
    typeof pdfBlob.size !== "number" ||
    pdfBlob.size < 8 ||
    typeof pdfBlob.slice !== "function"
  ) {
    return {
      ok: false,
      mensaje: "El archivo no es un PDF válido",
      error: "Archivo vacío o inválido",
    };
  }

  // Comprobar la firma real del PDF: %PDF-
  // También permite archivos móviles cuyo MIME viene vacío.
  let firmaPDFValida = false;

  try {
    const primerosBytes = pdfBlob.slice(0, 5);

    if (typeof primerosBytes.text === "function") {
      firmaPDFValida =
        (await primerosBytes.text()) === "%PDF-";
    } else if (
      typeof primerosBytes.arrayBuffer === "function"
    ) {
      const bytes = new Uint8Array(
        await primerosBytes.arrayBuffer()
      );

      firmaPDFValida =
        bytes.length === 5 &&
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46 &&
        bytes[4] === 0x2d;
    }
  } catch (errorValidacion) {
    console.error(
      "Error validando el PDF:",
      errorValidacion
    );
  }

  if (!firmaPDFValida) {
    return {
      ok: false,
      mensaje: "El archivo no es un PDF válido",
      error: "La firma del archivo no corresponde a un PDF",
    };
  }

  // Verificar que la inspección existe.
  const {
    data: inspeccion,
    error: inspeccionError,
  } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("id", inspeccionId)
    .maybeSingle();

  if (inspeccionError || !inspeccion) {
    return {
      ok: false,
      mensaje: "La inspección no existe",
      error:
        inspeccionError?.message ||
        "No se encontró la inspección",
    };
  }

  const bucket = "pdfs";

  // Mantener nombres únicos para evitar conflictos de caché.
  const filePath =
    `inspecciones/inspeccion_${inspeccionId}_${Date.now()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    return {
      ok: false,
      mensaje: "Error subiendo PDF",
      error:
        uploadError.message ||
        "Error de almacenamiento",
    };
  }

  // Mantener el formato antiguo de la URL guardada.
  // Generar esta URL no hace público un bucket privado.
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  const publicUrl = urlData?.publicUrl;

  if (!publicUrl) {
    return {
      ok: false,
      mensaje: "Error obteniendo la URL del PDF",
      error: "Supabase no devolvió una URL válida",
      filePath,
    };
  }

  // Guardar pdf_url para conservar la compatibilidad existente.
  // No incluir firmado_en: esa columna no existe en inspecciones.
  const { data: inspeccionActualizada, error: updateError } =
    await supabase
      .from("inspecciones")
      .update({
        pdf_url: publicUrl,
      })
      .eq("id", inspeccionId)
      .select("id, pdf_url")
      .maybeSingle();

  if (updateError || !inspeccionActualizada) {
    return {
      ok: false,
      mensaje:
        "PDF subido, pero no se pudo confirmar el guardado en la inspección",
      error:
        updateError?.message ||
        "La base de datos no confirmó la actualización. Comprueba los permisos de la inspección.",
      filePath,
    };
  }

  // Intentar generar un enlace temporal para el bucket privado.
  // Es adicional: no cambia el valor de `url` que esperan
  // los componentes existentes.
  let signedUrl = null;

  try {
    const {
      data: signedData,
      error: signedError,
    } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);

    if (signedError) {
      console.warn(
        "El PDF se guardó, pero no se pudo generar el enlace temporal:",
        signedError.message
      );
    } else {
      signedUrl = signedData?.signedUrl || null;
    }
  } catch (errorFirma) {
    console.warn(
      "No se pudo generar el enlace temporal del PDF:",
      errorFirma
    );
  }

  return {
    ok: true,
    mensaje: "PDF subido y guardado correctamente",
    url: publicUrl,
    signedUrl,
    id: inspeccionId,
    filePath,
    mime: "application/pdf",
  };
}
