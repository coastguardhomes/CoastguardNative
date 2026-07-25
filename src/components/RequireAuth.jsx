import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const [session, setSession] = useState(undefined); // undefined = cargando

  useEffect(() => {
    let mounted = true;

    // Cargar sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    // Escuchar cambios de sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Mientras carga
  if (session === undefined) return null;

  // Si no hay sesión → redirigir
  if (!session) return <Navigate to="/login" replace />;

  // Si hay sesión → mostrar contenido
  return children;
}
