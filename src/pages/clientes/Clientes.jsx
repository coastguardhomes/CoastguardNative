import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: false });

      if (!error) setClientes(data);
      setLoading(false);
    }

    cargarClientes();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Clientes</h1>

        <Link to="/clientes/crear">
          <button style={{ marginBottom: "20px" }}>Nuevo cliente</button>
        </Link>

        {loading ? (
          <p>Cargando...</p>
        ) : clientes.length === 0 ? (
          <p>No hay clientes registrados.</p>
        ) : (
          <ul>
            {clientes.map((c) => (
              <li key={c.id} style={{ marginBottom: "10px" }}>
                <Link to={`/clientes/ver/${c.id}`} style={{ color: "#4db8ff" }}>
                  {c.nombre} — {c.telefono}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
