import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

/**
 * Detalle de una factura, con su desglose y su PDF.
 */
export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [enviandoTecnico, setEnviandoTecnico] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarFactura() {
    const { data, error: errorFactura } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (errorFactura) {
      console.error("Error cargando factura:", errorFactura);
      setError("No se pudo cargar la factura.");
      setLoading(false);
      return;
    }

    setFactura(data);

    if (data) {
      const { data: detalle } = await supabase
        .from("facturas_lineas")
        .select("*")
        .eq("factura_id", data.id)
        .order("id");

      setLineas(detalle || []);

      if (data.cliente_id) {
        const { data: c } = await supabase
          .from("clientes")
          .select("nombre, direccion, email, telefono")
          .eq("id", data.cliente_id)
          .maybeSingle();
        setCliente(c || null);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    cargarFactura();
  }, [id]);

  async function generarPDF() {
    setMensaje("");
    setError("");
    setGenerando(true);

    const { data, error: errorPdf } = await supabase.functions.invoke(
      "factura-pdf",
      { body: { facturaId: Number(id) } }
    );

    if (errorPdf || data?.error) {
      console.error("Error generando PDF:", errorPdf || data.error);
      setError("No se pudo generar el PDF de la factura.");
      setGenerando(false);
      return;
    }

    setFactura((prev) => ({ ...prev, pdf_url: data.url }));
    setMensaje("PDF generado correctamente.");
    setGenerando(false);
  }

  // ⭐ APROBAR PAGO Y ENVIAR AL TÉCNICO CON LAS COLUMNAS EXACTAS DE 'EXTRAS'
  async function aprobarYEnviarATecnico() {
    try {
      setEnviandoTecnico(true);
      setError("");
      setMensaje("");

      // 1. Actualizar estado de la factura a pagada
      const { error: errorUpdate } = await supabase
        .from("facturas")
        .update({ estado: "pagada" })
        .eq("id", id);

      if (errorUpdate) throw new Error("Error actualizando factura: " + errorUpdate.message);

      // 2. Crear el registro en la tabla 'extras' usando los campos reales
      const conceptoTexto = factura.descripcion || lineas.map(l => l.concepto).join(", ") || "Servicio Extra Facturado";
      
      const payloadExtra = {
        descripcion: `Factura ${factura.numero || `#${factura.id}`}: ${conceptoTexto}`,
        precio: Number(factura.total || 0),
        estado: "pendiente"
      };

      const { error: errorExtra } = await supabase
        .from("extras")
        .insert([payloadExtra]);

      if (errorExtra) {
        throw new Error("Error en tabla 'extras': " + errorExtra.message);
      }

      setFactura((prev) => ({ ...prev, estado: "pagada" }));
      setMensaje("¡Pago aprobado y servicio enviado al técnico correctamente!");
    } catch (err) {
      console.error("Error al aprobar y enviar:", err);
      setError(err.message);
    } finally {
      setEnviandoTecnico(false);
    }
  }

  // ⭐ BORRAR FACTURA COMPLETA
  async function eliminarFactura() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta factura?");
    if (!confirmar) return;

    await supabase
      .from("facturas_lineas")
      .delete()
      .eq("factura_id", id);

    const { error } = await supabase
      .from("facturas")
      .delete()
      .eq("id", id);

    if (error) {
      setError("Error eliminando factura.");
      return;
    }

    alert("Factura eliminada correctamente.");
    navigate("/facturas");
  }

  if (loading) {
    return (
      <Menu>
        <div style={estilos.centrado}>Cargando factura...</div>
      </Menu>
    );
  }

  if (!factura) {
    return (
      <Menu>
        <div style={estilos.centrado}>
          {error || "No se encontró la factura."}
        </div>
      </Menu>
    );
  }

  const esPagada = factura.estado === "pagada" || factura.estado === "pagado";

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>{factura.numero || `Factura #${factura.id}`}</h1>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        <div style={estilos.tarjeta}>
          <Fila clave="Fecha" valor={String(factura.fecha || "").slice(0, 10)} />
          <Fila clave="Estado" valor={factura.estado} />
          {cliente && <Fila clave="Cliente" valor={cliente.nombre} />}
          {cliente?.direccion && <Fila clave="Dirección" valor={cliente.direccion} />}
          {factura.descripcion && (
            <Fila clave="Concepto" valor={factura.descripcion} />
          )}
        </div>

        {lineas.length > 0 && (
          <div style={estilos.tarjeta}>
            <h3 style={estilos.subtitulo}>Desglose</h3>
            {lineas.map((l) => (
              <Fila
                key={l.id}
                clave={`${l.concepto} x${l.cantidad ?? 1}`}
                valor={`${Number(l.subtotal || 0).toFixed(2)} €`}
              />
            ))}
          </div>
        )}

        <div style={estilos.tarjeta}>
          <Fila clave="Base" valor={`${Number(factura.base || 0).toFixed(2)} €`} />
          <Fila clave="IVA" valor={`${Number(factura.iva || 0).toFixed(2)} €`} />
          <Fila
            clave="Total"
            valor={`${Number(factura.total || 0).toFixed(2)} €`}
            destacado
          />
        </div>

        {/* ⭐ BOTÓN DE APROBAR PAGO Y ENVIAR AL TÉCNICO */}
        {!esPagada && (
          <button
            onClick={aprobarYEnviarATecnico}
            disabled={enviandoTecnico}
            style={estilos.botonAprobar}
          >
            {enviandoTecnico ? "Procesando..." : "✅ Aceptar Pago y Enviar a Técnico"}
          </button>
        )}

        <button
          onClick={generarPDF}
          disabled={generando}
          style={{ ...estilos.boton, opacity: generando ? 0.6 : 1 }}
        >
          {generando ? "Generando PDF..." : "Generar PDF de la factura"}
        </button>

        {factura.pdf_url && (
          <a
            href={factura.pdf_url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button style={estilos.botonSec}>Abrir PDF</button>
          </a>
        )}

        <button onClick={() => navigate("/facturas")} style={estilos.botonSec}>
          Volver a facturas
        </button>

        {/* ⭐ BOTÓN BORRAR FACTURA */}
        <button
          onClick={eliminarFactura}
          style={{
            ...estilos.botonSec,
            background: "red",
            border: "none",
            fontWeight: 700,
            marginTop: 10,
          }}
        >
          Eliminar factura
        </button>
      </div>
    </Menu>
  );
}

