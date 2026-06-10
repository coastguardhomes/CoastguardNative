import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function NuevaInspeccion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    tecnico_id: "",
    fecha: "",
    estado: "pendiente",
  });

  const crearInspeccion = async () => {
    if (!form.cliente_id || !form.tecnico_id || !form.fecha) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const { error } = await supabase.from("inspecciones").insert([
      {
        cliente_id: form.cliente_id,
        tecnico_id: form.tecnico_id,
        fecha: form.fecha,
        estado: form.estado,
      },
    ]);

    if (error) {
      console.error("Error creando inspección:", error);
      return;
    }

    navigate("/inspecciones");
  };

  return (
    <LayoutWithMenu>
      <div style={{ padding: 20 }}>
        <h2>Nueva Inspección</h2>

        <label>Cliente</label>
        <input
          type="text"
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Técnico</label>
        <input
          type="text"
          value={form.tecnico_id}
          onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Estado</label>
        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
          style={{ width: "100%", marginBottom: 20 }}
        >
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
        </select>

        <button onClick={crearInspeccion}>Crear</button>
        <button onClick={() => navigate(-1)} style={{ marginLeft: 10 }}>
          Cancelar
        </button>
      </div>
    </LayoutWithMenu>
  );
}
