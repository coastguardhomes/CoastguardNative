import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CrearFactura() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: "",
    concepto: "",
    importe: "",
    estado: "pendiente",
  });

  async function crearFactura() {
    const { error } = await supabase.from("facturas").insert([form]);

    if (error) {
      alert("Error creando factura");
      return;
    }

    alert("Factura creada correctamente");
    navigate("/facturas/lista");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Nueva Factura</h1>

        <label>ID Cliente</label>
        <input
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
        />

        <label>ID Vivienda</label>
        <input
          value={form.vivienda_id}
          onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <label>Concepto</label>
        <input
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
        />

        <label>Importe (€)</label>
        <input
          type="number"
          value={form.importe}
          onChange={(e) => setForm({ ...form, importe: e.target.value })}
        />

        <button onClick={crearFactura} style={{ marginTop: "20px" }}>
          Guardar factura
        </button>
      </div>
    </Menu>
  );
}
