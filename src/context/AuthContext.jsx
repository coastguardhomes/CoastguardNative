import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

useEffect(() => {
  if (loading) return;

  if (!user) {
    navigate("/login", { replace: true });
    return;
  }

  if (role === "admin") {
    navigate("/admin/dashboard", { replace: true });
    return;
  }

  if (role === "tecnico") {
    navigate("/tecnico", { replace: true });
    return;
  }

  if (role === "cliente") {
    navigate("/cliente", { replace: true });
    return;
  }
}, [user, role, loading]);
