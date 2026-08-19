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
    es_extra: false, // Opcional: si quieres marcar si es un extra o no
  });

  const [mensaje, setMensaje] = useState("");

  async function crearFactura() {
    // 1. Insertamos la factura principal
    const { data: facturaCreada, error } = await supabase
      .from("facturas")
      .insert([
        {
          cliente_id: form.cliente_id || null,
          vivienda_id: form.vivienda_id || null,
          fecha: form.fecha,
          descripcion: form.concepto,
          total: form.importe,
          estado: form.estado
        }
      ])
      .select()
      .single();

    if (error || !facturaCreada) {
      setMensaje("Error creando factura");
      return;
    }

    // 2. 🚀 CREAR EL REGISTRO EN 'EXTRAS' PARA QUE LE LLEGUE AL TÉCNICO
    const { error: errorExtra } = await supabase
      .from("extras")
      .insert([
        {
          contrato_id: facturaCreada.id, // Enlazamos con el ID de la factura creada
          descripcion: form.concepto,
          estado: "finalizado", // O el estado inicial que requiera tu app para que aparezca
        }
      ]);

    if (errorExtra) {
      console.error("Error al crear el extra para el técnico:", errorExtra);
    }

    setMensaje("Factura creada y enviada al técnico correctamente");
    setTimeout(() => navigate("/facturas/lista"), 1500);
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

          <label>Concepto</label>
          <input
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
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

          <label>Importe (€)</label>
          <input
            type="number"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
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
            onClick={crearFactura}
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
            Guardar factura y enviar al técnico
          </button>
        </div>
      </div>
    </Menu>
  );
}
