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
  const [mensaje, setMensaje] = useState("");

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
    setMensaje("Factura enviada. PDF: " + url);
  }

  async function handlePagada() {
    await marcarPagada(id);
    setMensaje("Factura marcada como pagada");
    cargar();
  }

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          background: "#0a0f1a",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    );

  return (
    <div
      style={{
        padding: "20px",
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        Factura #{factura.id}
      </h2>

      {mensaje && (
        <p
          style={{
            marginBottom: "15px",
            color: "#4db8ff",
            fontWeight: "600",
          }}
        >
          {mensaje}
        </p>
      )}

      {/* Tarjeta principal */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          marginBottom: "20px",
        }}
      >
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Cliente:</strong>{" "}
          {factura.cliente_nombre}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Email:</strong>{" "}
          {factura.cliente_email}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
          {factura.fecha}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Total:</strong> €{factura.total}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
          {factura.estado}
        </p>
      </div>

      {/* Tarjeta datos empresa */}
      {config && (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              color: "#4db8ff",
              marginBottom: "15px",
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            Datos de la empresa
          </h3>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Empresa:</strong>{" "}
            {config.nombre_empresa}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
            {config.direccion_empresa}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Teléfono:</strong>{" "}
            {config.telefono_empresa}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Email:</strong>{" "}
            {config.email_empresa}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Cuenta bancaria:</strong>{" "}
            {config.cuenta_bancaria}
          </p>
        </div>
      )}

      {/* Botones */}
      <button
        onClick={handleEnviar}
        style={{
          padding: "14px",
          width: "100%",
          background: "#4db8ff",
          color: "#000",
          borderRadius: "10px",
          border: "none",
          fontWeight: "700",
          fontSize: "17px",
          cursor: "pointer",
          marginBottom: "15px",
          boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        }}
      >
        Enviar factura por email
      </button>

      <button
        onClick={handlePagada}
        style={{
          padding: "14px",
          width: "100%",
          background: "green",
          color: "#fff",
          borderRadius: "10px",
          border: "none",
          fontWeight: "700",
          fontSize: "17px",
          cursor: "pointer",
          boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        }}
      >
        Marcar como pagada
      </button>
    </div>
  );
}
