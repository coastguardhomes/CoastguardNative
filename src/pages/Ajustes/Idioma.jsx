
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../supabaseClient";

export default function Idioma() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { user, role } = useAuth();

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const textos = {
    es: {
      descripcion: "Elige el idioma en el que deseas visualizar la aplicación:",
      guardando: "Guardando preferencia de idioma...",
      guardado: "Preferencia de idioma guardada.",
      sinSesion: "No se ha podido verificar la sesión.",
      errorGuardar: "No se ha podido guardar el idioma en el perfil del cliente. Vuelve a intentarlo.",
      errorSinCliente: "No se encontró un perfil de cliente asociado a esta cuenta.",
      errorInesperado: "No se ha podido confirmar el guardado del idioma.",
    },
    en: {
      descripcion: "Choose the language you want to use in the application:",
      guardando: "Saving language preference...",
      guardado: "Language preference saved.",
      sinSesion: "The session could not be verified.",
      errorGuardar: "The language could not be saved to the client profile. Please try again.",
      errorSinCliente: "No client profile was found for this account.",
      errorInesperado: "The language preference could not be confirmed as saved.",
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

    if (!user?.id || !role) {
      setError(textos[newLang].sinSesion);
      return;
    }

    // La preferencia visual se aplica inmediatamente.
    // LanguageContext se encarga de guardarla por usuario.
    changeLanguage(newLang);

    // Administrador y técnico no deben modificar clientes.idioma.
    if (role !== "cliente") {
      setMensaje(textos[newLang].guardado);
      return;
    }

    setGuardando(true);

    try {
      let { data, error: updateError } = await supabase
        .from("clientes")
        .update({ idioma: newLang })
        .eq("usuario_id", user.id)
        .select("id");

      if (updateError) {
        throw updateError;
      }

      // Compatibilidad con perfiles que utilizan user_id.
      if (!data || data.length === 0) {
        const resultado = await supabase
          .from("clientes")
          .update({ idioma: newLang })
          .eq("user_id", user.id)
          .select("id");

        if (resultado.error) {
          throw resultado.error;
        }

        data = resultado.data;
      }

      if (!data || data.length === 0) {
        setError(textos[newLang].errorSinCliente);
        return;
      }

      setMensaje(textos[newLang].guardado);
    } catch (err) {
      console.error("Error guardando el idioma:", err);
      setError(textos[newLang].errorGuardar);
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
            (idiomaActual === "en"
              ? "Select language"
              : "Seleccionar idioma")}
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
