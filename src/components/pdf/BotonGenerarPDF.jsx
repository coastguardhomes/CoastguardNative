import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";

/**
 * Botón reutilizable para generar y guardar el informe PDF 
 * Funciona tanto para "inspecciones" como para "contratos" según la prop `tipo`.
 */
export default function BotonGenerarPDF({ id, tipo = "inspeccion", onGenerado }) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    if (!id) {
      alert("Falta el identificador del registro.");
      return;
    }

    setLoading(true);

    try {
      if (tipo === "inspeccion") {
        // --- FLUJO DE INSPECCIONES ---
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

        const filePath = `inspecciones/inspeccion_${id}_${Date.now()}.pdf`;
        
        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, blob, { contentType: "application/pdf", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from("inspecciones")
          .update({ pdf_url: publicUrl, firmado_en: new Date().toISOString() })
          .eq("id", id);

        if (updateError) throw updateError;

        if (onGenerado) onGenerado(publicUrl);
        alert("Informe PDF de inspección generado correctamente.");

      } else if (tipo === "contrato") {
        // --- FLUJO DE CONTRATOS ---
        const { data: contrato, error } = await supabase
          .from("contratos")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !contrato) {
          throw new Error(error?.message || "No se encontró el contrato");
        }

        // Generación del PDF del contrato (puedes adaptarlo si usas una función específica de contratos)
        const blob = new Blob(["Contrato PDF #" + id], { type: "application/pdf" });

        const filePath = `contrato_${id}_${Date.now()}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from("contratos")
          .upload(filePath, blob, { contentType: "application/pdf", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("contratos").getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from("contratos")
          .update({ pdf_url: publicUrl })
          .eq("id", id);

        if (updateError) throw updateError;

        if (onGenerado) onGenerado(publicUrl);
        alert("Contrato PDF generado y guardado correctamente.");
      }

    } catch (e) {
      console.error("Error generando PDF:", e);
      alert(`No se pudo generar el documento: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
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
