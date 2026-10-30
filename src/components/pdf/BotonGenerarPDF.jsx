import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";

/**
 * Botón reutilizable para generar y guardar documentos PDF.
 *
 * Inspecciones:
 * - Genera el PDF con los datos actuales.
 * - Carga las fotografías mediante URL temporales.
 * - Guarda el documento en el bucket privado "pdfs".
 * - Actualiza inspecciones.pdf_url con la ruta interna.
 * - Comprueba que la referencia quedó guardada.
 *
 * Contratos:
 * - Mantiene la generación mediante la función contrato-pdf.
 */
export default function BotonGenerarPDF({
  id,
  tipo = "inspeccion",
  onGenerado,
}) {
  const [loading, setLoading] = useState(false);

  async function limpiarPDFSubido(filePath) {
    if (!filePath) return;

    try {
      const { error } = await supabase.storage
        .from("pdfs")
        .remove([filePath]);

      if (error) {
        console.warn(
          "No se pudo eliminar el PDF sobrante:",
          error.message
        );
      }
    } catch (errorLimpieza) {
      console.warn(
        "Error al limpiar el PDF sobrante:",
        errorLimpieza
      );
    }
  }

  async function generarPDFInspeccion() {
    const identificador = String(id).trim();

    // 1. Obtener los datos actuales de la inspección.
    const {
      data: inspeccion,
      error: inspeccionError,
    } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", identificador)
      .maybeSingle();

    if (inspeccionError || !inspeccion) {
      throw new Error(
        inspeccionError?.message ||
          "No se encontró la inspección."
      );
    }

    // Evitar generar informes para inspecciones que no
    // hayan sido completadas por el técnico.
    if (
      inspeccion.estado !== "completada_tecnico" ||
      inspeccion.estado_tecnico !== "completada"
    ) {
      throw new Error(
        "La inspección no está completada por el técnico o ya no está pendiente de revisión."
      );
    }

    // 2. Cargar las fotografías.
    // cargarFotosInspeccion resuelve las rutas privadas
    // mediante enlaces temporales de Storage.
    const fotos = await cargarFotosInspeccion(identificador);

    // 3. Generar el documento.
    const blob = await generarPDFCliente({
      ...inspeccion,
      fotos,
    });

    if (
      !blob ||
      typeof blob.size !== "number" ||
      blob.size === 0 ||
      blob.type !== "application/pdf"
    ) {
      throw new Error(
        "El PDF generado está vacío o no tiene un formato válido."
      );
    }

    // 4. Subir el PDF al bucket privado.
    const filePath =
      `inspecciones/inspeccion_${identificador}_${Date.now()}.pdf`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("pdfs")
      .upload(filePath, blob, {
        contentType: "application/pdf",
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(
        `Error al guardar el PDF en Storage: ${uploadError.message}`
      );
    }

    try {
      // 5. Crear enlace temporal para comprobar que el
      // archivo puede consultarse con los permisos actuales.
      const {
        data: signedData,
        error: signedError,
      } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(filePath, 3600);

      if (signedError || !signedData?.signedUrl) {
        throw new Error(
          signedError?.message ||
            "El archivo se guardó, pero no se pudo crear el enlace temporal."
        );
      }

      // 6. Guardar la ruta interna, nunca una URL pública.
      const {
        data: inspeccionActualizada,
        error: updateError,
      } = await supabase
        .from("inspecciones")
        .update({
          pdf_url: filePath,
        })
        .eq("id", identificador)
        .eq("estado", "completada_tecnico")
        .eq("estado_tecnico", "completada")
        .select("id, pdf_url")
        .maybeSingle();

      if (updateError || !inspeccionActualizada) {
        throw new Error(
          updateError?.message ||
            "El PDF se subió, pero no se pudo guardar su referencia. La inspección no debe publicarse."
        );
      }

      if (
        inspeccionActualizada.pdf_url !== filePath
      ) {
        throw new Error(
          "La base de datos no confirmó la ruta del PDF guardado."
        );
      }

      // 7. Comprobar de nuevo que la ruta está registrada.
      const {
        data: comprobacion,
        error: comprobacionError,
      } = await supabase
        .from("inspecciones")
        .select("id, pdf_url")
        .eq("id", identificador)
        .maybeSingle();

      if (
        comprobacionError ||
        !comprobacion ||
        comprobacion.pdf_url !== filePath
      ) {
        throw new Error(
          comprobacionError?.message ||
            "No se pudo verificar que el PDF quedó registrado en la inspección."
        );
      }

      // 8. Esperar a que la pantalla administrativa
      // actualice su estado antes de confirmar el proceso.
      if (typeof onGenerado === "function") {
        await onGenerado(signedData.signedUrl);
      }

      alert(
        "PDF generado, guardado y registrado correctamente."
      );
    } catch (error) {
      // Eliminar únicamente el archivo recién subido si
      // el proceso posterior no pudo completarse.
      // Nunca se elimina el PDF anterior.
      await limpiarPDFSubido(filePath);
      throw error;
    }
  }

  async function generarPDFContrato() {
    // 1. Comprobar que el contrato existe.
    const {
      data: contrato,
      error: contratoError,
    } = await supabase
      .from("contratos")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (contratoError || !contrato) {
      throw new Error(
        contratoError?.message ||
          "No se encontró el contrato."
      );
    }

    // 2. Mantener la función de generación existente.
    const {
      data: resultado,
      error: funcionError,
    } = await supabase.functions.invoke("contrato-pdf", {
      body: {
        contratoId: Number(id),
        contrato_id: Number(id),
        id: Number(id),
      },
    });

    if (funcionError) {
      throw new Error(
        funcionError.message ||
          "No se pudo generar el contrato."
      );
    }

    if (resultado?.error) {
      throw new Error(resultado.error);
    }

    const urlContrato =
      resultado?.url ||
      resultado?.pdf_url ||
      resultado?.pdfUrl;

    if (!urlContrato) {
      throw new Error(
        "La función de contratos no devolvió la referencia del documento."
      );
    }

    if (typeof onGenerado === "function") {
      await onGenerado(urlContrato);
    }

    alert(
      "Contrato generado y guardado correctamente."
    );
  }

  async function handlePDF() {
    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {
      alert(
        "Falta el identificador del registro."
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (tipo === "inspeccion") {
        await generarPDFInspeccion();
      } else if (tipo === "contrato") {
        await generarPDFContrato();
      } else {
        throw new Error(
          `Tipo de documento no válido: ${tipo}`
        );
      }
    } catch (error) {
      console.error(
        "Error generando documento PDF:",
        error
      );

      alert(
        `No se pudo generar el documento: ${
          error?.message || "Error desconocido."
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="cg-btn cg-btn-accent w-full mt-4"
      disabled={loading}
      onClick={handlePDF}
    >
      {loading
        ? "Generando PDF..."
        : tipo === "contrato"
          ? "Generar PDF / Ver Contrato"
          : "Generar PDF"}
    </button>
  );
}
