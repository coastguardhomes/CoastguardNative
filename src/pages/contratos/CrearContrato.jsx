import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function CrearContrato() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: "",
    precio: "",
    notas: "",
  });

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      const { data: clientesData } = await supabase.from("clientes").select("*");
      const { data: viviendasData } = await supabase.from("viviendas").select("*");

      setClientes(clientesData || []);
      setViviendas(viviendasData || []);
    }

    cargarDatos();
  }, []);

  async function crearContrato() {
    const { error } = await supabase.from("contratos").insert([form]);

    if (error) {
      setMensaje("Error creando contrato");
      console.error(error);
      return;
    }

    setMensaje("Contrato creado correctamente");
    navigate("/contratos");
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
          <label>Cliente:</label>
          <select
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <label>Vivienda:</label>
          <select
            value={form.vivienda_id}
            onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            <option value="">Selecciona vivienda</option>
            {viviendas.map((v) => (
              <option key={v.id} value={v.id}>{v.direccion}</option>
            ))}
          </select>

          <label>Fecha:</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

          <label>Precio (€):</label>
          <input
            type="number"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />

          <label>Notas:</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
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
