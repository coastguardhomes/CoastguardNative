import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function FacturasLista() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarFacturas() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // facturas no tiene `usuario_id` (la relación es `cliente_id`), así que
      // el filtro anterior dejaba la lista siempre vacía. La política RLS
      // facturas_select ya devuelve sólo lo que corresponde a cada rol.
      const { data, error } = await supabase.from("facturas").select("*");

      if (error) {
        console.error("Error cargando facturas:", error);
      } else {
        setFacturas(data || []);
      }

      setLoading(false);
    }

    cargarFacturas();
  }, []);

  if (loading) {
    return (
      <Menu>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h3>Cargando lista de facturas...</h3>
        </div>
      </Menu>
    );
  }

  if (!facturas.length) {
    return (
      <Menu>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h3>No hay facturas registradas.</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
    // El contenedor era blanco (#fff) y las tarjetas #f7f7f7, pero global.css
    // fija `color: #ffffff` en el body: el texto salía blanco sobre blanco.
    // Se usa el tema oscuro del resto de la aplicación.
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ color: "#4db8ff", marginBottom: 18 }}>Lista de Facturas</h2>

      {facturas.map((f) => (
        <div
          key={f.id}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "10px",
          }}
        >
          <p><strong style={{ color: "#9fb3c8" }}>Número:</strong> {f.numero || `#${f.id}`}</p>
          {/* `importe` no existe en la tabla: las columnas son base/iva/total */}
          <p><strong style={{ color: "#9fb3c8" }}>Total:</strong> {Number(f.total || 0).toFixed(2)} €</p>
          <p><strong style={{ color: "#9fb3c8" }}>Estado:</strong> {f.estado}</p>
          <p><strong style={{ color: "#9fb3c8" }}>Fecha:</strong> {String(f.fecha || "").slice(0, 10)}</p>
        </div>
      ))}
    </div>
    </Menu>
  );
}
