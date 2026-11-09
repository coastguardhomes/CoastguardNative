
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
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
  FaClipboardList,
  FaTools,
} from "react-icons/fa";

// Colores del diseño original
const AZUL_ICONO = "#4da8ff";
const AMARILLO_ETIQUETA = "#f9d71c";

export default function Menu({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role } = useAuth();
  const { t, language } = useLanguage();

  const en = language === "en";

  // Traducciones del menú.
  // Se definen localmente para no depender de claves
  // que todavía no existan en LanguageContext.
  const etiquetaMenu = (clave, fallbackEs, fallbackEn) => {
    const traduccion = t(clave);

    // Si la clave no existe en el diccionario,
    // useLanguage devuelve la propia clave.
    if (!traduccion || traduccion === clave) {
      return en ? fallbackEn : fallbackEs;
    }

    return traduccion;
  };

  // ---------------- ITEMS ADMIN ----------------
  const ITEMS_ADMIN = [
    {
      ruta: "/inicio",
      etiqueta: etiquetaMenu("inicio", "Inicio", "Home"),
      icono: FaHome,
    },
    {
      ruta: "/clientes",
      etiqueta: etiquetaMenu("clientes", "Clientes", "Clients"),
      icono: FaUsers,
    },
    {
      ruta: "/viviendas",
      etiqueta: etiquetaMenu("viviendas", "Viviendas", "Properties"),
      icono: FaBuilding,
    },
    {
      ruta: "/inspecciones",
      etiqueta: etiquetaMenu("inspecciones", "Inspecciones", "Inspections"),
      icono: FaSearch,
    },
    {
      ruta: "/servicios",
      etiqueta: etiquetaMenu("servicios", "Servicios", "Services"),
      icono: FaTools,
    },
    {
      ruta: "/presupuestos",
      etiqueta: etiquetaMenu("presupuestos", "Presupuestos", "Quotes"),
      icono: FaClipboardList,
    },
    {
      ruta: "/contratos",
      etiqueta: etiquetaMenu("contratos", "Contratos", "Contracts"),
      icono: FaFileContract,
    },
    {
      ruta: "/facturas",
      etiqueta: etiquetaMenu("facturas", "Facturas", "Invoices"),
      icono: FaMoneyBillWave,
    },
    {
      ruta: "/tecnicos",
      etiqueta: etiquetaMenu("tecnicos", "Técnicos", "Technicians"),
      icono: FaKey,
    },
    {
      ruta: "/admin/dashboard",
      etiqueta: etiquetaMenu("dashboard", "Dashboard", "Dashboard"),
      icono: FaChartBar,
    },
    {
      ruta: "/ajustes",
      etiqueta: etiquetaMenu("ajustes", "Ajustes", "Settings"),
      icono: FaCog,
    },
  ];

  // ---------------- ITEMS CLIENTE ----------------
  const ITEMS_CLIENTE = [
    {
      ruta: "/cliente",
      etiqueta: etiquetaMenu("inicio", "Inicio", "Home"),
      icono: FaHome,
    },
    {
      ruta: "/cliente/contratos",
      etiqueta: etiquetaMenu("contratos", "Contratos", "Contracts"),
      icono: FaFileContract,
    },
    {
      ruta: "/cliente/inspecciones",
      etiqueta: etiquetaMenu("inspecciones", "Inspecciones", "Inspections"),
      icono: FaClipboardCheck,
    },
    {
      ruta: "/cliente/presupuestos",
      etiqueta: etiquetaMenu(
        "presupuestos",
        "Mis presupuestos",
        "My quotes"
      ),
      icono: FaClipboardList,
    },
    {
      ruta: "/cliente/facturas",
      etiqueta: etiquetaMenu("facturas", "Facturas", "Invoices"),
      icono: FaMoneyBillWave,
    },
    {
      ruta: "/cliente/perfil",
      etiqueta: etiquetaMenu("perfil", "Perfil", "Profile"),
      icono: FaUsers,
    },
    {
      ruta: "/ajustes",
      etiqueta: etiquetaMenu("ajustes", "Ajustes", "Settings"),
      icono: FaCog,
    },
  ];

  // ---------------- MENÚ SEGÚN ROL ----------------
  let ITEMS = null;

  if (role === "admin") {
    ITEMS = ITEMS_ADMIN;
  } else if (role === "cliente") {
    ITEMS = ITEMS_CLIENTE;
  }

  return (
    <div style={estilos.contenedor}>
      <main style={estilos.contenido}>{children}</main>

      {ITEMS && (
        <nav style={estilos.barra}>
          {ITEMS.map(({ ruta, etiqueta, icono: Icono }) => {
            const activo =
              pathname === ruta || pathname.startsWith(ruta + "/");

            return (
              <div
                key={ruta}
                onClick={() => navigate(ruta)}
                style={{
                  ...estilos.item,
                  opacity: activo ? 1 : 0.82,
                }}
              >
                <Icono
                  color={AZUL_ICONO}
                  size={19}
                />

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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "14px",
    overflowX: "auto",
    overflowY: "hidden",
    backgroundColor: "#0b0c10",
    borderTop: "2px solid #1f2833",
    padding: "10px 12px calc(10px + env(safe-area-inset-bottom, 0px))",
    zIndex: 50,
    boxSizing: "border-box",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
  },

  item: {
    flex: "0 0 auto",
    minWidth: "68px",
    maxWidth: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: "0 3px",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "center",
  },

  etiqueta: {
    fontSize: "11px",
    lineHeight: "14px",
    marginTop: "0",
    whiteSpace: "normal",
    textAlign: "center",
    overflowWrap: "break-word",
  },
};
