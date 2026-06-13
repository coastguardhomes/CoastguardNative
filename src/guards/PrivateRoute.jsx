import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "white", textAlign: "center" }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
