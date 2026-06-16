import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function NuevaInspeccion() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("pendiente");

  const guardarInspeccion = async () => {
    const { error } = await supabase.from("inspecciones").insert([
      {
        cliente,
        fecha,
        estado,
      },
    ]);

    if (error) {
      console.error("Error guardando inspección:", error);
      return;
    }

    navigate("/inspecciones");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Nueva Inspección</h2>

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
        onClick={guardarInspeccion}
        style={{
          padding: "10px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Guardar inspección
      </button>
    </div>
  );
}
