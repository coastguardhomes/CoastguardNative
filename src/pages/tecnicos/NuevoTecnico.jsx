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

  async function guardarTecnico(e) {
    if (e) e.preventDefault();
    setMensaje("");

    // 1️⃣ Validaciones de frontend
    if (!form.nombre.trim()) return setMensaje("El nombre es obligatorio");
    if (!form.telefono.trim() || form.telefono.trim().length < 6)
      return setMensaje("Introduce un teléfono válido");
    if (!form.email.trim() || !form.email.includes("@"))
      return setMensaje("Introduce un email válido");
    if (!form.especialidad.trim())
      return setMensaje("La especialidad es obligatoria");

    setGuardando(true);

    try {
      // 2️⃣ Insertar directamente en Supabase
      const { error } = await supabase.from("tecnicos").insert([
        {
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim().toLowerCase(),
          especialidad: form.especialidad.trim(),
          activo: form.activo,
        },
      ]);

      if (error) {
        // Código 23505 = Postgres Unique Constraint Violation
        if (error.code === "23505") {
          setMensaje("Este email ya está registrado para otro técnico.");
        } else {
          setMensaje(`Error al guardar: ${error.message || "Error en la base de datos"}`);
        }
        setGuardando(false);
        return;
      }

      // 3️⃣ Notificar al admin mediante Supabase Functions nativo
      try {
        await supabase.functions.invoke("notificar-admin-nuevo-tecnico", {
          body: { email: form.email.trim().toLowerCase() },
        });
      } catch (e) {
        console.warn("Notificación a admin no enviada (no crítico):", e);
      }

      setMensaje("Técnico creado correctamente");

      setTimeout(() => {
        navigate("/tecnicos");
      }, 1000);
    } catch (err) {
      console.error("Excepción inesperada:", err);
      setMensaje("Error inesperado al procesar la solicitud.");
      setGuardando(false);
    }
  }

  const inputStyle = {
    padding: "12px",
    width: "100%",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    boxSizing: "border-box", // Evita desbordamientos
    fontSize: "15px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    color: "#4db8ff",
    fontWeight: "600",
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
          paddingBottom: "100px",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
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
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: mensaje.includes("correctamente")
                ? "rgba(74, 222, 128, 0.1)"
                : "rgba(255,107,107,0.1)",
              border: `1px solid ${
                mensaje.includes("correctamente") ? "#4ade80" : "#ff6b6b"
              }`,
              color: mensaje.includes("correctamente") ? "#4ade80" : "#ff6b6b",
              borderRadius: "10px",
              fontWeight: "600",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {mensaje}
          </div>
        )}

        <form
          onSubmit={guardarTecnico}
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 14px rgba(0,153,255,0.2)",
          }}
        >
          <label style={labelStyle}>Nombre completo</label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            disabled={guardando}
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Teléfono de contacto</label>
          <input
            type="tel"
            placeholder="Ej. 612345678"
            disabled={guardando}
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Correo electrónico</label>
          <input
            type="email"
            placeholder="tecnico@empresa.com"
            disabled={guardando}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Especialidad</label>
          <input
            type="text"
            placeholder="Ej. Fontanería, Electricidad, General"
            disabled={guardando}
            value={form.especialidad}
            onChange={(e) =>
              setForm({ ...form, especialidad: e.target.value })
            }
            style={inputStyle}
          />

          <label style={labelStyle}>Estado inicial</label>
          <select
            disabled={guardando}
            value={form.activo ? "true" : "false"}
            onChange={(e) =>
              setForm({ ...form, activo: e.target.value === "true" })
            }
            style={inputStyle}
          >
            <option value="true" style={{ background: "#0a0f1a", color: "#fff" }}>
              Activo
            </option>
            <option value="false" style={{ background: "#0a0f1a", color: "#fff" }}>
              Inactivo
            </option>
          </select>

          <button
            type="submit"
            disabled={guardando}
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: guardando ? "#666" : "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "16px",
              cursor: guardando ? "not-allowed" : "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            {guardando ? "Guardando..." : "Guardar Técnico"}
          </button>
        </form>
      </div>
    </Menu>
  );
}
