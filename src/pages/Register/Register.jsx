import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMsg("");
    setMensaje("");

    if (!email || !password) {
      setErrorMsg("Debes completar todos los campos");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    // 1️⃣ Registrar usuario en Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setErrorMsg("Error inesperado creando usuario");
      setLoading(false);
      return;
    }

    // ⭐ 2️⃣ Crear perfil SIEMPRE
    const { error: perfilError } = await supabase
      .from("profiles")
      .insert({ id: user.id, rol: "cliente" });

    if (perfilError) {
      console.error("Error creando perfil:", perfilError);
    }

    // ⭐ 3️⃣ Vincular cliente existente por email
    const { error: clienteError } = await supabase
      .from("clientes")
      .update({ usuario_id: user.id })
      .eq("email", user.email);

    if (clienteError) {
      console.error("Error vinculando cliente:", clienteError);
    }

    // ⭐ 4️⃣ Notificar al admin del nuevo técnico (CORREGIDO)
    try {
      await fetch(
        "https://wjomazuymbayceilvfku.supabase.co/functions/v1/notificar_admin_nuevo_tecnico",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabase.supabaseKey,
            "Authorization": `Bearer ${
              supabase.auth.getSession().data.session.access_token
            }`,
          },
          body: JSON.stringify({ tecnico_id: user.id }),
        }
      );
    } catch (e) {
      console.error("Error notificando admin:", e);
    }

    // 5️⃣ Mensaje final + redirección
    setMensaje("Cuenta creada correctamente. Revisa tu email para confirmar la cuenta.");
    setLoading(false);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "380px",
          margin: "0 auto",
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
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          Crear cuenta
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
            background: loading ? "#0a4a7a" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: "#4db8ff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
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
