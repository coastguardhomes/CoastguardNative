import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function EditarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("pendiente");

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

    setCliente(data.cliente);
    setFecha(data.fecha);
    setEstado(data.estado);
  };

  const guardarCambios = async () => {
    const { error } = await supabase
      .from("inspecciones")
      .update({
        cliente,
        fecha,
        estado,
      })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando inspección:", error);
      return;
    }

    navigate("/inspecciones");
  };

  useEffect(() => {
    cargarInspeccion();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Editar Inspección</h2>

      <label>Cliente</label>
      <input
        type="text"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <label>Fecha</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <label>Estado</label>
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      >
        <option value="pendiente">Pendiente</option>
        <option value="completada">Completada</option>
      </select>

      <button
        onClick={guardarCambios}
        style={{
          padding: "10px 16px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Guardar cambios
      </button>
    </div>
  );
}
