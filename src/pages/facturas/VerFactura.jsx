import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function VerFactura() {
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarFactura() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const id = window.location.pathname.split("/").pop();

      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setFactura(data);
      }

      setLoading(false);
    }

    cargarFactura();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Cargando factura...</h3>
      </div>
    );
  }

  if (!factura) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>No se encontró la factura.</h3>
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
      <h2>Factura #{factura.id}</h2>

      <p><strong>Importe:</strong> {factura.importe} €</p>
      <p><strong>Estado:</strong> {factura.estado}</p>
      <p><strong>Fecha:</strong> {factura.fecha}</p>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            background: "#0099ff",
            color: "#fff",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
