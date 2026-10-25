
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { supabase } from "../../supabaseClient.js";
import Menu from "../../layouts/Menu.jsx";
import logoReal from "../../assets/logo.jpeg";

const DORADO = "#e0b034";
const BRILLO = "rgba(224, 176, 52, 0.5)";
const FONDO = "#030509";
const TARJETA = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const BORDE = `1px solid ${DORADO}`;

export default function ClienteConfiguracion() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const es = language !== "en";

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const texto = {
    titulo: es ? "Seguridad de la cuenta" : "Account Security",
    cambiar: es ? "Cambiar contraseña" : "Change password",
    actual: es ? "Contraseña actual" : "Current password",
    nueva: es ? "Nueva contraseña" : "New password",
    confirmar: es
      ? "Confirmar nueva contraseña"
      : "Confirm new password",
    faltan: es
      ? "Completa los tres campos."
      : "Complete all three fields.",
    minimo: es
      ? "La nueva contraseña debe tener al menos 8 caracteres."
      : "The new password must contain at least 8 characters.",
    noCoinciden: es
      ? "Las nuevas contraseñas no coinciden."
      : "The new passwords do not match.",
    igual: es
      ? "La nueva contraseña debe ser diferente de la actual."
      : "The new password must be different from the current one.",
    sesion: es
      ? "Tu sesión ha caducado. Inicia sesión de nuevo."
      : "Your session has expired. Please sign in again.",
    error: es
      ? "No se ha podido cambiar la contraseña."
      : "The password could not be changed.",
    guardando: es ? "Actualizando..." : "Updating...",
    cerrando: es
      ? "Contraseña actualizada. Cerrando sesión..."
      : "Password updated. Signing out...",
    volver: t("volver"),
  };

  const obtenerMensajeError = (err) => {
    const mensaje = String(err?.message || "").toLowerCase();
    const codigo = String(err?.code || "").toLowerCase();

    if (
      mensaje.includes("current password") ||
      codigo === "current_password_mismatch"
    ) {
      return es
        ? "La contraseña actual es incorrecta o no se ha podido verificar."
        : "The current password is incorrect or could not be verified.";
    }

    if (
      mensaje.includes("weak password") ||
      mensaje.includes("easy to guess") ||
      mensaje.includes("password should be")
    ) {
      return es
        ? "La nueva contraseña es demasiado débil o fácil de adivinar. Elige otra más segura."
        : "The new password is too weak or easy to guess. Choose a stronger one.";
    }

    if (
      mensaje.includes("same password") ||
      mensaje.includes("different from the old password")
    ) {
      return texto.igual;
    }

    return err?.message || texto.error;
  };

  const handleCambiar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!actual || !nueva || !confirmacion) {
      setError(texto.faltan);
      return;
    }

    if (nueva.length < 8) {
      setError(texto.minimo);
      return;
    }

    if (nueva !== confirmacion) {
      setError(texto.noCoinciden);
      return;
    }

    if (actual === nueva) {
      setError(texto.igual);
      return;
    }

    setCargando(true);

    try {
      const { data: usuarioData, error: usuarioError } =
        await supabase.auth.getUser();

      if (usuarioError || !usuarioData?.user) {
        throw new Error("NO_VALID_SESSION");
      }

      // Supabase verifica la contraseña actual y cambia la nueva
      // en una sola operación.
      const { data: actualizacion, error: errorActualizacion } =
        await supabase.auth.updateUser({
          password: nueva,
          currentPassword: actual,
        });

      if (errorActualizacion) {
        throw errorActualizacion;
      }

      if (!actualizacion?.user) {
        throw new Error(
          es
            ? "Supabase no confirmó el cambio de contraseña."
            : "Supabase did not confirm the password change."
        );
      }

      // Solo se limpian los campos después de confirmar el cambio.
      setActual("");
      setNueva("");
      setConfirmacion("");
      setExito(texto.cerrando);

      const { error: errorCierre } = await supabase.auth.signOut({
        scope: "local",
      });

      if (errorCierre) {
        console.error("Error al cerrar sesión:", errorCierre);
        setExito("");
        setError(
          es
            ? "La contraseña se ha cambiado correctamente, pero no se pudo cerrar la sesión automáticamente. Cierra sesión manualmente."
            : "The password was changed successfully, but automatic sign-out failed. Please sign out manually."
        );
        return;
      }

      // Recargar la aplicación en la página de inicio de sesión.
      window.location.replace("/login");
    } catch (err) {
      console.error("Error al cambiar la contraseña:", err);

      if (err?.message === "NO_VALID_SESSION") {
        setError(texto.sesion);
      } else {
        setError(obtenerMensajeError(err));
      }
    } finally {
      setCargando(false);
    }
  };

  const estiloCampo = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "7px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#080e18",
    color: "#fff",
    fontSize: "14px",
    outlineColor: DORADO,
  };

  const estiloEtiqueta = {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
  };

  return (
    <Menu>
      <main
        style={{
          width: "100%",
          minHeight: "100vh",
          background: FONDO,
          padding: "15px",
          paddingBottom: "90px",
          boxSizing: "border-box",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          overflowX: "hidden",
        }}
      >
        <header
          style={{
            background: "linear-gradient(180deg, #0d1626 0%, #05080f 100%)",
            border: BORDE,
            borderRadius: "16px",
            padding: "12px 16px",
            marginBottom: "20px",
            boxShadow: "0 0 15px rgba(224, 176, 52, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={logoReal}
              alt="CoastGuard Homes"
              style={{
                height: "40px",
                width: "auto",
                filter: `drop-shadow(0 0 6px ${BRILLO})`,
              }}
            />
            <h1
              style={{
                fontSize: "14px",
                fontWeight: "800",
                margin: 0,
                textTransform: "uppercase",
                lineHeight: "1.3",
                color: DORADO,
                textShadow: `0 0 8px ${BRILLO}`,
              }}
            >
              {texto.titulo}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              border: BORDE,
              color: DORADO,
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {texto.volver}
          </button>
        </header>

        <section
          style={{
            background: TARJETA,
            border: BORDE,
            borderRadius: "16px",
            padding: "20px 16px",
            boxShadow: "0 0 12px rgba(224, 176, 52, 0.15)",
          }}
        >
          <h2
            style={{
              fontSize: "13px",
              color: "#cbd5e1",
              textTransform: "uppercase",
              margin: "0 0 20px",
              fontWeight: "700",
            }}
          >
            {texto.cambiar}
          </h2>

          <form onSubmit={handleCambiar}>
            <label htmlFor="password-current" style={estiloEtiqueta}>
              {texto.actual}
            </label>
            <input
              id="password-current"
              type="password"
              autoComplete="current-password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              style={estiloCampo}
              required
              disabled={cargando}
            />

            <label
              htmlFor="password-new"
              style={{ ...estiloEtiqueta, marginTop: "18px" }}
            >
              {texto.nueva}
            </label>
            <input
              id="password-new"
              type="password"
              autoComplete="new-password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              style={estiloCampo}
              minLength={8}
              required
              disabled={cargando}
            />

            <label
              htmlFor="password-confirm"
              style={{ ...estiloEtiqueta, marginTop: "18px" }}
            >
              {texto.confirmar}
            </label>
            <input
              id="password-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              style={estiloCampo}
              minLength={8}
              required
              disabled={cargando}
            />

            {error && (
              <p
                role="alert"
                style={{
                  color: "#fca5a5",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  marginTop: "16px",
                }}
              >
                {error}
              </p>
            )}

            {exito && (
              <p
                role="status"
                style={{
                  color: "#86efac",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  marginTop: "16px",
                }}
              >
                {exito}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: "100%",
                marginTop: "22px",
                background: cargando
                  ? "#64748b"
                  : "linear-gradient(90deg, #e0b034 0%, #b88a1d 100%)",
                border: "none",
                borderRadius: "30px",
                padding: "14px",
                color: "#000",
                fontWeight: "800",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 0 15px rgba(224, 176, 52, 0.3)",
                cursor: cargando ? "wait" : "pointer",
              }}
            >
              {cargando ? texto.guardando : texto.cambiar}
            </button>
          </form>
        </section>
      </main>
    </Menu>
  );
}
