import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  useEffect(() => {
    async function cargarCliente() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando cliente");
        return;
      }

      setForm(data);
    }

    cargarCliente();
  }, [id]);

  async function guardarCambios() {
    const { error } = await supabase
      .from("clientes")
      .update(form)
      .eq("id", id);

    if (error) {
      alert("Error guardando cambios");
      return;
    }

    alert("Cliente actualizado correctamente");
    navigate("/clientes");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Cliente</h1>

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

        <label>Dirección</label>
        <input
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />

        <button
          onClick={guardarCambios}
          style={{ marginTop: "20px" }}
        >
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
