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
    precio_vivienda: 0,
    precio_modalidad: 0,
    notas: "",
    frecuencia: "",
    modalidad: "",
    duracion_meses: "12",
    dni: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const modalidades = [
    { id: "basico", nombre: "Básico", precio: 39, frecuencia: 30 },
    { id: "standard", nombre: "Standard", precio: 59, frecuencia: 30 },
    { id: "premium", nombre: "Premium", precio: 79, frecuencia: 30 },
  ];

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

  function calcularPrecioVivienda(v) {
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

  // Filtrado flexible para que nunca devuelva vacío si la relación no es estricta
  const viviendasFiltradas = form.cliente_id
    ? viviendas.filter((v) => !v.cliente_id || String(v.cliente_id) === String(form.cliente_id))
    : viviendas;

  function handleClienteChange(e) {
    const clienteId = e.target.value;
    const clienteEncontrado = clientes.find((c) => String(c.id) === String(clienteId));

    setForm((prev) => ({
      ...prev,
      cliente_id: clienteId,
      vivienda_id: "",
      dni: clienteEncontrado ? (clienteEncontrado.dni || clienteEncontrado.cif || "") : "",
    }));
  }

  function handleViviendaChange(e) {
    const viviendaId = e.target.value;
    const vivienda = viviendas.find((v) => String(v.id) === String(viviendaId));

    setForm((prev) => {
      const precioVivienda = vivienda ? calcularPrecioVivienda(vivienda) : 0;
      const precioModalidad = Number(prev.precio_modalidad || 0);
      const precioTotal = Number((precioVivienda + precioModalidad).toFixed(2));

      return {
        ...prev,
        vivienda_id: viviendaId,
        precio_vivienda: precioVivienda,
        precio: precioTotal,
      };
    });
  }

  function seleccionarModalidad(modalidadId) {
    const mod = modalidades.find((m) => m.id === modalidadId);
    if (!mod) return;

    setForm((prev) => {
      const precioModalidad = Number(mod.precio);
      const precioVivienda = Number(prev.precio_vivienda || 0);
      const precioTotal = Number((precioModalidad + precioVivienda).toFixed(2));

      return {
        ...prev,
        modalidad: modalidadId,
        frecuencia: mod.frecuencia,
        precio_modalidad: precioModalidad,
        precio: precioTotal,
      };
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

    setForm((prev) => ({
      ...prev,
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
    }));
  }

  function handleDuracionChange(e) {
    const nuevaDuracion = e.target.value;
    let nuevaFechaFin = form.fecha_fin;

    if (form.fecha_inicio && nuevaDuracion) {
      const fecha = new Date(form.fecha_inicio);
      fecha.setMonth(fecha.getMonth() + Number(nuevaDuracion));
      nuevaFechaFin = fecha.toISOString().split("T")[0];
    }

    setForm((prev) => ({
      ...prev,
      duracion_meses: nuevaDuracion,
      fecha_fin: nuevaFechaFin,
    }));
  }

  async function crearContrato() {
    setMensaje("");

    if (!form.cliente_id || !form.vivienda_id || !form.tecnico_id) {
      setMensaje("Cliente, vivienda y técnico son obligatorios.");
      return;
    }

    if (!form.modalidad) {
      setMensaje("Selecciona una modalidad.");
      return;
    }

    if (!form.fecha_inicio) {
      setMensaje("Selecciona la fecha de inicio.");
      return;
    }

    const precioFinal = Number(form.precio);
    if (!precioFinal || precioFinal <= 0) {
      setMensaje("El precio total del contrato no puede ser 0 o estar vacío.");
      return;
    }

    setProcesando(true);
    setMensaje("Creando contrato y generando documentación...");

    try {
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

      // 1. Insertar el contrato asegurando el cliente_id numérico limpio
      const { data, error } = await supabase
        .from("contratos")
        .insert([
          {
            cliente_id: Number(form.cliente_id),
            vivienda_id: Number(form.vivienda_id),
            tecnico_id: String(form.tecnico_id),
            fecha_inicio: form.fecha_inicio,
            fecha_fin: fechaFinFinal,
            precio: precioFinal,
            notas: form.notas,
            frecuencia: Number(form.frecuencia || 30),
            modalidad: form.modalidad,
            estado: "pendiente",
            duracion_meses: Number(form.duracion_meses || 12),
            firma_url: null,
            pdf_url: null,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      const contratoId = data.id;

      // 2. Crear factura automática asociada
      const baseFactura = precioFinal;
      const ivaFactura = Number((baseFactura * 0.21).toFixed(2));
      const totalFactura = Number((baseFactura + ivaFactura).toFixed(2));

      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: Number(form.cliente_id),
            vivienda_id: Number(form.vivienda_id),
            contrato_id: Number(contratoId),
            tipo: "contrato",
            descripcion: `Contrato ${form.modalidad} — ${form.duracion_meses} meses`,
            base: baseFactura,
            iva: ivaFactura,
            total: totalFactura,
            estado: "pendiente",
            fecha: new Date().toISOString().slice(0, 10),
          },
        ])
        .select()
        .single();

      if (!facturaError && facturaData) {
        const facturaId = facturaData.id;

        try {
          await supabase.functions.invoke("factura-pdf", {
            body: { facturaId, id: facturaId },
          });
        } catch (e) {
          console.warn("Aviso menor al generar PDF de factura:", e);
        }

        try {
          await supabase.functions.invoke("enviar-email", {
            body: { facturaId, id: facturaId, tipo: "factura" },
          });
        } catch (e) {
          console.warn("Aviso menor al enviar email de factura:", e);
        }
      }

      try {
        await supabase.functions.invoke("contrato-pdf", {
          body: { contratoId: contratoId, id: contratoId },
        });
      } catch (e) {
        console.warn("Aviso menor al generar PDF de contrato:", e);
      }

      try {
        await supabase.functions.invoke("enviar-email", {
          body: { contratoId, id: contratoId, tipo: "contrato" },
        });
      } catch (e) {
        console.warn("Aviso menor al enviar email de contrato:", e);
      }

      setMensaje("¡Contrato creado con éxito! ✔");
      setTimeout(() => {
        navigate("/contratos");
      }, 1500);

    } catch (e) {
      console.error("Error general creando contrato:", e);
      setMensaje("Error creando contrato: " + e.message);
      setProcesando(false);
    }
  }

  const inputStyle = {
    padding: "12px",
    width: "100%",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    boxSizing: "border-box",
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
          boxSizing: "border-box",
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
              padding: "10px",
              borderRadius: "8px",
              background: mensaje.includes("éxito") ? "rgba(74,222,128,0.1)" : "rgba(0,153,255,0.1)",
              color: mensaje.includes("éxito") ? "#4ade80" : "#4db8ff",
              fontWeight: "600",
              border: mensaje.includes("éxito") ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(0,153,255,0.3)",
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
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Cliente:</label>
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

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>DNI / NIE:</label>
          <input
            type="text"
            placeholder="Introduce o edita el DNI / NIE"
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value })}
            style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Vivienda:</label>
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

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Técnico:</label>
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

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Modalidad:</label>
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

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Duración (meses):</label>
          <input
            type="number"
            value={form.duracion_meses}
            onChange={handleDuracionChange}
            style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Fecha inicio:</label>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={handleFechaInicioChange}
            style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Fecha de finalización:</label>
          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Precio total (€/mes):</label>
          <input
            type="number"
            value={form.precio}
            readOnly
            style={{ ...inputStyle, background: "rgba(255,255,255,0.15)", fontWeight: "bold", color: "#4db8ff" }}
          />

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Frecuencia de visitas (días):</label>
          <input
            type="number"
            value={form.frecuencia}
            onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
            style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#9fb3c8" }}>Notas adicionales:</label>
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
            disabled={procesando}
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
              opacity: procesando ? 0.6 : 1,
            }}
          >
            {procesando ? "Procesando..." : "Crear Contrato"}
          </button>
        </div>
      </div>
    </Menu>
  );
}
