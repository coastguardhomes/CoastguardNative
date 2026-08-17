import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFCliente } from "../../pdf/generarPDFCliente";
import { subirPDF } from "../../pdf/subirPDF";

export default function DetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [firma, setFirma] = useState(null);

  // Estados relacionados
  const [cliente, setCliente] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [contrato, setContrato] = useState(null);
  const [checklist, setChecklist] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [aprobando, setAprobando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        setCargando(true);
        setError("");

        // 1️⃣ Cargar inspección
        const { data: insp, error: errorInsp } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (cancelado) return;

        if (errorInsp || !insp) {
          setError("No se pudo cargar la inspección.");
          setCargando(false);
          return;
        }

        setInspeccion(insp);

        // 2️⃣ Cargar vivienda
        if (insp.vivienda_id) {
          const { data: viv } = await supabase
            .from("viviendas")
            .select("*")
            .eq("id", insp.vivienda_id)
            .maybeSingle();

          setVivienda(viv);

          // 3️⃣ Cargar cliente
          const clienteId = viv?.cliente_id || insp.cliente_id;
          if (clienteId) {
            const { data: cli } = await supabase
              .from("clientes")
              .select("*")
              .eq("id", clienteId)
              .maybeSingle();

            setCliente(cli);
          }
        }

        // 4️⃣ Cargar técnico
        if (insp.tecnico_id) {
          const { data: tec } = await supabase
            .from("tecnicos")
            .select("*")
            .eq("id", insp.tecnico_id)
            .maybeSingle();
          setTecnico(tec);
        }

        // 5️⃣ Cargar contrato
        if (insp.contrato_id) {
          const { data: cont } = await supabase
            .from("contratos")
            .select("*")
            .eq("id", insp.contrato_id)
            .maybeSingle();
          setContrato(cont);
        }

        // 6️⃣ Cargar checklist para auditoría del admin
        const { data: chk } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", id);
        setChecklist(chk || []);

        // 7️⃣ Cargar fotos de forma segura
        try {
          const fotosCargadas = await cargarFotosInspeccion(id);
          setFotos(fotosCargadas || []);
        } catch (errFoto) {
          console.warn("Error cargando fotos:", errFoto);
          setFotos([]);
        }

        // 8️⃣ Cargar firma de forma segura
        try {
          const { data: firmas } = await supabase
            .from("firmas_inspeccion")
            .select("url")
            .eq("inspeccion_id", id)
            .limit(1);

          setFirma(firmas?.[0]?.url || null);
        } catch (errFirma) {
          console.warn("Error cargando firma:", errFirma);
          setFirma(null);
        }

      } catch (errGeneral) {
        console.error("Error crítico cargando detalle de inspección:", errGeneral);
        setError("Error al cargar los datos de la inspección.");
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function aBase64(url) {
    if (!url) return null;
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  // ⭐ ACCIÓN DE APROBACIÓN DEL ADMIN
  async function aprobarInspeccionAdmin() {
    setAprobando(true);
    setMensaje("");
    setError("");

    const { error: updateError } = await supabase
      .from("inspecciones")
      .update({
        estado: "completada_admin",
        fecha_aprobacion_admin: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError("No se pudo aprobar la inspección: " + updateError.message);
      setAprobando(false);
      return;
    }

    setInspeccion((prev) => ({ ...prev, estado: "completada_admin" }));
    setMensaje("¡Inspección aprobada con éxito! Ya se puede generar el PDF para el cliente.");
    setAprobando(false);
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

  if (!inspeccion) {
    return (
      <Menu>
        <div style={estilos.centrado}>
          <div>
            <p style={{ color: "#ff6b6b", marginBottom: "15px" }}>{error || "No se encontró la inspección."}</p>
            <button onClick={() => navigate(-1)} style={estilos.botonSec}>Volver</button>
          </div>
        </div>
      </Menu>
    );
  }

  const estaAprobada = inspeccion.estado === "completada_admin";

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h2 style={estilos.titulo}>Revisión de Inspección #{inspeccion.id}</h2>

        {mensaje && <p style={estilos.ok}>{mensaje}</p>}
        {error && <p style={estilos.error}>{error}</p>}

        {/* 🛡️ PANEL DE CONTROL Y APROBACIÓN DEL ADMIN */}
        <div style={estilos.tarjetaAdmin}>
          <h3 style={{ color: "#4db8ff", marginBottom: "10px", fontSize: "18px" }}>
            Panel de Validación del Administrador
          </h3>
          <p style={{ fontSize: "14.5px", marginBottom: "12px" }}>
            Estado actual: <strong style={{ color: estaAprobada ? "#4ade80" : "#ffcc00" }}>{inspeccion.estado || "Pendiente"}</strong>
          </p>

          {!estaAprobada ? (
            <button
              onClick={aprobarInspeccionAdmin}
              disabled={aprobando}
              style={{
                ...estilos.boton,
                background: "#4ade80",
                color: "#000",
                marginBottom: 0,
                opacity: aprobando ? 0.6 : 1,
              }}
            >
              {aprobando ? "Aprobando..." : "✅ Aprobar trabajo del técnico"}
            </button>
          ) : (
            <p style={{ color: "#4ade80", fontWeight: "700", fontSize: "14px" }}>
              ✔ Trabajo aprobado y validado para envío al cliente.
            </p>
          )}
        </div>

        {/* 🔥 TARJETA DATOS GENERALES */}
        <div style={estilos.tarjeta}>
          <Dato clave="Fecha" valor={String(inspeccion.fecha || "").slice(0, 10)} />
          <Dato clave="Cliente" valor={cliente?.nombre} />
          <Dato clave="Teléfono" valor={cliente?.telefono} />
          <Dato clave="Vivienda" valor={vivienda?.direccion} />
          <Dato clave="Localidad" valor={vivienda?.ciudad} />
          <Dato clave="Técnico" valor={tecnico?.nombre} />
          <Dato clave="Contrato" valor={contrato?.modalidad} />
          <Dato clave="Fotos subidas" valor={fotos.length} />
          <Dato clave="Checklist ítems" valor={`${checklist.filter(i => i.completado).length} / ${checklist.length} OK`} />
          <Dato clave="Firma" valor={firma ? "Capturada" : "Pendiente"} />
          {inspeccion.observaciones && <Dato clave="Notas del técnico" valor={inspeccion.observaciones} />}
        </div>

        {/* ACCIÓN PDF */}
        <button
          onClick={generarInforme}
          disabled={generando}
          style={{
            ...estilos.boton,
            opacity: generando ? 0.6 : 1,
          }}
        >
          {generando ? "Generando informe..." : "Generar informe PDF"}
        </button>

        {inspeccion.pdf_url && (
          <button
            onClick={() => navigate(`/inspecciones/pdf/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Ver informe PDF guardado
          </button>
        )}

        <div style={estilos.acciones}>
          <button
            onClick={() => navigate(`/inspecciones/fotos/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Ver Fotos ({fotos.length})
          </button>
          <button
            onClick={() => navigate(`/inspecciones/checklist/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Ver Checklist
          </button>
          <button
            onClick={() => navigate(`/inspecciones/firma/${inspeccion.id}`)}
            style={estilos.botonSec}
          >
            Ver Firma
          </button>
        </div>
      </div>
    </Menu>
  );
}

function Dato({ clave, valor }) {
  if (valor === undefined || valor === null || valor === "") return null;
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
  tarjetaAdmin: {
    background: "rgba(77,184,255,0.08)",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(77,184,255,0.3)",
    marginBottom: 18,
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
    padding: 12,
    marginBottom: 14,
    color: "#ff6b6b",
    fontWeight: 600,
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.35)",
    borderRadius: 8,
  },
};
