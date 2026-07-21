import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();

  // Restauración de sesión estable en móvil
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      setTimeout(async () => {
        if (data.session) {
          await redirigirSegunRol(data.session.user.id);
        } else {
          setCheckingSession(false);
        }
      }, 150);
    };

    checkSession();
  }, [navigate]);

  // 🔥 FUNCIÓN QUE DECIDE LA PANTALLA SEGÚN EL ROL
  async function redirigirSegunRol(userId) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", userId)
      .single();

    if (!perfil) {
      navigate("/home", { replace: true });
      return;
    }

    switch (perfil.rol) {
      case "admin":
        navigate("/menu", { replace: true });   // 🔥 ADMIN → MENU
        break;

      case "cliente":
        navigate("/cliente", { replace: true });
        break;

      case "tecnico":
        navigate("/tecnico", { replace: true });
        break;

      default:
        navigate("/home", { replace: true });
    }
  }

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return;

    await redirigirSegunRol(data.user.id);
  };

  if (checkingSession) {
    return (
      <div
        style={{
          height: "100%",
          background: "#0a0f1a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: 18,
        }}
      >
        Cargando...
      </div>
    );
  }

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
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#0a4a7a" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}
