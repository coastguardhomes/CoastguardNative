import React, { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function procesar() {
      try {
        // Extraer el hash de la URL donde Supabase envía los tokens (ej: #access_token=...&type=recovery)
        const hash = location.hash || window.location.hash;
        const params = new URLSearchParams(hash.replace("#", "?"));
        const type = params.get("type");

        // 1. Caso de Recuperación de Contraseña
        if (type === "recovery") {
          navigate(`/update-password${hash}`, { replace: true });
          return;
        }

        // 2. Caso de Confirmación de Correo (signup / email_change)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Cerramos la sesión automática del enlace para que el cliente inicie sesión de forma manual
          await supabase.auth.signOut();
        }

        // Redirigir al Login indicando que ya se puede autenticar
        navigate("/login", {
          replace: true,
          state: { mensaje: "¡Cuenta confirmada con éxito! Ya puedes iniciar sesión." },
        });
      } catch (error) {
        console.error("Error al procesar el callback de autenticación:", error);
        navigate("/login", { replace: true });
      }
    }

    procesar();
  }, [navigate, location]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        background: "#0a0f1a",
      }}
    >
      Confirmando tu cuenta, un momento…
    </div>
  );
}
