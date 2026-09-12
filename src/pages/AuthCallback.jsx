import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Forzar a Supabase a procesar el hash de la URL (token de confirmación)
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data?.user) {
        // Usuario confirmado → lo mandamos al login
        navigate("/login", { replace: true });
      } else {
        // Si algo falla, también lo mandamos al login
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1a",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p>Confirmando tu cuenta, un momento...</p>
    </div>
  );
}
