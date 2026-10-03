import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

const EXTRAS = [
  { nombre: "Urgencia / Emergencia", precio: 50 },
  { nombre: "Apertura de vivienda", precio: 30 },
  { nombre: "Supervisión (por hora o fracción)", precio: 35 },
  { nombre: "Cierre de vivienda", precio: 30 },
  { nombre: "Gestión del técnico", precio: 25 },
  { nombre: "Visita rápida", precio: 25 },
  { nombre: "Inspección posterior a tormenta", precio: 35 },
  { nombre: "Gestión y custodia de llaves", precio: 15 },
  { nombre: "Coste del técnico", precio: null }
];

const redondear = (n) => Math.round(n * 100) / 100;

async function pdfDisponible(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export default function Extras() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [viviendaId, setViviendaId] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [precios, setPrecios] = useState({});
  const [enviarEmail, setEnviarEmail] = useState(true);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoViviendas, setCargandoViviendas] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargarClientes() {
      const { data, error: errClientes } = await supabase
        .from("clientes")
        .select("id, nombre, direccion, email")
        .order("nombre");

      if (cancelado) return;

      if (errClientes) {
        console.error("Error cargando clientes:", errClientes);
        setError("No se pudieron cargar los clientes.");
      } else {
        setClientes(data || []);
      }

      setCargando(false);
    }

    cargarClientes();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function cargarViviendas() {
      setViviendaId("");

      if (!clienteId) {
        setViviendas([]);
        return;
      }

      setCargandoViviendas(true);
      setError("");

      const { data, error: errViviendas } = await supabase
        .from("viviendas")
        .select("id, direccion, tecnico_id")
        .eq("cliente_id", clienteId)
        .order("direccion");

      if (cancelado) return;

      if (errViviendas) {
        console.error("Error cargando viviendas:", errViviendas);
        setViviendas([]);
        setError("No se pudieron cargar las viviendas del cliente.");
      } else {
        setViviendas(data || []);

        if ((data || []).length === 1) {
          setViviendaId(String(data[0].id));
        }
      }

      setCargandoViviendas(false);
    }

    cargarViviendas();

    return () => {
      cancelado = true;
    };
  }, [clienteId]);

  const toggleExtra = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((x) => x !== nombre)
        : [...prev, nombre]
    );
  };

  const lineas = seleccionados.map((nombre) => {
    const extra = EXTRAS.find((e) => e.nombre === nombre);

    if (!extra) {
      return {
        nombre,
        precio: null
      };
    }

    if (extra.precio !== null) {
      return {
        nombre,
        precio: Number(extra.precio)
      };
    }

    const valor = precios[nombre];

    if (valor === undefined || valor === null || String(valor).trim() === "") {
      return {
        nombre,
        precio: null
      };
    }

    const numero = Number(String(valor).replace(",", "."));

    return {
      nombre,
      precio: Number.isFinite(numero) ? numero : null
    };
  });

  // Se mantiene exactamente como base imponible de los extras seleccionados.
  // No se añaden características de la vivienda al precio.
  const totalBase = redondear(
    lineas.reduce(
      (acc, l) => acc + (l.precio === null ? 0 : l.precio),
      0
    )
  );

  async function siguienteNumero() {
    const { data, error: errorNum } = await supabase
      .from("facturas")
      .select("numero")
      .like("numero", "CG-%")
      .order("numero", { ascending: false })
      .limit(1);

    if (errorNum) {
      throw new Error(errorNum.message);
    }

    const ultimo = data?.[0]?.numero;
    const n = ultimo
      ? parseInt(String(ultimo).replace(/\D/g, ""), 10)
      : 0;

    const siguiente = (Number.isNaN(n) ? 0 : n) + 1;

    return `CG-${String(siguiente).padStart(6, "0")}`;
  }

  const crearFactura = async () => {
    setMensaje("");
    setError("");

    if (!clienteId) {
      setError("Selecciona el cliente al que se factura.");
      return;
    }

    if (!viviendaId) {
      setError("Selecciona la vivienda a la que corresponde el servicio.");
      return;
    }

    if (seleccionados.length === 0) {
      setError("Selecciona al menos un servicio o extra.");
      return;
    }

    const sinPrecio = lineas.find(
      (l) =>
        l.precio === null ||
        l.precio === undefined ||
        Number.isNaN(l.precio) ||
        !Number.isFinite(l.precio) ||
        l.precio < 0
    );

    if (sinPrecio) {
      setError(`Indica un precio válido para "${sinPrecio.nombre}".`);
      return;
    }

    const vivienda = viviendas.find(
      (v) => String(v.id) === String(viviendaId)
    );

    if (!vivienda) {
      setError("No se pudo localizar la vivienda seleccionada.");
      return;
    }

    const cliente = clientes.find(
      (c) => String(c.id) === String(clienteId)
    );

    if (!cliente) {
      setError("No se pudo localizar el cliente seleccionado.");
      return;
    }

    setGuardando(true);

    try {
      const numero = await siguienteNumero();

      /*
       * IMPORTANTE:
       * El bloque de creación de la factura mantiene el mismo cálculo
       * que el flujo actual:
       *
       * base = totalBase
       * iva  = 21%
       * total = base + IVA
       *
       * No se utiliza la vivienda para modificar el precio.
       */
      const { data: factura, error: errorFactura } = await supabase
        .from("facturas")
        .insert({
          numero,
          cliente_id: clienteId,
          fecha: new Date().toISOString().slice(0, 10),
          base: Number(totalBase),
          iva: Number(redondear(totalBase * 0.21)),
          total: Number(redondear(totalBase * 1.21)),
          descripcion: lineas.map((l) => l.nombre).join(", "),
          estado: "pendiente",
          vivienda_id: vivienda.id
        })
        .select()
        .single();

      if (errorFactura) {
        throw new Error(errorFactura.message);
      }

      /*
       * Se mantiene la creación de las líneas de factura.
       */
      const { error: errorLineas } = await supabase
        .from("facturas_lineas")
        .insert(
          lineas.map((l) => ({
            factura_id: factura.id,
            concepto: l.nombre,
            cantidad: 1,
            precio: Number(l.precio),
            subtotal: Number(l.precio)
          }))
        );

      if (errorLineas) {
        console.error("Error guardando líneas:", errorLineas);

        setMensaje(
          `Factura ${factura.numero} creada, pero falló el desglose: ${errorLineas.message}`
        );

        setGuardando(false);
        return;
      }

      /*
       * NUEVO:
       * Creamos el registro de extras asociado a la factura.
       *
       * No se calcula aquí ningún precio adicional:
       * el precio del extra es exactamente la suma de los servicios
       * seleccionados.
       *
       * El técnico se obtiene de la vivienda.
       */
      const descripcionExtra = lineas
        .map((l) => l.nombre)
        .join(", ");

      const { error: errorExtra } = await supabase
        .from("extras")
        .insert({
          factura_id: factura.id,
          vivienda_id: vivienda.id,
          tecnico_id: vivienda.tecnico_id || null,
          cliente_id: cliente.id,
          cliente_email: cliente.email || null,
          descripcion: descripcionExtra,
          precio: Number(totalBase),
          estado: "pendiente",
          estado_tecnico: null,
          estado_admin: "pendiente",
          direccion: vivienda.direccion || cliente.direccion || null,
          creado_en: new Date().toISOString()
        });

      if (errorExtra) {
        console.error("Error creando extra:", errorExtra);

        /*
         * No tocamos ni borramos la factura ya creada.
         * Esto evita alterar el flujo de facturación que ya funciona.
         */
        setMensaje(
          `Factura ${factura.numero} creada correctamente, pero no se pudo crear el extra: ${errorExtra.message}`
        );

        setGuardando(false);
        return;
      }

      let avisoPdf = "";

      /*
       * Flujo actual del PDF y email.
       * No se modifica.
       */
      try {
        const { data: pdfData, error: errorPdf } =
          await supabase.functions.invoke("factura-pdf", {
            body: { facturaId: factura.id }
          });

        if (!errorPdf && pdfData?.pdf_url) {
          const disponible = await pdfDisponible(pdfData.pdf_url);

          if (disponible) {
            await supabase
              .from("facturas")
              .update({ pdf_url: pdfData.pdf_url })
              .eq("id", factura.id);

            if (enviarEmail && cliente?.email) {
              const { error: errorEmail } =
                await supabase.functions.invoke("enviar-email", {
                  body: {
                    facturaId: factura.id,
                    id: factura.id,
                    tipo: "factura"
                  }
                });

              if (errorEmail) {
                console.error("Error enviando email:", errorEmail);
                avisoPdf +=
                  " (Factura creada, pero no se pudo enviar el email).";
              } else {
                avisoPdf += ` Enviada a ${cliente.email}.`;
              }
            } else if (enviarEmail) {
              avisoPdf +=
                " (El cliente no tiene email registrado).";
            }
          } else {
            avisoPdf =
              " Factura creada correctamente (PDF pendiente de procesamiento).";
          }
        } else {
          avisoPdf = " Factura creada correctamente.";
        }
      } catch (pdfErr) {
        console.warn(
          "Aviso menor: La Edge Function del PDF no respondió:",
          pdfErr
        );

        avisoPdf = " Factura creada correctamente.";
      }

      setSeleccionados([]);
      setPrecios({});

      setMensaje(
        `¡Factura ${factura.numero} creada correctamente!${avisoPdf}`
      );

      setGuardando(false);
    } catch (e) {
      console.error("Error creando factura:", e);
      setError(`No se pudo crear la factura: ${e.message}`);
      setGuardando(false);
    }
  };

  const viviendasDelCliente = viviendas;

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>Emitir Servicio y Facturar</h1>

        <p style={estilos.subtitulo}>
          Selecciona los servicios adicionales o de custodia para generar la
          factura correspondiente.
        </p>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        <div style={estilos.tarjeta}>
          <label style={estilos.etiqueta}>Cliente</label>

          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={estilos.select}
            disabled={cargando}
          >
            <option value="">
              {cargando
                ? "Cargando clientes..."
                : "-- Selecciona un cliente --"}
            </option>

            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.direccion ? ` — ${c.direccion}` : ""}
              </option>
            ))}
          </select>

          {!cargando && clientes.length === 0 && (
            <p style={estilos.aviso}>
              No hay clientes disponibles. Crea uno primero en el módulo de
              Clientes.
            </p>
          )}
        </div>

        <div style={estilos.tarjeta}>
          <label style={estilos.etiqueta}>Vivienda</label>

          <select
            value={viviendaId}
            onChange={(e) => setViviendaId(e.target.value)}
            style={estilos.select}
            disabled={!clienteId || cargandoViviendas}
          >
            <option value="">
              {!clienteId
                ? "-- Selecciona primero un cliente --"
                : cargandoViviendas
                ? "Cargando viviendas..."
                : "-- Selecciona una vivienda --"}
            </option>

            {viviendasDelCliente.map((vivienda) => (
              <option key={vivienda.id} value={vivienda.id}>
                {vivienda.direccion || `Vivienda #${vivienda.id}`}
              </option>
            ))}
          </select>

          {clienteId &&
            !cargandoViviendas &&
            viviendasDelCliente.length === 0 && (
              <p style={estilos.aviso}>
                Este cliente no tiene ninguna vivienda disponible.
              </p>
            )}
        </div>

        <div style={estilos.tarjeta}>
          <h3
            style={{
              color: "#4db8ff",
              marginBottom: 14,
              fontSize: 16
            }}
          >
            Servicios Disponibles
          </h3>

          {EXTRAS.map((extra) => (
            <div key={extra.nombre} style={{ marginBottom: 18 }}>
              <label style={estilos.check}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(extra.nombre)}
                  onChange={() => toggleExtra(extra.nombre)}
                  style={estilos.checkbox}
                />

                {extra.nombre} —{" "}
                {extra.precio !== null
                  ? `${extra.precio} €`
                  : "Precio personalizado"}
              </label>

              {extra.precio === null &&
                seleccionados.includes(extra.nombre) && (
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="Introduce el precio en €"
                    value={precios[extra.nombre] ?? ""}
                    onChange={(e) =>
                      setPrecios({
                        ...precios,
                        [extra.nombre]: e.target.value
                      })
                    }
                    style={estilos.input}
                  />
                )}
            </div>
          ))}
        </div>

        <div style={estilos.tarjeta}>
          <Fila
            clave="Importe Total"
            valor={`${totalBase.toFixed(2)} €`}
            destacado
          />

          <label style={{ ...estilos.check, marginTop: 14 }}>
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              style={estilos.checkbox}
            />

            <span style={{ fontSize: 14.5 }}>
              Enviar factura por email automáticamente al cliente
            </span>
          </label>
        </div>

        <button
          onClick={crearFactura}
          disabled={guardando}
          style={{
            ...estilos.boton,
            opacity: guardando ? 0.6 : 1
          }}
        >
          {guardando ? "Procesando..." : "Emitir Servicio y Facturar"}
        </button>

        <button
          onClick={() => navigate("/facturas")}
          style={estilos.botonSec}
        >
          Ir al listado de Facturas
        </button>
      </div>
    </Menu>
  );
}

