import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function useAuthGuard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return null; // evita que React pinte "0"
}
