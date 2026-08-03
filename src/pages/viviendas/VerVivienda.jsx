import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerVivienda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vivienda, setVivienda] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Nuevos estados para datos relacionados
  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);

  useEffect(() => {
    cargarVivienda();
    cargarRelacionados();
  }, [id]);

  async function cargarVivienda() {
    const { data, error } = await supabase
      .from("viviendas")
      .select("id, nombre, direccion, ciudad, codigo_postal, cliente_id")
      .eq("id", id)
      .single();

    if (error) {
      setMensaje("Error cargando vivienda");
      return;
    }

    setVivienda(data);
  }

  async function cargarRelacionados() {
    // Cliente propietario
    const { data: clienteData } = await supabase
      .from("clientes")
      .select("id, nombre, telefono, email")
      .eq("id", vivienda?.cliente_id)
      .single();

    setCliente(clienteData || null);

    // Contratos asociados
    const { data: contratosData } = await supabase
      .from("contratos")
      .select("*")
      .eq("vivienda_id", id);

    setContratos(contratosData || []);

    // Inspecciones realizadas
    const { data: inspeccionesData } = await supabase
      .from("inspecciones")
      .select("id, fecha, estado, tecnico_id")
      .eq("vivienda_id", id);

    setInspecciones(inspeccionesData || []);
  }

  async function eliminarVivienda() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta vivienda?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("viviendas")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando vivienda");
      return;
    }

    setMensaje("Vivienda eliminada correctamente");
    navigate("/viviendas");
  }

  if (!vivienda) {
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
          Cargando vivienda...
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
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          {vivienda.nombre}
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

        {/* DATOS DE LA VIVIENDA */}
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
          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
            {vivienda.direccion}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Ciudad:</strong>{" "}
            {vivienda.ciudad}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Código Postal:</strong>{" "}
            {vivienda.codigo_postal}
          </p>
        </div>

        {/* ---------------- BLOQUES PROFESIONALES ---------------- */}

        <Bloque titulo="Cliente propietario">
          {!cliente ? (
            <p style={{ opacity: 0.7 }}>No se encontró el cliente.</p>
          ) : (
            <Item
              to={`/clientes/${cliente.id}`}
              titulo={`${cliente.nombre} — ${cliente.email}`}
            />
          )}
        </Bloque>

        <Bloque titulo="Contratos asociados">
          {contratos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay contratos asociados.</p>
          ) : (
            contratos.map((c) => (
              <Item
                key={c.id}
                to={`/contratos/${c.id}`}
                titulo={`${c.modalidad} — ${c.precio}€`}
              />
            ))
          )}
        </Bloque>

        <Bloque titulo="Inspecciones realizadas">
          {inspecciones.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay inspecciones.</p>
          ) : (
            inspecciones.map((i) => (
              <Item
                key={i.id}
                to={`/inspecciones/${i.id}`}
                titulo={`Inspección del ${i.fecha} — Estado: ${i.estado}`}
              />
            ))
          )}
        </Bloque>

        {/* ---------------- BOTONES ORIGINALES ---------------- */}

        <Link to={`/viviendas/editar/${id}`}>
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
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Editar vivienda
          </button>
        </Link>

        <button
          onClick={eliminarVivienda}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(255,0,0,0.4)",
          }}
        >
          Eliminar vivienda
        </button>
      </div>
    </Menu>
  );
}

/* ---------------- COMPONENTES REUTILIZABLES ---------------- */

function Bloque({ titulo, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#4db8ff",
        }}
      >
        {titulo}
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Item({ to, titulo }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          padding: "10px",
          marginBottom: "8px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {titulo}
      </div>
    </Link>
  );
}
