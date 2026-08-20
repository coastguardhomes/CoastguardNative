import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

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
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
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
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTecnico();
  }, [id]);

  async function cargarTecnico() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tecnicos")
      .select("nombre, telefono, email, especialidad, activo")
      .eq("id", id)
      .single();

    if (error || !data) {
      setMensaje("Error cargando técnico");
      setLoading(false);
      return;
    }

    setForm(data);
    setLoading(false);
  }

  async function guardarCambios() {
    setMensaje("");

    if (!form.nombre.trim()) return setMensaje("El nombre es obligatorio");
    if (!form.telefono.trim() || form.telefono.length < 6)
      return setMensaje("Teléfono inválido");
    if (!form.email.trim() || !form.email.includes("@"))
      return setMensaje("Email inválido");
    if (!form.especialidad.trim())
      return setMensaje("La especialidad es obligatoria");

    setGuardando(true);

    // 1️⃣ Validar email único
    const { data: emailCheck } = await supabase
      .from("tecnicos")
      .select("id")
      .eq("email", form.email);

    if (emailCheck && emailCheck.length > 0 && emailCheck[0].id !== id) {
      setGuardando(false);
      return setMensaje("Este email ya está en uso por otro técnico");
    }

    // 2️⃣ Guardar técnico
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
      setGuardando(false);
      return setMensaje("Error guardando cambios");
    }

    // 3️⃣ Si se desactiva → marcar inspecciones pendientes
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

    setGuardando(false);
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
          paddingBottom: "80px",
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
            Editar Técnico
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

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: COLOR_DORADO }}>
            <p style={{ opacity: 0.8, fontSize: "14px", fontWeight: "700" }}>Cargando técnico...</p>
          </div>
        ) : (
          <div
            style={{
              background: FONDO_TARJETA,
              padding: "20px",
              borderRadius: "16px",
              border: BORDE_DORADO_FINO,
              boxShadow: SOMBRA_LUXURY,
            }}
          >
            <label style={labelStyle}>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={inputStyle}
            />

            <label style={labelStyle}>Teléfono</label>
            <input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              style={inputStyle}
            />

            <label style={labelStyle}>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />

            <label style={labelStyle}>Especialidad</label>
            <input
              value={form.especialidad}
              onChange={(e) =>
                setForm({ ...form, especialidad: e.target.value })
              }
              style={inputStyle}
            />

            <label style={labelStyle}>Activo</label>
            <select
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
              <option value="true" style={{ background: "#0b1320", color: "#fff" }}>Activo</option>
              <option value="false" style={{ background: "#0b1320", color: "#fff" }}>Inactivo</option>
            </select>

            <button
              onClick={guardarCambios}
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
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    </Menu>
  );
}
