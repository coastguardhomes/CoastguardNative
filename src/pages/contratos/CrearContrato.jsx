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
    duracion_meses: "12", // Añadido por defecto para el contrato legal
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

  const viviendasFiltradas = form.cliente_id
    ? viviendas.filter((v) => String(v.cliente_id) === String(form.cliente_id))
    : viviendas;

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

    if (!form.modalidad) {
      setMensaje("Selecciona una modalidad");
      return;
    }

    if (!form.fecha_inicio) {
      setMensaje("Selecciona la fecha de inicio");
      return;
    }

    // 1️⃣ Crear contrato inicial en Supabase
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
          firma_url: null,
          pdf_url: null,
          fecha_fin: null,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      setMensaje("Error creando contrato");
      return;
    }

    const contratoId = data[0].id;

    // 2️⃣ Calcular fecha_fin basada en la frecuencia
    const fechaInicio = new Date(form.fecha_inicio);
    const frecuenciaDias = Number(form.frecuencia) || 30;
    const fechaFin = new Date(
      fechaInicio.getTime() + frecuenciaDias * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    // Obtener sesión para la Edge Function
    const { data: { session } } = await supabase.auth.getSession();
    const token = session ? session.access_token : "";

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    // 3️⃣ Generar PDF en la Edge Function (el cual usará los datos legales y el sello)
    let pdfUrl = null;
    try {
      const pdfResponse = await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/contrato-pdf?id=${contratoId}`,
        { headers }
      );
      if (pdfResponse.ok) {
        pdfUrl = await pdfResponse.text();
      } else {
        console.error("Error en respuesta de PDF:", await pdfResponse.text());
      }
    } catch (e) {
      console.error("Error generando PDF:", e);
    }

    // 4️⃣ Guardar fecha_fin y pdf_url
    await supabase
      .from("contratos")
      .update({
        fecha_fin: fechaFin,
        pdf_url: pdfUrl,
      })
      .eq("id", contratoId);

    // 5️⃣ Crear inspecciones automáticas
    try {
      await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/crear_inspecciones_programadas?id=${contratoId}`,
        { headers }
      );
    } catch (e) {
      console.error("Error creando inspecciones:", e);
    }

    // 6️⃣ Enviar email al cliente con el enlace de firma
    try {
      await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/enviar-email?contrato=${contratoId}`,
        { headers }
      );
    } catch (e) {
      console.error("Error enviando email:", e);
    }

    setMensaje("¡Contrato legal creado y enviado al cliente con éxito!");
    setTimeout(() => {
      navigate("/contratos");
    }, 1500);
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
          Crear Contrato Legal
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
            onChange={(e) =>
              setForm({ ...form, tecnico_id: String(e.target.value) })
            }
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

          {/* Duración en meses */}
          <label>Duración (meses):</label>
          <input
            type="number"
            value={form.duracion_meses}
            onChange={(e) => setForm({ ...form, duracion_meses: e.target.value })}
            style={inputStyle}
          />

          {/* Fecha inicio */}
          <label>Fecha inicio:</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            style={inputStyle}
          />

          {/* Precio */}
          <label>Precio (€/mes):</label>
          <input
            type="number"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            style={inputStyle}
          />

          {/* Frecuencia */}
          <label>Frecuencia de visitas (días):</label>
          <input
            type="number"
            value={form.frecuencia}
            onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
            style={inputStyle}
          />

          {/* Notas */}
          <label>Notas adicionales:</label>
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
            Generar y Enviar Contrato Legal
          </button>
        </div>
      </div>
    </Menu>
  );
}
