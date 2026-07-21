import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

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
    navigate("/facturas/lista");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Factura</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <label>ID Cliente</label>
        <input
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>ID Vivienda</label>
        <input
          value={form.vivienda_id}
          onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Concepto</label>
        <input
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Importe (€)</label>
        <input
          type="number"
          value={form.importe}
          onChange={(e) => setForm({ ...form, importe: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <label>Estado</label>
        <input
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={guardarCambios}
          style={{
            marginTop: "20px",
            padding: "12px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
