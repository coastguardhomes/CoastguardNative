import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function NuevaInspeccion() {
  const navigate = useNavigate();

  const [viviendas, setViviendas] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [contratos, setContratos] = useState([]);   // ← AÑADIDO
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    vivienda_id: "",
    contrato_id: "",        // ← AÑADIDO
    tecnico_id: "",
    fecha: "",
    estado: "pendiente",
    notas: "",
  });

  // 🔥 Cargar viviendas y técnicos reales
  useEffect(() => {
    async function cargarDatos() {
      const { data: viv } = await supabase
        .from("viviendas")
        .select("id, direccion, cliente_id");

      const { data: tec } = await supabase
        .from("tecnicos")
        .select("id, nombre");

      setViviendas(viv || []);
      setTecnicos(tec || []);
    }

    cargarDatos();
  }, []);

  // 🔥 Cargar contratos de la vivienda seleccionada
  useEffect(() => {
    async function cargarContratos() {
      if (!form.vivienda_id) {
        setContratos([]);
        return;
      }

      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("vivienda_id", form.vivienda_id);

      if (!error) setContratos(data || []);
    }

    cargarContratos();
  }, [form.vivienda_id]);

  async function crear() {
    setMensaje("");

    try {
      // 1️⃣ Obtener vivienda seleccionada
      const vivienda = viviendas.find((v) => v.id == form.vivienda_id);

      if (!vivienda) {
        setMensaje("Selecciona una vivienda válida.");
        return;
      }

      // 2️⃣ Obtener cliente automáticamente
      const cliente_id = vivienda.cliente_id;

      if (!cliente_id) {
        setMensaje("La vivienda no tiene cliente asignado.");
        return;
      }

      // 3️⃣ Contrato seleccionado por el usuario
      const contrato_id = form.contrato_id;

      if (!contrato_id) {
        setMensaje("Selecciona un contrato.");
        return;
      }

      // 4️⃣ Técnico automático si existe en contrato
      const { data: contratoData } = await supabase
        .from("contratos")
        .select("tecnico_id")
        .eq("id", contrato_id)
        .maybeSingle();

      const tecnicoFinal =
        contratoData?.tecnico_id || form.tecnico_id || null;

      if (!tecnicoFinal) {
        setMensaje("Selecciona un técnico.");
        return;
      }

      // 5️⃣ Crear inspección completa
      const nuevaInspeccion = {
        vivienda_id: vivienda.id,
        cliente_id,
        contrato_id,
        tecnico_id: tecnicoFinal,
        fecha: form.fecha,
        estado: "pendiente",
        notas: form.notas,
        origen: "app",
      };

      const { data: insp, error } = await supabase
        .from("inspecciones")
        .insert([nuevaInspeccion])
        .select()
        .maybeSingle();

      if (error || !insp) {
        setMensaje("Error creando inspección.");
        return;
      }

      // 6️⃣ Crear checklist automático
      const plantilla = [
        "Puertas y ventanas cerradas",
        "Persianas en posición correcta",
        "Ausencia de humedades",
        "Estado general de la vivienda",
        "Revisión de electrodomésticos",
        "Comprobación de fugas",
      ];

      const checklistItems = plantilla.map((texto) => ({
        inspeccion_id: insp.id,
        item: texto,
        estado: "pendiente",
        observaciones: "",
      }));

      await supabase.from("checklist_respuestas").insert(checklistItems);

      setMensaje("Inspección creada correctamente.");
      navigate(`/inspecciones/${insp.id}`);
    } catch (e) {
      console.error(e);
      setMensaje("Error inesperado creando inspección.");
    }
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
          Nueva Inspección
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
          {/* Vivienda */}
          <label>Vivienda</label>
          <select
            value={form.vivienda_id}
            onChange={(e) =>
              setForm({ ...form, vivienda_id: e.target.value })
            }
            style={selectStyle}
          >
            <option value="">Selecciona una vivienda</option>
            {viviendas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.direccion}
              </option>
            ))}
          </select>

          {/* Contrato */}
          <label>Contrato</label>
          <select
            value={form.contrato_id}
            onChange={(e) =>
              setForm({ ...form, contrato_id: e.target.value })
            }
            style={selectStyle}
          >
            <option value="">Selecciona un contrato</option>
            {contratos.map((c) => (
              <option key={c.id} value={c.id}>
                Contrato #{c.id} — {c.precio}€
              </option>
            ))}
          </select>

          {/* Técnico */}
          <label>Técnico</label>
          <select
            value={form.tecnico_id}
            onChange={(e) =>
              setForm({ ...form, tecnico_id: e.target.value })
            }
            style={selectStyle}
          >
            <option value="">Selecciona un técnico</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* Fecha */}
          <label>Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            style={selectStyle}
          />

          {/* Notas */}
          <label>Notas</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{
              ...selectStyle,
              minHeight: "100px",
            }}
          />

          <button
            onClick={crear}
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
            Crear inspección
          </button>
        </div>
      </div>
    </Menu>
  );
}

const selectStyle = {
  padding: "12px",
  width: "100%",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
};
