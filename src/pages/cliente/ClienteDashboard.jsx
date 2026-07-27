import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ClienteDashboard() {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCliente() {
      // ⭐ Esperar a que Supabase inicialice correctamente
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        setLoading(false);
        return;
      }

      // ⭐ Consultar cliente usando el usuario_id correcto
      const { data: clienteData, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("usuario_id", session.user.id)
        .single();

      if (!error) {
        setCliente(clienteData);
      }

      setLoading(false);
    }

    cargarCliente();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Cargando datos del cliente...</h3>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>No se encontró información del cliente.</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "20px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>Panel del Cliente</h2>

      <p><strong>Nombre:</strong> {cliente.nombre}</p>
      <p><strong>Email:</strong> {cliente.email}</p>
      <p><strong>Teléfono:</strong> {cliente.telefono}</p>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            background: "#007bff",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Ver mis viviendas
        </button>
      </div>
    </div>
  );
}
