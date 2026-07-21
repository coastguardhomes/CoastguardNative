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

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarTecnico() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando técnico");
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
      setMensaje("Error guardando cambios");
      return;
    }

    setMensaje("Técnico actualizado correctamente");
    navigate("/tecnicos");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Técnico</h1>

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

        <label>Teléfono</label>
        <input
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Email</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Especialidad</label>
        <input
          value={form.especialidad}
          onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={guardarCambios}
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
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
