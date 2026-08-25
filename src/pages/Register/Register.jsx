import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx"; // ⭐ 1. Importar el contexto de idioma

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idioma, setIdioma] = useState("es"); // Idioma seleccionado por el usuario
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { changeLanguage } = useLanguage(); // ⭐ 2. Extraer la función changeLanguage

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

    // 1️⃣ Registrar usuario en Supabase Auth
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

    // 2️⃣ Crear perfil en la tabla 'profiles'
    const { error: perfilError } = await supabase
      .from("profiles")
      .insert({ id: user.id, rol: "cliente" });

    if (perfilError) {
      console.error("Error creando perfil:", perfilError);
    }

    // 3️⃣ Comprobar si el cliente ya existe en la tabla 'clientes' (usando maybeSingle para evitar errores)
    const { data: clienteExistente, error: errorBusqueda } = await supabase
      .from("clientes")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (errorBusqueda) {
      console.error("Error buscando cliente existente:", errorBusqueda);
    }

    if (!clienteExistente) {
      // Crear cliente nuevo guardando explícitamente su idioma preferido
      const { error: crearClienteError } = await supabase
        .from("clientes")
        .insert({
          email: user.email,
          usuario_id: user.id,
          idioma: idioma, // ⭐ Guardamos el idioma aquí
        });

      if (crearClienteError) {
        console.error("Error creando cliente con idioma:", crearClienteError);
        setErrorMsg("Error al guardar el idioma del cliente en la base de datos.");
        setLoading(false);
        return;
      }
    } else {
      // Actualizar cliente existente vinculando su usuario_id y su idioma
      const { error: vincularError } = await supabase
        .from("clientes")
        .update({ usuario_id: user.id, idioma: idioma })
        .eq("email", user.email);

      if (vincularError) {
        console.error("Error actualizando idioma del cliente:", vincularError);
      }
    }

    // ⭐ 3.5 Sincronizar el idioma localmente para que la app lo adopte de inmediato
    changeLanguage(idioma);
    localStorage.setItem("app_idioma", idioma);

    // 4️⃣ Mensaje final + redirección
    setMensaje("Cuenta creada correctamente. Ya puedes iniciar sesión.");
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
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
          }}
        />

        {/* Selector de idioma */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#9fb3c8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Idioma Preferido / Preferred Language
          </label>
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: "15px",
            }}
          >
            <option value="es" style={{ background: "#0a0f1a", color: "#fff" }}>🇪🇸 Español</option>
            <option value="en" style={{ background: "#0a0f1a", color: "#fff" }}>🇬🇧 English</option>
            <option value="fr" style={{ background: "#0a0f1a", color: "#fff" }}>🇫🇷 Français</option>
          </select>
        </div>

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
