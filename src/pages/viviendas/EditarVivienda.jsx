import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarVivienda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    tecnico_id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
  });

  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [contratos, setContratos] = useState([]); // ← AÑADIDO
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarVivienda() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("cliente_id, tecnico_id, nombre, direccion, ciudad, codigo_postal")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando vivienda");
        return;
      }

      setForm({
        ...data,
        cliente_id: data.cliente_id || "",
        tecnico_id: data.tecnico_id || "",
      });
    }

    async function cargarContratos() {   // ← AÑADIDO
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("vivienda_id", id);

      if (!error) setContratos(data || []);
    }

    // Sin cliente la vivienda queda huérfana: no se le puede crear contrato
    // ni inspección (ambos cuelgan de la relación cliente -> vivienda).
    async function cargarListas() {
      const [{ data: cli }, { data: tec }] = await Promise.all([
        supabase.from("clientes").select("id, nombre").order("nombre"),
        supabase.from("tecnicos").select("id, nombre").order("nombre"),
      ]);

      setClientes(cli || []);
      setTecnicos(tec || []);
    }

    cargarVivienda();
    cargarContratos();  // ← AÑADIDO
    cargarListas();
  }, [id]);

  async function guardarCambios() {
    if (!form.cliente_id) {
      setMensaje("Selecciona el cliente propietario de la vivienda");
      return;
    }

    const { error } = await supabase
      .from("viviendas")
      .update({
        cliente_id: form.cliente_id,
        tecnico_id: form.tecnico_id || null,
        nombre: form.nombre,
        direccion: form.direccion,
        ciudad: form.ciudad,
        codigo_postal: form.codigo_postal,
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando cambios");
      return;
    }

    setMensaje("Vivienda actualizada correctamente");
    navigate("/viviendas");
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
          }}
        >
          Editar Vivienda
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
          <label>Cliente</label>
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

          <label>Técnico asignado</label>
          <select
            value={form.tecnico_id}
            onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">Sin técnico asignado</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          <label>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={inputStyle}
          />

          <label>Dirección</label>
          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            style={inputStyle}
          />

          <label>Ciudad</label>
          <input
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            style={inputStyle}
          />

          <label>Código Postal</label>
          <input
            value={form.codigo_postal}
            onChange={(e) =>
              setForm({ ...form, codigo_postal: e.target.value })
            }
            style={inputStyle}
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

        {/* 🔵 CONTRATOS DE ESTA VIVIENDA */}
        <h2 style={{ marginTop: "30px", color: "#4db8ff" }}>
          Contratos de esta vivienda
        </h2>

        {contratos.length === 0 ? (
          <p>No hay contratos para esta vivienda.</p>
        ) : (
          contratos.map((c) => (
            <div
              key={c.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <p><strong>ID:</strong> {c.id}</p>
              <p><strong>Precio:</strong> {c.precio} €</p>
              <p><strong>Inicio:</strong> {c.fecha_inicio}</p>
            </div>
          ))
        )}
      </div>
    </Menu>
  );
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
