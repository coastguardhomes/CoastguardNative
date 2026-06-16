import React from "react";
import { jsPDF } from "jspdf";

const GenerarPDFContrato = ({ cliente }) => {
  const generarPDF = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.text("Contrato de Servicio CoastGuard", 20, 20);

    doc.setFontSize(12);
    doc.text(`Nombre del cliente: ${cliente?.nombre || ""}`, 20, 40);
    doc.text(`Dirección: ${cliente?.direccion || ""}`, 20, 50);
    doc.text(`Teléfono: ${cliente?.telefono || ""}`, 20, 60);

    doc.text("Detalles del servicio:", 20, 80);
    doc.text(`Tipo de servicio: ${cliente?.tipoServicio || ""}`, 20, 90);
    doc.text(`Fecha de inicio: ${cliente?.fechaInicio || ""}`, 20, 100);
    doc.text(`Precio mensual: ${cliente?.precioMensual || ""} €`, 20, 110);

    doc.text("Condiciones generales:", 20, 130);
    doc.text(
      "El cliente acepta las condiciones del servicio CoastGuard según lo acordado.",
      20,
      140,
      { maxWidth: 170 }
    );

    doc.text("Firma del cliente: ____________________", 20, 170);
    doc.text("Firma CoastGuard: ____________________", 20, 180);

    doc.save("Contrato_CoastGuard.pdf");
  };

  return (
    <button
      onClick={generarPDF}
      style={{
        padding: "10px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "12px",
      }}
    >
      Generar PDF del contrato
    </button>
  );
};

export default GenerarPDFContrato;
