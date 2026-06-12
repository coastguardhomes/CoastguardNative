import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function NuevaInspeccion() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    fecha: "",
    estado: "pendiente",
    notas: "",
  });

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

  useEffect(() => {
    cargarClientes();
  }, []);

  // ============================
  // CREAR INSPECCIÓN
  // ============================
  const crearInspeccion = async () => {
    if (!form.cliente_id) {
      alert("Selecciona un cliente.");
      return;
    }

    if (!form.fecha) {
      alert("Selecciona una fecha.");
      return;
    }

    setGuardando(true);

    const { data, error } = await supabase
      .from("inspecciones")
      .insert([form])
      .select()
      .single();

    setGuardando(false);

    if (error) {
      console.error("Error creando inspección:", error);
      alert("Error creando inspección");
      return;
    }

    navigate(`/inspecciones/${data.id}`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Nueva Inspección</h1>

      {/* Cliente */}
      <label>Cliente</label>
      <select
        value={form.cliente_id}
        onChange={(e) =>
          setForm({ ...form, cliente_id: e.target.value })
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
        value={form.fecha}
        onChange={(e) =>
          setForm({ ...form, fecha: e.target.value })
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
        value={form.estado}
        onChange={(e) =>
          setForm({ ...form, estado: e.target.value })
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
        value={form.notas}
        onChange={(e) =>
          setForm({ ...form, notas: e.target.value })
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

      {/* Botón Crear */}
      <button
        onClick={crearInspeccion}
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
        {guardando ? "Creando..." : "Crear Inspección"}
      </button>

      {/* Botón Cancelar */}
      <button
        onClick={() => navigate("/inspecciones")}
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
