import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Inspecciones() {
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarInspecciones();
  }, []);

  async function cargarInspecciones() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        setErrorMsg("Error al obtener inspecciones: " + error.message);
      } else {
        setInspecciones(data || []);
      }
    } catch (err) {
      setErrorMsg("Error conectando con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "20px", fontSize: "28px", fontWeight: "700", textAlign: "center" }}>
          Inspecciones
        </h1>

        <Link to="/inspecciones/nueva" style={{ textDecoration: "none" }}>
          <button style={{ padding: "14px", width: "100%", background: "#4db8ff", color: "#000", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginBottom: "25px" }}>
            Nueva inspección
          </button>
        </Link>

        {errorMsg && (
          <div style={{ padding: "10px", background: "rgba(255,107,107,0.2)", border: "1px solid #ff6b6b", color: "#ff6b6b", borderRadius: "8px", marginBottom: "15px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#4db8ff", marginTop: "30px" }}>Cargando inspecciones...</div>
        ) : inspecciones.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", marginTop: "30px" }}>No hay inspecciones registradas.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {inspecciones.map((insp) => (
              <div
                key={insp.id}
                onClick={() => navigate(`/inspecciones/finalizar/${insp.id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
              >
                <h3 style={{ color: "#4db8ff", fontSize: "16px", marginBottom: "8px", wordBreak: "break-all" }}>
                  Inspección #{insp.id}
                </h3>
                <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px" }}>
                  <strong>Dirección:</strong> {insp.direccion || "No especificada"}
                </p>
                <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px" }}>
                  <strong>Localidad:</strong> {insp.localidad || "No especificada"}
                </p>
                <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px" }}>
                  <strong>Fecha:</strong> {insp.fecha ? String(insp.fecha).slice(0, 10) : "Sin fecha"}
                </p>
                <p style={{ color: "#ccc", fontSize: "14px" }}>
                  <strong>Estado:</strong>{" "}
                  <span style={{ color: insp.estado === "completada_tecnico" ? "#4ade80" : insp.estado === "aprobada" ? "#60a5fa" : "#facc15" }}>
                    {insp.estado}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
