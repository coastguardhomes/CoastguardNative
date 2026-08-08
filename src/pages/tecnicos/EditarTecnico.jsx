import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    especialidad: "",
    activo: true,
  });

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarTecnico() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("nombre, telefono, email, especialidad, activo")
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
    if (!form.nombre.trim()) {
      setMensaje("El nombre es obligatorio");
      return;
    }

    if (!form.telefono.trim()) {
      setMensaje("El teléfono es obligatorio");
      return;
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      setMensaje("Email inválido");
      return;
    }

    if (!form.especialidad.trim()) {
      setMensaje("La especialidad es obligatoria");
      return;
    }

    // Guardar técnico
    const { error } = await supabase
      .from("tecnicos")
      .update({
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        especialidad: form.especialidad,
        activo: form.activo,
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando cambios");
      return;
    }

    // Si el técnico se desactiva → inspecciones pendientes quedan sin asignar
    if (!form.activo) {
      await supabase
        .from("inspecciones")
        .update({ estado: "pendiente_reasignar" })
        .eq("tecnico_id", id)
        .eq("estado", "pendiente");
    }

    setMensaje("Técnico actualizado correctamente");

    setTimeout(() => {
      navigate("/tecnicos");
    }, 1200);
  }

  const inputStyle = {
    padding: "12px",
    width: "100%",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  };

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Editar Técnico
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

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          <label>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={inputStyle}
          />

          <label>Teléfono</label>
          <input
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            style={inputStyle}
          />

          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <label>Especialidad</label>
          <input
            value={form.especialidad}
            onChange={(e) =>
              setForm({ ...form, especialidad: e.target.value })
            }
            style={inputStyle}
          />

          <label>Activo</label>
          <select
            value={form.activo ? "true" : "false"}
            onChange={(e) =>
              setForm({ ...form, activo: e.target.value === "true" })
            }
            style={inputStyle}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <button
            onClick={guardarCambios}
            style={{
              marginTop: "20px",
              padding: "14px",
              width: "100%",
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
      </div>
    </Menu>
  );
}
