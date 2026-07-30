import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

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
                <span style={{ ...estilos.valor, color: "#ffc861" }}>
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
                        color: f.estado === "pagada" ? "#4ade80" : "#ffc861",
                        borderColor:
                          f.estado === "pagada"
                            ? "rgba(74,222,128,0.4)"
                            : "rgba(255,200,97,0.4)",
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
      <span style={estilos.clave}>{clave}</span>
      <span
        style={{
          ...estilos.valorFila,
          color: destacado ? "#4db8ff" : "#e8eef5",
          fontSize: destacado ? 16 : 14,
        }}
      >
        {valor}
      </span>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: 20,
    background: "#0a0f1a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },
  titulo: {
    color: "#4db8ff",
    marginBottom: 18,
    fontSize: 28,
    fontWeight: 700,
    textShadow: "0 0 8px rgba(0,153,255,0.6)",
  },
  resumen: { display: "flex", gap: 12, marginBottom: 16 },
  dato: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  valor: { fontSize: 20, fontWeight: 700, color: "#fff" },
  clave: { fontSize: 12.5, color: "#9fb3c8" },
  tarjeta: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 0 12px rgba(0,153,255,0.15)",
  },
  cabeceraTarjeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  numero: { fontSize: 17, fontWeight: 700, color: "#4db8ff" },
  estado: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    border: "1px solid",
    borderRadius: 20,
    padding: "3px 10px",
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "5px 0",
  },
  valorFila: { fontWeight: 600, textAlign: "right" },
  texto: { color: "#c9d6e2", fontSize: 15, marginBottom: 12 },
  boton: {
    width: "100%",
    marginTop: 8,
    padding: 14,
    background: "#4db8ff",
    color: "#04263f",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
  acciones: { display: "flex", gap: 10, marginTop: 10 },
  botonSec: {
    flex: 1,
    padding: 12,
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14.5,
    cursor: "pointer",
  },
  error: {
    marginBottom: 14,
    color: "#ff6b6b",
    fontWeight: 600,
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.35)",
    borderRadius: 8,
    padding: 12,
  },
};
