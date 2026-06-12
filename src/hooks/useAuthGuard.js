import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function useAuthGuard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Si está cargando (undefined), no hacer nada
    if (user === undefined) return;

    // 2. Si NO está logueado (null), redirigir
    if (user === null) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return { user };
}
