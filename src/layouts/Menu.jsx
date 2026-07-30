import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Layout principal con la barra de navegación inferior.
 *
 * El diseño (iconos azules #4da8ff grandes, etiquetas amarillas #f9d71c,
 * fondo #0b0c10 con borde #1f2833) es el del Menu.jsx original del
 * repositorio. Dos cosas se corrigen respecto a aquel fichero:
 *
 *   · Renderiza `children`. El original no lo hacía y el contenido de cada
 *     pantalla envuelta en <Menu> se descartaba: sólo se veía la barra.
 *   · Los iconos originales eran <ion-icon>, un web component cuyo script no
 *     está incluido en index.html, así que los iconos salían VACÍOS (sólo se
 *     veían las etiquetas amarillas). Se sustituyen por SVG en línea con las
 *     mismas formas de Ionicons (outline), que funcionan también sin red.
 *
 * Además se añaden a la barra los módulos que faltaban (el original sólo
 * tenía Clientes, Inspecciones, Facturas y Dashboard): con overflow-x la
 * barra se desliza en horizontal para mostrarlos todos.
 */

const ITEMS = [
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

// Colores del diseño original del repositorio.
const AZUL_ICONO = "#4da8ff";
const AMARILLO_ETIQUETA = "#f9d71c";

export default function Menu({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={estilos.contenedor}>
      {/* Contenido de la pantalla. El padding inferior evita que la barra
          tape las últimas filas o los botones de guardar. */}
      <main style={estilos.contenido}>{children}</main>

      <nav style={estilos.barra}>
        {ITEMS.map(({ ruta, etiqueta, icono: Icono }) => {
          // `startsWith` para que /clientes/ver/3 siga marcando "Clientes".
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

/* ------------------------------ ICONOS ------------------------------
   Formas equivalentes a los "-outline" de Ionicons, dibujadas como SVG en
   línea para que no dependan de ningún script externo. Tamaño 1.8rem como
   en el diseño original. */

function Svg({ children, color }) {
  return (
    <svg
      style={{ width: "1.8rem", height: "1.8rem" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function IconoInicio({ color }) {
  return (
    <Svg color={color}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V21h14V9.8" />
    </Svg>
  );
}

// person-outline
function IconoPersona({ color }) {
  return (
    <Svg color={color}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" />
    </Svg>
  );
}

function IconoCasa({ color }) {
  return (
    <Svg color={color}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V21h14V9.8" />
      <path d="M9.5 21v-5.5h5V21" />
    </Svg>
  );
}

// search-outline
function IconoLupa({ color }) {
  return (
    <Svg color={color}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </Svg>
  );
}

function IconoDocumento({ color }) {
  return (
    <Svg color={color}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </Svg>
  );
}

// cash-outline
function IconoDinero({ color }) {
  return (
    <Svg color={color}>
      <rect x="2.5" y="7" width="19" height="11" rx="1.6" />
      <circle cx="12" cy="12.5" r="2.6" />
      <path d="M5.5 7v-1M18.5 7v-1M5.5 19v-1M18.5 19v-1" />
    </Svg>
  );
}

function IconoLlave({ color }) {
  return (
    <Svg color={color}>
      <path d="M14.5 3a6.5 6.5 0 0 1 2.6 12.5L15 21l-2.5-1.5L10 21l-1.4-4.2A6.5 6.5 0 0 1 14.5 3Z" />
      <circle cx="14.5" cy="9" r="2" />
    </Svg>
  );
}

// stats-chart-outline
function IconoEstadisticas({ color }) {
  return (
    <Svg color={color}>
      <path d="M4 20V12" />
      <path d="M9.5 20V6" />
      <path d="M15 20v-9" />
      <path d="M20.5 20V4" />
    </Svg>
  );
}

function IconoEngranaje({ color }) {
  return (
    <Svg color={color}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.4-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4Z" />
    </Svg>
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
    // Alto de la barra + margen de seguridad del móvil.
    paddingBottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
  },
  barra: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-around",
    // La barra lleva 9 módulos: se desliza en horizontal en pantallas
    // estrechas en lugar de esconder los últimos.
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
