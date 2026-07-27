import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarFacturas() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // CAMBIO IMPORTANTE: cliente_id en lugar de usuario_id
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("cliente_id", 2); // O el cliente asociado al usuario

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
        <h3>Cargando facturas...</h3>
      </div>
    );
  }

  if (!facturas.length) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>No hay facturas registradas.</h3>
      </div>
    );
  }

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
      <h2>Facturas</h2>

      {facturas.map((f) => (
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
          <p><strong>Número:</strong> {f.numero}</p>
          <p><strong>Fecha:</strong> {f.fecha}</p>
          <p><strong>Total:</strong> {f.total} €</p>
          <p><strong>Estado:</strong> {f.estado}</p>
        </div>
      ))}
    </div>
  );
}
