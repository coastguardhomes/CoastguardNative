import React from "react";
import Menu from "../../layouts/Menu";
import { Link } from "react-router-dom";

export default function Facturas() {
  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Facturas</h1>

        <ul style={{ marginTop: "20px", lineHeight: "1.8" }}>
          <li>
            <Link to="/facturas/lista" style={{ color: "#4db8ff" }}>
              Listado de facturas
            </Link>
          </li>

          <li>
            <Link to="/facturas/crear" style={{ color: "#4db8ff" }}>
              Crear factura
            </Link>
          </li>

          <li>
            <Link to="/facturas/filtros" style={{ color: "#4db8ff" }}>
              Filtros de facturas
            </Link>
          </li>

          <li>
            <Link to="/facturas/estadisticas" style={{ color: "#4db8ff" }}>
              Estadísticas de facturas
            </Link>
          </li>
        </ul>
      </div>
    </Menu>
  );
}
