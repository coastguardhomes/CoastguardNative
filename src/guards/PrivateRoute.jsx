import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  // ⭐ Rutas públicas que NO deben mostrar overlay
  const rutasPublicas = ["/login", "/register", "/reset-password", "/update-password"];
  const esPublica = rutasPublicas.includes(pathname);

  // ⭐ Si está cargando pero es ruta pública → NO mostrar overlay
  if (loading && !esPublica) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          color: "#fff",
          fontSize: 17,
          lineHeight: 1.5,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Cargando…
      </div>
    );
  }

  // ⭐ Si no hay usuario y NO es ruta pública → login
  if (!user && !esPublica) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
