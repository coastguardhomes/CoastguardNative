import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";
import { subirPDF } from "../../pdf/subirPDF";

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

      // 🔥 Notificar al componente padre la nueva URL para actualizar el estado al instante
      if (onGenerado) {
        onGenerado(resultado.url);
      }

      alert("Informe PDF generado y guardado correctamente.");
    } catch (e) {
      console.error("Error generando PDF:", e);
      alert(`No se pudo generar el informe: ${e.message}`);
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
      {loading ? "Generando PDF..." : "Generar PDF"}
    </button>
  );
}
