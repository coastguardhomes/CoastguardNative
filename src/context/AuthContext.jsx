import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // ← CAMBIO
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

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

      const roleActual = await cargarRol(sesion?.user); // ← CAMBIO
      if (cancelado) return;

      setSession(sesion);
      setUser(sesion?.user || null);
      setRole(roleActual); // ← CAMBIO
      setLoading(false);
    }

    inicializar();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, sesion) => {
        setSession(sesion || null);
        setUser(sesion?.user || null);

        const roleActual = await cargarRol(sesion?.user); // ← CAMBIO
        if (!cancelado) setRole(roleActual); // ← CAMBIO
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
    setRole(null); // ← CAMBIO
  };

  return (
    <AuthContext.Provider value={{ session, user, role, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
