import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function NuevoTecnico() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [mensaje, setMensaje] = useState("");

  const guardar = async () => {
    if (!nombre) {
      setMensaje("El nombre es obligatorio");
      return;
    }

    const { error } = await supabase.from("tecnicos").insert([
      {
        nombre,
        telefono,
        email,
        especialidad,
        activo: true,
      },
    ]);

    if (error) setMensaje("Error al guardar el técnico");
    else window.location.href = "/tecnicos";
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Nuevo Técnico</h1>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Especialidad"
        value={especialidad}
        onChange={(e) => setEspecialidad(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <button
        onClick={guardar}
        style={{
          padding: "10px 15px",
          background: "#34C759",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginRight: 10,
        }}
      >
        Guardar
      </button>

      <button
        onClick={() => (window.location.href = "/tecnicos")}
        style={{
          padding: "10px 15px",
          background: "#333",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Volver
      </button>
    </div>
  );
}