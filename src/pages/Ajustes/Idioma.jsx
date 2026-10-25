
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../supabaseClient";

export default function Idioma() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const textos = {
    es: {
      descripcion: "Elige el idioma en el que deseas visualizar la aplicación:",
      guardando: "Guardando preferencia de idioma...",
      guardado: "Preferencia de idioma guardada.",
      sinSesion:
        "El idioma ha cambiado en este dispositivo, pero no se ha podido verificar la sesión.",
      errorGuardar:
        "El idioma ha cambiado en esta pantalla, pero no se ha podido confirmar que se guardara en el perfil. Vuelve a intentarlo.",
      errorSinCliente:
        "El idioma ha cambiado en este dispositivo, pero no se encontró un perfil de cliente asociado a esta cuenta.",
      errorInesperado:
        "No se ha podido confirmar el guardado del idioma en el perfil.",
    },
    en: {
      descripcion: "Choose the language you want to use in the application:",
      guardando: "Saving language preference...",
      guardado: "Language preference saved.",
      sinSesion:
        "The language has changed on this device, but the session could not be verified.",
      errorGuardar:
        "The language has changed on this screen, but saving it to your profile could not be confirmed. Please try again.",
      errorSinCliente:
        "The language has changed on this device, but no client profile was found for this account.",
      errorInesperado:
        "The language preference could not be confirmed as saved to your profile.",
    },
  };

  const idiomaActual = language === "en" ? "en" : "es";
  const copy = textos[idiomaActual];

  const handleSelectLanguage = async (newLang) => {
    if (!["es", "en"].includes(newLang) || guardando) {
      return;
    }

    setError("");
    setMensaje("");

    // Aplicar inmediatamente el idioma en esta instalación.
    changeLanguage(newLang);
    localStorage.setItem("app_idioma", newLang);

    const mensajes = textos[newLang];

    if (!user?.id) {
      setError(mensajes.sinSesion);
      return;
    }

    setGuardando(true);

    try {
      const { data, error: updateError } = await supabase
        .from("clientes")
        .update({ idioma: newLang })
        .or(`usuario_id.eq.${user.id},user_id.eq.${user.id}`)
        .select("id");

      if (updateError) {
        console.error(
          "Error guardando el idioma del cliente:",
          updateError
        );
        setError(mensajes.errorGuardar);
        return;
      }

      if (!data || data.length === 0) {
        setError(mensajes.errorSinCliente);
        return;
      }

      setMensaje(mensajes.guardado);
    } catch (err) {
      console.error("Error inesperado guardando el idioma:", err);
      setError(mensajes.errorInesperado);
    } finally {
      setGuardando(false);
    }
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const btnStyle = (isActive) => ({
    width: "100%",
    padding: "15px",
    marginBottom: "12px",
    backgroundColor: isActive
      ? "#2563eb"
      : "rgba(255,255,255,0.08)",
    color: "#fff",
    border:
      "1px solid " +
      (isActive ? "#3b82f6" : "rgba(255,255,255,0.15)"),
    borderRadius: "10px",
    cursor: guardando ? "wait" : "pointer",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s ease",
    opacity: guardando ? 0.7 : 1,
  });

  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#4db8ff",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          ← {t("volver") || (idiomaActual === "en" ? "Back" : "Volver")}
        </button>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          🌐{" "}
          {t("cambiarIdioma") ||
            (idiomaActual === "en" ? "Select language" : "Seleccionar idioma")}
        </h1>

        <div style={cardStyle}>
          <p
            style={{
              fontSize: "15px",
              opacity: 0.8,
              marginBottom: "20px",
            }}
          >
            {copy.descripcion}
          </p>

          <button
            type="button"
            disabled={guardando}
            aria-pressed={idiomaActual === "es"}
            onClick={() => handleSelectLanguage("es")}
            style={btnStyle(idiomaActual === "es")}
          >
            🇪🇸 Español {idiomaActual === "es" && "✓"}
          </button>

          <button
            type="button"
            disabled={guardando}
            aria-pressed={idiomaActual === "en"}
            onClick={() => handleSelectLanguage("en")}
            style={btnStyle(idiomaActual === "en")}
          >
            🇬🇧 English {idiomaActual === "en" && "✓"}
          </button>

          {guardando && (
            <p role="status" style={{ fontSize: "14px" }}>
              {copy.guardando}
            </p>
          )}

          {mensaje && (
            <p
              role="status"
              style={{
                color: "#4dff88",
                fontSize: "14px",
                overflowWrap: "anywhere",
              }}
            >
              {mensaje}
            </p>
          )}

          {error && (
            <p
              role="alert"
              style={{
                color: "#ff8a8a",
                fontSize: "14px",
                overflowWrap: "anywhere",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </Menu>
  );
}
