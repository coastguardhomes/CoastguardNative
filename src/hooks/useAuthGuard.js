import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function useAuthGuard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === undefined) return; // cargando
    if (user === null) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // El hook debe devolver el user para evitar renders corruptos
  return user;
}
