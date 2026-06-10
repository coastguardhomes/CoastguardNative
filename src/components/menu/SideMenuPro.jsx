import { Link } from "react-router-dom";
import HomeIcon from "../icons/HomeIcon";
import UsersIcon from "../icons/UsersIcon";
import FileIcon from "../icons/FileIcon";
import SettingsIcon from "../icons/SettingsIcon";

export default function SideMenuPro() {
  return (
    <div
      style={{
        width: 250,
        background: "#0f172a",
        color: "#e2e8f0",
        height: "100vh",
        padding: 25,
        boxShadow: "4px 0 15px rgba(0,0,0,0.4)",
      }}
    >
      <h2 style={{ marginBottom: 35, fontSize: 22, fontWeight: 700 }}>
        CoastGuard PRO
      </h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: 25 }}>
          <Link
            to="/dashboard"
            style={{
              color: "#e2e8f0",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              fontSize: 16,
            }}
          >
            <HomeIcon /> Dashboard
          </Link>
        </li>

        <li style={{ marginBottom: 25 }}>
          <Link
            to="/clientes"
            style={{
              color: "#e2e8f0",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              fontSize: 16,
            }}
          >
            <UsersIcon /> Clientes
          </Link>
        </li>

        <li style={{ marginBottom: 25 }}>
          <Link
            to="/contratos"
            style={{
              color: "#e2e8f0",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              fontSize: 16,
            }}
          >
            <FileIcon /> Contratos
          </Link>
        </li>

        <li style={{ marginBottom: 25 }}>
          <Link
            to="/ajustes"
            style={{
              color: "#e2e8f0",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              fontSize: 16,
            }}
          >
            <SettingsIcon /> Ajustes
          </Link>
        </li>
      </ul>
    </div>
  );
}
