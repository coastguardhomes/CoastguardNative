import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    idioma: "es", // ⭐ 1. Idioma inicial añadido aquí
  });

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarCliente() {
      const { data, error } = await supabase
        .from("clientes")
        .select("nombre, telefono, email, direccion, idioma") // ⭐ 2. Seleccionar el idioma de Supabase
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando cliente");
        return;
      }

      setForm(data);
    }

    cargarCliente();
  }, [id]);

  async function guardarCambios() {
    if (!form.nombre) {
      setMensaje("El nombre es obligatorio");
      return;
    }

    const { error } = await supabase
      .from("clientes")
      .update({
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion,
        idioma: form.idioma, // ⭐ 3. Guardar el idioma modificado en Supabase
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando cambios");
      return;
    }

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
          Editar Cliente
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

        {/* ⭐ 4. Selector visual de idioma añadido en edición */}
        <label>Idioma Preferido</label>
        <select
          name="idioma"
          value={form.idioma}
          onChange={(e) => setForm({ ...form, idioma: e.target.value })}
          style={inputStyle}
        >
          <option value="es" style={{ background: "#0d1b2a", color: "#fff" }}>🇪🇸 Español</option>
          <option value="en" style={{ background: "#0d1b2a", color: "#fff" }}>🇬🇧 Inglés</option>
          <option value="fr" style={{ background: "#0d1b2a", color: "#fff" }}>🇫🇷 Francés</option>
        </select>

        <button
          onClick={guardarCambios}
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
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
