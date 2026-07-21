import { useState } from "react";
import { Link } from "react-router-dom";

export default function Menu() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {/* TOP BAR */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "#001f3f",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          justifyContent: "space-between",
        }}
      >
        {/* BOTÓN HAMBURGUESA */}
        <div
          onClick={toggleMenu}
          style={{
            width: 30,
            height: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <span style={{ height: 3, background: "#fff", borderRadius: 2 }}></span>
          <span style={{ height: 3, background: "#fff", borderRadius: 2 }}></span>
          <span style={{ height: 3, background: "#fff", borderRadius: 2 }}></span>
        </div>

        <h2 style={{ marginLeft: 20 }}>CoastGuard</h2>
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-260px",
          width: 260,
          height: "100%",
          background: "#012a4a",
          color: "#fff",
          paddingTop: 20,
          transition: "left 0.3s",
          zIndex: 999,
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: 20 }}>Menú</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ padding: "12px 20px" }}>
            <Link to="/inicio" style={{ color: "#fff", textDecoration: "none" }}>
              Inicio
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/clientes" style={{ color: "#fff", textDecoration: "none" }}>
              Clientes
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/tecnicos" style={{ color: "#fff", textDecoration: "none" }}>
              Técnicos
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/viviendas" style={{ color: "#fff", textDecoration: "none" }}>
              Viviendas
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/contratos" style={{ color: "#fff", textDecoration: "none" }}>
              Contratos
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/inspecciones" style={{ color: "#fff", textDecoration: "none" }}>
              Inspecciones
            </Link>
          </li>

          <li style={{ padding: "12px 20px", marginTop: 40 }}>
            <Link to="/logout" style={{ color: "#ff6b6b", textDecoration: "none" }}>
              Cerrar sesión
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
