import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function EditarCliente() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargarCliente = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando cliente:", error);
      alert("Error cargando cliente");
      return;
    }

    setNombre(data.nombre || "");
    setTelefono(data.telefono || "");
    setEmail(data.email || "");
    setDireccion(data.direccion || "");
    setNotas(data.notas || "");
    setCargando(false);
  };

  useEffect(() => {
    cargarCliente();
  }, []);

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("clientes")
      .update({
        nombre,
        telefono,
        email,
        direccion,
        notas,
      })
      .eq("id", id);

    setGuardando(false);

    if (error) {
      console.error("Error actualizando cliente:", error);
      alert("Error actualizando cliente");
      return;
    }

    navigate(`/clientes/${id}`);
  };

  if (cargando) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Editar Cliente</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Editar Cliente</h1>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 12,
        }}
      />

      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 12,
        }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 12,
        }}
      />

      <input
        type="text"
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 12,
        }}
      />

      <textarea
        placeholder="Notas"
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 12,
          minHeight: 100,
        }}
      />

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
          marginTop: 10,
        }}
      >
        {guardando ? "Guardando..." : "Guardar Cambios"}
      </button>

      <button
        onClick={() => navigate(`/clientes/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 10,
        }}
      >
        Cancelar
      </button>
    </div>
  );
}
