import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function NuevoCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [guardando, setGuardando] = useState(false);

  // ============================
  // GUARDAR CLIENTE
  // ============================
  const guardarCliente = async () => {
    if (!cliente.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("clientes")
      .insert([cliente])
      .select();

    setGuardando(false);

    if (error) {
      console.error("Error creando cliente:", error);
      alert("Error creando cliente");
      return;
    }

    navigate("/clientes");
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Nuevo Cliente</h1>

      {/* Nombre */}
      <label>Nombre</label>
      <input
        type="text"
        value={cliente.nombre}
        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
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

      {/* Teléfono */}
      <label>Teléfono</label>
      <input
        type="text"
        value={cliente.telefono}
        onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
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

      {/* Email */}
      <label>Email</label>
      <input
        type="email"
        value={cliente.email}
        onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
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

      {/* Dirección */}
      <label>Dirección</label>
      <input
        type="text"
        value={cliente.direccion}
        onChange={(e) =>
          setCliente({ ...cliente, direccion: e.target.value })
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

      {/* Botón Guardar */}
      <button
        onClick={guardarCliente}
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
        {guardando ? "Guardando..." : "Crear Cliente"}
      </button>

      {/* Botón Cancelar */}
      <button
        onClick={() => navigate("/clientes")}
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
