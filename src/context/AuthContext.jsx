import { createContext, useContext, useState, useEffect } from "react";

// Crear contexto
const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    // Simulación de login (luego lo conectamos a backend)
    if (email === "admin@admin.com" && password === "123456") {
      const userData = { email, role: "admin" };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { ok: true };
    }

    return { ok: false, message: "Credenciales incorrectas" };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
