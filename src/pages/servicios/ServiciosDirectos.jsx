import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";

const CATALOGO = [
  { codigo: "urgencia", nombre: "Urgencia / Emergencia", precio: 50 },
  { codigo: "visita_rapida", nombre: "Visita rápida", precio: 25 },
  { codigo: "inspeccion_tormenta", nombre: "Inspección posterior a tormenta", precio: 35 },
];

const dinero = (n) => `${Number(n || 0).toFixed(2)} €`;

export default function ServiciosDirectos() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [viviendaId, setViviendaId] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      try {
        const [clientesResult, viviendasResult] = await Promise.all([
          supabase.from("clientes").select("id,nombre,email").order("nombre"),
          supabase.from("viviendas").select("id,cliente_id,direccion,activa,tecnico_id").eq("activa", true).order("direccion"),
        ]);
        if (clientesResult.error) throw clientesResult.error;
        if (viviendasResult.error) throw viviendasResult.error;
        if (!cancelado) {
          setClientes(clientesResult.data || []);
          setViviendas(viviendasResult.data || []);
        }
      } catch (e) {
        if (!cancelado) setError(e.message || "No se pudieron cargar clientes y viviendas.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => { cancelado = true; };
  }, []);

  const viviendasCliente = useMemo(
    () => viviendas.filter((v) => String(v.cliente_id) === String(clienteId)),
    [viviendas, clienteId]
  );
  const viviendaSeleccionada = viviendasCliente.find((v) => String(v.id) === String(viviendaId));
  const clienteSeleccionado = clientes.find((c) => String(c.id) === String(clienteId));
  const base = CATALOGO.filter((s) => seleccionados.includes(s.codigo)).reduce((sum, s) => sum + s.precio, 0);
  const iva = Math.round(base * 21) / 100;
  const total = Math.round((base + iva) * 100) / 100;

  const alternar = (codigo) => {
    setSeleccionados((actuales) => actuales.includes(codigo)
      ? actuales.filter((x) => x !== codigo)
      : [...actuales, codigo]);
  };

  const crearServicio = async (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);
    if (!clienteId || !viviendaId) return setError("Selecciona el cliente y la vivienda.");
    if (!seleccionados.length) return setError("Selecciona al menos un servicio directo.");
    if (!viviendaSeleccionada?.tecnico_id) return setError("La vivienda debe tener un técnico asignado antes de registrar este servicio.");

    setGuardando(true);
    try {
      const lineas = CATALOGO
        .filter((s) => seleccionados.includes(s.codigo))
        .map((s) => ({ codigo: s.codigo, precio_unitario: s.precio }));

      const { data, error: rpcError } = await supabase.rpc("admin_crear_extra_directo", {
        p_cliente_id: clienteId,
        p_vivienda_id: Number(viviendaId),
        p_lineas: lineas,
      });
      if (rpcError) throw rpcError;
      setResultado(data);
      setSeleccionados([]);
    } catch (e) {
      console.error("Error registrando servicio directo:", e);
      setError(e.message || "No se pudo registrar el servicio.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Menu>
      <div style={styles.page}>
        <h1 style={styles.title}>Servicios directos</h1>
        <p style={styles.subtitle}>Estos servicios tienen precio fijo y no necesitan presupuesto previo. El técnico solo se asigna cuando el pago de la factura queda confirmado.</p>

        {error && <div style={styles.error}>{error}</div>}
        {resultado && (
          <div style={styles.success}>
            <strong>Servicio registrado correctamente.</strong>
            <p>Factura #{resultado.factura_id} · Base {dinero(resultado.base)} · IVA {dinero(resultado.iva)} · Total {dinero(resultado.total)}.</p>
            <p>El técnico todavía no está asignado al extra. La asignación se hará automáticamente cuando el pago se confirme.</p>
            <button type="button" style={styles.linkButton} onClick={() => navigate(`/facturas/ver/${resultado.factura_id}`)}>Abrir factura y continuar con el cobro</button>
          </div>
        )}

        <form onSubmit={crearServicio} style={styles.card}>
          <label style={styles.label}>Cliente</label>
          <select value={clienteId} onChange={(e) => { setClienteId(e.target.value); setViviendaId(""); }} style={styles.input} disabled={cargando || guardando}>
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre || c.email || c.id}</option>)}
          </select>

          <label style={styles.label}>Vivienda</label>
          <select value={viviendaId} onChange={(e) => setViviendaId(e.target.value)} style={styles.input} disabled={!clienteId || guardando}>
            <option value="">Selecciona una vivienda</option>
            {viviendasCliente.map((v) => <option key={v.id} value={v.id}>{v.direccion || `Vivienda #${v.id}`}{!v.tecnico_id ? " — sin técnico" : ""}</option>)}
          </select>

          <label style={styles.label}>Servicio directo</label>
          <div style={styles.options}>
            {CATALOGO.map((item) => (
              <label key={item.codigo} style={styles.option}>
                <input type="checkbox" checked={seleccionados.includes(item.codigo)} onChange={() => alternar(item.codigo)} disabled={guardando} />
                <span>{item.nombre}</span>
                <strong>{dinero(item.precio)}</strong>
              </label>
            ))}
          </div>

          <div style={styles.totalBox}>
            <div><span>Base imponible</span><strong>{dinero(base)}</strong></div>
            <div><span>IVA (21%)</span><strong>{dinero(iva)}</strong></div>
            <div style={styles.total}><span>Total</span><strong>{dinero(total)}</strong></div>
          </div>

          <button type="submit" style={styles.button} disabled={guardando || cargando || !clienteSeleccionado || !viviendaSeleccionada || !seleccionados.length}>
            {guardando ? "Registrando…" : "Crear factura y servicio directo"}
          </button>
        </form>
      </div>
    </Menu>
  );
}

