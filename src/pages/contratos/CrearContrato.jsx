import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function CrearContrato() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  // Buscamos el cliente seleccionado para mostrar su DNI en pantalla
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    tecnico_id: "",
    fecha_inicio: "",
    precio: "",
    notas: "",
    frecuencia: "",
    modalidad: "",
    duracion_meses: "12",
  });

  const [mensaje, setMensaje] = useState("");

  const modalidades = [
    { id: "basico", nombre: "Básico", precio: 39, frecuencia: 30 },
    { id: "premium", nombre: "Premium", precio: 59, frecuencia: 30 },
    { id: "plus", nombre: "Plus", precio: 79, frecuencia: 30 },
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    // 1. Añadimos dni y cif a la consulta
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("id, nombre, dni, cif");

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

  const viviendasFiltradas = form.cliente_id
    ? viviendas.filter((v) => String(v.cliente_id) === String(form.cliente_id))
    : viviendas;

  // Actualizar el cliente seleccionado cuando cambia el formulario
  const handleClienteChange = (id) => {
    const cliente = clientes.find((c) => String(c.id) === String(id));
    setClienteSeleccionado(cliente || null);
    setForm({ ...form, cliente_id: id });
  };

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
    setMensaje("");
    if (!form.cliente_id || !form.vivienda_id || !form.tecnico_id) {
      setMensaje("Cliente, vivienda y técnico son obligatorios");
      return;
    }
    // ... resto de la lógica de creación igual ...
    const { data, error } = await supabase
      .from("contratos")
      .insert([
        {
          cliente_id: form.cliente_id,
          vivienda_id: form.vivienda_id,
          tecnico_id: String(form.tecnico_id),
          fecha_inicio: form.fecha_inicio,
          precio: form.precio,
          notas: form.notas,
          frecuencia: form.frecuencia,
          modalidad: form.modalidad,
          estado: "pendiente",
          duracion_meses: form.duracion_meses,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      setMensaje("Error creando contrato");
      return;
    }

    const contratoId = data[0].id;
    // ... resto de lógica (PDF, inspecciones, email) ...
    const { data: pdfData } = await supabase.functions.invoke("contrato-pdf", { body: { contratoId } });
    await supabase.from("contratos").update({ pdf_url: pdfData?.url }).eq("id", contratoId);
    
    setMensaje("¡Contrato creado y enviado!");
    setTimeout(() => navigate("/contratos"), 1500);
  }

  const inputStyle = { padding: "12px", width: "100%", marginBottom: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff" };

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "25px" }}>Crear Contrato Legal</h1>
        
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px" }}>
          
          <label>Cliente:</label>
          <select value={form.cliente_id} onChange={(e) => handleClienteChange(e.target.value)} style={inputStyle}>
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          {/* Visualización del DNI/NIE */}
          {clienteSeleccionado && (
            <div style={{ marginBottom: "15px", padding: "10px", background: "rgba(77, 184, 255, 0.1)", borderRadius: "8px", fontSize: "14px" }}>
              <strong>DNI / NIE:</strong> {clienteSeleccionado.dni || clienteSeleccionado.cif || "No registrado"}
            </div>
          )}

          {/* ... resto del formulario ... */}
          
          <button onClick={crearContrato} style={{ marginTop: "20px", padding: "14px", width: "100%", background: "#4db8ff", border: "none", borderRadius: "10px", fontWeight: "bold" }}>
            Generar Contrato
          </button>
        </div>
      </div>
    </Menu>
  );
          }
          
