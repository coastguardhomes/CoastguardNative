import React, { useEffect, useState } from "react";
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

      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("usuario_id", session.user.id);

      if (!error) {
        setFacturas(data);
      }

      setLoading(false);
    }

    cargarFacturas();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Cargando estadísticas...</h3>
      </div>
    );
  }

  if (!facturas.length) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>No hay facturas para mostrar estadísticas.</h3>
      </div>
    );
  }

  const totalFacturas = facturas.length;
  const totalImporte = facturas.reduce((acc, f) => acc + (f.importe || 0), 0);
  const pagadas = facturas.filter((f) => f.estado === "pagada").length;
  const pendientes = facturas.filter((f) => f.estado === "pendiente").length;

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "700px",
        margin: "0 auto",
        marginTop: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Estadísticas de Facturas</h2>

      <div style={{ marginTop: "20px" }}>
        <p><strong>Total de facturas:</strong> {totalFacturas}</p>
        <p><strong>Importe total:</strong> {totalImporte.toFixed(2)} €</p>
        <p><strong>Facturas pagadas:</strong> {pagadas}</p>
        <p><strong>Facturas pendientes:</strong> {pendientes}</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Últimas facturas</h3>

        {facturas.slice(0, 5).map((f) => (
          <div
            key={f.id}
            style={{
              background: "#f7f7f7",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <p><strong>ID:</strong> {f.id}</p>
            <p><strong>Importe:</strong> {f.importe} €</p>
            <p><strong>Estado:</strong> {f.estado}</p>
            <p><strong>Fecha:</strong> {f.fecha}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
