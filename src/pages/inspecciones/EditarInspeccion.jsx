import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function EditarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cliente_id: "",
    tecnico_id: "",
    fecha: "",
    estado: "pendiente",
  });

  useEffect(() => {
    const cargarInspeccion = async () => {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando inspección:", error);
        return;
      }

      setForm({
        cliente_id: data.cliente_id,
        tecnico_id: data.tecnico_id,
        fecha: data.fecha,
        estado: data.estado,
      });
    };

    cargarInspeccion();
  }, [id]);

  const guardarCambios = async () => {
    if (!form.cliente_id || !form.tecnico_id || !form.fecha) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const { error } = await supabase
      .from("inspecciones")
      .update({
        cliente_id: form.cliente_id,
        tecnico_id: form.tecnico_id,
        fecha: form.fecha,
        estado: form.estado,
      })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando inspección:", error);
      return;
    }

    navigate(-1);
  };

  return (
    <LayoutWithMenu>
      <div style={{ padding: 20 }}>
        <h2>Editar Inspección</h2>

        <label>Cliente</label>
        <input
          type="text"
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
        />

        <label>Técnico</label>
        <input
          type="text"
          value={form.tecnico_id}
          onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <label>Estado</label>
        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        >
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
        </select>

        <button onClick={guardarCambios}>Guardar</button>
        <button onClick={() => navigate(-1)}>Cancelar</button>
      </div>
    </LayoutWithMenu>
  );
}
