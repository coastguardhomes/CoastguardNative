import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // ← AÑADIDO

// ---------------- ITEMS ADMIN ----------------
const ITEMS_ADMIN = [
  { ruta: "/inicio", etiqueta: "Inicio", icono: IconoInicio },
  { ruta: "/clientes", etiqueta: "Clientes", icono: IconoPersona },
  { ruta: "/viviendas", etiqueta: "Viviendas", icono: IconoCasa },
  { ruta: "/inspecciones", etiqueta: "Inspecciones", icono: IconoLupa },
  { ruta: "/contratos", etiqueta: "Contratos", icono: IconoDocumento },
  { ruta: "/facturas", etiqueta: "Facturas", icono: IconoDinero },
  { ruta: "/tecnicos", etiqueta: "Técnicos", icono: IconoLlave },
  { ruta: "/admin/dashboard", etiqueta: "Dashboard", icono: IconoEstadisticas },
  { ruta: "/ajustes", etiqueta: "Ajustes", icono: IconoEngranaje },
];

// ---------------- ITEMS CLIENTE ----------------
const ITEMS_CLIENTE = [
  { ruta: "/cliente", etiqueta: "Inicio", icono: IconoInicio },
  { ruta: "/cliente/contratos", etiqueta: "Contratos", icono: IconoDocumento },
  { ruta: "/cliente/perfil", etiqueta: "Perfil", icono: IconoPersona },
  { ruta: "/ajustes", etiqueta: "Ajustes", icono: IconoEngranaje },
];

// Colores del diseño original
const AZUL_ICONO = "#4da8ff";
const AMARILLO_ETIQUETA = "#f9d71c";

export default function Menu({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role } = useAuth(); // ← AÑADIDO

  // Elegir menú según el rol
  const ITEMS = role === "cliente" ? ITEMS_CLIENTE : ITEMS_ADMIN;

  return (
    <div style={estilos.contenedor}>
      <main style={estilos.contenido}>{children}</main>

      <nav style={estilos.barra}>
        {ITEMS.map(({ ruta, etiqueta, icono: Icono }) => {
          const activo = pathname === ruta || pathname.startsWith(ruta + "/");

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
    </div>
  );
}
