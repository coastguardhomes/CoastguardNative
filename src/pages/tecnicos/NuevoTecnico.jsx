import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

const inputStyle = {
  padding: "12px 14px",
  width: "100%",
  marginBottom: "16px",
  borderRadius: "12px",
  border: BORDE_DORADO_FINO,
  background: "rgba(11, 19, 32, 0.8)",
  color: "#fff",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  color: COLOR_DORADO,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

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

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h1
            style={{
              ...TEXTO_DORADO_BRILLO,
              margin: 0,
              fontSize: "22px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            Nuevo Técnico
          </h1>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>
        </div>

        {mensaje && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
              background: mensaje.includes("correctamente")
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: mensaje.includes("correctamente")
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
              color: mensaje.includes("correctamente") ? "#34d399" : "#ef4444",
              fontWeight: "700",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        <form
          onSubmit={guardarTecnico}
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "16px",
            border: BORDE_DORADO_FINO,
            boxShadow: SOMBRA_LUXURY,
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
            style={{
              ...inputStyle,
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e0b034%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px top 50%",
              backgroundSize: "10px auto",
              cursor: "pointer",
            }}
          >
            <option value="true" style={{ background: "#0b1320", color: "#fff" }}>
              Activo
            </option>
            <option value="false" style={{ background: "#0b1320", color: "#fff" }}>
              Inactivo
            </option>
          </select>

          <button
            type="submit"
            disabled={guardando}
            style={{
              marginTop: "10px",
              padding: "14px",
              width: "100%",
              background: guardando
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              color: guardando ? "#64748b" : "#ffffff",
              borderRadius: "16px",
              border: guardando ? BORDE_DORADO_FINO : "1px solid rgba(16, 185, 129, 0.6)",
              fontWeight: "900",
              fontSize: "14px",
              cursor: guardando ? "not-allowed" : "pointer",
              boxShadow: guardando ? "none" : "0 4px 15px rgba(16, 185, 129, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              transition: "all 0.2s ease",
            }}
          >
            {guardando ? "Guardando..." : "Guardar Técnico"}
          </button>
        </form>
      </div>
    </Menu>
  );
}
