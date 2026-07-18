import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vivienda_id: "",
    tecnico_id: "",
    fecha: "",
    estado: "",
    notas: "",
  });

  useEffect(() => {
    async function cargarInspeccion() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando inspección");
        return;
      }

      setForm(data);
    }

    cargarInspeccion();
  }, [id]);

  async function guardarCambios() {
    const { error } = await supabase
      .from("inspecciones")
      .update(form)
      .eq("id", id);

    if (error) {
      alert("Error guardando cambios");
      return;
    }

    alert("Inspección actualizada correctamente");
    navigate("/inspecciones");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Inspección</h1>

        <label>ID Vivienda</label>
        <input
          value={form.vivienda_id}
          onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
        />

        <label>ID Técnico</label>
        <input
          value={form.tecnico_id}
          onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <label>Estado</label>
        <input
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        />

        <label>Notas</label>
        <textarea
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />

        <button onClick={guardarCambios} style={{ marginTop: "20px" }}>
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
