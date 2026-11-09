import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu.jsx";

const SERVICIOS_DIRECTOS = [
  { codigo: "urgencia", nombre: "Urgencia / Emergencia", precio: 50 },
  { codigo: "visita_rapida", nombre: "Visita rápida", precio: 25 },
  { codigo: "inspeccion_tormenta", nombre: "Inspección posterior a tormenta", precio: 35 },
];

const SERVICIOS_PRESUPUESTO = [
  { codigo: "apertura_vivienda", nombre: "Apertura de vivienda", precio: "Presupuesto" },
  { codigo: "supervision", nombre: "Supervisión (por hora o fracción)", precio: "Desde 35 €" },
  { codigo: "cierre_vivienda", nombre: "Cierre de vivienda", precio: "Presupuesto" },
  { codigo: "coste_tecnico", nombre: "Coste del técnico", precio: "Variable" },
];

const PRECIO_GESTION = 25;
const IVA_PORCENTAJE = 21;
const TOTAL_GESTION = 30.25;

const dinero = (n) => `${Number(n || 0).toFixed(2)} €`;

export default function ServiciosDirectos() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [viviendaId, setViviendaId] = useState("");

  const [seleccionadosDirectos, setSeleccionadosDirectos] = useState([]);
  const [seleccionadosPresupuesto, setSeleccionadosPresupuesto] = useState([]);
  const [descripcionPresupuesto, setDescripcionPresupuesto] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState("");

  const [error, setError] = useState("");
  const [resultadoDirecto, setResultadoDirecto] = useState(null);
  const [resultadoPresupuesto, setResultadoPresupuesto] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError("");

      try {
        const [clientesResult, viviendasResult] = await Promise.all([
          supabase
            .from("clientes")
            .select("id,nombre,email")
            .order("nombre"),

          supabase
            .from("viviendas")
            .select("id,cliente_id,direccion,activa,tecnico_id")
            .eq("activa", true)
            .order("direccion"),
        ]);

        if (clientesResult.error) throw clientesResult.error;
        if (viviendasResult.error) throw viviendasResult.error;

        if (!cancelado) {
          setClientes(clientesResult.data || []);
          setViviendas(viviendasResult.data || []);
        }
      } catch (e) {
        if (!cancelado) {
          setError(
            e.message || "No se pudieron cargar los clientes y las viviendas."
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  const viviendasCliente = useMemo(
    () =>
      viviendas.filter(
        (v) => String(v.cliente_id) === String(clienteId)
      ),
    [viviendas, clienteId]
  );

  const viviendaSeleccionada = viviendasCliente.find(
    (v) => String(v.id) === String(viviendaId)
  );

  const clienteSeleccionado = clientes.find(
    (c) => String(c.id) === String(clienteId)
  );

  const baseDirectos = SERVICIOS_DIRECTOS
    .filter((s) => seleccionadosDirectos.includes(s.codigo))
    .reduce((sum, s) => sum + s.precio, 0);

  const ivaDirectos = Math.round(baseDirectos * IVA_PORCENTAJE) / 100;

  const totalDirectos = Math.round(
    (baseDirectos + ivaDirectos) * 100
  ) / 100;

  const alternarDirecto = (codigo) => {
    setSeleccionadosDirectos((actuales) =>
      actuales.includes(codigo)
        ? actuales.filter((x) => x !== codigo)
        : [...actuales, codigo]
    );
  };

  const alternarPresupuesto = (codigo) => {
    setSeleccionadosPresupuesto((actuales) =>
      actuales.includes(codigo)
        ? actuales.filter((x) => x !== codigo)
        : [...actuales, codigo]
    );
  };

  const validarClienteVivienda = () => {
    if (!clienteId || !viviendaId) {
      setError("Selecciona el cliente y la vivienda.");
      return false;
    }

    if (!viviendaSeleccionada) {
      setError("La vivienda seleccionada no pertenece al cliente elegido.");
      return false;
    }

    if (!viviendaSeleccionada.tecnico_id) {
      setError("La vivienda debe tener un técnico asignado.");
      return false;
    }

    return true;
  };

  const crearServicioDirecto = async () => {
    setError("");
    setResultadoDirecto(null);

    if (!validarClienteVivienda()) return;

    if (!seleccionadosDirectos.length) {
      setError("Selecciona al menos un servicio directo.");
      return;
    }

    setGuardando("directo");

    try {
      const lineas = SERVICIOS_DIRECTOS
        .filter((s) => seleccionadosDirectos.includes(s.codigo))
        .map((s) => ({
          codigo: s.codigo,
          precio_unitario: s.precio,
        }));

      const { data, error: rpcError } = await supabase.rpc(
        "admin_crear_extra_directo",
        {
          p_cliente_id: clienteId,
          p_vivienda_id: Number(viviendaId),
          p_lineas: lineas,
        }
      );

      if (rpcError) throw rpcError;

      setResultadoDirecto(data);
      setSeleccionadosDirectos([]);
    } catch (e) {
      console.error("Error registrando servicios directos:", e);
      setError(
        e.message || "No se pudieron registrar los servicios directos."
      );
    } finally {
      setGuardando("");
    }
  };

  const crearSolicitudPresupuesto = async () => {
    setError("");
    setResultadoPresupuesto(null);

    if (!validarClienteVivienda()) return;

    if (!seleccionadosPresupuesto.length) {
      setError("Selecciona al menos un servicio que requiera presupuesto.");
      return;
    }

    setGuardando("presupuesto");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "admin_solicitar_presupuesto",
        {
          p_cliente_id: clienteId,
          p_vivienda_id: Number(viviendaId),
          p_servicios: seleccionadosPresupuesto,
          p_descripcion: descripcionPresupuesto.trim() || null,
        }
      );

      if (rpcError) throw rpcError;

      setResultadoPresupuesto(data);
      setSeleccionadosPresupuesto([]);
      setDescripcionPresupuesto("");
    } catch (e) {
      console.error("Error creando solicitud de presupuesto:", e);
      setError(
        e.message || "No se pudo crear la solicitud de presupuesto."
      );
    } finally {
      setGuardando("");
    }
  };

  const bloqueado = cargando || Boolean(guardando);

  return (
    <Menu>
      <div style={styles.page}>
        <h1 style={styles.title}>Servicios y extras</h1>

        <p style={styles.subtitle}>
          Selecciona el cliente, su vivienda y los extras que quieras
          registrar. Cada servicio seguirá su propio procedimiento:
          factura directa o solicitud de presupuesto.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {resultadoDirecto && (
          <div style={styles.success}>
            <strong>Servicios directos registrados correctamente.</strong>

            <p>
              Factura #{resultadoDirecto.factura_id}
              {" · "}Base {dinero(resultadoDirecto.base)}
              {" · "}IVA {dinero(resultadoDirecto.iva)}
              {" · "}Total {dinero(resultadoDirecto.total)}.
            </p>

            <p>
              El técnico no se asigna todavía al extra. La asignación
              se realizará cuando el pago quede confirmado.
            </p>

            <button
              type="button"
              style={styles.linkButton}
              onClick={() =>
                navigate(`/facturas/ver/${resultadoDirecto.factura_id}`)
              }
            >
              Abrir factura y continuar con el cobro
            </button>
          </div>
        )}

        {resultadoPresupuesto && (
          <div style={styles.success}>
            <strong>Solicitud de presupuesto creada correctamente.</strong>

            <p>
              Solicitud: {String(resultadoPresupuesto.solicitud_id).slice(0, 8)}
            </p>

            <p>
              Factura de gestión inicial:
              {" "}#{resultadoPresupuesto.factura_gestion_id}
            </p>

            <p>
              Base {dinero(resultadoPresupuesto.base)}
              {" · "}IVA {dinero(resultadoPresupuesto.iva)}
              {" · "}Total {dinero(resultadoPresupuesto.total)}.
            </p>

            <p>
              El presupuesto del trabajo se preparará después de confirmar
              el pago de la gestión inicial. La gestión no asigna todavía
              el trabajo al técnico.
            </p>

            <button
              type="button"
              style={styles.linkButton}
              onClick={() =>
                navigate(
                  `/facturas/ver/${resultadoPresupuesto.factura_gestion_id}`
                )
              }
            >
              Abrir factura de gestión
            </button>
          </div>
        )}

        <div style={styles.card}>
          <label style={styles.label}>Cliente</label>

          <select
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setViviendaId("");
              setResultadoDirecto(null);
              setResultadoPresupuesto(null);
            }}
            style={styles.input}
            disabled={bloqueado}
          >
            <option value="">Selecciona un cliente</option>

            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre || c.email || c.id}
              </option>
            ))}
          </select>

          <label style={styles.label}>Vivienda</label>

          <select
            value={viviendaId}
            onChange={(e) => {
              setViviendaId(e.target.value);
              setResultadoDirecto(null);
              setResultadoPresupuesto(null);
            }}
            style={styles.input}
            disabled={!clienteId || bloqueado}
          >
            <option value="">Selecciona una vivienda</option>

            {viviendasCliente.map((v) => (
              <option key={v.id} value={v.id}>
                {v.direccion || `Vivienda #${v.id}`}
                {!v.tecnico_id ? " — sin técnico" : ""}
              </option>
            ))}
          </select>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Servicios directos</h2>

            <p style={styles.sectionDescription}>
              Precio fijo. Se crea la factura del servicio y el técnico
              solo se asigna cuando el pago queda confirmado.
            </p>

            <div style={styles.options}>
              {SERVICIOS_DIRECTOS.map((item) => (
                <label key={item.codigo} style={styles.option}>
                  <input
                    type="checkbox"
                    checked={seleccionadosDirectos.includes(item.codigo)}
                    onChange={() => alternarDirecto(item.codigo)}
                    disabled={bloqueado}
                  />

                  <span>{item.nombre}</span>

                  <strong>{dinero(item.precio)}</strong>
                </label>
              ))}
            </div>

            <div style={styles.totalBox}>
              <div>
                <span>Base imponible</span>
                <strong>{dinero(baseDirectos)}</strong>
              </div>

              <div>
                <span>IVA (21%)</span>
                <strong>{dinero(ivaDirectos)}</strong>
              </div>

              <div style={styles.total}>
                <span>Total servicios directos</span>
                <strong>{dinero(totalDirectos)}</strong>
              </div>
            </div>

            <button
              type="button"
              style={styles.button}
              onClick={crearServicioDirecto}
              disabled={
                bloqueado ||
                !clienteSeleccionado ||
                !viviendaSeleccionada ||
                !seleccionadosDirectos.length
              }
            >
              {guardando === "directo"
                ? "Registrando servicios…"
                : "Crear factura de servicios directos"}
            </button>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Servicios que requieren presupuesto
            </h2>

            <p style={styles.sectionDescription}>
              Estos servicios no generan una factura directa del trabajo.
              Primero se crea la solicitud y se cobra la gestión inicial.
              Después se prepara el presupuesto para el cliente.
            </p>

            <div style={styles.options}>
              {SERVICIOS_PRESUPUESTO.map((item) => (
                <label key={item.codigo} style={styles.option}>
                  <input
                    type="checkbox"
                    checked={seleccionadosPresupuesto.includes(item.codigo)}
                    onChange={() => alternarPresupuesto(item.codigo)}
                    disabled={bloqueado}
                  />

                  <span>{item.nombre}</span>

                  <strong>{item.precio}</strong>
                </label>
              ))}

              <div style={styles.optionInfo}>
                <span>Gestión de técnico</span>
                <strong>{dinero(PRECIO_GESTION)} + IVA</strong>
                <p>
                  Cargo obligatorio que se genera automáticamente al
                  solicitar cualquiera de los servicios presupuestables.
                  No es el precio del trabajo del técnico.
                </p>
              </div>
            </div>

            <label style={styles.label}>
              Descripción o indicaciones para el presupuesto
            </label>

            <textarea
              value={descripcionPresupuesto}
              onChange={(e) => setDescripcionPresupuesto(e.target.value)}
              placeholder="Añade detalles de los trabajos solicitados (opcional)…"
              maxLength={2000}
              rows={4}
              style={styles.textarea}
              disabled={bloqueado}
            />

            <div style={styles.totalBox}>
              <div>
                <span>Gestión inicial</span>
                <strong>{dinero(PRECIO_GESTION)}</strong>
              </div>

              <div>
                <span>IVA (21%)</span>
                <strong>{dinero(TOTAL_GESTION - PRECIO_GESTION)}</strong>
              </div>

              <div style={styles.total}>
                <span>Total inicial a facturar</span>
                <strong>{dinero(TOTAL_GESTION)}</strong>
              </div>

              <p style={styles.note}>
                El precio definitivo de los trabajos se calculará y enviará
                posteriormente en el presupuesto. Esta factura inicial
                corresponde únicamente a la gestión.
              </p>
            </div>

            <button
              type="button"
              style={styles.button}
              onClick={crearSolicitudPresupuesto}
              disabled={
                bloqueado ||
                !clienteSeleccionado ||
                !viviendaSeleccionada ||
                !seleccionadosPresupuesto.length
              }
            >
              {guardando === "presupuesto"
                ? "Creando solicitud…"
                : "Crear solicitud y factura de gestión"}
            </button>
          </div>
        </div>
      </div>
    </Menu>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "22px 16px 110px",
    background: "#0a0f1a",
    color: "#fff",
    fontFamily: "Inter,sans-serif",
    boxSizing: "border-box",
  },

  title: {
    color: "#e0b034",
    fontSize: 24,
    fontWeight: 900,
    margin: "0 0 8px",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.5,
    margin: "0 0 18px",
  },

  card: {
    background: "linear-gradient(145deg,#0b1320,#04070d)",
    border: "1px solid rgba(224,176,52,.35)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,.3)",
  },

  label: {
    display: "block",
    color: "#e0b034",
    fontSize: 12,
    fontWeight: 900,
    margin: "14px 0 7px",
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#111d2e",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 9,
    padding: 12,
    color: "#fff",
    fontSize: 14,
  },

  section: {
    marginTop: 25,
    paddingTop: 20,
    borderTop: "1px solid rgba(224,176,52,.25)",
  },

  sectionTitle: {
    color: "#e0b034",
    fontSize: 17,
    fontWeight: 900,
    margin: "0 0 7px",
  },

  sectionDescription: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.5,
    margin: "0 0 12px",
  },

  options: {
    display: "grid",
    gap: 8,
    marginTop: 8,
  },

  option: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 10,
    padding: 12,
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 9,
    color: "#e2e8f0",
    fontSize: 13,
  },

  optionInfo: {
    display: "block",
    padding: 12,
    border: "1px solid rgba(224,176,52,.3)",
    borderRadius: 9,
    color: "#e2e8f0",
    fontSize: 13,
    background: "rgba(224,176,52,.06)",
  },

  totalBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    background: "rgba(255,255,255,.04)",
    display: "grid",
    gap: 8,
    color: "#cbd5e1",
    fontSize: 13,
  },

  total: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    borderTop: "1px solid rgba(224,176,52,.3)",
    paddingTop: 10,
    color: "#e0b034",
    fontSize: 16,
    fontWeight: 900,
  },

  note: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.5,
    margin: "4px 0 0",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#111d2e",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 9,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    resize: "vertical",
    fontFamily: "inherit",
  },

  button: {
    width: "100%",
    border: 0,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    background: "linear-gradient(135deg,#e0b034,#b88918)",
    color: "#080b10",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
  },

  linkButton: {
    border: 0,
    borderRadius: 8,
    padding: "10px 12px",
    background: "#38bdf8",
    color: "#07111d",
    fontWeight: 900,
    cursor: "pointer",
  },

  error: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 9,
    background: "rgba(127,29,29,.2)",
    border: "1px solid rgba(248,113,113,.4)",
    color: "#fca5a5",
    fontSize: 13,
  },

  success: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 10,
    background: "rgba(6,95,70,.2)",
    border: "1px solid rgba(52,211,153,.4)",
    color: "#6ee7b7",
    fontSize: 13,
    lineHeight: 1.5,
  },
};
