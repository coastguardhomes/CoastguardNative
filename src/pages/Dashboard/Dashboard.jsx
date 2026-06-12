import React from "react";
import useAuthGuard from "../../hooks/useAuthGuard.js";
import { useAuth } from "../../context/useAuth";

export default function Dashboard() {
  const user = useAuthGuard();
  const { logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user?.email}</p>

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
