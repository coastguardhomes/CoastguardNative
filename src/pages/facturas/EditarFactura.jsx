import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function EditarFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: "",
    descripcion: "",
    total: "",
    estado: "pendiente",
  });

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);

      // Cargar clientes y viviendas para los selects
      const { data: dataClientes } = await supabase.from("clientes").select("id, nombre").order("nombre");
      const { data: dataViviendas } = await supabase.from("viviendas").select("id, direccion, ciudad").order("id");

      if (dataClientes) setClientes(dataClientes);
      if (dataViviendas) setViviendas(dataViviendas);

      // Cargar factura específica
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMensaje("Error cargando factura");
      } else {
        setForm({
          cliente_id: data.cliente_id || "",
          vivienda_id: data.vivienda_id || "",
          fecha: data.fecha || "",
          descripcion: data.descripcion || "",
          total: data.total || "",
          estado: data.estado || "pendiente",
        });
      }
      setLoading(false);
    }

    cargarDatos();
  }, [id]);

  async function guardarCambios() {
    setMensaje("");

    const updatePayload = {
      cliente_id: form.cliente_id,
      vivienda_id: Number(form.vivienda_id),
      fecha: form.fecha,
      descripcion: form.descripcion,
      total: Number(form.total),
      estado: form.estado,
    };

    const { error } = await supabase
      .from("facturas")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar factura:", error);
      setMensaje("Error guardando cambios");
      return;
    }

    setMensaje("Factura actualizada correctamente");
    setTimeout(() => navigate("/facturas/lista"), 1200);
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ padding: "40px", textAlign: "center", color: COLOR_DORADO, background: FONDO_PRINCIPAL, minHeight: "100vh" }}>
          Cargando datos de la factura...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: "20px",
            fontWeight: "900",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Editar Factura
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: mensaje.includes("correctamente") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: mensaje.includes("correctamente") ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
              color: mensaje.includes("correctamente") ? "#34d399" : "#ef4444",
              borderRadius: "12px",
              fontWeight: "700",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            {mensaje}
          </div>
        )}

        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "16px",
            border: BORDE_DORADO_FINO,
            boxShadow: SOMBRA_LUXURY,
            boxSizing: "border-box",
          }}
        >
          {/* CLIENTE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={labelStyle}>Cliente</label>
            <select
              value={form.cliente_id}
              onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">Selecciona un cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* VIVIENDA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={labelStyle}>Vivienda</label>
            <select
              value={form.vivienda_id}
              onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">Selecciona una vivienda...</option>
              {viviendas.map((v) => (
                <option key={v.id} value={v.id}>
                  #{v.id} — {v.direccion} ({v.ciudad})
                </option>
              ))}
            </select>
          </div>

          {/* FECHA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              value={form.fecha || ""}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={labelStyle}>Descripción / Concepto</label>
            <input
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* IMPORTE TOTAL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            <label style={labelStyle}>Importe Total (€)</label>
            <input
              type="number"
              value={form.total || ""}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* ESTADO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
            <label style={labelStyle}>Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              style={inputStyle}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <button
              onClick={guardarCambios}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                color: "#fff",
                borderRadius: "16px",
                border: "1px solid rgba(16, 185, 129, 0.6)",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                boxSizing: "border-box",
              }}
            >
              Guardar cambios
            </button>

            <button
              onClick={() => navigate("/facturas/lista")}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
                color: "#fff",
                borderRadius: "16px",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxSizing: "border-box",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Menu>
  );
}

const labelStyle = {
  fontSize: "12px",
  color: COLOR_DORADO,
  fontWeight: "700",
  textTransform: "uppercase",
};

const inputStyle = {
  backgroundColor: "rgba(11, 19, 32, 0.8)",
  border: BORDE_DORADO_FINO,
  borderRadius: "12px",
  padding: "12px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};
