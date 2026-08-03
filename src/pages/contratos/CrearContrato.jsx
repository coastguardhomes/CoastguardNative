import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function CrearContrato() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    tecnico_id: "",
    fecha_inicio: "",
    precio: "",
    notas: "",
    frecuencia: "",
    modalidad: "",
  });

  const [mensaje, setMensaje] = useState("");

  // 🔥 Modalidades y precios automáticos
  const modalidades = [
    { id: "basico", nombre: "Básico", precio: 39, frecuencia: 30 },
    { id: "premium", nombre: "Premium", precio: 59, frecuencia: 30 },
    { id: "plus", nombre: "Plus", precio: 79, frecuencia: 30 },
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("id, nombre");

    const { data: viviendasData } = await supabase
      .from("viviendas")
      .select("id, direccion, cliente_id");

    const { data: tecnicosData } = await supabase
      .from("tecnicos")
      .select("id, nombre");

    setClientes(clientesData || []);
    setViviendas(viviendasData || []);
    setTecnicos(tecnicosData || []);
  }

  // 🔥 Auto‑filtrar viviendas según cliente
  const viviendasFiltradas = form.cliente_id
    ? viviendas.filter((v) => v.cliente_id === form.cliente_id)
    : viviendas;

  // 🔥 Auto‑calcular precio y frecuencia según modalidad
  function seleccionarModalidad(modalidadId) {
    const mod = modalidades.find((m) => m.id === modalidadId);

    setForm({
      ...form,
      modalidad: modalidadId,
      precio: mod ? mod.precio : "",
      frecuencia: mod ? mod.frecuencia : "",
    });
  }

  async function crearContrato() {
    if (!form.cliente_id || !form.vivienda_id || !form.tecnico_id) {
      setMensaje("Cliente, vivienda y técnico son obligatorios");
      return;
    }

    const { error } = await supabase.from("contratos").insert([
      {
        cliente_id: form.cliente_id,
        vivienda_id: form.vivienda_id,
        tecnico_id: form.tecnico_id,
        fecha_inicio: form.fecha_inicio || null,
        precio: form.precio || null,
        notas: form.notas || null,
        frecuencia: form.frecuencia || null,
        modalidad: form.modalidad || null,
      },
    ]);

    if (error) {
      setMensaje("Error creando contrato");
      console.error(error);
      return;
    }

    navigate("/contratos");
  }

  const inputStyle = {
    padding: "12px",
    width: "100%",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  };

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
          }}
        >
          Crear Contrato
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

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          {/* Cliente */}
          <label>Cliente:</label>
          <select
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          {/* Vivienda */}
          <label>Vivienda:</label>
          <select
            value={form.vivienda_id}
            onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">Selecciona vivienda</option>
            {viviendasFiltradas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.direccion}
              </option>
            ))}
          </select>

          {/* Técnico */}
          <label>Técnico:</label>
          <select
            value={form.tecnico_id}
            onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">Selecciona técnico</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* Modalidad */}
          <label>Modalidad:</label>
          <select
            value={form.modalidad}
            onChange={(e) => seleccionarModalidad(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecciona modalidad</option>
            {modalidades.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} — {m.precio}€
              </option>
            ))}
          </select>

          {/* Fecha inicio */}
          <label>Fecha inicio:</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            style={inputStyle}
          />

          {/* Precio */}
          <label>Precio (€):</label>
          <input
            type="number"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            style={inputStyle}
          />

          {/* Frecuencia */}
          <label>Frecuencia (días):</label>
          <input
            type="number"
            value={form.frecuencia}
            onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
            style={inputStyle}
          />

          {/* Notas */}
          <label>Notas:</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{
              ...inputStyle,
              minHeight: "90px",
            }}
          />

          <button
            onClick={crearContrato}
            style={{
              marginTop: "20px",
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
            Guardar contrato
          </button>
        </div>
      </div>
    </Menu>
  );
}
