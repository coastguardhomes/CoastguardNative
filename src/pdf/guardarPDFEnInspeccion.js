
import { supabase } from "../lib/supabase";

const BUCKET_PDFS = "pdfs";

/**
 * Sube un PDF de inspección a Storage y guarda su ruta interna.
 * Compatible con un bucket privado.
 */
export async function guardarPDFEnInspeccion(id, pdfBlob) {
  if (
    id === null ||
    id === undefined ||
    String(id).trim() === "" ||
    !pdfBlob
  ) {
    throw new Error("ID o PDF inválido");
  }

  if (
    typeof pdfBlob.slice !== "function" ||
    typeof pdfBlob.size !== "number" ||
    pdfBlob.size < 8
  ) {
    throw new Error("El archivo PDF está vacío o no es válido");
  }

  // Verificar la cabecera real del PDF, incluso si el MIME está vacío.
  let cabecera;

  try {
    cabecera = new Uint8Array(
      await pdfBlob.slice(0, 5).arrayBuffer()
    );
  } catch {
    throw new Error("No se pudo comprobar el formato del PDF");
  }

  const firmaPDF =
    cabecera.length === 5 &&
    cabecera[0] === 0x25 &&
    cabecera[1] === 0x50 &&
    cabecera[2] === 0x44 &&
    cabecera[3] === 0x46 &&
    cabecera[4] === 0x2d;

  if (!firmaPDF) {
    throw new Error("El archivo no contiene una cabecera PDF válida");
  }

  // Comprobar que existe la inspección y que el usuario puede consultarla.
  const { data: inspeccionExiste, error: existeError } =
    await supabase
      .from("inspecciones")
      .select("id")
      .eq("id", id)
      .maybeSingle();

  if (existeError) {
    throw new Error(
      "No se pudo comprobar la inspección: " +
        existeError.message
    );
  }

  if (!inspeccionExiste) {
    throw new Error(
      "La inspección no existe o no tienes permiso para acceder a ella"
    );
  }

  const filePath =
    `inspecciones/inspeccion_${id}_${Date.now()}.pdf`;

  // Subir el PDF sin sobrescribir archivos anteriores.
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_PDFS)
    .upload(filePath, pdfBlob, {
      upsert: false,
      contentType: "application/pdf",
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(
      "Error subiendo PDF: " + uploadError.message
    );
  }

  try {
    // Generar un enlace temporal para abrir el PDF privado.
    const { data: signedData, error: signedError } =
      await supabase.storage
        .from(BUCKET_PDFS)
        .createSignedUrl(filePath, 3600);

    if (signedError || !signedData?.signedUrl) {
      throw new Error(
        "El PDF se subió, pero no se pudo crear el enlace temporal: " +
          (signedError?.message || "respuesta vacía de Storage")
      );
    }

    // Guardar la ruta, nunca una URL pública o temporal.
    const { data: actualizada, error: updateError } =
      await supabase
        .from("inspecciones")
        .update({ pdf_url: filePath })
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (updateError) {
      throw new Error(
        "El PDF se subió, pero no se pudo guardar la ruta: " +
          updateError.message
      );
    }

    if (!actualizada) {
      throw new Error(
        "El PDF se subió, pero la base de datos no confirmó la actualización. Comprueba los permisos antes de volver a generarlo."
      );
    }

    return {
      ok: true,
      id,
      url: signedData.signedUrl,
      filePath,
      mime: "application/pdf",
    };
  } catch (error) {
    // Limpiar únicamente el archivo creado por esta operación fallida.
    const { error: removeError } = await supabase.storage
      .from(BUCKET_PDFS)
      .remove([filePath]);

    if (removeError) {
      console.error(
        "No se pudo limpiar el PDF recién subido:",
        removeError.message
      );
    }

    throw error;
  }
}
