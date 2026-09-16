import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idioma, setIdioma] = useState("es");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { changeLanguage } = useLanguage();

  const handleError = (err, customPrefix = "") => {
    let msg = "";

    if (!err) {
      msg = "Error desconocido";
    } else if (typeof err === "string") {
      msg = err;
    } else if (err.message) {
      msg = err.message;
    } else {
      try {
        const stringified = JSON.stringify(err);
        if (stringified && stringified !== "{}" && stringified !== "[]") {
          msg = stringified;
        }
      } catch (e) {}
    }

    if (!msg || msg === "{}") {
      msg = "Error de conexión con el servidor o credenciales inválidas";
    }

    setErrorMsg(customPrefix ? `${customPrefix}: ${msg}` : msg);
  };

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

    if (!aceptaTerminos) {
      setErrorMsg("Debes aceptar la Política de Privacidad");
      return;
    }

    setLoading(true);

    // 1. Obtener la IP pública del usuario para la auditoría de privacidad
    let userIp = "IP_NO_DISPONIBLE";
    try {
      const ipRes = await fetch("https://api64.ipify.org?format=json");
      const ipData = await ipRes.json();
      userIp = ipData.ip;
    } catch (err) {
      console.warn("No se pudo obtener la IP del cliente", err);
    }

    const fechaAceptacion = new Date().toISOString();
    const versionPrivacidad = "v1.0";

    // 2. Registrar usuario en Supabase Auth guardando los metadatos de privacidad
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "coastguard://auth/callback",
        data: {
          acepta_privacidad: true,
          privacidad_aceptada_at: fechaAceptacion,
          ip_registro: userIp,
          version_privacidad: versionPrivacidad,
        },
      },
    });

    if (error) {
      handleError(error);
      setLoading(false);
      return;
    }

    const user = data?.user;

    if (!user) {
      setErrorMsg("Error inesperado creando usuario (sin datos de usuario)");
      setLoading(false);
      return;
    }

    const { error: perfilError } = await supabase
      .from("profiles")
      .insert({ id: user.id, rol: "cliente" });

    if (perfilError) {
      console.error("Error creando perfil:", perfilError);
    }

    const { data: clienteExistente } = await supabase
      .from("clientes")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    const datosPrivacidadCliente = {
      email: user.email,
      idioma: idioma,
      acepta_privacidad: true,
      privacidad_aceptada_at: fechaAceptacion,
      ip_registro: userIp,
      version_privacidad: versionPrivacidad,
    };

    if (!clienteExistente) {
      const { error: crearClienteError } = await supabase
        .from("clientes")
        .insert(datosPrivacidadCliente);

      if (crearClienteError) {
        handleError(crearClienteError, "Error DB (Crear)");
        setLoading(false);
        return;
      }
    } else {
      const { error: vincularError } = await supabase
        .from("clientes")
        .update(datosPrivacidadCliente)
        .eq("email", user.email);

      if (vincularError) {
        console.error("Error actualizando datos del cliente:", vincularError);
      }
    }

    changeLanguage(idioma);
    localStorage.setItem("app_idioma", idioma);

    setMensaje("Cuenta creada correctamente. Se ha enviado un enlace de confirmación a tu correo.");
    setLoading(false);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
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
              fontSize: "13px",
              wordBreak: "break-word",
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

        {/* CHECKBOX OBLIGATORIO DE POLÍTICA DE PRIVACIDAD */}
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "10px", textAlign: "left" }}>
          <input
            type="checkbox"
            id="terminos"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            style={{ marginTop: "4px", cursor: "pointer", width: "18px", height: "18px" }}
          />
          <label htmlFor="terminos" style={{ fontSize: "12px", lineHeight: "1.4", color: "#9fb3c8", cursor: "pointer" }}>
            He leído y acepto la <Link to="/politica-privacidad" target="_blank" style={{ color: "#4db8ff", textDecoration: "underline" }}>Política de Privacidad</Link>.
          </label>
        </div>

        {/* BOTÓN BLOQUEADO HASTA MARCAR EL CHECKBOX */}
        <button
          onClick={handleRegister}
          disabled={loading || !aceptaTerminos}
          style={{
            width: "100%",
            padding: "12px",
            background: (!aceptaTerminos || loading) ? "#1a365d" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: (!aceptaTerminos || loading) ? "not-allowed" : "pointer",
            opacity: (!aceptaTerminos || loading) ? 0.6 : 1,
            transition: "background 0.2s",
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
