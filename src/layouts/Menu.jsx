import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaHome, FaUsers, FaUserTie, FaFileContract, FaTools, FaSignOutAlt } from "react-icons/fa";

export default function Menu() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {/* BOTÓN HAMBURGUESA */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "#001f3f",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <FaBars size={26} style={{ cursor: "pointer" }} onClick={toggleMenu} />
        <h2 style={{ marginLeft: 20 }}>CoastGuard</h2>
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-260px",
          width: 260,
          height: "100vh",
          background: "#012a4a",
          color: "#fff",
          paddingTop: 20,
          transition: "0.3s",
          zIndex: 999,
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: 20 }}>Menú</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ padding: "12px 20px" }}>
            <Link to="/inicio" style={{ color: "#fff", textDecoration: "none" }}>
              <FaHome /> Inicio
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/clientes" style={{ color: "#fff", textDecoration: "none" }}>
              <FaUsers /> Clientes
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/tecnicos" style={{ color: "#fff", textDecoration: "none" }}>
              <FaUserTie /> Técnicos
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/viviendas" style={{ color: "#fff", textDecoration: "none" }}>
              <FaHome /> Viviendas
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/contratos" style={{ color: "#fff", textDecoration: "none" }}>
              <FaFileContract /> Contratos
            </Link>
          </li>

          <li style={{ padding: "12px 20px" }}>
            <Link to="/inspecciones" style={{ color: "#fff", textDecoration: "none" }}>
              <FaTools /> Inspecciones
            </Link>
          </li>

          <li style={{ padding: "12px 20px", marginTop: 40 }}>
            <Link to="/logout" style={{ color: "#ff6b6b", textDecoration: "none" }}>
              <FaSignOutAlt /> Cerrar sesión
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
