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

  const [mensaje, setMensaje] = useState("");

  async function crearVivienda() {
    const { error } = await supabase.from("viviendas").insert([form]);

    if (error) {
      setMensaje("Error creando vivienda");
      return;
    }

    setMensaje("Vivienda creada correctamente");
    navigate("/viviendas");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Nueva Vivienda</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <label>Nombre</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Dirección</label>
        <input
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Ciudad</label>
        <input
          value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Código Postal</label>
        <input
          value={form.cp}
          onChange={(e) => setForm({ ...form, cp: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={crearVivienda}
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
          Guardar vivienda
        </button>
      </div>
    </Menu>
  );
}
