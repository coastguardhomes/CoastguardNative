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
    fecha_fin: "",
    precio: "",
    notas: "",
    frecuencia: "",
    modalidad: "",
    duracion_meses: "12",
    dni: "",
  });

  const [mensaje, setMensaje] = useState("");

  const modalidades = [
    { id: "basico", nombre: "Básico", precio: 39, frecuencia: 30 },
    { id: "premium", nombre: "Premium", precio: 59, frecuencia: 30 },
    { id: "plus", nombre: "Plus", precio: 79, frecuencia: 30 },
  ];

  // ⭐ SISTEMA AUTOMÁTICO DE PUNTOS
  function calcularPuntos(v) {
    let puntos = 0;

    if (v.metros_cuadrados > 80 && v.metros_cuadrados <= 120) puntos += 5;
    else if (v.metros_cuadrados > 120 && v.metros_cuadrados <= 180) puntos += 10;
    else if (v.metros_cuadrados > 180) puntos += 15;

    if (v.habitaciones > 1) puntos += (v.habitaciones - 1) * 2;
    if (v.banos > 1) puntos += (v.banos - 1) * 3;

    if (v.tiene_piscina) puntos += 10;
    if (v.tiene_jardin) puntos += 8;
    if (v.tiene_garaje) puntos += 4;
    if (v.tiene_sotano) puntos += 6;

    return puntos;
  }

  function calcularPrecio(v) {
    const puntos = calcularPuntos(v);
    return Number((puntos * 1.5).toFixed(2));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("id, nombre, dni, cif, email");

    const { data: viviendasData } = await supabase
      .from("viviendas")
      .select("*");

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

  function handleClienteChange(e) {
    const clienteId = e.target.value;
    const clienteEncontrado = clientes.find((c) => String(c.id) === String(clienteId));

    setForm({
      ...form,
      cliente_id: clienteId,
      vivienda_id: "",
      dni: clienteEncontrado ? (clienteEncontrado.dni || clienteEncontrado.cif || "") : "",
    });
  }

  // ⭐ CUANDO SE SELECCIONA VIVIENDA → CALCULAR PRECIO AUTOMÁTICO
  function handleViviendaChange(e) {
    const viviendaId = e.target.value;
    const vivienda = viviendas.find((v) => String(v.id) === String(viviendaId));

    if (vivienda) {
      const precioAuto = calcularPrecio(vivienda);

      setForm({
        ...form,
        vivienda_id: viviendaId,
        precio: precioAuto,
        frecuencia: form.frecuencia, // no tocar
      });
    } else {
      setForm({ ...form, vivienda_id: viviendaId });
    }
  }

  function seleccionarModalidad(modalidadId) {
    const mod = modalidades.find((m) => m.id === modalidadId);

    setForm({
      ...form,
      modalidad: modalidadId,
      frecuencia: mod ? mod.frecuencia : "",
    });
  }

  function handleFechaInicioChange(e) {
    const nuevaFechaInicio = e.target.value;
    let nuevaFechaFin = form.fecha_fin;

    if (nuevaFechaInicio && form.duracion_meses) {
      const fecha = new Date(nuevaFechaInicio);
      fecha.setMonth(fecha.getMonth() + Number(form.duracion_meses));
      nuevaFechaFin = fecha.toISOString().split("T")[0];
    }

    setForm({
      ...form,
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
    });
  }

  function handleDuracionChange(e) {
    const nuevaDuracion = e.target.value;
    let nuevaFechaFin = form.fecha_fin;

    if (form.fecha_inicio && nuevaDuracion) {
      const fecha = new Date(form.fecha_inicio);
      fecha.setMonth(fecha.getMonth() + Number(nuevaDuracion));
      nuevaFechaFin = fecha.toISOString().split("T")[0];
    }

    setForm({
      ...form,
      duracion_meses: nuevaDuracion,
      fecha_fin: nuevaFechaFin,
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

    if (form.dni && form.cliente_id) {
      await supabase
        .from("clientes")
        .update({ dni: form.dni })
        .eq("id", form.cliente_id);
    }

    let fechaFinFinal = form.fecha_fin;
    if (!fechaFinFinal && form.fecha_inicio) {
      const fechaInicioObj = new Date(form.fecha_inicio);
      const meses = Number(form.duracion_meses) || 12;
      fechaInicioObj.setMonth(fechaInicioObj.getMonth() + meses);
      fechaFinFinal = fechaInicioObj.toISOString().split("T")[0];
    }

    const { data, error } = await supabase
      .from("contratos")
      .insert([
        {
          cliente_id: form.cliente_id,
          vivienda_id: form.vivienda_id,
          tecnico_id: String(form.tecnico_id),
          fecha_inicio: form.fecha_inicio,
          fecha_fin: fechaFinFinal,
          precio: form.precio,
          notas: form.notas,
          frecuencia: form.frecuencia,
          modalidad: form.modalidad,
          estado: "pendiente",
          duracion_meses: form.duracion_meses,
          firma_url: null,
          pdf_url: null,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      setMensaje("Error creando contrato");
      return;
    }

    const contratoId = data[0].id;

    let pdfUrl = null;
    try {
      const { data: pdfData } = await supabase.functions.invoke(
        "contrato-pdf",
        { body: { contratoId } }
      );
      pdfUrl = pdfData?.pdf_url || null;
    } catch (e) {
      console.error("Error generando PDF:", e);
    }

    if (pdfUrl) {
      await supabase
        .from("contratos")
        .update({ pdf_url: pdfUrl })
        .eq("id", contratoId);
    }

    try {
      await supabase.functions.invoke(
        "crear_inspecciones_programadas",
        { body: { contratoId } }
      );
    } catch (e) {
      console.error("Error creando inspecciones:", e);
    }

    // ⭐ CREAR FACTURA AUTOMÁTICA
    const { data: facturaData, error: facturaError } = await supabase
      .from("facturas")
      .insert([
        {
          cliente_id: form.cliente_id,
          vivienda_id: form.vivienda_id,
          contrato_id: contratoId,
          tipo: "contrato",
          descripcion: `Contrato ${form.modalidad} — ${form.duracion_meses} meses`,
          base: form.precio,
          iva: (form.precio * 0.21).toFixed(2),
          total: (form.precio * 1.21).toFixed(2),
          estado: "pendiente",
          fecha: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (!facturaError) {
      const facturaId = facturaData.id;

      try {
        await supabase.functions.invoke("factura-pdf", {
          body: { facturaId },
        });
      } catch (e) {
        console.error("Error generando factura PDF:", e);
      }

      try {
        await supabase.functions.invoke("enviar-email", {
          body: { id: facturaId, tipo: "factura" },
        });
      } catch (e) {
        console.error("Error enviando factura:", e);
      }
    }

    try {
      await supabase.functions.invoke(
        "enviar-email",
        { body: { contratoId } }
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
            onChange={handleClienteChange}
            style={inputStyle}
          >
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          {/* DNI */}
          <label>DNI / NIE:</label>
          <input
            type="text"
            placeholder="Introduce o edita el DNI / NIE"
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value })}
            style={inputStyle}
          />

          {/* Vivienda */}
          <label>Vivienda:</label>
          <select
            value={form.vivienda_id}
            onChange={handleViviendaChange}
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

          {/* Duración */}
          <label>Duración (meses):</label>
          <input
            type="number"
            value={form.duracion_meses}
            onChange={handleDuracionChange}
            style={inputStyle}
          />

          {/* Fecha inicio */}
          <label>Fecha inicio:</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={handleFechaInicioChange}
            style={inputStyle}
          />

          {/* Fecha fin */}
          <label>Fecha de finalización:</label>
          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
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
