import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function CrearFactura() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);

  const [form, setForm] = useState({
    cliente_id: "",
    vivienda_id: "",
    fecha: new Date().toISOString().slice(0, 10),
    concepto: "",
    importe: "",
    estado: "pendiente",
  });

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarClientes();
    cargarViviendas();
  }, []);

  async function cargarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (!error) setClientes(data);
  }

  async function cargarViviendas() {
    const { data, error } = await supabase
      .from("viviendas")
      .select("id, direccion, ciudad")
      .order("id", { ascending: true });

    if (!error) setViviendas(data);
  }

  async function crearAvisoCobro() {
    setMensaje("");

    if (!form.cliente_id) {
      setMensaje(t("errorSeleccionarCliente") || "Selecciona un cliente.");
      return;
    }
    if (!form.vivienda_id) {
      setMensaje(t("errorSeleccionarVivienda") || "Selecciona una vivienda.");
      return;
    }
    if (!form.importe) {
      setMensaje(t("errorIntroducirImporte") || "Introduce el importe.");
      return;
    }

    try {
      // Nota: Mantenemos la tabla 'facturas' en la base de datos para no romper relaciones, 
      // pero conceptualmente y visualmente actúa como Aviso de Cobro / Pendiente de Pago.
      const { data: avisoCreado, error } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: form.cliente_id,
            vivienda_id: Number(form.vivienda_id),
            fecha: form.fecha,
            descripcion: form.concepto,
            total: Number(form.importe),
            estado: form.estado,
            estado_tecnico: "pendiente",
          },
        ])
        .select()
        .single();

      if (error || !avisoCreado) {
        console.error("Error creando aviso de cobro:", error);
        setMensaje(t("errorCreandoAviso") || "Error creando aviso de cobro");
        return;
      }

      setMensaje(t("avisoCreadoCorrectamente") || "Aviso de cobro creado correctamente");
      setTimeout(() => navigate("/facturas"), 1200);
    } catch (e) {
      console.error("Error en crearAvisoCobro:", e);
      setMensaje(t("errorCreandoAviso") || "Error creando aviso de cobro");
    }
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
          {t("tituloNuevoAvisoCobro") || "Nuevo Aviso de Cobro (Pendiente de Pago)"}
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: mensaje.includes("correctamente") || mensaje.includes(t("avisoCreadoCorrectamente"))
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: mensaje.includes("correctamente") || mensaje.includes(t("avisoCreadoCorrectamente"))
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
              color: mensaje.includes("correctamente") || mensaje.includes(t("avisoCreadoCorrectamente")) ? "#34d399" : "#ef4444",
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
          <label style={labelStyle}>{t("cliente") || "Cliente"}</label>
          <select
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">{t("seleccionaCliente") || "Selecciona un cliente..."}</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <label style={labelStyle}>{t("vivienda") || "Vivienda"}</label>
          <select
            value={form.vivienda_id}
            onChange={(e) => setForm({ ...form, vivienda_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">{t("seleccionaVivienda") || "Selecciona una vivienda..."}</option>
            {viviendas.map((v) => (
              <option key={v.id} value={v.id}>
                #{v.id} — {v.direccion} ({v.ciudad})
              </option>
            ))}
          </select>

          <label style={labelStyle}>{t("fecha") || "Fecha"}</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>{t("conceptoExplicacion") || "Explicación detallada de los servicios a realizar"}</label>
          <textarea
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
            placeholder={t("placeholderConceptoAviso") || "Describa detalladamente los servicios extra a realizar..."}
          />

          <label style={labelStyle}>{t("importe") || "Importe (€)"}</label>
          <input
            type="number"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
            style={inputStyle}
            placeholder="0.00"
          />

          <button
            onClick={crearAvisoCobro}
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
              marginTop: "20px",
              boxSizing: "border-box",
            }}
          >
            {t("btnCrearAvisoCobro") || "Crear Aviso de Cobro"}
          </button>
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
  marginTop: "14px",
  marginBottom: "6px",
  display: "block",
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
