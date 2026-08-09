import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function NuevoTecnico() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    especialidad: "",
    activo: true,
  });

  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardarTecnico() {
    setMensaje("");

    // VALIDACIONES
    if (!form.nombre.trim()) return setMensaje("El nombre es obligatorio");
    if (!form.telefono.trim() || form.telefono.length < 6)
      return setMensaje("Teléfono inválido");
    if (!form.email.trim() || !form.email.includes("@") || form.email.length < 5)
      return setMensaje("Email inválido");
    if (!form.especialidad.trim())
      return setMensaje("La especialidad es obligatoria");

    setGuardando(true);

    // 1️⃣ Validar email único
    const { data: emailCheck } = await supabase
      .from("tecnicos")
      .select("id")
      .eq("email", form.email);

    if (emailCheck && emailCheck.length > 0) {
      setGuardando(false);
      return setMensaje("Este email ya está en uso por otro técnico");
    }

    // 2️⃣ Crear técnico
    const { error } = await supabase.from("tecnicos").insert([
      {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        especialidad: form.especialidad,
        activo: form.activo,
      },
    ]);

    if (error) {
      setGuardando(false);
      return setMensaje("Error guardando técnico");
    }

    // 3️⃣ Notificar al admin
    try {
      await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/notificar-admin-nuevo-tecnico?email=${form.email}`
      );
    } catch (e) {
      console.error("Error notificando al admin:", e);
    }

    setMensaje("Técnico creado correctamente");

    setTimeout(() => {
      navigate("/tecnicos");
    }, 1200);

    setGuardando(false);
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
          padding: "25px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 10px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Nuevo Técnico
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: mensaje.includes("correctamente")
                ? "#4ade80"
                : "#ff6b6b",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {mensaje}
          </p>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "25px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 14px rgba(0,153,255,0.2)",
          }}
        >
          <label>Nombre del técnico</label>
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
            onClick={guardarTecnico}
            disabled={guardando}
            style={{
              marginTop: "20px",
              padding: "14px",
              width: "100%",
              background: guardando ? "#999" : "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: guardando ? "not-allowed" : "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            {guardando ? "Guardando..." : "Guardar técnico"}
          </button>
        </div>
      </div>
    </Menu>
  );
}