function Fila({ clave, valor, destacado }) {
  return (
    <div style={estilos.fila}>
      <span style={{ color: "#9fb3c8", fontSize: 15 }}>
        {clave}
      </span>

      <span
        style={{
          fontWeight: 700,
          fontSize: destacado ? 20 : 16,
          color: destacado ? "#4db8ff" : "#fff"
        }}
      >
        {valor}
      </span>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: 20,
    background: "#0a0f1a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif"
  },

  titulo: {
    color: "#4db8ff",
    marginBottom: 6,
    fontSize: 28,
    fontWeight: 700,
    textShadow: "0 0 8px rgba(0,153,255,0.6)"
  },

  subtitulo: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 20
  },

  tarjeta: {
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: 16
  },

  etiqueta: {
    display: "block",
    fontSize: 13,
    color: "#9fb3c8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },

  select: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "#132033",
    color: "#fff",
    fontSize: 15
  },

  check: {
    display: "flex",
    alignItems: "center",
    fontSize: 16,
    cursor: "pointer"
  },

  checkbox: {
    width: 22,
    height: 22,
    marginRight: 12,
    cursor: "pointer",
    accentColor: "#4db8ff"
  },

  input: {
    padding: "11px 14px",
    width: "100%",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    marginTop: 10,
    fontSize: 15
  },

  fila: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0"
  },

  boton: {
    width: "100%",
    padding: 14,
    background: "#4db8ff",
    color: "#000",
    borderRadius: 8,
    border: "none",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(0,153,255,0.4)"
  },

  botonSec: {
    width: "100%",
    marginTop: 10,
    padding: 13,
    background: "transparent",
    color: "#4db8ff",
    borderRadius: 8,
    border: "1px solid rgba(77,184,255,0.45)",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer"
  },

  ok: {
    marginBottom: 15,
    color: "#4ade80",
    fontWeight: 600,
    background: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.35)",
    borderRadius: 8,
    padding: 12
  },

  error: {
    marginBottom: 15,
    color: "#ff6b6b",
    fontWeight: 600,
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.35)",
    borderRadius: 8,
    padding: 12
  },

  aviso: {
    marginTop: 10,
    color: "#ffc861",
    fontSize: 13.5
  }
};
