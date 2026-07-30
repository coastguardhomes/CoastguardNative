import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../layouts/Menu";
import { supabase } from "../lib/supabase";

/**
 * Dashboard del administrador (destino del botón "Dashboard" de la barra).
 *
 * Antes mostraba cuatro ceros escritos a mano con la nota "*El técnico
 * conectará estos datos a Supabase": nunca se conectó. Ahora cuenta las
 * filas reales con `count: exact, head: true`, que devuelve el total sin
 * descargar los datos. Además no estaba envuelto en <Menu>, así que al
 * entrar desaparecía la barra de navegación.
 */

const TARJETAS = [
  { clave: "clientes", etiqueta: "Clientes", ruta: "/clientes" },
  { clave: "viviendas", etiqueta: "Viviendas", ruta: "/viviendas" },
  { clave: "contratos", etiqueta: "Contratos", ruta: "/contratos" },
  { clave: "facturas", etiqueta: "Facturas", ruta: "/facturas" },
  { clave: "inspecciones", etiqueta: "Inspecciones", ruta: "/inspecciones" },
  { clave: "tecnicos", etiqueta: "Técnicos", ruta: "/tecnicos" },
];

export default function AdminDashboard() {
  const [conteos, setConteos] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const resultado = {};

      await Promise.all(
        TARJETAS.map(async ({ clave }) => {
          const { count, error } = await supabase
            .from(clave)
            .select("*", { count: "exact", head: true });
          resultado[clave] = error ? null : count ?? 0;
        })
      );

      if (!cancelado) {
        setConteos(resultado);
        setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          fontFamily: "Inter, sans-serif",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 20,
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Dashboard Admin
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 20,
          }}
        >
          {TARJETAS.map(({ clave, etiqueta, ruta }) => (
            <Link key={clave} to={ruta} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                }}
              >
                <h3 style={{ color: "#4db8ff", marginBottom: 10 }}>{etiqueta}</h3>
                <p style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
                  {cargando ? "…" : conteos[clave] ?? "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Menu>
  );
}
