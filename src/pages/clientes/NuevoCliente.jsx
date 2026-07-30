import React, { useState } from "react";
import Menu from "../../layouts/Menu";
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
    // Este formulario era la pantalla de "los 3 rectángulos vacíos": el panel
    // era blanco y global.css fija `color: #ffffff` en el body, así que las
    // etiquetas Nombre/Email/Teléfono eran blancas sobre blanco y sólo se
    // intuían los tres inputs. Ahora usa el tema oscuro de la aplicación.
    <Menu>
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ color: "#4db8ff", marginBottom: 18 }}>Nuevo Cliente</h2>

      <div style={tarjeta}>
        <Campo
          etiqueta="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />
        <Campo
          etiqueta="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <Campo
          etiqueta="Teléfono"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />

        <button
          onClick={crearCliente}
          style={{
            marginTop: "20px",
            width: "100%",
            background: "#4db8ff",
            color: "#04263f",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Guardar Cliente
        </button>

        {mensaje && (
          <p
            style={{
              marginTop: "15px",
              color: "#4ade80",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
    </Menu>
  );
}

function Campo({ etiqueta, ...props }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 13,
          color: "#9fb3c8",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {etiqueta}
      </label>
      <input
        type="text"
        {...props}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: 15,
        }}
      />
    </div>
  );
}

const tarjeta = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 0 12px rgba(0,153,255,0.15)",
};
