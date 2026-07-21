import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NuevoCliente() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [mensaje, setMensaje] = useState("");

  async function crearCliente() {
    if (!form.nombre || !form.telefono) {
      setMensaje("Nombre y teléfono son obligatorios");
      return;
    }

    const { error } = await supabase.from("clientes").insert([form]);

    if (error) {
      setMensaje("Error creando cliente");
      return;
    }

    setMensaje("Cliente creado correctamente");
    navigate("/clientes");
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #4db8ff",
    background: "#0d1b2a",
    color: "#fff",
    fontSize: "16px",
  };

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          color: "#fff",
          background: "#0a0f1a",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "20px",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Nuevo Cliente
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        <label>Nombre</label>
        <input
          style={inputStyle}
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <label>Teléfono</label>
        <input
          style={inputStyle}
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />

        <label>Email</label>
        <input
          style={inputStyle}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Dirección</label>
        <input
          style={inputStyle}
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />

        <button
          onClick={crearCliente}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "14px",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Guardar cliente
        </button>
      </div>
    </Menu>
  );
}
