import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function setupRecoverySession() {
      try {
        const hash = location.hash || window.location.hash || "";
        if (hash) {
          const hashString = hash.startsWith("#") ? hash.substring(1) : hash;
          const params = new URLSearchParams(hashString);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error && isMounted) {
              setErrorMsg("El enlace de recuperación ha caducado. Por favor, solicita uno nuevo.");
            }
          }
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session && isMounted) {
            setErrorMsg("No se encontró una sesión válida. Por favor, solicita un nuevo correo de recuperación.");
          }
        }
      } catch (err) {
        console.error("Error en setupRecoverySession:", err);
      } finally {
        if (isMounted) setReady(true);
      }
    }

    setupRecoverySession();

    return () => { isMounted = false; };
  }, [location]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMensaje("");
    setErrorMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Error al actualizar la contraseña.");
      return;
    }

    setMensaje("¡Contraseña actualizada correctamente! Redirigiendo al inicio de sesión...");

    // Cerramos la sesión temporal para obligar a iniciar sesión con la nueva clave
    await supabase.auth.signOut();

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  };

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at center, #10192d 0%, #080c14 100%)",
          color: "#d4af37",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
        }}
      >
        Cargando formulario de seguridad...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #10192d 0%, #080c14 100%)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(16, 25, 45, 0.85)",
          padding: "32px 24px",
          borderRadius: "16px",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 0 25px rgba(212, 175, 55, 0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ color: "#d4af37", margin: "0 0 8px 0", fontSize: "22px" }}>
            Nueva Contraseña
          </h2>
          <p style={{ color: "#a0aec0", fontSize: "14px", margin: 0 }}>
            Escribe tu nueva clave de acceso
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              padding: "12px",
              borderRadius: "8px",
              color: "#fca5a5",
              marginBottom: "16px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              padding: "12px",
              borderRadius: "8px",
              color: "#86efac",
              marginBottom: "16px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)",
              color: "#0a0f1d",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.25)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
