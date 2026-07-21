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

  const [mensaje, setMensaje] = useState("");

  async function crear() {
    const { error } = await supabase.from("inspecciones").insert([form]);

    if (error) {
      setMensaje("Error creando inspección");
      return;
    }

    setMensaje("Inspección creada correctamente");
    navigate("/inspecciones");
  }

  return (
    <Menu>
      <div style={{ padding: 20, color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Nueva Inspección</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <label>ID Vivienda</label>
        <input
          value={form.vivienda_id}
          onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>ID Técnico</label>
        <input
          value={form.tecnico_id}
          onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Notas</label>
        <textarea
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            minHeight: "100px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={crear}
          style={{
            marginTop: "20px",
            padding: "12px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Crear inspección
        </button>
      </div>
    </Menu>
  );
}
