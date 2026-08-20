import React, { useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

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
          Nueva Factura / Extra
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
          <label>ID Cliente</label>
          <input
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            style={inputStyle}
          />

          <label>ID Vivienda</label>
          <input
            value={form.vivienda_id}
            onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
            style={inputStyle}
          />

          <label>Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            style={inputStyle}
          />

          <label>Concepto</label>
          <input
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            style={inputStyle}
          />

          <label>Importe</label>
          <input
            type="number"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => crearFactura()}
              style={{
                padding: "12px 18px",
                background: "#4ade80",
                color: "#0b1220",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Crear Factura
            </button>

            <button
              onClick={() => navigate("/facturas/lista")}
              style={{
                padding: "12px 18px",
                background: "#ef4444",
                color: "#fff",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
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
  padding: "12px",
  width: "100%",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
};
