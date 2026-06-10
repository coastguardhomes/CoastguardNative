import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function NuevoCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const crearCliente = async () => {
    if (!cliente.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    const { error } = await supabase
      .from("clientes")
      .insert(cliente);

    if (error) {
      console.error("Error creando cliente:", error);
      alert("Error al crear el cliente");
      return;
    }

    navigate("/clientes");
  };

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>Nuevo Cliente</h1>

        <label>Nombre</label>
        <input
          type="text"
          value={cliente.nombre}
          onChange={(e) =>
            setCliente({ ...cliente, nombre: e.target.value })
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <label>Teléfono</label>
        <input
          type="text"
          value={cliente.telefono}
          onChange={(e) =>
            setCliente({ ...cliente, telefono: e.target.value })
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <label>Email</label>
        <input
          type="email"
          value={cliente.email}
          onChange={(e) =>
            setCliente({ ...cliente, email: e.target.value })
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <label>Dirección</label>
        <input
          type="text"
          value={cliente.direccion}
          onChange={(e) =>
            setCliente({ ...cliente, direccion: e.target.value })
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <button
          onClick={crearCliente}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Crear Cliente
        </button>

        <button
          onClick={() => navigate("/clientes")}
          style={{
            marginTop: 12,
            padding: "12px 20px",
            background: "#475569",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Cancelar
        </button>
      </div>
    </LayoutWithMenu>
  );
}