function Fila({ clave, valor, destacado }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div style={estilos.fila}>
      <span style={estilos.clave}>{clave}</span>
      <span
        style={{
          ...estilos.valor,
          color: destacado ? "#4db8ff" : "#e8eef5",
          fontSize: destacado ? 18 : 14.5,
        }}
      >
        {String(valor)}
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
    fontFamily: "Inter, sans-serif",
  },
  centrado: {
    minHeight: "100vh",
    background: "#0a0f1a",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    padding: 24,
    textAlign: "center",
  },
  titulo: {
    color: "#4db8ff",
    marginBottom: 18,
    fontSize: 26,
    fontWeight: 700,
    textShadow: "0 0 8px rgba(0,153,255,0.6)",
  },
  subtitulo: { color: "#9fb3c8", fontSize: 14, marginBottom: 8, fontWeight: 700 },
  tarjeta: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    boxShadow: "0 0 12px rgba(0,153,255,0.15)",
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  clave: { color: "#9fb3c8", fontSize: 14 },
  valor: { fontWeight: 600, textAlign: "right" },
  botonAprobar: {
    width: "100%",
    padding: 14,
    background: "linear-gradient(to bottom, #2ecc71, #27ae60)",
    color: "#fff",
    border: "1px solid #27ae60",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 10,
    boxShadow: "0 4px 12px rgba(46, 204, 113, 0.3)",
  },
  boton: {
    width: "100%",
    padding: 14,
    background: "#4db8ff",
    color: "#04263f",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 10,
  },
  botonSec: {
    width: "100%",
    padding: 12,
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14.5,
    cursor: "pointer",
    marginBottom: 10,
  },
  ok: {
    marginBottom: 14,
    color: "#4ade80",
    fontWeight: 600,
    background: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.35)",
    borderRadius: 8,
    padding: 12,
  },
  error: {
    marginBottom: 14,
    color: "#ff6b6b",
    fontWeight: 600,
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.35)",
    borderRadius: 8,
    padding: 12,
  },
};
