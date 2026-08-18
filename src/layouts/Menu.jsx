import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaSearch,
  FaFileContract,
  FaMoneyBillWave,
  FaKey,
  FaChartBar,
  FaCog,
  FaClipboardCheck,
  FaTools,
} from "react-icons/fa";

// ---------------- ITEMS ADMIN ----------------
const ITEMS_ADMIN = [
  { ruta: "/inicio", etiqueta: "Inicio", icono: FaHome },
  { ruta: "/clientes", etiqueta: "Clientes", icono: FaUsers },
  { ruta: "/viviendas", etiqueta: "Viviendas", icono: FaBuilding },
  { ruta: "/inspecciones", etiqueta: "Inspecciones", icono: FaSearch },
  { ruta: "/servicios", etiqueta: "Servicios", icono: FaTools },
  { ruta: "/contratos", etiqueta: "Contratos", icono: FaFileContract },
  { ruta: "/facturas", etiqueta: "Facturas", icono: FaMoneyBillWave },
  { ruta: "/tecnicos", etiqueta: "Técnicos", icono: FaKey },
  { ruta: "/admin/dashboard", etiqueta: "Dashboard", icono: FaChartBar },
  { ruta: "/ajustes", etiqueta: "Ajustes", icono: FaCog },
];

// ---------------- ITEMS CLIENTE ----------------
const ITEMS_CLIENTE = [
  { ruta: "/cliente", etiqueta: "Inicio", icono: FaHome },
  { ruta: "/cliente/contratos", etiqueta: "Contratos", icono: FaFileContract },
  { ruta: "/cliente/inspecciones", etiqueta: "Inspecciones", icono: FaClipboardCheck },
  { ruta: "/cliente/facturas", etiqueta: "Facturas", icono: FaMoneyBillWave },
  { ruta: "/cliente/perfil", etiqueta: "Perfil", icono: FaUsers },
  { ruta: "/ajustes", etiqueta: "Ajustes", icono: FaCog },
];

// Colores del diseño original
const AZUL_ICONO = "#4da8ff";
const AMARILLO_ETIQUETA = "#f9d71c";

export default function Menu({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role } = useAuth();

  // ---------------- MENÚ SEGÚN ROL ----------------
  let ITEMS = null;

  if (role === "admin") {
    ITEMS = ITEMS_ADMIN;
  } else if (role === "cliente") {
    ITEMS = ITEMS_CLIENTE;
  } else {
    ITEMS = null; // técnico → sin menú inferior
  }

  return (
    <div style={estilos.contenedor}>
      <main style={estilos.contenido}>{children}</main>

      {/* Renderizar menú solo si ITEMS existe */}
      {ITEMS && (
        <nav style={estilos.barra}>
          {ITEMS.map(({ ruta, etiqueta, icono: Icono }) => {
            const activo =
              pathname === ruta || pathname.startsWith(ruta + "/");

            return (
              <div
                key={ruta}
                onClick={() => navigate(ruta)}
                style={{ ...estilos.item, opacity: activo ? 1 : 0.82 }}
              >
                <Icono color={AZUL_ICONO} />
                <span
                  style={{
                    ...estilos.etiqueta,
                    color: AMARILLO_ETIQUETA,
                    fontWeight: activo ? 700 : 400,
                  }}
                >
                  {etiqueta}
                </span>
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* ------------------------------ ESTILOS ------------------------------ */

const estilos = {
  contenedor: {
    minHeight: "100vh",
    background: "#0a0f1a",
    display: "flex",
    flexDirection: "column",
  },
  contenido: {
    flex: 1,
    paddingBottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
  },
  barra: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-around",
    overflowX: "auto",
    backgroundColor: "#0b0c10",
    borderTop: "2px solid #1f2833",
    padding: "10px 4px calc(10px + env(safe-area-inset-bottom, 0px))",
    zIndex: 50,
  },
  item: {
    flex: "1 0 auto",
    minWidth: 74,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  etiqueta: {
    fontSize: "0.9rem",
    marginTop: "4px",
    whiteSpace: "nowrap",
  },
};
