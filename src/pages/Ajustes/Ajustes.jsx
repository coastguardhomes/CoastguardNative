
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { supabase } from "../../supabaseClient";

const TEXTOS = {
  es: {
    titulo: "⚙️ Ajustes",
    descripcion: "Configuración general de tu cuenta y preferencias de idioma.",
    idioma: "🌐 Idioma de la aplicación",
    sesion: "Sesión activa",
    cerrarSesion: "🚪 Cerrar sesión",
    guardado: "Idioma actualizado y guardado correctamente.",
    guardadoLocal:
      "El idioma ha cambiado en este dispositivo, pero no se ha podido confirmar el guardado en tu perfil.",
    error: "No se ha podido guardar el idioma en tu perfil. Inténtalo de nuevo.",
    idiomas: { es: "🇪🇸 Español", en: "🇬🇧 Inglés" },
  },
  en: {
    titulo: "⚙️ Settings",
    descripcion: "General account settings and language preferences.",
    idioma: "🌐 Application language",
    sesion: "Active session",
    cerrarSesion: "🚪 Log out",
    guardado: "Language preference updated and saved successfully.",
    guardadoLocal:
      "The language changed on this device, but saving it to your profile could not be confirmed.",
    error: "The language could not be saved to your profile. Please try again.",
    idiomas: { es: "🇪🇸 Spanish", en: "🇬🇧 English" },
  },
};

export default function Ajustes() {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const idioma = ["es", "en"].includes(language) ? language : "es";
  const texto = TEXTOS[idioma];

  const cambiarIdiomaManual = async (nuevoIdioma) => {
    if (!["es", "en"].includes(nuevoIdioma) || guardando) return;
    if (nuevoIdioma === idioma) return;

    setMensaje("");
    setTipoMensaje("");

    // Cambia inmediatamente el idioma de la interfaz.
    changeLanguage(nuevoIdioma);
    localStorage.setItem("app_idioma", nuevoIdioma);

    if (!user?.id) {
      setMensaje(TEXTOS[nuevoIdioma].guardadoLocal);
      setTipoMensaje("error");
      return;
    }

    setGuardando(true);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .update({ idioma: nuevoIdioma })
        .or(`usuario_id.eq.${user.id},user_id.eq.${user.id}`)
        .select("id");

      if (error) {
        console.error("Error guardando el idioma del cliente:", error);
        setMensaje(TEXTOS[nuevoIdioma].error);
        setTipoMensaje("error");
        return;
      }

      if (!data || data.length === 0) {
        console.warn(
          "No se encontró un registro de cliente asociado al usuario para guardar el idioma."
        );
        setMensaje(TEXTOS[nuevoIdioma].guardadoLocal);
        setTipoMensaje("error");
        return;
      }

      setMensaje(TEXTOS[nuevoIdioma].guardado);
      setTipoMensaje("exito");
    } catch (error) {
      console.error("Error inesperado guardando el idioma:", error);
      setMensaje(TEXTOS[nuevoIdioma].error);
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
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

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 0",
    fontSize: "16px",
    color: "#4db8ff",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };

  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          {texto.titulo}
        </h1>

        {mensaje && (
          <div
            role="status"
            aria-live="polite"
            style={{
              background:
                tipoMensaje === "error"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(34,197,94,0.2)",
              border:
                tipoMensaje === "error"
                  ? "1px solid rgba(239,68,68,0.4)"
                  : "1px solid rgba(34,197,94,0.4)",
              padding: "10px",
              borderRadius: "8px",
              color: tipoMensaje === "error" ? "#f87171" : "#22c55e",
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            {mensaje}
          </div>
        )}

        <div style={cardStyle}>
          <p
            style={{
              fontSize: "16px",
              opacity: 0.8,
              marginBottom: "15px",
            }}
          >
            {texto.descripcion}
          </p>

          <div style={itemStyle}>
            <label htmlFor="idioma-aplicacion">{texto.idioma}</label>

            <select
              id="idioma-aplicacion"
              value={idioma}
              disabled={guardando}
              onChange={(e) => cambiarIdiomaManual(e.target.value)}
              style={{
                background: "rgba(11, 19, 32, 0.9)",
                border: "1px solid rgba(0,153,255,0.4)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: guardando ? "wait" : "pointer",
                outline: "none",
                maxWidth: "55%",
              }}
            >
              <option value="es" style={{ background: "#030509" }}>
                {texto.idiomas.es}
              </option>
              <option value="en" style={{ background: "#030509" }}>
                {texto.idiomas.en}
              </option>
            </select>
          </div>

          <div style={itemStyle}>
            <span
              style={{
                color: "#fff",
                opacity: 0.85,
                overflowWrap: "anywhere",
              }}
            >
              📧 {user?.email || texto.sesion}
            </span>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            style={{
              ...itemStyle,
              width: "100%",
              background: "transparent",
              color: "#ff6b6b",
              cursor: "pointer",
              borderBottom: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              textAlign: "left",
            }}
          >
            {texto.cerrarSesion}
          </button>
        </div>
      </div>
    </Menu>
  );
}
