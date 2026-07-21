import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      setMensaje("Introduce email y contraseña");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje("Cuenta creada. Revisa tu email para confirmar.");
    setTimeout(() => navigate("/"), 1200);
  };

  return (
    <div
      style={{
        height: "100%",
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
          Crear cuenta
        </h1>

        {mensaje && (
          <p
            style={{
              color: "#4db8ff",
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "15px",
            }}
          >
            {mensaje}
          </p>
        )}

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
          onClick={handleRegister}
          disabled={loading}
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
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          {loading ? "Creando..." : "Registrarse"}
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "none",
            color: "#4db8ff",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
            marginTop: "15px",
            textDecoration: "underline",
          }}
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
