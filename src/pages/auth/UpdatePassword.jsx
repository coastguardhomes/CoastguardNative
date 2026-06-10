import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function actualizar() {
    if (!password || password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Contraseña actualizada correctamente.");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Crear nueva contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginTop: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={actualizar}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          background: "#4CAF50",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Guardar nueva contraseña
      </button>

      {mensaje && (
        <p style={{ marginTop: 20, opacity: 0.9 }}>{mensaje}</p>
      )}
    </div>
  );
}
