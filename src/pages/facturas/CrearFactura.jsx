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

export default function CrearFactura() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: "",
    concepto: "",
    importe: "",
    estado: "pendiente",
    es_extra: false,
  });

  const [mensaje, setMensaje] = useState("");

  async function crearFactura() {
    setMensaje("");

    // Validaciones mínimas
    if (!form.cliente_id) {
      setMensaje("Selecciona el cliente.");
      return;
    }
    if (!form.importe) {
      setMensaje("Introduce el importe.");
      return;
    }

    try {
      // 1. Insertar la factura principal
      const { data: facturaCreada, error } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: form.cliente_id || null,
            vivienda_id: form.vivienda_id || null,
            fecha: form.fecha || new Date().toISOString().slice(0, 10),
            descripcion: form.concepto,
            total: form.importe,
            estado: form.estado || "pendiente",
          },
        ])
        .select()
        .single();

      if (error || !facturaCreada) {
        console.error("Error creando factura:", error);
        setMensaje("Error creando factura");
        return;
      }

      // 2. Crear el extra/tarea
      const extraPayload = {
        factura_id: facturaCreada.id,
        contrato_id: facturaCreada.contrato_id || null,
        cliente_id: facturaCreada.cliente_id || null,
        vivienda_id: facturaCreada.vivienda_id || null,
        descripcion: form.concepto || "Servicio extra contratado",
        estado: "pendiente",
        creado_en: new Date().toISOString(),
      };

      const { error: errorExtra } = await supabase.from("extras").insert([extraPayload]);

      if (errorExtra) {
        console.error("Error al crear el extra:", errorExtra);
      }

      // 3. Generación opcional de PDF por función
      try {
        const { data: pdfData, error: errorPdf } = await supabase.functions.invoke(
          "factura-pdf",
          { body: { facturaId: facturaCreada.id } }
        );

        if (!errorPdf && pdfData?.url) {
          await supabase.from("facturas").update({ pdf_url: pdfData.url }).eq("id", facturaCreada.id);
        }
      } catch (e) {
        console.error("Error generando PDF (no crítico):", e);
      }

      setMensaje("Factura creada correctamente");
      setTimeout(() => navigate("/facturas/lista"), 1200);
    } catch (e) {
      console.error("Error en crearFactura:", e);
      setMensaje("Error creando factura");
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
          Nueva Factura / Extra
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
              value={form.cliente_id}
              onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              style={inputStyle}
              placeholder="Introduce el ID del cliente..."
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              ID Vivienda
            </label>
            <input
              value={form.vivienda_id}
              onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
              style={inputStyle}
              placeholder="Introduce el ID de la vivienda..."
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Fecha
            </label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Concepto
            </label>
            <input
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              style={inputStyle}
              placeholder="Descripción del concepto o servicio..."
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", color: COLOR_DORADO, fontWeight: "700", textTransform: "uppercase" }}>
              Importe
            </label>
            <input
              type="number"
              value={form.importe}
              onChange={(e) => setForm({ ...form, importe: e.target.value })}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <button
              onClick={() => crearFactura()}
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
              Crear Factura
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
