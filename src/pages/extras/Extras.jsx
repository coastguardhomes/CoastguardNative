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
    <div style={{ padding: 20, color: "#fff" }}>
      <h1 style={{ color: "#4db8ff" }}>Extras</h1>

      {mensaje && (
        <p style={{ marginBottom: 15, color: "#4db8ff" }}>{mensaje}</p>
      )}

      {EXTRAS.map(extra => (
        <div key={extra.nombre} style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={seleccionados.includes(extra.nombre)}
              onChange={() => toggleExtra(extra.nombre)}
              style={{
                width: 20,
                height: 20,
                marginRight: 10,
                cursor: "pointer"
              }}
            />
            {extra.nombre} — {extra.precio !== null ? `${extra.precio}€` : "Según tarifa"}
          </label>

          {extra.precio === null && seleccionados.includes(extra.nombre) && (
            <input
              type="number"
              placeholder="Precio €"
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
              onChange={(e) =>
                setPrecios({ ...precios, [extra.nombre]: e.target.value })
              }
            />
          )}
        </div>
      ))}

      <hr style={{ margin: "20px 0" }} />

      <button
        onClick={crearFactura}
        style={{
          padding: "12px",
          width: "100%",
          background: "#4db8ff",
          color: "#000",
          borderRadius: "8px",
          border: "none",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        Crear Factura Automática
      </button>
    </div>
  );
}
