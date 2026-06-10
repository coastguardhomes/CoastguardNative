import { useState } from "react";
import { generarInspeccionPDF } from "../utils/generarInspeccionPDF";

export default function BotonGenerarPDF({ id }) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    setLoading(true);
    await generarInspeccionPDF(id);
    setLoading(false);
    alert("PDF generado correctamente");
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