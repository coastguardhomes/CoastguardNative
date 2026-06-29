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
  { nombre: "Coste del técnico", precio: null } // precio manual
];

export default function Extras() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});

  const toggleExtra = (nombre) => {
    if (seleccionados.includes(nombre)) {
      setSeleccionados(seleccionados.filter(x => x !== nombre));
    } else {
      setSeleccionados([...seleccionados, nombre]);
    }
  };

  const crearFactura = async () => {
    if (seleccionados.length === 0) {
      alert("Selecciona al menos un extra.");
      return;
    }

    const extrasFinal = seleccionados.map(nombre => {
      const extra = EXTRAS.find(e => e.nombre === nombre);
      const precio = extra.precio ?? Number(precios[nombre] || 0);
      return { nombre, precio };
    });

    const total = extrasFinal.reduce((acc, e) => acc + e.precio, 0);

    // 1. Crear factura en Supabase
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
      alert("Error creando factura");
      return;
    }

    // 2. Generar PDF
    const pdfRes = await fetch(
      "https://YOUR-SUPABASE-FUNCTION-URL/factura-pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factura_id: factura.id })
      }
    );

    const pdfData = await pdfRes.json();

    // 3. Enviar email
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

    alert("Factura creada y enviada al cliente.");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Extras</h1>

      {EXTRAS.map(extra => (
        <div key={extra.nombre} style={{ marginBottom: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={seleccionados.includes(extra.nombre)}
              onChange={() => toggleExtra(extra.nombre)}
            />
            {extra.nombre} — {extra.precio !== null ? `${extra.precio}€` : "Según tarifa"}
          </label>

          {extra.precio === null && seleccionados.includes(extra.nombre) && (
            <input
              type="number"
              placeholder="Precio €"
              style={{ marginLeft: 10 }}
              onChange={(e) =>
                setPrecios({ ...precios, [extra.nombre]: e.target.value })
              }
            />
          )}
        </div>
      ))}

      <hr />

      <button onClick={crearFactura}>
        Crear Factura Automática
      </button>
    </div>
  );
}
