import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarContratos() {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          id,
          cliente_id,
          vivienda_id,
          tecnico_id,
          precio,
          fecha_inicio,
          fecha_fin,
          modalidad,
          estado,
          firma,
          creado_en
        `)
        .order("creado_en", { ascending: false });

      if (!error) {
        // Cargar nombres relacionados
        const clientes = await supabase.from("clientes").select("id, nombre");
        const viviendas = await supabase.from("viviendas").select("id, direccion");
        const tecnicos = await supabase.from("tecnicos").select("id, nombre");

        const contratosConNombres = data.map((c) => ({
          ...c,
          cliente_nombre:
            clientes.data.find((x) => x.id === c.cliente_id)?.nombre || "—",
          vivienda_direccion:
            viviendas.data.find((x) => x.id === c.vivienda_id)?.direccion || "—",
          tecnico_nombre:
            tecnicos.data.find((x) => x.id === c.tecnico_id)?.nombre || "—",
        }));

        setContratos(contratosConNombres);
      }

      setLoading(false);
    }

    cargarContratos();
  }, []);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Contratos
        </h1>

        <Link to="/contratos/crear">
          <button
            style={{
              marginBottom: "25px",
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
            Nuevo contrato
          </button>
        </Link>

        {loading ? (
          <p style={{ textAlign: "center", fontSize: "18px", opacity: 0.8 }}>
            Cargando contratos...
          </p>
        ) : contratos.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: "16px", opacity: 0.8 }}>
            No hay contratos registrados.
          </p>
        ) : (
          <div>
            {contratos.map((c) => (
              <Link
                key={c.id}
                to={`/contratos/ver/${c.id}`}
                style={{ textDecoration: "none", color: "#fff" }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "18px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                    marginBottom: "15px",
                  }}
                >
                  <p>
                    <strong style={{ color: "#4db8ff" }}>Contrato:</strong> #{c.id}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Cliente:</strong>{" "}
                    {c.cliente_nombre}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Vivienda:</strong>{" "}
                    {c.vivienda_direccion}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Técnico:</strong>{" "}
                    {c.tecnico_nombre}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Modalidad:</strong>{" "}
                    {c.modalidad || "Sin modalidad"}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Fecha inicio:</strong>{" "}
                    {c.fecha_inicio || "Sin fecha"}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Fecha fin:</strong>{" "}
                    {c.fecha_fin || "Sin fecha"}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Precio:</strong>{" "}
                    {c.precio ? `${c.precio} €` : "Sin precio"}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
                    {c.estado || "Sin estado"}
                  </p>

                  <p>
                    <strong style={{ color: "#4db8ff" }}>Firmado:</strong>{" "}
                    {c.firma ? "Sí" : "No"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
