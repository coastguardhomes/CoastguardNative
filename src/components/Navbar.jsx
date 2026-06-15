import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 10, background: "#eee", marginBottom: 20 }}>
      <Link to="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>
      <Link to="/clientes" style={{ marginRight: 10 }}>Clientes</Link>
      <Link to="/contratos" style={{ marginRight: 10 }}>Contratos</Link>
      <Link to="/ajustes">Ajustes</Link>
    </nav>
  );
}
