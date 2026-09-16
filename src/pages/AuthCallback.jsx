import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = location.hash || window.location.hash || "";
      const search = location.search || window.location.search || "";
      const combined = hash + search;

      // Si es un flujo de recuperación de contraseña, redirigimos inmediatamente a /update-password
      if (combined.includes("type=recovery") || combined.includes("update-password")) {
        navigate(`/update-password${hash}`, { replace: true });
        return;
      }

      // Si es otro flujo (por ejemplo, confirmación de registro)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
      navigate("/login", { replace: true });
    };

    handleAuthCallback();
  }, [navigate, location]);

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
      Verificando autenticación...
    </div>
  );
}
