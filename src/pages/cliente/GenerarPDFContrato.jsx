import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";
import { jsPDF } from "jspdf";
import { PRICES } from "../../constants/prices";

export default function GenerarPDFContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setContrato(data);
      setLoading(false);
    };

    cargar();
  }, [id]);

  const generarPDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Contrato de Servicio", 20, 20);

    doc.setFontSize(12);
    doc.text(`Contrato ID: ${contrato.id}`, 20, 40);
    doc.text(`Cliente: ${contrato.nombre_cliente}`, 20, 50);
    doc.text(`Dirección: ${contrato.direccion}`, 20, 60);
    doc.text(`Estado: ${contrato.estado}`, 20, 70);

    // -------------------------------
    // PRECIOS OFICIALES DEL CONTRATO
    // -------------------------------
    doc.setFontSize(14);
    doc.text("Servicios Extra (Precios Oficiales)", 20, 90);

    doc.setFontSize(12);
    doc.text(`Urgencia / Emergencia: ${PRICES.emergencia} €`, 20, 105);
    doc.text(`Apertura de vivienda: ${PRICES.apertura} €`, 20, 115);
    doc.text(`Cierre de vivienda: ${PRICES.cierre} €`, 20, 125);
    doc.text(`Supervisión (por hora): ${PRICES.supervision} €`, 20, 135);
    doc.text(`Gestión del técnico: ${PRICES.gestionTecnico} €`, 20, 145);
    doc.text(`Visita rápida: ${PRICES.visitaRapida} €`, 20, 155);
    doc.text(`Inspección post tormenta: ${PRICES.postTormenta} €`, 20, 165);

    // -------------------------------
    // FIRMA DEL CLIENTE
    // -------------------------------
    doc.text("Firma del cliente:", 20, 185);

    if (contrato.firma_url) {
      const firmaImg = await fetch(contrato.firma_url)
        .then((r) => r.blob())
        .then((b) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(b);
          });
        });

      doc.addImage(firmaImg, "PNG", 20, 195, 80, 40);
    }

    const pdfBlob = doc.output("blob");
    const fileName = `contrato_${id}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("pdfs")
      .getPublicUrl(fileName);

    await supabase
      .from("contratos")
      .update({ pdf_url: urlData.publicUrl })
      .eq("id", id);

    navigate(`/cliente/contrato/pdf/${id}`);
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Generar PDF del contrato</h2>

      <button
        onClick={generarPDF}
        style={{
          background: "#28a745",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        Generar PDF
      </button>
    </div>
  );
}
