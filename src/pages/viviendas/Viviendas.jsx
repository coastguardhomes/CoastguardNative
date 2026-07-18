import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function Viviendas() {
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarViviendas() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .order("id", { ascending: false });

      if (!error) setViviendas(data || []);
      setLoading(false);
    }

    cargarViviendas();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Viviendas</h1>

        <Link to="/viviendas/crear">
          <button style={{ marginBottom: "20px" }}>Nueva vivienda</button>
        </Link>

        {loading ? (
          <p>Cargando...</p>
        ) : viviendas.length === 0 ? (
          <p>No hay viviendas registradas.</p>
        ) : (
          <ul>
            {viviendas.map((v) => (
              <li key={v.id} style={{ marginBottom: "10px" }}>
                <Link
                  to={`/viviendas/ver/${v.id}`}
                  style={{ color: "#4db8ff" }}
                >
                  {v.nombre} — {v.direccion}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
