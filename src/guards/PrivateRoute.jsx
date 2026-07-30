import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Guard de sesión y de rol.
 *
 * Antes comparaba con `path.startsWith("/cliente")`, y "/clientes" empieza por
 * "/cliente": el administrador que abría el módulo de Clientes acababa en el
 * login. Lo mismo ocurría con "/tecnico" y "/tecnicos". Ahora la comparación
 * es por segmentos completos, así que /cliente y /clientes no se confunden.
 *
 * El rol se lee del AuthContext; antes cada PrivateRoute lo consultaba a
 * Supabase al montarse, es decir una petición en cada navegación.
 */

// Qué roles pueden entrar en cada área, por el primer tramo de la ruta.
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
  "/cliente": ["cliente"],
  "/tecnico": ["tecnico"],
  // Comunes a cualquier rol autenticado.
  "/ajustes": ["admin", "cliente", "tecnico"],
  "/idioma": ["admin", "cliente", "tecnico"],
};

// Pantalla de inicio de cada rol: si alguien abre un área que no le toca se le
// devuelve a su panel, no al login (que parecía un cierre de sesión).
const INICIO_POR_ROL = {
  admin: "/inicio",
  cliente: "/cliente",
  tecnico: "/tecnico",
};

/** Coincidencia por segmentos: "/cliente" NO casa con "/clientes". */
function coincide(path, base) {
  return path === base || path.startsWith(base + "/");
}

export default function PrivateRoute() {
  const { session, rol, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Aviso texto="Cargando..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Sesión válida pero sin fila en profiles: no hay área a la que enviarle y
  // redirigir provocaría un bucle, así que se explica la situación.
  if (!rol) {
    return (
      <Aviso texto="Tu cuenta todavía no tiene un rol asignado. Un administrador debe asignarlo para poder entrar." />
    );
  }

  const base = Object.keys(PERMISOS).find((b) => coincide(location.pathname, b));
  const permitidos = base ? PERMISOS[base] : null;

  if (permitidos && !permitidos.includes(rol)) {
    return <Navigate to={INICIO_POR_ROL[rol] || "/login"} replace />;
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
