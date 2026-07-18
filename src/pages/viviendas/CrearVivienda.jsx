import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CrearVivienda() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    cp: "",
  });

  async function crearVivienda() {
    const { error } = await supabase.from("viviendas").insert([form]);

    if (error) {
      alert("Error creando vivienda");
      return;
    }

    alert("Vivienda creada correctamente");
    navigate("/viviendas");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Nueva Vivienda</h1>

        <label>Nombre</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <label>Dirección</label>
        <input
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />

        <label>Ciudad</label>
        <input
          value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
        />

        <label>Código Postal</label>
        <input
          value={form.cp}
          onChange={(e) => setForm({ ...form, cp: e.target.value })}
        />

        <button onClick={crearVivienda} style={{ marginTop: "20px" }}>
          Guardar vivienda
        </button>
      </div>
    </Menu>
  );
}
