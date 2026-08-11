import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function Inspecciones() {
  const [user, setUser] = useState(null);
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarUsuario() {
      const { data } = await supabase.auth.getUser();
      console.log("Usuario actual logueado:", data?.user);
      setUser(data?.user || null);
    }

    cargarUsuario();
  }, []);

  useEffect(() => {
    async function cargarInspecciones() {
      if (!user) return;

      try {
        let query = supabase
          .from("inspecciones")
          .select(`
            id,
            fecha,
            estado,
            vivienda_id,
            tecnico_id,
            viviendas (
              direccion,
              ciudad
            )
          `)
          .order("id", { ascending: false });

        // Si NO es admin → filtrar por técnico
        if (user.email !== "coastguardhomes2@gmail.com") {
          console.log("Filtrando para técnico con ID:", user.id);
          query = query.eq("tecnico_id", user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        console.log("Inspecciones encontradas para este usuario:", data);
        setInspecciones(data || []);
      } catch (err) {
        console.error("Error detallado:", err.message);
        
        // Plan B: Cargar todo sin filtros para ver qué devuelve
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("inspecciones")
          .select("*")
          .order("id", { ascending: false });

        if (fallbackError) {
          setMensaje("Error cargando inspecciones");
        } else {
          console.log("Inspecciones obtenidas por Plan B:", fallbackData);
          setInspecciones(fallbackData || []);
        }
      } finally {
        setLoading(false);
      }
    }

    cargarInspecciones();
  }, [user]);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
          }}
        >
          Inspecciones
        </h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff", fontWeight: "600" }}>
            {mensaje}
          </p>
        )}

        {/* Solo admin */}
        {user?.email === "coastguardhomes2@gmail.com" && (
          <Link to="/inspecciones/nueva">
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
              }}
            >
              Nueva inspección
            </button>
          </Link>
        )}

        {loading ? (
          <p>Cargando inspecciones...</p>
        ) : inspecciones.length === 0 ? (
          <p>No hay inspecciones registradas o asignadas a este usuario.</p>
        ) : (
          <div>
            {inspecciones.map((i) => (
              <div
                key={i.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Link
                  to={`/inspecciones/ver/${i.id}`}
                  style={{
                    color: "#4db8ff",
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  Inspección #{i.id}
                </Link>

                <p style={{ opacity: 0.8, marginTop: "10px" }}>
                  <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
                  {i.viviendas?.direccion || "No especificada"}
                </p>

                <p style={{ opacity: 0.8 }}>
                  <strong style={{ color: "#4db8ff" }}>Localidad:</strong>{" "}
                  {i.viviendas?.ciudad || "No especificada"}
                </p>

                <p style={{ opacity: 0.8 }}>
                  <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
                  {i.fecha}
                </p>

                <p style={{ opacity: 0.8 }}>
                  <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
                  {i.estado}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
