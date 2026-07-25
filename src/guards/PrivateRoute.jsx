import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const { data: perfil } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", user.id)
        .single();

      setRole(perfil?.rol || null);
      setChecking(false);
    };

    fetchRole();
  }, [user]);

  if (loading || checking) return null;

  if (!user) return <Navigate to="/login" replace />;

  // ADMIN
  if (window.location.pathname.startsWith("/menu") && role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // CLIENTE
  if (window.location.pathname.startsWith("/cliente") && role !== "cliente") {
    return <Navigate to="/login" replace />;
  }

  // TÉCNICO
  if (window.location.pathname.startsWith("/tecnico") && role !== "tecnico") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
