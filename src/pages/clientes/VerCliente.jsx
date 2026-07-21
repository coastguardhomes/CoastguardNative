import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
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
        .select("*")
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
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando cliente");
      return;
    }

    setMensaje("Cliente eliminado correctamente");
    navigate("/clientes");
  }

  if (!cliente) {
    return (
      <Menu>
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Cargando cliente...</p>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>{cliente.nombre}</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>Email:</strong> {cliente.email}</p>
        <p><strong>Dirección:</strong> {cliente.direccion}</p>

        <Link to={`/clientes/editar/${id}`}>
          <button
            style={{
              marginTop: "15px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Editar cliente
          </button>
        </Link>

        <button
          onClick={eliminarCliente}
          style={{
            marginTop: "15px",
            padding: "12px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Eliminar cliente
        </button>
      </div>
    </Menu>
  );
}
