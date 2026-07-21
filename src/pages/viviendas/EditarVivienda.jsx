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

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarVivienda() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando vivienda");
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
      setMensaje("Error guardando cambios");
      return;
    }

    setMensaje("Vivienda actualizada correctamente");
    navigate("/viviendas");
  }

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
          Editar Vivienda
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
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

          <label>Dirección</label>
          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

          <label>Ciudad</label>
          <input
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

          <label>Código Postal</label>
          <input
            value={form.cp}
            onChange={(e) => setForm({ ...form, cp: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

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
