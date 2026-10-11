
import { supabase } from "../lib/supabase";

/**
 * Sube un PDF a Supabase y guarda su ruta en la inspección.
 * Compatible con WEB + APP.
 *
 * Guarda la ruta interna en pdf_url para permitir que el bucket
 * sea privado. Devuelve signedUrl como enlace temporal de acceso.
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

  // Comprobar la firma real del PDF: %PDF-.
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

  // Guardar la ruta interna, no una URL pública.
  // No incluir firmado_en: esa columna no existe en inspecciones.
  const {
    data: inspeccionActualizada,
    error: updateError,
  } = await supabase
    .from("inspecciones")
    .update({
      pdf_url: filePath,
    })
    .eq("id", inspeccionId)
    .select("id, pdf_url")
    .maybeSingle();

  if (updateError || !inspeccionActualizada) {
    // Intentar eliminar el archivo si no se pudo guardar
    // su referencia en la inspección.
    try {
      const { error: cleanupError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (cleanupError) {
        console.warn(
          "No se pudo limpiar el PDF subido:",
          cleanupError.message
        );
      }
    } catch (errorLimpieza) {
      console.warn(
        "Error al intentar limpiar el PDF subido:",
        errorLimpieza
      );
    }

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

  // Crear un enlace temporal para consultar el PDF.
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
    // Se conserva la propiedad url para el llamador existente,
    // pero ahora contiene la ruta interna del archivo.
    url: filePath,
    signedUrl,
    id: inspeccionId,
    filePath,
    mime: "application/pdf",
  };
}
