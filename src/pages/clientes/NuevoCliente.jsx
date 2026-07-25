import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function NuevoCliente() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const crearCliente = async () => {
    if (!form.nombre || !form.email || !form.telefono) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert([
        {
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
        },
      ]);

    if (error) {
      setMensaje("Error al crear cliente");
      return;
    }

    setMensaje("Cliente creado correctamente");
    setForm({ nombre: "", email: "", telefono: "" });
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Nuevo Cliente</h2>

      <div style={{ marginTop: "15px" }}>
        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginTop: "15px" }}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginTop: "15px" }}>
        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <button
        onClick={crearCliente}
        style={{
          marginTop: "20px",
          background: "#0099ff",
          color: "#fff",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        }}
      >
        Guardar Cliente
      </button>

      {mensaje && (
        <p style={{ marginTop: "15px", color: "green", fontWeight: "bold" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
