import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: "",
    precio: "",
    notas: "",
  });

  useEffect(() => {
    async function cargarContrato() {
      const { data } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setForm(data);
    }

    cargarContrato();
  }, [id]);

  async function guardarCambios() {
    const { error } = await supabase
      .from("contratos")
      .update(form)
      .eq("id", id);

    if (error) {
      alert("Error guardando cambios");
    } else {
      alert("Contrato actualizado");
      navigate("/contratos");
    }
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1>Editar Contrato #{id}</h1>

        <label>Fecha:</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <label>Precio (€):</label>
        <input
          type="number"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
        />

        <label>Notas:</label>
        <textarea
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />

        <button onClick={guardarCambios}>Guardar cambios</button>
      </div>
    </Menu>
  );
}
