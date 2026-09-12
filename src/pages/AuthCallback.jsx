import React, { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function procesar() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        navigate("/login", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }

    procesar();
  }, [navigate]);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#fff",
      background: "#0a0f1a"
    }}>
      Confirmando tu cuenta, un momento…
    </div>
  );
}
