import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarCliente() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, telefono, email, direccion")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando cliente");
        return;
      }

      setCliente(data);
    }

    cargarCliente();
  }, [id]);

  async function eliminarCliente() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando cliente");
      return;
    }

    navigate("/clientes");
  }

  if (!cliente) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cargando cliente...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          color: "#fff",
          background: "#0a0f1a",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "20px",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          {cliente.nombre}
        </h1>

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
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
        </div>

        {/* Ver viviendas del cliente */}
        <Link to={`/viviendas?cliente_id=${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Ver viviendas del cliente
          </button>
        </Link>

        {/* Editar */}
        <Link to={`/clientes/editar/${id}`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Editar cliente
          </button>
        </Link>

        {/* Eliminar */}
        <button
          onClick={eliminarCliente}
          style={{
            marginTop: "15px",
            padding: "14px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          Eliminar cliente
        </button>
      </div>
    </Menu>
  );
}
