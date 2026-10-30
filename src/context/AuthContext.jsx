
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

  useEffect(() => {
    let activo = true;

    const backSub = App.addListener("backButton", () => {
      if (!user) return;
      window.history.back();
    });

    return () => {
      activo = false;
      backSub.remove();
    };
  }, [user]);

  useEffect(() => {
    let activo = true;

    async function cargarSesion() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!activo) return;

        setUser(data?.session?.user || null);
      } catch (error) {
        console.error("Error recuperando sesión:", error);
        if (activo) setUser(null);
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarSesion();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!activo) return;

        const nuevoUsuario = session?.user || null;

        setUser((usuarioActual) => {
          if (usuarioActual?.id !== nuevoUsuario?.id) {
            setRole(null);
          }
          return nuevoUsuario;
        });

        if (!nuevoUsuario) {
          setRole(null);
        }
      }
    );

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    setRole(null);

    if (!user?.id) {
      return () => {
        cancelado = true;
      };
    }

    async function cargarRol() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelado) return;

        if (error) {
          console.error("Error cargando rol:", error);
          setRole(null);
          return;
        }

        setRole(data?.rol || null);
      } catch (error) {
        if (!cancelado) {
          console.error("Error inesperado cargando rol:", error);
          setRole(null);
        }
      }
    }

    cargarRol();

    return () => {
      cancelado = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (loading) return;

    if (pathname.includes("update-password")) {
      return;
    }

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
    }
  }, [user, role, loading, navigate, pathname]);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setRole(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
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
