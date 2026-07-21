import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NuevaInspeccion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vivienda_id: "",
    tecnico_id: "",
    fecha: "",
    estado: "pendiente",
    notas: "",
  });

  const [mensaje, setMensaje] = useState("");

  async function crear() {
    const { error } = await supabase.from("inspecciones").insert([form]);

    if (error) {
      setMensaje("Error creando inspección");
      return;
    }

    setMensaje("Inspección creada correctamente");
    navigate("/inspecciones");
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
          Nueva Inspección
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
          <label>ID Vivienda</label>
          <input
            value={form.vivienda_id}
            onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
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

          <label>ID Técnico</label>
          <input
            value={form.tecnico_id}
            onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
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

          <label>Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
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

          <label>Notas</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              minHeight: "100px",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

          <button
            onClick={crear}
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
            Crear inspección
          </button>
        </div>
      </div>
    </Menu>
  );
}
