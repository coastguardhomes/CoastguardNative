import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";
import { subirPDF } from "../../pdf/subirPDF";

/**
 * Botón reutilizable para generar y guardar el informe PDF de una inspección.
 *
 * Antes recibía un `elemento` del DOM y hacía una captura con html2canvas,
 * descartando después el Blob: el PDF nunca se subía y aun así avisaba de
 * "PDF generado correctamente". Ahora construye el informe con los datos de
 * la inspección y lo guarda con subirPDF, que además actualiza
 * inspecciones.pdf_url.
 */
export default function BotonGenerarPDF({ id, onGenerado }) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    if (!id) {
      alert("Falta el identificador de la inspección.");
      return;
    }

    setLoading(true);

    try {
      const { data: inspeccion, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !inspeccion) {
        throw new Error(error?.message || "No se encontró la inspección");
      }

      const blob = await generarPDFCliente({
        ...inspeccion,
        fotos: await cargarFotosInspeccion(id),
      });

      const resultado = await subirPDF(id, blob);

      if (!resultado.ok) {
        throw new Error(`${resultado.mensaje}: ${resultado.error}`);
      }

      if (onGenerado) onGenerado(resultado.url);
      alert("Informe PDF generado y guardado correctamente.");
    } catch (e) {
      console.error("Error generando PDF:", e);
      alert(`No se pudo generar el informe: ${e.message}`);
    }

    setLoading(false);
  };

  return (
    <button
      className="cg-btn cg-btn-accent w-full mt-4"
      disabled={loading}
      onClick={handlePDF}
    >
      {loading ? "Generando PDF..." : "Generar PDF"}
    </button>
  );
}
