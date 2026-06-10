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
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Te hemos enviado un correo para recuperar tu contraseña.");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Recuperar contraseña</h2>

      <input
        type="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginTop: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={enviarReset}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          background: "#2196F3",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Enviar enlace
      </button>

      {mensaje && (
        <p style={{ marginTop: 20, opacity: 0.9 }}>{mensaje}</p>
      )}
    </div>
  );
}
