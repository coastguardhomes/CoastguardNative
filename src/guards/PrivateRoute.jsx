import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function PrivateRoute() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    async function load() {
      // ⭐ Android necesita tiempo para inicializar Supabase
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;

      setSession(currentSession);

      if (currentSession) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", currentSession.user.id)
          .single();

        setRole(perfil?.rol || null);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          background: "#0a0f1a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: 18,
        }}
      >
        Cargando...
      </div>
    );
  }

  // ❌ Sin sesión → login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // ⭐ Rutas protegidas por rol
  const path = location.pathname;

  if (path.startsWith("/menu") && role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  if (path.startsWith("/cliente") && role !== "cliente") {
    return <Navigate to="/login" replace />;
  }

  if (path.startsWith("/tecnico") && role !== "tecnico") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
