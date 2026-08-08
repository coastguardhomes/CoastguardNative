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

  // ⭐ LOGOUT SOLO AL CERRAR LA APP COMPLETA
  useEffect(() => {
    // ANDROID: cerrar desde multitarea → dispara backButton
    const backSub = App.addListener("backButton", async () => {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    });

    // iOS: cerrar app → dispara appExit
    const exitSub = App.addListener("appExit", async () => {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    });

    return () => {
      backSub.remove();
      exitSub.remove();
    };
  }, []);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    async function cargarSesion() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        setUser(data.session.user);
      }

      setLoading(false);
    }

    cargarSesion();

    // Escuchar cambios de sesión
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

  // Cargar rol del usuario
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

  // Redirección automática por rol
  useEffect(() => {
    if (loading) return;

    const rutasPublicas = [
      "/",
      "/login",
      "/register",
      "/reset-password",
      "/update-password",
    ];
    const esPublica = rutasPublicas.includes(pathname);

    if (!user && !esPublica) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user || !esPublica) return;

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
