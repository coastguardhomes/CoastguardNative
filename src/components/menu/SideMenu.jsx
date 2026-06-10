import { Link } from "react-router-dom";
import HomeIcon from "../icons/HomeIcon";
import UsersIcon from "../icons/UsersIcon";
import FileIcon from "../icons/FileIcon";
import SettingsIcon from "../icons/SettingsIcon";

export default function SideMenu() {
  return (
    <div
      style={{
        width: 230,
        background: "#1e1e1e",
        color: "#fff",
        height: "100vh",
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 30 }}>CoastGuard</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: 20 }}>
          <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
            <HomeIcon /> Dashboard
          </Link>
        </li>

        <li style={{ marginBottom: 20 }}>
          <Link to="/clientes" style={{ color: "#fff", textDecoration: "none" }}>
            <UsersIcon /> Clientes
          </Link>
        </li>

        <li style={{ marginBottom: 20 }}>
          <Link to="/contratos" style={{ color: "#fff", textDecoration: "none" }}>
            <FileIcon /> Contratos
          </Link>
        </li>

        <li style={{ marginBottom: 20 }}>
          <Link to="/ajustes" style={{ color: "#fff", textDecoration: "none" }}>
            <SettingsIcon /> Ajustes
          </Link>
        </li>
      </ul>
    </div>
  );
}
