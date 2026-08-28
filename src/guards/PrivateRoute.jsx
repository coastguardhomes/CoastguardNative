import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function PrivateRoute({ allowedRole }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [authorized, setAuthorized] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  const rutasPublicas = ["/login", "/register", "/reset-password", "/update-password"];
  const esPublica = rutasPublicas.includes(pathname);

  useEffect(() => {
    async function verifyRole() {
      if (!user || esPublica) {
        setAuthorized(false);
        setCheckingRole(false);
        return;
      }

      // Si no se requiere un rol específico, con estar logueado basta
      if (!allowedRole) {
        setAuthorized(true);
        setCheckingRole(false);
        return;
      }

      try {
        if (allowedRole === "cliente") {
          const { data } = await supabase
            .from("clientes")
            .select("id")
            .eq("usuario_id", user.id)
            .maybeSingle();
          setAuthorized(!!data);
        } else if (allowedRole === "admin" || allowedRole === "tecnico") {
          const { data } = await supabase
            .from("usuarios")
            .select("rol")
            .eq("id", user.id)
            .maybeSingle();
          setAuthorized(data?.rol === allowedRole || data?.rol === "admin");
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Error verificando rol:", err);
        setAuthorized(false);
      } finally {
        setCheckingRole(false);
      }
    }

    if (!loading) {
      verifyRole();
    }
  }, [user, loading, allowedRole, pathname, esPublica]);

  if (loading || checkingRole) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          color: "#fff",
          fontSize: 17,
          lineHeight: 1.5,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Cargando…
      </div>
    );
  }

  if (!user && !esPublica) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado pero el rol no corresponde (intenta entrar por el botón atrás)
  if (user && allowedRole && authorized === false) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
