
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function PrivateRoute({ allowedRole }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [authorized, setAuthorized] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  const rutasPublicas = [
    "/login",
    "/register",
    "/reset-password",
    "/update-password",
    "/auth/callback",
  ];

  const esPublica =
    rutasPublicas.includes(pathname) ||
    pathname.startsWith("/update-password");

  const rolesPermitidos = Array.isArray(allowedRole)
    ? allowedRole
    : typeof allowedRole === "string"
      ? allowedRole.split(",").map((role) => role.trim()).filter(Boolean)
      : [];

  useEffect(() => {
    let cancelado = false;

    async function verificarAcceso() {
      setCheckingRole(true);
      setAuthorized(null);

      if (esPublica) {
        if (!cancelado) {
          setAuthorized(true);
          setCheckingRole(false);
        }
        return;
      }

      if (!user) {
        if (!cancelado) {
          setAuthorized(false);
          setCheckingRole(false);
        }
        return;
      }

      if (rolesPermitidos.length === 0) {
        if (!cancelado) {
          setAuthorized(true);
          setCheckingRole(false);
        }
        return;
      }

      try {
        let rolesUsuario = [];

        const { data: perfil, error: errorPerfil } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", user.id)
          .maybeSingle();

        if (errorPerfil) {
          throw errorPerfil;
        }

        if (perfil?.rol) {
          rolesUsuario.push(String(perfil.rol).trim().toLowerCase());
        }

        if (rolesPermitidos.includes("cliente")) {
          const { data: cliente, error: errorCliente } = await supabase
            .from("clientes")
            .select("id")
            .eq("usuario_id", user.id)
            .maybeSingle();

          if (errorCliente) {
            throw errorCliente;
          }

          if (cliente) {
            rolesUsuario.push("cliente");
          }
        }

        const rolesNormalizados = rolesPermitidos.map((role) =>
          String(role).trim().toLowerCase()
        );

        const tieneAcceso =
          rolesUsuario.includes("admin") ||
          rolesNormalizados.some((role) => rolesUsuario.includes(role));

        if (!cancelado) {
          setAuthorized(tieneAcceso);
        }
      } catch (error) {
        console.error("Error verificando permisos de acceso:", error);

        if (!cancelado) {
          setAuthorized(false);
        }
      } finally {
        if (!cancelado) {
          setCheckingRole(false);
        }
      }
    }

    if (!loading) {
      verificarAcceso();
    }

    return () => {
      cancelado = true;
    };
  }, [user, loading, pathname, esPublica, allowedRole]);

  if (loading || checkingRole) {
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

  if (esPublica) {
    return <Outlet />;
  }

  if (!user || authorized !== true) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
