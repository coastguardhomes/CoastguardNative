import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NuevoTecnico() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    especialidad: "",
  });

  async function crearTecnico() {
    const { error } = await supabase.from("tecnicos").insert([form]);

    if (error) {
      alert("Error creando técnico");
      return;
    }

    alert("Técnico creado correctamente");
    navigate("/tecnicos");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Nuevo Técnico</h1>

        <label>Nombre</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <label>Teléfono</label>
        <input
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />

        <label>Email</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Especialidad</label>
        <input
          value={form.especialidad}
          onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
        />

        <button onClick={crearTecnico} style={{ marginTop: "20px" }}>
          Guardar técnico
        </button>
      </div>
    </Menu>
  );
}
