import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarTecnicos() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .order("id", { ascending: false });

      if (!error) setTecnicos(data || []);
      setLoading(false);
    }

    cargarTecnicos();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Técnicos</h1>

        <Link to="/tecnicos/crear">
          <button style={{ marginBottom: "20px" }}>Nuevo técnico</button>
        </Link>

        {loading ? (
          <p>Cargando...</p>
        ) : tecnicos.length === 0 ? (
          <p>No hay técnicos registrados.</p>
        ) : (
          <ul>
            {tecnicos.map((t) => (
              <li key={t.id} style={{ marginBottom: "10px" }}>
                <Link
                  to={`/tecnicos/ver/${t.id}`}
                  style={{ color: "#4db8ff" }}
                >
                  {t.nombre} — {t.telefono}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
