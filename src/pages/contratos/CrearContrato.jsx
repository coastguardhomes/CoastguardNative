
import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
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
      alert("Error creando contrato");
      console.error(error);
    } else {
      alert("Contrato creado correctamente");
      navigate("/contratos");
    }
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1>Crear Contrato</h1>

        <label>Cliente:</label>
        <select
          value={form.cliente_id}
          onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
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
        />

        <label>Precio (€):</label>
        <input
          type="number"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
        />

        <label>Notas:</label>
        <textarea
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />

        <button onClick={crearContrato}>Guardar contrato</button>
      </div>
    </Menu>
  );
}
