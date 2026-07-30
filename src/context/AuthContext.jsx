import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    // El rol vive en profiles.rol. Se resuelve aquí una sola vez y se comparte
    // por contexto: antes cada PrivateRoute lo consultaba al montarse, o sea
    // una petición de red en cada navegación.
    async function cargarRol(usuario) {
      if (!usuario) return null;

      const { data } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", usuario.id)
        .maybeSingle();

      return data?.rol || null;
    }

    async function inicializar() {
      const { data } = await supabase.auth.getSession();
      const sesion = data?.session || null;

      const rolActual = await cargarRol(sesion?.user);
      if (cancelado) return;

      setSession(sesion);
      setUser(sesion?.user || null);
      setRol(rolActual);
      setLoading(false);
    }

    inicializar();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, sesion) => {
        // onAuthStateChange se dispara en login, logout y refresco de token.
        setSession(sesion || null);
        setUser(sesion?.user || null);

        const rolActual = await cargarRol(sesion?.user);
        if (!cancelado) setRol(rolActual);
      }
    );

    return () => {
      cancelado = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRol(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, rol, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
