import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

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
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setRole(data.rol);
      }
    }

    cargarRol();
  }, [user]);

  // ⭐ Redirección automática por rol
  useEffect(() => {
    if (loading) return;

    // Si no hay usuario → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Si hay usuario → redirigir según rol
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
  }, [user, role, loading, navigate]);

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
