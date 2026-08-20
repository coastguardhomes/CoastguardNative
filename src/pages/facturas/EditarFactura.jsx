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

export default function EditarFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: "",
    concepto: "",
    importe: "",
    estado: "",
  });

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarFactura() {
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando factura");
        return;
      }

      setForm(data);
    }

    cargarFactura();
  }, [id]);

  async function guardarCambios() {
    const { error } = await supabase
      .from("facturas")
      .update(form)
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando cambios");
      return;
    }

    setMensaje("Factura actualizada correctamente");
    setTimeout(() => navigate("/facturas/lista"), 1200);
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
        <h1
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: "20px",
            fontWeight: "900",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Editar Factura
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: mensaje.includes("correctamente") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: mensaje.includes("correctamente") ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
              color: mensaje.includes("correctamente") ? "#34d399" : "#ef4444",
              borderRadius: "12px",
              fontWeight: "700",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            {mensaje}
          </div>
        )}

        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "16px",
            border: BORDE_DORADO_FINO,
            boxShadow: SOMBRA_LUXURY,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              ID Cliente
            </label>
            <input
              value={form.cliente_id || ""}
              onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              ID Vivienda
            </label>
            <input
              value={form.vivienda_id || ""}
              onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Fecha
            </label>
            <input
              type="date"
              value={form.fecha || ""}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Concepto
            </label>
            <input
              value={form.concepto || ""}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Importe (€)
            </label>
            <input
              type="number"
              value={form.importe || ""}
              onChange={(e) => setForm({ ...form, importe: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Estado
            </label>
            <input
              value={form.estado || ""}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <button
              onClick={guardarCambios}
              style={{
                padding: "14px",
                background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                color: "#fff",
                borderRadius: "16px",
                border: "1px solid rgba(16, 185, 129, 0.6)",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              }}
            >
              Guardar cambios
            </button>

            <button
              onClick={() => navigate("/facturas/lista")}
              style={{
                padding: "14px",
                background: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
                color: "#fff",
                borderRadius: "16px",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Menu>
  );
}

const inputStyle = {
  backgroundColor: "rgba(11, 19, 32, 0.8)",
  border: BORDE_DORADO_FINO,
  borderRadius: "12px",
  padding: "12px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};
