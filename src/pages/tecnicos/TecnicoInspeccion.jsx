import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TecnicoInspeccion() {
  const { id } = useParams(); // ID inspección
  const { user } = useAuth();

  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarInspeccion();
  }, [id]);

  async function cargarInspeccion() {
    setLoading(true);

    // 1️⃣ Obtener técnico real por email
    const { data: tecnico } = await supabase
      .from("tecnicos")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!tecnico) {
      setMensaje("No se pudo validar el técnico.");
      setLoading(false);
      return;
    }

    // 2️⃣ Cargar inspección completa
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .single();

    if (!insp) {
      setMensaje("Inspección no encontrada.");
      setLoading(false);
      return;
    }

    // 3️⃣ Validar que pertenece al técnico
    if (insp.tecnico_id !== tecnico.id) {
      setMensaje("No tienes permiso para ver esta inspección.");
      setLoading(false);
      return;
    }

    setInspeccion(insp);

    // 4️⃣ Cargar vivienda
    const { data: viv } = await supabase
      .from("viviendas")
      .select("direccion, ciudad")
      .eq("id", insp.vivienda_id)
      .single();

    setVivienda(viv || null);

    // 5️⃣ Cargar cliente desde contrato
    let clienteFinal = null;

    if (insp.contrato_id) {
      const { data: contrato } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", insp.contrato_id)
        .single();

      if (contrato?.cliente_id) {
        const { data: cli } = await supabase
          .from("clientes")
          .select("nombre, telefono")
          .eq("id", contrato.cliente_id)
          .single();

        clienteFinal = cli;
      }
    }

    setCliente(clienteFinal);

    setLoading(false);
  }

  if (loading || !inspeccion) {
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
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando inspección...
        </div>
      </Menu>
    );
  }

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
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Inspección #{inspeccion.id}
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#ff6b6b",
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
            marginBottom: "25px",
          }}
        >
          <p>
            <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
            {inspeccion.fecha}
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
            {inspeccion.estado}
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>Vivienda:</strong>{" "}
            {vivienda
              ? `${vivienda.direccion}, ${vivienda.ciudad}`
              : inspeccion.vivienda_id}
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>Cliente:</strong>{" "}
            {cliente
              ? `${cliente.nombre} (${cliente.telefono})`
              : "Sin cliente"}
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>Notas del técnico:</strong>{" "}
            {inspeccion.notas_tecnico || "Sin notas"}
          </p>
        </div>

        {/* Botones del técnico */}
        <Link to={`/inspecciones/${id}/checklist`}>
          <button
            style={{
              marginBottom: "15px",
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
            Checklist
          </button>
        </Link>

        <Link to={`/inspecciones/fotos/${id}`}>
          <button
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Fotos
          </button>
        </Link>

        <Link to={`/inspecciones/finalizar/${id}`}>
          <button
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#4ade80",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Finalizar inspección
          </button>
        </Link>
      </div>
    </Menu>
  );
}
