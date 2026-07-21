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
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "rgba(255,255,255,0.05)",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 18px rgba(0,153,255,0.25)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "20px",
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Crear nueva contraseña
        </h2>

        {mensaje && (
          <p
            style={{
              textAlign: "center",
              color: "#4db8ff",
              marginBottom: "15px",
              fontSize: "15px",
            }}
          >
            {mensaje}
          </p>
        )}

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        />

        <button
          onClick={actualizar}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Guardar nueva contraseña
        </button>
      </div>
    </div>
  );
}
