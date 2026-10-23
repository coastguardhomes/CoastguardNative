
import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idioma, setIdioma] = useState("es");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
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
      } catch {
        // Se conserva el mensaje genérico si el error no se puede convertir.
      }
    }

    if (!msg || msg === "{}") {
      msg = "Error de conexión con el servidor o credenciales inválidas";
    }

    setErrorMsg(customPrefix ? `${customPrefix}: ${msg}` : msg);
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setMensaje("");

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      setErrorMsg("Debes completar todos los campos");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!aceptaPrivacidad) {
      setErrorMsg(
        "Debes confirmar que has leído la Política de Privacidad."
      );
      return;
    }

    setLoading(true);

    try {
      // La fecha probatoria de aceptación la genera el trigger de Supabase
      // con la fecha de alta del servidor, no con una hora enviada por el navegador.
      const versionPrivacidad = "v1.1";

      const { data, error } = await supabase.auth.signUp({
        email: emailNormalizado,
        password,
        options: {
          emailRedirectTo: "coastguard://auth/callback",
          data: {
            acepta_privacidad: true,
            version_privacidad: versionPrivacidad,
            idioma,
          },
        },
      });

      if (error) {
        handleError(error);
        return;
      }

      const user = data?.user;

      if (!user) {
        setErrorMsg(
          "Error inesperado creando usuario (sin datos de usuario)."
        );
        return;
      }

      // Los triggers de Supabase crean el perfil, vinculan o crean la ficha
      // de cliente y guardan la evidencia legal. No se repiten escrituras desde
      // el navegador, que pueden fallar por RLS antes de confirmar el correo.
      // Si una operación esencial falla, el trigger aborta el alta y signUp devuelve error.

      changeLanguage(idioma);
      localStorage.setItem("app_idioma", idioma);

      setMensaje(
        "Cuenta creada correctamente. Se ha enviado un enlace de confirmación a tu correo."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error durante el registro:", error);
      handleError(error, "No se ha podido completar el registro");
    } finally {
      setLoading(false);
    }
  };

  const estiloEnlace = {
    color: "#4db8ff",
    textDecoration: "underline",
    cursor: "pointer",
  };

  const abrirDocumento = (documento) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/documentos-legales#${documento}`);
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "380px",
          margin: "20px auto",
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
            role="alert"
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
            role="status"
            style={{
              background: "rgba(0,255,0,0.15)",
              padding: "10px",
              borderRadius: "8px",
              color: "#4dff88",
              marginBottom: "15px",
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
          autoComplete="email"
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="idioma"
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#9fb3c8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Idioma preferido / Preferred Language
          </label>

          <select
            id="idioma"
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "#0a0f1a",
              color: "#fff",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            textAlign: "left",
          }}
        >
          <input
            type="checkbox"
            id="aceptaPrivacidad"
            checked={aceptaPrivacidad}
            onChange={(e) => setAceptaPrivacidad(e.target.checked)}
            required
            style={{
              marginTop: "4px",
              cursor: "pointer",
              width: "18px",
              height: "18px",
              flexShrink: 0,
            }}
          />

          <label
            htmlFor="aceptaPrivacidad"
            style={{
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#9fb3c8",
              cursor: "pointer",
            }}
          >
            He leído la{" "}
            <a
              href="/documentos-legales#privacidad"
              onClick={abrirDocumento("privacidad")}
              style={estiloEnlace}
            >
              Política de Privacidad
            </a>{" "}
            y confirmo que he sido informado sobre el tratamiento de mis
            datos personales.
          </label>
        </div>

        <p
          style={{
            color: "#9fb3c8",
            fontSize: "12px",
            lineHeight: "1.5",
            marginBottom: "20px",
          }}
        >
          La creación de la cuenta no sustituye la aceptación ni la firma
          del contrato concreto de los servicios que contrates. Ese contrato
          se mostrará para su revisión y firma en el proceso correspondiente.
        </p>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading || !aceptaPrivacidad}
          style={{
            width: "100%",
            padding: "12px",
            background:
              !aceptaPrivacidad || loading ? "#2a324b" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor:
              !aceptaPrivacidad || loading ? "not-allowed" : "pointer",
            opacity: !aceptaPrivacidad || loading ? "0.4" : "1",
            transition: "background 0.2s, opacity 0.2s",
          }}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <button
          type="button"
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
