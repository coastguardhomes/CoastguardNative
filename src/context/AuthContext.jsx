import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
      // El rol vive en `profiles`; la tabla `usuarios` no existe y devolvía
      // 404, así que role se quedaba en null y Menu.jsx no pintaba la barra.
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

  // ⭐ Redirección automática por rol.
  //
  // Sólo actúa desde la pantalla de acceso (o la raíz). Antes se ejecutaba
  // con cada cambio de `user`, y onAuthStateChange entrega un objeto nuevo en
  // cada refresco de token: eso devolvía al dashboard a mitad de navegación y
  // dejaba la app atascada en la pantalla inicial.
  useEffect(() => {
    if (loading) return;

    const enPantallaDeAcceso = pathname === "/" || pathname === "/login";

    // Si no hay usuario → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!enPantallaDeAcceso) return;

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
