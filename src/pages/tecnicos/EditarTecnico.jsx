import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    especialidad: "",
  });

  useEffect(() => {
    async function cargarTecnico() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando técnico");
        return;
      }

      setForm(data);
    }

    cargarTecnico();
  }, [id]);

  async function guardarCambios() {
    const { error } = await supabase
      .from("tecnicos")
      .update(form)
      .eq("id", id);

    if (error) {
      alert("Error guardando cambios");
      return;
    }

    alert("Técnico actualizado correctamente");
    navigate("/tecnicos");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Técnico</h1>

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

        <button onClick={guardarCambios} style={{ marginTop: "20px" }}>
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
