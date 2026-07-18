import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarVivienda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    cp: "",
  });

  useEffect(() => {
    async function cargarVivienda() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando vivienda");
        return;
      }

      setForm(data);
    }

    cargarVivienda();
  }, [id]);

  async function guardarCambios() {
    const { error } = await supabase
      .from("viviendas")
      .update(form)
      .eq("id", id);

    if (error) {
      alert("Error guardando cambios");
      return;
    }

    alert("Vivienda actualizada");
    navigate("/viviendas");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Vivienda</h1>

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

        <button onClick={guardarCambios} style={{ marginTop: "20px" }}>
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
