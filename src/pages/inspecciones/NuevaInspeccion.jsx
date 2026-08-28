import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function NuevaInspeccion() {
  const navigate = useNavigate();

  const [viviendas, setViviendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    vivienda_id: "",
    cliente_id: "",
    contrato_id: "",
    tecnico_id: "",
    fecha: "",
    estado: "pendiente",
    notas: "",
  });

  // CARGAR VIVIENDAS, CLIENTES Y TÉCNICOS
  useEffect(() => {
    async function cargarDatos() {
      const { data: viv } = await supabase
        .from("viviendas")
        .select("id, direccion, cliente_id");

      const { data: cli } = await supabase
        .from("clientes")
        .select("id, nombre");

      const { data: tec } = await supabase
        .from("tecnicos")
        .select("id, nombre");

      setViviendas(viv || []);
      setClientes(cli || []);
      setTecnicos(tec || []);
    }

    cargarDatos();
  }, []);

  // CARGAR CONTRATOS SEGÚN VIVIENDA
  useEffect(() => {
    async function cargarContratos() {
      if (!form.vivienda_id) {
        setContratos([]);
        return;
      }

      const { data, error } = await supabase
        .from("contratos")
        .select("id, modalidad, precio, fecha_inicio, estado, tecnico_id")
        .eq("vivienda_id", form.vivienda_id);

      if (!error) setContratos(data || []);
      else console.error("Error cargando contratos:", error);
    }

    cargarContratos();
  }, [form.vivienda_id]);

  // CREAR INSPECCIÓN
  async function crear() {
    setMensaje("");

    try {
      const vivienda = viviendas.find((v) => String(v.id) === String(form.vivienda_id));

      if (!vivienda) {
        setMensaje("Selecciona una vivienda válida.");
        return;
      }

      if (!form.cliente_id) {
        setMensaje("Selecciona un cliente.");
        return;
      }

      if (!form.contrato_id) {
        setMensaje("Selecciona un contrato.");
        return;
      }

      const { data: contratoData } = await supabase
        .from("contratos")
        .select("id, tecnico_id")
        .eq("id", form.contrato_id)
        .maybeSingle();

      const tecnicoFinal = form.tecnico_id || contratoData?.tecnico_id || null;

      if (!tecnicoFinal) {
        setMensaje("Selecciona un técnico.");
        return;
      }

      if (!form.fecha) {
        setMensaje("Selecciona una fecha.");
        return;
      }

      const nuevaInspeccion = {
        vivienda_id: vivienda.id,
        cliente_id: form.cliente_id,
        contrato_id: form.contrato_id,
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

      if (error) {
        console.error("Error detallado Supabase:", error);
        setMensaje(`Error Supabase: ${error.message}`);
        return;
      }

      if (!insp) {
        setMensaje("Error: No se pudo obtener el ID de la inspección creada.");
        return;
      }

      // PLANTILLA CHECKLIST
      const plantillaCompleta = [
        "Puerta principal cerrada y asegurada correctamente",
        "Cerraduras y bombines sin daños aparentes",
        "Ventanas y ventanales cerrados y bloqueados",
        "Persianas bajadas o en posición de seguridad",
        "Rejas exteriores sin indicios de fuerza o daños",
        "Comprobación de sistema de alarma activo",
        "Sensores de movimiento limpios y operativos",
        "Comprobación de llaves de repuesto en su lugar",
        "Accesos exteriores revisados (jardín, trastero, garaje)",
        "Ausencia total de humedades o filtraciones en paredes",
        "Ausencia de humedades o manchas en techos",
        "Cuadro eléctrico principal sin interruptores disparados",
        "Luces e interruptores funcionando correctamente",
        "Enchufes sin marcas de quemaduras ni holguras",
        "Electrodomésticos con suministro eléctrico correcto",
        "Grifos y llaves de paso funcionando sin goteos",
        "Presión de agua correcta en red general",
        "Ausencia de fugas visibles en baños y cocina",
        "Cisterna de WC funcionando y cargando bien",
        "Desagües limpios y ausencia de malos olores",
        "Estado general del jardín y limpieza de exteriores",
        "Piscina: nivel de agua correcto y bomba operativa",
        "Ausencia de plagas (insectos, hormigas o roedores)",
        "Limpieza ligera y ausencia de basura interior",
        "Estado general del mobiliario y cristales sin roturas"
      ];

      const checklistItems = plantillaCompleta.map((texto) => ({
        inspeccion_id: insp.id,
        item: texto,
        completado: false,
      }));

      await supabase.from("checklist_inspeccion").insert(checklistItems);

      setMensaje("Inspección creada correctamente.");
      navigate(`/inspecciones/${insp.id}`);
    } catch (e) {
      console.error(e);
      setMensaje(`Error inesperado: ${e.message}`);
    }
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "25px", fontSize: "28px", fontWeight: "700" }}>
          Nueva Inspección
        </h1>

        {mensaje && <p style={{ marginBottom: "15px", color: "#ff6b6b", fontWeight: "600" }}>{mensaje}</p>}

        <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px" }}>

          {/* SELECT VIVIENDA */}
          <label>Vivienda</label>
          <select
            value={form.vivienda_id}
            onChange={(e) => {
              const viviendaId = e.target.value;
              const viviendaSel = viviendas.find(v => String(v.id) === viviendaId);
              setForm({
                ...form,
                vivienda_id: viviendaId,
                cliente_id: viviendaSel?.cliente_id || "",
              });
            }}
            style={selectStyle}
          >
            <option value="">Selecciona una vivienda</option>
            {viviendas.map((v) => (
              <option key={v.id} value={v.id}>{v.direccion}</option>
            ))}
          </select>

          {/* SELECT CLIENTE */}
          <label>Cliente</label>
          <select
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            style={selectStyle}
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          {/* SELECT CONTRATO */}
          <label>Contrato</label>
          <select
            value={form.contrato_id}
            onChange={(e) => setForm({ ...form, contrato_id: e.target.value })}
            style={selectStyle}
          >
            <option value="">Selecciona un contrato</option>
            {contratos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.modalidad} — {c.precio}€ — {c.fecha_inicio} — {c.estado}
              </option>
            ))}
          </select>

          {/* SELECT TÉCNICO */}
          <label>Técnico</label>
          <select
            value={form.tecnico_id}
            onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
            style={selectStyle}
          >
            <option value="">Selecciona un técnico</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>

          {/* FECHA */}
          <label>Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            style={selectStyle}
          />

          {/* NOTAS */}
          <label>Notas</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            style={{ ...selectStyle, minHeight: "100px" }}
          />

          {/* BOTÓN */}
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
