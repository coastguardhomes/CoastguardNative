
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
    precio: "",
    precio_vivienda: 0,
    precio_modalidad: 0,
    notas: "",
    frecuencia: "",
    modalidad: "",
    dni: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const modalidades = [
    { id: "basico", nombre: "Básico", precio: 39, frecuencia: 30 },
    { id: "standard", nombre: "Standard", precio: 59, frecuencia: 30 },
    { id: "premium", nombre: "Premium", precio: 79, frecuencia: 30 },
    {
      id: "custodia_llaves",
      nombre: "Custodia de llaves",
      precio: 15,
      frecuencia: null,
    },
  ];

  // Calcula la fecha final del período contractual de 12 meses.
  // No utiliza la frecuencia de visitas para calcularla.
  function calcularFechaFin(fechaInicio, meses = 12) {
    if (!fechaInicio) return null;

    const partes = fechaInicio.split("-").map(Number);

    if (
      partes.length !== 3 ||
      partes.some((n) => !Number.isFinite(n))
    ) {
      return null;
    }

    const [anio, mes, dia] = partes;
    const indiceMes = mes - 1 + meses;
    const anioFinal = anio + Math.floor(indiceMes / 12);
    const mesFinal = indiceMes % 12;
    const ultimoDia = new Date(
      anioFinal,
      mesFinal + 1,
      0
    ).getDate();
    const diaFinal = Math.min(dia, ultimoDia);

    return `${anioFinal}-${String(mesFinal + 1).padStart(2, "0")}-${String(diaFinal).padStart(2, "0")}`;
  }

  // El precio introducido se considera la base imponible.
  function calcularImportes(baseIntroducida) {
    const base = Number(Number(baseIntroducida).toFixed(2));
    const iva = Number((base * 0.21).toFixed(2));
    const total = Number((base + iva).toFixed(2));

    return { base, iva, total };
  }

  function calcularPuntos(v) {
    let puntos = 0;

    if (v.metros_cuadrados > 80 && v.metros_cuadrados <= 120) {
      puntos += 5;
    } else if (
      v.metros_cuadrados > 120 &&
      v.metros_cuadrados <= 180
    ) {
      puntos += 10;
    } else if (v.metros_cuadrados > 180) {
      puntos += 15;
    }

    if (v.habitaciones > 1) {
      puntos += (v.habitaciones - 1) * 2;
    }

    if (v.banos > 1) {
      puntos += (v.banos - 1) * 3;
    }

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
    const { data: clientesData, error: clientesError } =
      await supabase
        .from("clientes")
        .select("id, nombre, dni, cif, email");

    const { data: viviendasData, error: viviendasError } =
      await supabase
        .from("viviendas")
        .select("*");

    const { data: tecnicosData, error: tecnicosError } =
      await supabase
        .from("tecnicos")
        .select("id, nombre");

    if (clientesError) {
      console.error("Error cargando clientes:", clientesError);
    }

    if (viviendasError) {
      console.error("Error cargando viviendas:", viviendasError);
    }

    if (tecnicosError) {
      console.error("Error cargando técnicos:", tecnicosError);
    }

    setClientes(clientesData || []);
    setViviendas(viviendasData || []);
    setTecnicos(tecnicosData || []);
  }

  const viviendasFiltradas = form.cliente_id
    ? viviendas.filter(
        (v) =>
          !v.cliente_id ||
          String(v.cliente_id) === String(form.cliente_id)
      )
    : viviendas;

  function handleClienteChange(e) {
    const clienteId = e.target.value;

    const clienteEncontrado = clientes.find(
      (c) => String(c.id) === String(clienteId)
    );

    setForm((prev) => ({
      ...prev,
      cliente_id: clienteId,
      vivienda_id: "",
      dni: clienteEncontrado
        ? clienteEncontrado.dni || clienteEncontrado.cif || ""
        : "",
      precio_vivienda: 0,
      precio:
        prev.modalidad === "custodia_llaves"
          ? Number(prev.precio_modalidad || 0)
          : 0,
    }));
  }

  function handleViviendaChange(e) {
    const viviendaId = e.target.value;

    const vivienda = viviendas.find(
      (v) => String(v.id) === String(viviendaId)
    );

    setForm((prev) => {
      const esCustodia = prev.modalidad === "custodia_llaves";

      const precioVivienda = esCustodia
        ? 0
        : vivienda
          ? calcularPrecioVivienda(vivienda)
          : 0;

      const precioModalidad = Number(
        prev.precio_modalidad || 0
      );

      const precioBase = Number(
        (precioVivienda + precioModalidad).toFixed(2)
      );

      return {
        ...prev,
        vivienda_id: viviendaId,
        precio_vivienda: precioVivienda,
        precio: precioBase,
      };
    });
  }

  function seleccionarModalidad(modalidadId) {
    const mod = modalidades.find(
      (m) => m.id === modalidadId
    );

    if (!mod) return;

    setForm((prev) => {
      const precioModalidad = Number(mod.precio);
      const esCustodia = modalidadId === "custodia_llaves";

      const precioVivienda = esCustodia
        ? 0
        : Number(prev.precio_vivienda || 0);

      const precioBase = Number(
        (precioModalidad + precioVivienda).toFixed(2)
      );

      return {
        ...prev,
        modalidad: modalidadId,
        frecuencia: esCustodia ? "" : mod.frecuencia,
        precio_modalidad: precioModalidad,
        precio_vivienda: precioVivienda,
        precio: precioBase,
      };
    });
  }

  async function crearContrato() {
    if (procesando) return;

    setMensaje("");

    if (
      !form.cliente_id ||
      !form.vivienda_id ||
      !form.tecnico_id
    ) {
      setMensaje(
        "Cliente, vivienda y técnico son obligatorios."
      );
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

    if (
      form.modalidad !== "custodia_llaves" &&
      (!form.frecuencia ||
        !Number.isFinite(Number(form.frecuencia)) ||
        Number(form.frecuencia) <= 0)
    ) {
      setMensaje(
        "Indica una frecuencia de visitas válida para esta modalidad."
      );
      return;
    }

    const precioBase = Number(form.precio);

    if (
      !Number.isFinite(precioBase) ||
      precioBase <= 0
    ) {
      setMensaje(
        "El precio base del contrato no puede ser 0 o estar vacío."
      );
      return;
    }

    const importes = calcularImportes(precioBase);
    const fechaFinContrato = calcularFechaFin(form.fecha_inicio, 12);

    if (!fechaFinContrato) {
      setMensaje(
        "No se pudo calcular la fecha de finalización del contrato."
      );
      return;
    }

    setProcesando(true);
    setMensaje(
      "Creando contrato y generando documentación interna..."
    );

    let contratoCreadoId = null;
    let facturaCreada = false;

    try {
      if (form.dni && form.cliente_id) {
        const { error: dniError } = await supabase
          .from("clientes")
          .update({ dni: form.dni })
          .eq("id", form.cliente_id);

        if (dniError) throw dniError;
      }

      // La duración contractual es de 12 meses.
      // El pago es mensual y no existe permanencia mínima anual.
      const frecuenciaContrato =
        form.modalidad === "custodia_llaves"
          ? null
          : Number(form.frecuencia);

      const { data, error } = await supabase
        .from("contratos")
        .insert([
          {
            cliente_id: String(form.cliente_id),
            vivienda_id: Number(form.vivienda_id),
            tecnico_id: String(form.tecnico_id),
            fecha_inicio: form.fecha_inicio,
            fecha_fin: fechaFinContrato,
            precio: importes.base,
            iva: importes.iva,
            precio_total: importes.total,
            notas: form.notas,
            frecuencia: frecuenciaContrato,
            modalidad: form.modalidad,
            estado: "pendiente",
            duracion_meses: 12,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      const contratoId = data.id;
      contratoCreadoId = contratoId;

      const {
        base: baseFactura,
        iva: ivaFactura,
        total: totalFactura,
      } = importes;

      const { error: facturaError } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: String(form.cliente_id),
            vivienda_id: Number(form.vivienda_id),
            contrato_id: Number(contratoId),
            tipo: "contrato",
            descripcion:
              form.modalidad === "custodia_llaves"
                ? "Custodia de llaves"
                : "Suscripción mensual",
            base: baseFactura,
            iva: ivaFactura,
            total: totalFactura,
            monto: totalFactura,
            estado_tecnico: "no_enviar",
            estado: "pendiente",
            estado_pago: "pendiente",
            fecha: new Date().toISOString().slice(0, 10),
          },
        ])
        .select()
        .single();

      if (facturaError) throw facturaError;
      facturaCreada = true;

      // La función genera el PDF con los datos guardados.
      const { error: pdfError } =
        await supabase.functions.invoke("contrato-pdf", {
          body: {
            contratoId,
            id: contratoId,
          },
        });

      if (pdfError) {
        console.error(
          "No se pudo generar el PDF del contrato:",
          pdfError
        );

        setMensaje(
          "Contrato y factura creados, pero no se pudo generar el PDF. " +
          "No vuelvas a crear el contrato: entra en su ficha y usa " +
          "«Regenerar / Actualizar PDF»."
        );
      } else {
        setMensaje("¡Contrato y factura creados con éxito! ✔");
      }

      // Si falla el PDF, el contrato y la factura ya están guardados.
      setTimeout(() => {
        navigate("/contratos");
      }, pdfError ? 3000 : 1500);
    } catch (e) {
      console.error("Error general creando contrato:", e);

      if (contratoCreadoId && !facturaCreada) {
        setMensaje(
          "El contrato #" +
            contratoCreadoId +
            " sí se guardó, pero falló la creación de su factura. " +
            "No vuelvas a crear el contrato para evitar duplicados. " +
            "Revisa la ficha del contrato y las facturas. Detalle: " +
            (e?.message || "Error desconocido")
        );
      } else if (contratoCreadoId && facturaCreada) {
        setMensaje(
          "El contrato #" +
            contratoCreadoId +
            " y su factura ya se guardaron. Falló un paso posterior; " +
            "no vuelvas a crear el contrato para evitar duplicados. " +
            "Puedes revisar la ficha del contrato. Detalle: " +
            (e?.message || "Error desconocido")
        );
      } else {
        setMensaje(
          "Error creando contrato: " +
            (e?.message || "Error desconocido")
        );
      }

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

  const importesActuales = calcularImportes(
    Number(form.precio || 0)
  );

  const esCustodia = form.modalidad === "custodia_llaves";

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
            role="status"
            style={{
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "8px",
              background: mensaje.includes("éxito")
                ? "rgba(74,222,128,0.1)"
                : "rgba(0,153,255,0.1)",
              color: mensaje.includes("éxito")
                ? "#4ade80"
                : "#4db8ff",
              fontWeight: "600",
              border: mensaje.includes("éxito")
                ? "1px solid rgba(74,222,128,0.3)"
                : "1px solid rgba(0,153,255,0.3)",
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
          <label style={labelStyle}>Cliente:</label>

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

          <label style={labelStyle}>DNI / NIE:</label>

          <input
            type="text"
            placeholder="Introduce o edita el DNI / NIE"
            value={form.dni}
            onChange={(e) =>
              setForm({
                ...form,
                dni: e.target.value,
              })
            }
            style={inputStyle}
          />

          <label style={labelStyle}>Vivienda:</label>

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

          <label style={labelStyle}>Técnico responsable:</label>

          <select
            value={form.tecnico_id}
            onChange={(e) =>
              setForm({
                ...form,
                tecnico_id: String(e.target.value),
              })
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

          <label style={labelStyle}>Modalidad:</label>

          <select
            value={form.modalidad}
            onChange={(e) =>
              seleccionarModalidad(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">Selecciona modalidad</option>
            {modalidades.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} — {m.precio}€ + IVA
              </option>
            ))}
          </select>

          <label style={labelStyle}>Fecha de inicio:</label>

          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) =>
              setForm({
                ...form,
                fecha_inicio: e.target.value,
              })
            }
            style={inputStyle}
          />

          <div
            style={{
              padding: "12px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "rgba(77,184,255,0.08)",
              border: "1px solid rgba(77,184,255,0.25)",
              color: "#b8dfff",
              lineHeight: "1.6",
              fontSize: "14px",
            }}
          >
            El contrato tiene duración y renovación anual, con facturación
            mensual. No existe permanencia mínima anual: el cliente puede
            solicitar la cancelación en cualquier momento con un mes de
            preaviso, conforme al contrato marco.
          </div>

          <label style={labelStyle}>
            Precio base sin IVA (€/mes):
          </label>

          <input
            type="number"
            value={form.precio}
            readOnly
            style={{
              ...inputStyle,
              background: "rgba(255,255,255,0.15)",
              fontWeight: "bold",
              color: "#4db8ff",
            }}
          />

          <div
            style={{
              marginTop: "-8px",
              marginBottom: "15px",
              color: "#9fb3c8",
              fontSize: "14px",
            }}
          >
            <div>
              IVA (21%): {importesActuales.iva.toFixed(2)} € / mes
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#4db8ff",
                fontWeight: "700",
              }}
            >
              Total con IVA: {importesActuales.total.toFixed(2)} € / mes
            </div>
          </div>

          {!esCustodia && (
            <>
              <label style={labelStyle}>
                Frecuencia de visitas (días):
              </label>

              <input
                type="number"
                min="1"
                value={form.frecuencia}
                onChange={(e) =>
                  setForm({
                    ...form,
                    frecuencia: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </>
          )}

          {esCustodia && (
            <p
              style={{
                marginTop: 0,
                marginBottom: "15px",
                color: "#9fb3c8",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              La custodia de llaves no incluye visitas ni inspecciones
              de la vivienda. Cualquier servicio adicional requiere
              contratación expresa.
            </p>
          )}

          <label style={labelStyle}>Notas adicionales:</label>

          <textarea
            value={form.notas}
            onChange={(e) =>
              setForm({
                ...form,
                notas: e.target.value,
              })
            }
            style={{
              ...inputStyle,
              minHeight: "90px",
            }}
          />

          <button
            type="button"
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

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  color: "#9fb3c8",
};
