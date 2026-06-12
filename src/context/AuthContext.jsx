import { createContext, useState, useEffect } from "react";

// CONTEXTO DE AUTENTICACIÓN
export const AuthContext = createContext();

// PROVIDER
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Cargar usuario desde localStorage o Supabase si lo usas
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // LOGIN
  const login = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
