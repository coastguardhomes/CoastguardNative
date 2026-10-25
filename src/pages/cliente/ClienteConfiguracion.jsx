
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { supabase } from "../../lib/supabase.js";
import Menu from "../../layouts/Menu.jsx";
import logoReal from "../../assets/logo.jpeg";

const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;

export default function ClienteConfiguracion() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const es = language !== "en";

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const texto = {
    titulo: es ? "Seguridad de la cuenta" : "Account Security",
    cambiar: es ? "Cambiar contraseña" : "Change password",
    actual: es ? "Contraseña actual" : "Current password",
    nueva: es ? "Nueva contraseña" : "New password",
    confirmar: es ? "Confirmar nueva contraseña" : "Confirm new password",
    minimo: es
      ? "La nueva contraseña debe tener al menos 8 caracteres."
      : "The new password must contain at least 8 characters.",
    noCoinciden: es
      ? "Las nuevas contraseñas no coinciden."
      : "The new passwords do not match.",
    faltan: es
      ? "Completa los tres campos."
      : "Complete all three fields.",
    usuario: es
      ? "No se ha encontrado una sesión iniciada. Vuelve a iniciar sesión."
      : "No authenticated session was found. Please sign in again.",
    credenciales: es
      ? "La contraseña actual no es correcta."
      : "The current password is incorrect.",
    guardando: es ? "Actualizando..." : "Updating...",
    exito: es
      ? "La contraseña se ha cambiado correctamente."
      : "Your password has been changed successfully.",
    error: es
      ? "No se ha podido cambiar la contraseña. Inténtalo de nuevo."
      : "The password could not be changed. Please try again.",
    volver: t("volver"),
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!contrasenaActual || !contrasenaNueva || !confirmacion) {
      setError(texto.faltan);
      return;
    }

    if (contrasenaNueva.length < 8) {
      setError(texto.minimo);
      return;
    }

    if (contrasenaNueva !== confirmacion) {
      setError(texto.noCoinciden);
      return;
    }

    if (contrasenaActual === contrasenaNueva) {
      setError(
        es
          ? "La nueva contraseña debe ser diferente de la actual."
          : "The new password must be different from the current one."
      );
      return;
    }

    setCargando(true);

    try {
      // Comprobar la sesión y obtener el correo de la cuenta actual.
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user?.email) {
        throw new Error("NO_AUTHENTICATED_USER");
      }

      // Verificar la contraseña actual sin cerrar la sesión de la cuenta.
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: userData.user.email,
          password: contrasenaActual,
        });

      if (loginError) {
        throw new Error("CURRENT_PASSWORD_INVALID");
      }

      // Actualizar la contraseña de la cuenta autenticada.
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: contrasenaNueva,
        });

      if (updateError) {
        throw updateError;
      }

      setContrasenaActual("");
      setContrasenaNueva("");
      setConfirmacion("");
      setExito(texto.exito);
    } catch (err) {
      if (err.message === "NO_AUTHENTICATED_USER") {
        setError(texto.usuario);
      } else if (err.message === "CURRENT_PASSWORD_INVALID") {
        setError(texto.credenciales);
      } else {
        setError(err.message || texto.error);
      }
    } finally {
      setCargando(false);
    }
  };

  const estiloCampo = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "7px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#080e18",
    color: "#fff",
    fontSize: "14px",
    outlineColor: COLOR_DORADO,
  };

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
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
            border: BORDE_DORADO,
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
            }}
          >
            <img
              src={logoReal}
              alt="CoastGuard Homes"
              style={{
                height: "40px",
                width: "auto",
                filter: `drop-shadow(0 0 6px ${COLOR_BRILLO_DORADO})`,
              }}
            />
            <h1
              style={{
                fontSize: "14px",
                fontWeight: "800",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                lineHeight: "1.3",
                color: COLOR_DORADO,
                textShadow: `0 0 8px ${COLOR_BRILLO_DORADO}`,
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
              border: BORDE_DORADO,
              color: COLOR_DORADO,
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
            background: FONDO_TARJETA,
            border: BORDE_DORADO,
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

          <form onSubmit={handleCambiarContrasena}>
            <label
              htmlFor="contrasena-actual"
              style={{ display: "block", fontSize: "12px", fontWeight: "700" }}
            >
              {texto.actual}
            </label>
            <input
              id="contrasena-actual"
              type="password"
              autoComplete="current-password"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              style={estiloCampo}
              required
              disabled={cargando}
            />

            <label
              htmlFor="contrasena-nueva"
              style={{
                display: "block",
                marginTop: "18px",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              {texto.nueva}
            </label>
            <input
              id="contrasena-nueva"
              type="password"
              autoComplete="new-password"
              value={contrasenaNueva}
              onChange={(e) => setContrasenaNueva(e.target.value)}
              style={estiloCampo}
              minLength={8}
              required
              disabled={cargando}
            />

            <label
              htmlFor="confirmacion-contrasena"
              style={{
                display: "block",
                marginTop: "18px",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              {texto.confirmar}
            </label>
            <input
              id="confirmacion-contrasena"
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
      </div>
    </Menu>
  );
}
