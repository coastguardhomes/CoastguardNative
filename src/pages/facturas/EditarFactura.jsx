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

  useEffect(() => {
    async function cargarFactura() {
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando factura");
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
      alert("Error guardando cambios");
      return;
    }

    alert("Factura actualizada");
    navigate("/facturas/lista");
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Editar Factura</h1>

        <label>ID Cliente</label>
        <input
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
        />

        <label>ID Vivienda</label>
        <input
          value={form.vivienda_id}
          onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <label>Concepto</label>
        <input
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
        />

        <label>Importe (€)</label>
        <input
          type="number"
          value={form.importe}
          onChange={(e) => setForm({ ...form, importe: e.target.value })}
        />

        <label>Estado</label>
        <input
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        />

        <button onClick={guardarCambios} style={{ marginTop: "20px" }}>
          Guardar cambios
        </button>
      </div>
    </Menu>
  );
}
