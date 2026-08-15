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

    if (data) {
      setForm({
        fecha_inicio: data.fecha_inicio || "",
        precio: data.precio || "",
        notas: data.notas || "",
        frecuencia: data.frecuencia || "",
        tecnico_id: data.tecnico_id || "",
        modalidad: data.modalidad || "",
      });
    }
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
    if (!form.fecha_inicio) return setMensaje("La fecha de inicio es obligatoria");
    if (!form.precio) return setMensaje("El precio es obligatorio");
    if (!form.frecuencia) return setMensaje("La frecuencia es obligatoria");
    if (!form.modalidad) return setMensaje("Selecciona una modalidad");
    if (!form.tecnico_id) return setMensaje("Selecciona un técnico");

    // 1️⃣ Actualizar contrato
    const { error } = await supabase
      .from("contratos")
      .update({
        fecha_inicio: form.fecha_inicio,
        precio: form.precio,
        notas: form.notas,
        frecuencia: form.frecuencia,
        tecnico_id: String(form.tecnico_id),
        modalidad: form.modalidad,
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando cambios");
      return;
    }

    // 2️⃣ Recalcular fecha_fin
    const fechaInicio = new Date(form.fecha_inicio);
    const fechaFin = new Date(
      fechaInicio.getTime() + form.frecuencia * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    await supabase
      .from("contratos")
      .update({ fecha_fin: fechaFin })
      .eq("id", id);

    // Obtener sesión para autenticar las peticiones a las Edge Functions
    const { data: { session } } = await supabase.auth.getSession();
    const token = session ? session.access_token : "";

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    const contratoId = id;

    // 3️⃣ Regenerar PDF actualizado (vía POST)
    let pdfUrl = null;
    try {
      const pdfResponse = await fetch(
        "https://wjomazuymbayceilvfku.supabase.co/functions/v1/contrato-pdf",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ contratoId })
        }
      );
      if (pdfResponse.ok) {
        pdfUrl = await pdfResponse.text();
      }
    } catch (e) {
      console.error("Error regenerando PDF:", e);
    }

    await supabase
      .from("contratos")
      .update({ pdf_url: pdfUrl })
      .eq("id", id);

    // 4️⃣ Regenerar inspecciones automáticas (vía POST)
    try {
      await fetch(
        "https://wjomazuymbayceilvfku.supabase.co/functions/v1/crear_inspecciones_programadas",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ contratoId })
        }
      );
    } catch (e) {
      console.error("Error regenerando inspecciones:", e);
    }

    // 5️⃣ Enviar email automático al cliente (vía POST)
    try {
      await fetch(
        "https://wjomazuymbayceilvfku.supabase.co/functions/v1/enviar-email",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ contratoId })
        }
      );
    } catch (e) {
      console.error("Error enviando email:", e);
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
