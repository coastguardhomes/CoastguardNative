async function redirigirSegunRol(userId) {
  if (!userId) {
    setErrorMsg(t("loginError"));
    return;
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", userId)
    .maybeSingle();

  const role = perfil?.rol; // ← UNIFICADO

  switch (role) {
    case "admin":
      navigate("/inicio", { replace: true });
      break;
    case "cliente":
      navigate("/cliente", { replace: true });
      break;
    case "tecnico":
      navigate("/tecnico", { replace: true });
      break;
    default:
      setErrorMsg(t("loginSinRol"));
  }
}
