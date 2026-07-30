import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function EstadisticasFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarFacturas() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // La tabla facturas no tiene `usuario_id` (se relaciona por
      // `cliente_id`), así que este filtro no devolvía nada nunca. No hace
      // falta filtrar aquí: la política RLS facturas_select ya limita el
      // resultado (el admin ve todas y el cliente sólo las suyas).
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
          <h3>Cargando estadísticas...</h3>
        </div>
      </Menu>
    );
  }

  if (!facturas.length) {
    return (
      <Menu>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h3>No hay facturas para mostrar estadísticas.</h3>
        </div>
      </Menu>
    );
  }

  const totalFacturas = facturas.length;
  // `importe` no existe en la tabla facturas: el importe está en `total`, así
  // que esta suma daba siempre 0.00 €.
  const totalImporte = facturas.reduce((acc, f) => acc + Number(f.total || 0), 0);
  const pagadas = facturas.filter((f) => f.estado === "pagada").length;
  const pendientes = facturas.filter((f) => f.estado === "pendiente").length;

  return (
    // Antes el contenedor era blanco y el texto blanco heredado de global.css:
    // no se leía nada. Ahora usa el tema oscuro del resto de la app.
    <Menu>
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ color: "#4db8ff", marginBottom: 18 }}>
        Estadísticas de Facturas
      </h2>

      <div style={tarjeta}>
        <p><strong style={clave}>Total de facturas:</strong> {totalFacturas}</p>
        <p><strong style={clave}>Importe total:</strong> {totalImporte.toFixed(2)} €</p>
        <p><strong style={clave}>Facturas pagadas:</strong> {pagadas}</p>
        <p><strong style={clave}>Facturas pendientes:</strong> {pendientes}</p>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3 style={{ color: "#4db8ff", marginBottom: 12 }}>Últimas facturas</h3>

        {facturas.slice(0, 5).map((f) => (
          <div key={f.id} style={tarjeta}>
            <p><strong style={clave}>Número:</strong> {f.numero || `#${f.id}`}</p>
            <p><strong style={clave}>Total:</strong> {Number(f.total || 0).toFixed(2)} €</p>
            <p><strong style={clave}>Estado:</strong> {f.estado}</p>
            <p><strong style={clave}>Fecha:</strong> {String(f.fecha || "").slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </div>
    </Menu>
  );
}

const tarjeta = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "10px",
};

const clave = { color: "#9fb3c8" };
