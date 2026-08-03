import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Guard de sesión y de rol.
 *
 * Ahora PrivateRoute solo controla acceso general por rol.
 * El área cliente está protegida por ClienteRoute.jsx.
 */

const PERMISOS = {
  "/inicio": ["admin"],
  "/menu": ["admin"],
  "/admin": ["admin"],
  "/clientes": ["admin"],
  "/tecnicos": ["admin"],
  "/contratos": ["admin"],
  "/facturas": ["admin"],
  "/extras": ["admin"],
  "/viviendas": ["admin", "tecnico"],
  "/inspecciones": ["admin", "tecnico"],
  "/tecnico": ["tecnico"],

  // Comunes
  "/ajustes": ["admin", "cliente", "tecnico"],
  "/idioma": ["admin", "cliente", "tecnico"],
};

const INICIO_POR_ROL = {
  admin: "/inicio",
  cliente: "/cliente",
  tecnico: "/tecnico",
};

function coincide(path, base) {
  return path === base || path.startsWith(base + "/");
}

export default function PrivateRoute() {
  const { session, role, loading } = useAuth(); // ← rol → role
  const location = useLocation();

  if (loading) {
    return <Aviso texto="Cargando..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    return (
      <Aviso texto="Tu cuenta todavía no tiene un rol asignado. Un administrador debe asignarlo para poder entrar." />
    );
  }

  const base = Object.keys(PERMISOS).find((b) => coincide(location.pathname, b));
  const permitidos = base ? PERMISOS[base] : null;

  if (permitidos && !permitidos.includes(role)) {
    return <Navigate to={INICIO_POR_ROL[role] || "/login"} replace />;
  }

  return <Outlet />;
}

function Aviso({ texto }) {
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
      {texto}
    </div>
  );
}
