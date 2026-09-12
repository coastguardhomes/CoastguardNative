import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = async () => {
    setMensaje("");
    setErrorMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message || "Error actualizando contraseña.");
      return;
    }

    setMensaje("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1a",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
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
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Cambiar contraseña
        </h2>

        {errorMsg && (
          <div
            style={{
              background: "rgba(255,0,0,0.15)",
              padding: "10px",
              borderRadius: "8px",
              color: "#ff6b6b",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              background: "rgba(0,255,0,0.15)",
              padding: "10px",
              borderRadius: "8px",
              color: "#4dff88",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
          }}
        />

        <button
          onClick={handleUpdate}
          style={{
            width: "100%",
            padding: "12px",
            background: "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Guardar nueva contraseña
        </button>
      </div>
    </div>
  );
}
