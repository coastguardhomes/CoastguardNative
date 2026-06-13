import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Mientras carga el estado del usuario
  if (loading) {
    return <div style={{ color: "white", textAlign: "center" }}>Cargando...</div>;
  }

  // Si NO está autenticado → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado → mostrar contenido protegido
  return children;
}
