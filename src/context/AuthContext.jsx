
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { App } from "@capacitor/app";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Botón atrás normal en toda la aplicación.
  useEffect(() => {
    const backSub = App.addListener("backButton", () => {
      // Si no hay usuario, se conserva el comportamiento existente.
      if (!user) return;

      window.history.back();
    });

    return () => {
      backSub.remove();
    };
  }, [user]);

  // Cargar sesión al iniciar la aplicación.
  useEffect(() => {
    async function cargarSesion() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        setUser(data.session.user);
      }

      setLoading(false);
    }

    cargarSesion();

    // Escuchar cambios de sesión.
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cargar el rol del usuario.
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    async function cargarRol() {
      const { data, error } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setRole(data.rol);
      }
    }

    cargarRol();
  }, [user]);

  // Redirección automática por rol.
  useEffect(() => {
    if (loading) return;

    // No redirigir durante la actualización de contraseña.
    if (pathname.includes("update-password")) {
      return;
    }

    // Rutas accesibles sin iniciar sesión.
    // IMPORTANTE: los documentos legales deben permanecer públicos.
    const rutasPublicas = [
      "/",
      "/login",
      "/register",
      "/reset-password",
      "/update-password",
      "/auth/callback",
      "/documentos-legales",
      "/politica-privacidad",
    ];

    const esPublica = rutasPublicas.includes(pathname);

    // Sin sesión, solo se permite permanecer en rutas públicas.
    if (!user && !esPublica) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user || !esPublica) return;

    // Si ya existe una sesión, conservar la redirección por rol.
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (role === "tecnico") {
      navigate("/tecnico", { replace: true });
      return;
    }

    if (role === "cliente") {
      navigate("/cliente", { replace: true });
      return;
    }
  }, [user, role, loading, navigate, pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
