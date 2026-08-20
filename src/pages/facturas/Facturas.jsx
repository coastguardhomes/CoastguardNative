import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

/**
 * Listado de facturas.
 *
 * Dos fallos que tenía esta pantalla:
 *   · Filtraba por `cliente_id = 2` escrito a mano, así que sólo se veían las
 *     facturas de ese cliente y faltaban las demás. La política RLS
 *     facturas_select ya devuelve lo que corresponde a cada rol (el admin
 *     todas, el cliente las suyas), por lo que no hace falta filtrar aquí.
 *   · El contenedor era blanco (`background: #fff`) pero global.css fija
 *     `color: #ffffff` en el body: el texto salía blanco sobre blanco y no se
 *     leía nada. Ahora usa el tema oscuro del resto de la app.
 */
export default function Facturas() {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarFacturas() {
      const { data, error: errorFacturas } = await supabase
        .from("facturas")
        .select("*")
        .order("fecha", { ascending: false });

      if (cancelado) return;

      if (errorFacturas) {
        console.error("Error cargando facturas:", errorFacturas);
        setError("No se pudieron cargar las facturas.");
      } else {
        setFacturas(data || []);
      }

      setLoading(false);
    }

    cargarFacturas();
    return () => {
      cancelado = true;
    };
  }, []);

  const totalPendiente = facturas
    .filter((f) => f.estado !== "pagada")
    .reduce((acc, f) => acc + Number(f.total || 0), 0);

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>Facturas</h1>

        {error && <p style={estilos.error}>{error}</p>}

        {loading ? (
          <p style={estilos.texto}>Cargando facturas...</p>
        ) : facturas.length === 0 ? (
          <p style={estilos.texto}>No hay facturas registradas.</p>
        ) : (
          <>
            <div style={estilos.resumen}>
              <div style={estilos.dato}>
                <span style={estilos.valor}>{facturas.length}</span>
                <span style={estilos.clave}>Facturas</span>
              </div>
              <div style={estilos.dato}>
                <span style={{ ...estilos.valor, color: COLOR_DORADO }}>
                  {totalPendiente.toFixed(2)} €
                </span>
                <span style={estilos.clave}>Pendiente</span>
              </div>
            </div>

            {facturas.map((f) => (
              <Link
                key={f.id}
                to={`/facturas/ver/${f.id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={estilos.tarjeta}>
                  <div style={estilos.cabeceraTarjeta}>
                    <span style={estilos.numero}>{f.numero || `#${f.id}`}</span>
                    <span
                      style={{
                        ...estilos.estado,
                        color: f.estado === "pagada" ? "#34d399" : COLOR_DORADO,
                        borderColor:
                          f.estado === "pagada"
                            ? "rgba(52, 211, 153, 0.4)"
                            : "rgba(224, 176, 52, 0.4)",
                      }}
                    >
                      {f.estado}
                    </span>
                  </div>

                  <Fila clave="Fecha" valor={String(f.fecha || "").slice(0, 10)} />
                  <Fila clave="Base" valor={`${Number(f.base || 0).toFixed(2)} €`} />
                  <Fila clave="IVA" valor={`${Number(f.iva || 0).toFixed(2)} €`} />
                  <Fila
                    clave="Total"
                    valor={`${Number(f.total || 0).toFixed(2)} €`}
                    destacado
                  />
                  {f.descripcion && <Fila clave="Concepto" valor={f.descripcion} />}
                </div>
              </Link>
            ))}
          </>
        )}

        <button onClick={() => navigate("/facturas/crear")} style={estilos.boton}>
          + Nueva factura
        </button>

        <div style={estilos.acciones}>
          <button
            onClick={() => navigate("/facturas/estadisticas")}
            style={estilos.botonSec}
          >
            Estadísticas
          </button>
          <button onClick={() => navigate("/extras")} style={estilos.botonSec}>
            Facturar extras
          </button>
        </div>
      </div>
    </Menu>
  );
}

function Fila({ clave, valor, destacado }) {
  return (
    <div style={estilos.fila}>
      <span style={estilos.claveFila}>{clave}</span>
      <span
        style={{
          ...estilos.valorFila,
          color: destacado ? COLOR_DORADO : "#fff",
          fontSize: destacado ? "14px" : "13px",
          fontWeight: destacado ? "900" : "600",
        }}
      >
        {valor}
      </span>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: "20px",
    background: FONDO_PRINCIPAL,
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    paddingBottom: "100px",
    boxSizing: "border-box",
  },
  titulo: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: "20px",
    fontWeight: "900",
    marginBottom: "20px",
    textAlign: "center",
    textTransform: "uppercase",
  },
  resumen: { 
    display: "flex", 
    gap: "12px", 
    marginBottom: "16px" 
  },
  dato: {
    flex: 1,
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    padding: "14px",
    boxShadow: SOMBRA_LUXURY,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    boxSizing: "border-box",
  },
  valor: { 
    fontSize: "18px", 
    fontWeight: "900", 
    color: "#fff" 
  },
  clave: { 
    fontSize: "11px", 
    color: COLOR_DORADO, 
    fontWeight: "700", 
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  tarjeta: {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: SOMBRA_LUXURY,
    boxSizing: "border-box",
  },
  cabeceraTarjeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  numero: { 
    fontSize: "15px", 
    fontWeight: "900", 
    color: COLOR_DORADO 
  },
  estado: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    border: "1px solid",
    borderRadius: "20px",
    padding: "4px 10px",
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "4px 0",
  },
  claveFila: {
    fontSize: "12px",
    color: COLOR_DORADO,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  valorFila: { 
    textAlign: "right" 
  },
  texto: { 
    color: "#aaa", 
    fontSize: "13px", 
    marginBottom: "12px",
    textAlign: "center" 
  },
  boton: {
    width: "100%",
    marginTop: "8px",
    padding: "14px",
    background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
    color: "#fff",
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
    boxSizing: "border-box",
  },
  acciones: { 
    display: "flex", 
    gap: "10px", 
    marginTop: "12px" 
  },
  botonSec: {
    flex: 1,
    padding: "12px",
    background: FONDO_TARJETA,
    color: "#fff",
    border: BORDE_DORADO_FINO,
    borderRadius: "14px",
    fontWeight: "900",
    fontSize: "12px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: SOMBRA_LUXURY,
    boxSizing: "border-box",
  },
  error: {
    marginBottom: "16px",
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
    borderRadius: "12px",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "13px",
  },
};
