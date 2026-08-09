import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FaTools,
  FaClipboardList,
  FaCamera,
  FaCheckCircle,
} from "react-icons/fa";

export default function TecnicoDashboard() {
  const { user } = useAuth();

  const [tecnico, setTecnico] = useState(null);
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const baseStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "25px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  };

  const hoverStyle = {
    transform: "scale(1.03)",
    boxShadow: "0 0 18px rgba(0,153,255,0.35)",
  };

  function applyHover(e) {
    Object.assign(e.currentTarget.style, hoverStyle);
  }

  function removeHover(e) {
    Object.assign(e.currentTarget.style, baseStyle);
  }

  useEffect(() => {
    if (user) cargarTecnicoYInspecciones();
  }, [user]);

  async function cargarTecnicoYInspecciones() {
    setLoading(true);

    // 1️⃣ Buscar técnico REAL por email del usuario autenticado
    const { data: tecnicoData, error: errorTecnico } = await supabase
      .from("tecnicos")
      .select("id, nombre, email")
      .eq("email", user.email)
      .single();

    if (errorTecnico || !tecnicoData) {
      setMensaje("No se encontró técnico para este usuario.");
      setTecnico(null);
      setInspecciones([]);
      setLoading(false);
      return;
    }

    setTecnico(tecnicoData);

    // 2️⃣ Cargar inspecciones asignadas al técnico REAL
    const { data: inspData, error: errorInsp } = await supabase
      .from("inspecciones")
      .select("id, fecha, estado, vivienda_id, cliente_id")
      .eq("tecnico_id", tecnicoData.id)
      .order("fecha", { ascending: true });

    if (errorInsp) {
      setMensaje("Error cargando inspecciones.");
      setLoading(false);
      return;
    }

    // 3️⃣ Cargar vivienda + cliente para cada inspección
    const inspeccionesConDatos = await Promise.all(
      (inspData || []).map(async (i) => {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", i.vivienda_id)
          .single();

        const { data: cli } = await supabase
          .from("clientes")
          .select("nombre, telefono")
          .eq("id", i.cliente_id)
          .single();

        return {
          ...i,
          vivienda: viv || null,
          cliente: cli || null,
        };
      })
    );

    setInspecciones(inspeccionesConDatos);
    setLoading(false);
  }

  return (
    <div
      style={{
        padding: "25px",
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "700",
          marginBottom: "25px",
          color: "#4db8ff",
          textShadow: "0 0 10px rgba(0,153,255,0.6)",
          textAlign: "center",
        }}
      >
        Panel del Técnico
      </h1>

      {mensaje && (
        <p
          style={{
            marginBottom: "15px",
            color: "#ff6b6b",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {mensaje}
        </p>
      )}

      {/* INFO DEL TÉCNICO */}
      {tecnico && (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "25px",
          }}
        >
          <p style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#4db8ff" }}>Nombre:</strong>{" "}
            {tecnico.nombre}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Email:</strong>{" "}
            {tecnico.email}
          </p>
        </div>
      )}

      {/* INSPECCIONES ASIGNADAS */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            color: "#4db8ff",
            marginBottom: "15px",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Inspecciones asignadas
        </h2>

        {loading ? (
          <p style={{ opacity: 0.7 }}>Cargando inspecciones...</p>
        ) : inspecciones.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No tienes inspecciones asignadas.</p>
        ) : (
          inspecciones.map((insp) => (
            <div
              key={insp.id}
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <p>
                <strong>Fecha:</strong> {insp.fecha}
              </p>
              <p>
                <strong>Estado:</strong> {insp.estado}
              </p>
              <p>
                <strong>Vivienda:</strong>{" "}
                {insp.vivienda
                  ? `${insp.vivienda.direccion}, ${insp.vivienda.ciudad}`
                  : insp.vivienda_id}
              </p>
              <p>
                <strong>Cliente:</strong>{" "}
                {insp.cliente
                  ? `${insp.cliente.nombre} (${insp.cliente.telefono})`
                  : insp.cliente_id}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {/* Checklist */}
                <Link
                  to={`/tecnico/inspeccion/${insp.id}/checklist`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={baseStyle}
                    onMouseEnter={applyHover}
                    onMouseLeave={removeHover}
                  >
                    <FaClipboardList size={35} color="#4db8ff" />
                    <h4 style={{ marginTop: "10px", color: "#4db8ff" }}>
                      Checklist
                    </h4>
                  </div>
                </Link>

                {/* Fotos */}
                <Link
                  to={`/tecnico/inspeccion/${insp.id}/fotos`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={baseStyle}
                    onMouseEnter={applyHover}
                    onMouseLeave={removeHover}
                  >
                    <FaCamera size={35} color="#4db8ff" />
                    <h4 style={{ marginTop: "10px", color: "#4db8ff" }}>
                      Subir fotos
                    </h4>
                  </div>
                </Link>

                {/* Finalizar */}
                <Link
                  to={`/tecnico/inspeccion/${insp.id}/finalizar`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={baseStyle}
                    onMouseEnter={applyHover}
                    onMouseLeave={removeHover}
                  >
                    <FaCheckCircle size={35} color="#4db8ff" />
                    <h4 style={{ marginTop: "10px", color: "#4db8ff" }}>
                      Finalizar
                    </h4>
                  </div>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
