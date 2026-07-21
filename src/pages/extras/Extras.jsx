import { useState } from "react";
import supabase from "../../supabaseClient";

const EXTRAS = [
  { nombre: "Urgencia / Emergencia", precio: 50 },
  { nombre: "Apertura de vivienda", precio: 30 },
  { nombre: "Supervisión (por hora o fracción)", precio: 35 },
  { nombre: "Cierre de vivienda", precio: 30 },
  { nombre: "Gestión del técnico", precio: 25 },
  { nombre: "Visita rápida", precio: 25 },
  { nombre: "Inspección posterior a tormenta", precio: 35 },
  { nombre: "Coste del técnico", precio: null }
];

export default function Extras() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});
  const [mensaje, setMensaje] = useState("");

  const toggleExtra = (nombre) => {
    if (seleccionados.includes(nombre)) {
      setSeleccionados(seleccionados.filter(x => x !== nombre));
    } else {
      setSeleccionados([...seleccionados, nombre]);
    }
  };

  const crearFactura = async () => {
    if (seleccionados.length === 0) {
      setMensaje("Selecciona al menos un extra.");
      return;
    }

    const extrasFinal = seleccionados.map(nombre => {
      const extra = EXTRAS.find(e => e.nombre === nombre);
      const precio = extra.precio ?? Number(precios[nombre] || 0);
      return { nombre, precio };
    });

    const total = extrasFinal.reduce((acc, e) => acc + e.precio, 0);

    const { data: factura, error } = await supabase
      .from("facturas")
      .insert({
        extras: extrasFinal,
        total,
        estado: "pendiente"
      })
      .select()
      .single();

    if (error) {
      setMensaje("Error creando factura.");
      return;
    }

    const pdfRes = await fetch(
      "https://YOUR-SUPABASE-FUNCTION-URL/factura-pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factura_id: factura.id })
      }
    );

    const pdfData = await pdfRes.json();

    await fetch(
      "https://YOUR-SUPABASE-FUNCTION-URL/enviar-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factura_id: factura.id,
          pdf_url: pdfData.url
        })
      }
    );

    setMensaje("Factura creada y enviada al cliente.");
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <h1
        style={{
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)"
        }}
      >
        Extras
      </h1>

      {mensaje && (
        <p
          style={{
            marginBottom: "15px",
            color: "#4db8ff",
            fontWeight: "600"
          }}
        >
          {mensaje}
        </p>
      )}

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)"
        }}
      >
        {EXTRAS.map(extra => (
          <div key={extra.nombre} style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(extra.nombre)}
                onChange={() => toggleExtra(extra.nombre)}
                style={{
                  width: "22px",
                  height: "22px",
                  marginRight: "12px",
                  cursor: "pointer",
                  accentColor: "#4db8ff"
                }}
              />
              {extra.nombre} —{" "}
              {extra.precio !== null ? `${extra.precio}€` : "Según tarifa"}
            </label>

            {extra.precio === null && seleccionados.includes(extra.nombre) && (
              <input
                type="number"
                placeholder="Precio €"
                style={{
                  padding: "12px",
                  width: "100%",
