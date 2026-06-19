import { useState } from "react";
import { generarPDFInspeccion } from "../../pdf/generarPDFInspeccion";

export default function BotonGenerarPDF({ id, elemento }) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    if (!elemento) {
      alert("Error: no se encontró el contenido del PDF.");
      return;
    }

    setLoading(true);
    await generarPDFInspeccion(id, elemento);
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
