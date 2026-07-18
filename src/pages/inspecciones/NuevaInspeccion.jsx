import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NuevaInspeccion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vivienda_id: "",
    tecnico_id: "",
    fecha: "",
    estado: "pendiente",
    notas: "",
  });

  async function crear() {
    const { error } = await supabase.from("inspecciones").insert([form]);

    if (error) {
      alert("Error creando inspección");
      return;
    }

    alert("Inspección creada correctamente");
    navigate("/inspecciones");
  }

  return (
    <Menu>
      <div style={{ padding: 20, color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Nueva Inspección</h1>

        <label>ID Vivienda</label>
        <input
          value={form.vivienda_id}
          onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
        />

        <label>ID Técnico</label>
        <input
          value={form.tecnico_id}
          onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <label>Notas</label>
        <textarea
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />

        <button onClick={crear} style={{ marginTop: 20 }}>
          Crear inspección
        </button>
      </div>
    </Menu>
  );
}
