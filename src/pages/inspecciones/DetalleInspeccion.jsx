import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";
import { subirPDF } from "../../pdf/subirPDF";

/**
 * Detalle de una inspección y generación del informe PDF.
 *
 * Qué estaba mal antes:
 *   · La pantalla mostraba `JSON.stringify(inspeccion)` en crudo dentro de una
 *     caja oscura, y el "informe" era una captura (html2canvas) de esa caja:
 *     un PDF con JSON sobre fondo negro.
 *   · El Blob generado se descartaba: nunca se llamaba a subirPDF, así que no
 *     se guardaba en Storage ni en inspecciones.pdf_url. El mensaje "PDF
 *     generado correctamente" era falso.
 *   · generarPDFInspeccion no se esperaba (sin await), así que cualquier error
 *     quedaba en silencio.
 *
 * Ahora se usa generarPDFCliente, que dibuja un informe real (tabla de datos,
 * fotos, firma y QR) y se sube con subirPDF, que además guarda la URL en la
 * inspección.
 */
export default function DetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [firma, setFirma] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const { data, error: errorInsp } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelado) return;

      if (errorInsp || !data) {
        console.error("Error cargando inspección:", errorInsp);
        setError("No se pudo cargar la inspección.");
        setCargando(false);
        return;
      }

      setInspeccion(data);
      setFotos(await cargarFotosInspeccion(id));

      // La firma vive en firmas_inspeccion (una fila por firma capturada).
      const { data: firmas } = await supabase
        .from("firmas_inspeccion")
        .select("url")
        .eq("inspeccion_id", id)
        .order("id", { ascending: false })
        .limit(1);

      if (cancelado) return;
      setFirma(firmas?.[0]?.url || null);
      setCargando(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  /** Convierte una imagen de Storage a base64 para incrustarla en el PDF. */
  async function aBase64(url) {
    if (!url) return null;
    try {
      const blob = await (await fetch(url)).blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  async function generarInforme() {
    setMensaje("");
    setError("");
    setGenerando(true);

    try {
      const blob = await generarPDFCliente({
        ...inspeccion,
        fotos,
        firmaBase64: await aBase64(firma),
      });

      const resultado = await subirPDF(inspeccion.id, blob);

      if (!resultado.ok) {
        setError(`${resultado.mensaje}: ${resultado.error}`);
        setGenerando(false);
        return;
      }

      setInspeccion((prev) => ({ ...prev, pdf_url: resultado.url }));
      setMensaje("Informe PDF generado y guardado correctamente.");
      setGenerando(false);
    } catch (e) {
      console.error("Error generando informe:", e);
      setError(`No se pudo generar el informe: ${e.message}`);
      setGenerando(false);
    }
  }

  if (cargando) {
    return (
      <Menu>
        <div style={estilos.centrado}>Cargando inspección...</div>
      </Menu>
    );
  }

  if (error && !inspeccion) {
    return (
      <Menu>
        <div style={estilos.centrado}>{error}</div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h2 style={estilos.titulo}>Inspección #{inspeccion.id}</h2>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        {/* Resumen legible en lugar del JSON en crudo */}
        <div style={estilos.tarjeta}>
          <Dato clave="Fecha" valor={String(inspeccion.fecha || "").slice(0, 10)} />
          <Dato clave="Estado" valor={inspeccion.estado} />
          <Dato clave="Inspector" valor={inspeccion.inspector} />
          <Dato clave="Vivienda" valor={inspeccion.vivienda_id} />
          <Dato clave="Contrato" valor={inspeccion.contrato_id} />
          <Dato clave="Origen" valor={inspeccion.origen} />
          <Dato clave="Fotos" valor={fotos.length} />
          <Dato clave="Firma" valor={firma ? "capturada" : "pendiente"} />
          {inspeccion.notas && <Dato clave="Notas" valor={inspeccion.notas} />}
        </div>

        <button
          onClick={generarInforme}
          disabled={generando}
          style={{ ...estilos.boton, opacity: generando ? 0.6 : 1 }}
        >
          {generando ? "Generando informe..." : "Generar informe PDF"}
        </button>

        {inspeccion.pdf_url && (
          <button
            onClick={() => navigate(`/inspecciones/pdf/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Ver informe PDF
          </button>
        )}

        <div style={estilos.acciones}>
          <button
            onClick={() => navigate(`/inspecciones/fotos/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Fotos ({fotos.length})
          </button>
          <button
            onClick={() => navigate(`/inspecciones/checklist/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Checklist
          </button>
          <button
            onClick={() => navigate(`/inspecciones/firma/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Firma
          </button>
        </div>
      </div>
    </Menu>
  );
}

function Dato({ clave, valor }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div style={estilos.fila}>
      <span style={estilos.clave}>{clave}</span>
      <span style={estilos.valor}>{String(valor)}</span>
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
    marginBottom: 20,
    fontSize: 28,
    fontWeight: 700,
    textShadow: "0 0 8px rgba(0,153,255,0.6)",
  },
  tarjeta: {
    background: "rgba(255,255,255,0.05)",
    padding: 18,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: 18,
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    padding: "7px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  clave: { color: "#9fb3c8", fontSize: 14 },
  valor: { fontWeight: 600, fontSize: 14.5, textAlign: "right" },
  boton: {
    padding: 14,
    width: "100%",
    background: "#4db8ff",
    color: "#000",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    fontSize: 17,
    cursor: "pointer",
    marginBottom: 10,
    boxShadow: "0 0 10px rgba(0,153,255,0.4)",
  },
  botonSec: {
    flex: 1,
    padding: 12,
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 600,
    fontSize: 14.5,
    cursor: "pointer",
    marginBottom: 10,
  },
  acciones: { display: "flex", gap: 10, marginTop: 6 },
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