const styles = {
  page: { minHeight: "100vh", padding: "22px 16px 110px", background: "#0a0f1a", color: "#fff", fontFamily: "Inter,sans-serif", boxSizing: "border-box" },
  title: { color: "#e0b034", fontSize: 24, fontWeight: 900, margin: "0 0 8px" },
  subtitle: { color: "#94a3b8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" },
  card: { background: "linear-gradient(145deg,#0b1320,#04070d)", border: "1px solid rgba(224,176,52,.35)", borderRadius: 16, padding: 16, boxShadow: "0 10px 25px rgba(0,0,0,.3)" },
  label: { display: "block", color: "#e0b034", fontSize: 12, fontWeight: 900, margin: "14px 0 7px", textTransform: "uppercase" },
  input: { width: "100%", boxSizing: "border-box", background: "#111d2e", border: "1px solid rgba(255,255,255,.16)", borderRadius: 9, padding: 12, color: "#fff", fontSize: 14 },
  options: { display: "grid", gap: 8, marginTop: 8 },
  option: { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10, padding: 12, border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "#e2e8f0", fontSize: 13 },
  totalBox: { marginTop: 18, padding: 12, borderRadius: 10, background: "rgba(255,255,255,.04)", display: "grid", gap: 8, color: "#cbd5e1", fontSize: 13 },
  total: { borderTop: "1px solid rgba(224,176,52,.3)", paddingTop: 10, color: "#e0b034", fontSize: 17, fontWeight: 900 },
  button: { width: "100%", border: 0, borderRadius: 10, padding: 14, marginTop: 16, background: "linear-gradient(135deg,#e0b034,#b88918)", color: "#080b10", fontWeight: 900, fontSize: 14, cursor: "pointer" },
  linkButton: { border: 0, borderRadius: 8, padding: "10px 12px", background: "#38bdf8", color: "#07111d", fontWeight: 900, cursor: "pointer" },
  error: { marginBottom: 14, padding: 12, borderRadius: 9, background: "rgba(127,29,29,.2)", border: "1px solid rgba(248,113,113,.4)", color: "#fca5a5", fontSize: 13 },
  success: { marginBottom: 14, padding: 14, borderRadius: 10, background: "rgba(6,95,70,.2)", border: "1px solid rgba(52,211,153,.4)", color: "#6ee7b7", fontSize: 13, lineHeight: 1.5 },
};
