import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fecha_inicio: "",
    precio: "",
    notas: "",
    frecuencia: "",
    tecnico_id: "",
    modalidad: "",
  });

  const [tecnicos, setTecnicos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const modalidades = [
    { id: "basico", nombre: "Básico", precio: 39, frecuencia: 30 },
    { id: "premium", nombre: "Premium", precio: 59, frecuencia: 30 },
    { id: "plus", nombre: "Plus", precio: 79, frecuencia: 30 },
  ];

  useEffect(() => {
    cargarContrato();
    cargarTecnicos();
  }, [id]);

  async function cargarContrato() {
    const { data, error } = await supabase
      .from("contratos")
      .select("fecha_inicio, precio, notas, frecuencia, tecnico_id, modalidad")
      .eq("id", id)
      .single();

    if (error) {
      setMensaje("Error cargando contrato");
      return;
    }

    if (data) setForm(data);
  }

  async function cargarTecnicos() {
    const { data } = await supabase
      .from("tecnicos")
      .select("id, nombre");

    setTecnicos(data || []);
  }

  function seleccionarModalidad(modalidadId) {
    const mod = modalidades.find((m) => m.id === modalidadId);

    setForm({
      ...form,
      modalidad: modalidadId,
      precio: mod ? mod.precio : form.precio,
      frecuencia: mod ? mod.frecuencia : form.frecuencia,
    });
  }

  async function guardarCambios() {
    const { error } = await supabase
      .from("contratos")
      .update({
        fecha_inicio: form.fecha_inicio || null,
        precio: form.precio || null,
        notas: form.notas || null,
        frecuencia: form.frecuencia || null,
        tecnico_id: form.tecnico_id || null,
        modalidad: form.modalidad || null,
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando cambios");
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
          Editar Contrato #{id}
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
          {/* Modalidad */}
          <label>Modalidad:</label>
          <select
            value={form.modalidad || ""}
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
            value={form.fecha_inicio || ""}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            style={inputStyle}
          />

          {/* Precio */}
          <label>Precio (€):</label>
          <input
            type="number"
            value={form.precio || ""}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            style={inputStyle}
          />

          {/* Frecuencia */}
          <label>Frecuencia (días):</label>
          <input
            type="number"
            value={form.frecuencia || ""}
            onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
            style={inputStyle}
          />

          {/* Técnico */}
          <label>Técnico:</label>
          <select
            value={form.tecnico_id || ""}
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

          {/* Notas */}
          <label>Notas:</label>
          <textarea
            value={form.notas || ""}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{
              ...inputStyle,
              minHeight: "90px",
            }}
          />

          <button
            onClick={guardarCambios}
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
            Guardar cambios
          </button>
        </div>
      </div>
    </Menu>
  );
}
