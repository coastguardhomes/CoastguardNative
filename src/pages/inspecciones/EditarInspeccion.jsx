import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function EditarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState({
    cliente_id: "",
    fecha: "",
    estado: "",
    notas: "",
  });

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // ============================
  // CARGAR CLIENTES
  // ============================
  const cargarClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (!error) setClientes(data || []);
  };

  // ============================
  // CARGAR INSPECCIÓN
  // ============================
  const cargarInspeccion = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando inspección:", error);
      alert("Error cargando inspección");
      navigate("/inspecciones");
      return;
    }

    setInspeccion(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarClientes();
    cargarInspeccion();
  }, [id]);

  // ============================
  // GUARDAR CAMBIOS
  // ============================
  const guardarCambios = async () => {
    if (!inspeccion.cliente_id) {
      alert("Selecciona un cliente.");
      return;
    }

    if (!inspeccion.fecha) {
      alert("Selecciona una fecha.");
      return;
    }

    if (!inspeccion.estado) {
      alert("Selecciona un estado.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("inspecciones")
      .update(inspeccion)
      .eq("id", id);

    setGuardando(false);

    if (error) {
      console.error("Error actualizando inspección:", error);
      alert("Error actualizando inspección");
      return;
    }

    navigate(`/inspecciones/${id}`);
  };

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Editar Inspección</h1>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Editar Inspección</h1>

      {/* Cliente */}
      <label>Cliente</label>
      <select
        value={inspeccion.cliente_id}
        onChange={(e) =>
          setInspeccion({ ...inspeccion, cliente_id: e.target.value })
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "white",
        }}
      >
        <option value="">Seleccionar cliente...</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      {/* Fecha */}
      <label>Fecha</label>
      <input
        type="date"
        value={inspeccion.fecha}
        onChange={(e) =>
          setInspeccion({ ...inspeccion, fecha: e.target.value })
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "white",
        }}
      />

      {/* Estado */}
      <label>Estado</label>
      <select
        value={inspeccion.estado}
        onChange={(e) =>
          setInspeccion({ ...inspeccion, estado: e.target.value })
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "white",
        }}
      >
        <option value="pendiente">Pendiente</option>
        <option value="en_proceso">En proceso</option>
        <option value="completada">Completada</option>
      </select>

      {/* Notas */}
      <label>Notas</label>
      <textarea
        value={inspeccion.notas}
        onChange={(e) =>
          setInspeccion({ ...inspeccion, notas: e.target.value })
        }
        style={{
          width: "100%",
          padding: 12,
          height: 120,
          marginBottom: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "white",
        }}
      />

      {/* Botón Guardar */}
      <button
        onClick={guardarCambios}
        disabled={guardando}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: guardando ? "#15803d" : "#22c55e",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        {guardando ? "Guardando..." : "Guardar Cambios"}
      </button>

      {/* Botón Cancelar */}
      <button
        onClick={() => navigate(`/inspecciones/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 12,
        }}
      >
        Cancelar
      </button>
    </div>
  );
}
