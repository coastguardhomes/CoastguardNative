import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerFactura } from "../../services/facturas";
import { enviarFactura } from "../../services/facturaEnviar";
import { marcarPagada } from "../../services/facturaEstado";
import { supabase } from "../../supabaseClient";

export default function VerFactura() {
  const { id } = useParams();

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(null);

  async function cargar() {
    const f = await obtenerFactura(id);
    setFactura(f);
    setLoading(false);
  }

  async function cargarConfig() {
    const { data, error } = await supabase
      .from("configuracion")
      .select("*")
      .single();

    if (!error) {
      setConfig(data);
    }
  }

  useEffect(() => {
    cargar();
    cargarConfig();
  }, []);

  async function handleEnviar() {
    const url = await enviarFactura(id);
    alert("Factura enviada. PDF: " + url);
  }

  async function handlePagada() {
    await marcarPagada(id);
    alert("Factura marcada como pagada");
    cargar();
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Factura #{factura.id}</h2>

      <p><strong>Cliente:</strong> {factura.cliente_nombre}</p>
      <p><strong>Email:</strong> {factura.cliente_email}</p>
      <p><strong>Fecha:</strong> {factura.fecha}</p>
      <p><strong>Total:</strong> €{factura.total}</p>
      <p><strong>Estado:</strong> {factura.estado}</p>

      {config && (
        <div style={{ marginTop: 20 }}>
          <h3>Datos de la empresa</h3>
          <p><strong>Empresa:</strong> {config.nombre_empresa}</p>
          <p><strong>Dirección:</strong> {config.direccion_empresa}</p>
          <p><strong>Teléfono:</strong> {config.telefono_empresa}</p>
          <p><strong>Email:</strong> {config.email_empresa}</p>
          <p><strong>Cuenta bancaria:</strong> {config.cuenta_bancaria}</p>
        </div>
      )}

      <button onClick={handleEnviar}>Reenviar factura</button>
      <button onClick={handlePagada}>Marcar como pagada</button>
    </div>
  );
}
