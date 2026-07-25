import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function enviarReset() {
    if (!email) {
      setMensaje("Por favor introduce tu email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://coastguard.app/#/update-password", // URL FIJA Y SEGURA
    });

    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Te hemos enviado un correo para recuperar tu contraseña.");
    }
  }

  return (
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: 20,
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: 20,
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        Recuperar contraseña
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: 20,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
        }}
      >
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 12,
            width: "100%",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            marginBottom: 15,
          }}
        />

        <button
          onClick={enviarReset}
          style={{
            padding: 12,
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: 8,
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Enviar enlace
        </button>

        {mensaje && (
          <p style={{ marginTop: 20, opacity: 0.9, textAlign: "center" }}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
