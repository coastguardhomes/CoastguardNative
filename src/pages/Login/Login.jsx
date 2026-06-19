import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
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
        <h1
          style={{
            textAlign: "center",
            color: "#4db8ff",
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "25px",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          CoastGuard
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#fff",
            opacity: 0.7,
            marginBottom: "25px",
          }}
        >
          Inicia sesión para continuar
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
          }}
        />

        <button
          style={{
            width: "100%",
            padding: "12px",
            background: "#4db8ff",
            border: "none",
            borderRadius: "8px",
            color: "#000",
            fontWeight: "700",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Entrar
        </button>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#fff",
            opacity: 0.6,
            fontSize: "14px",
          }}
        >
          Próximamente: login real con Supabase Auth.
        </p>
      </div>
    </div>
  );
}
