import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [contrato, setContrato] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [firma, setFirma] = useState(null);
  const [checklist, setChecklist] = useState([]);

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarTodo();
  }, [id]);

  async function cargarTodo() {
    // 1️⃣ Inspección
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!insp) {
      setMensaje("Error cargando inspección");
      return;
    }

    setInspeccion(insp);

    // 2️⃣ Vivienda
    const { data: viv } = await supabase
      .from("viviendas")
      .select("*")
      .eq("id", insp.vivienda_id)
      .maybeSingle();

    setVivienda(viv);

    // 3️⃣ Cliente
    if (viv?.cliente_id) {
      const { data: cli } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", viv.cliente_id)
        .maybeSingle();

      setCliente(cli);
    }

    // 4️⃣ Técnico
    const { data: tec } = await supabase
      .from("tecnicos")
      .select("*")
      .eq("id", insp.tecnico_id)
      .maybeSingle();

    setTecnico(tec);

    // 5️⃣ Contrato
    const { data: cont } = await supabase
      .from("contratos")
      .select("*")
      .eq("id", insp.contrato_id)
      .maybeSingle();

    setContrato(cont);

    // 6️⃣ Fotos
    const { data: fotosData } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    setFotos(fotosData || []);

    // 7️⃣ Firma
    const { data: firmas } = await supabase
      .from("firmas_inspeccion")
      .select("url")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false })
      .limit(1);

    setFirma(firmas?.[0]?.url || null);

    // 8️⃣ Checklist
    const { data: checklistData } = await supabase
      .from("checklist_respuestas")
      .select("id, item, estado, observaciones")
      .eq("inspeccion_id", id);

    setChecklist(checklistData || []);
  }

  // 🔥 Finalizar inspección
  async function finalizarInspeccion() {
    const confirmar = window.confirm("¿Finalizar inspección?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("inspecciones")
      .update({ estado: "finalizada" })
      .eq("id", id);

    if (error) {
      setMensaje("Error finalizando inspección");
      return;
    }

    setMensaje("Inspección finalizada ✔");
    cargarTodo();
  }

  // 🔥 Generar PDF (llamada a Edge Function)
  async function generarPDF() {
    setMensaje("Generando PDF...");

    const { data, error } = await supabase.functions.invoke("generar-pdf-inspeccion", {
      body: { inspeccion_id: id }
    });

    if (error) {
      setMensaje("Error generando PDF");
      return;
    }

    // Guardar URL del PDF
    await supabase
      .from("inspecciones")
      .update({ pdf_url: data.url })
      .eq("id", id);

    setMensaje("PDF generado ✔");
    cargarTodo();
  }

  // 🔥 Enviar email
  async function enviarEmail() {
    setMensaje("Enviando email...");

    const { error } = await supabase.functions.invoke("enviar-email-inspeccion", {
      body: { inspeccion_id: id }
    });

    if (error) {
      setMensaje("Error enviando email");
      return;
    }

    setMensaje("Email enviado ✔");
  }

  async function eliminar() {
    if (!window.confirm("¿Seguro que deseas eliminar esta inspección?")) return;

    const { error } = await supabase
      .from("inspecciones")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando inspección");
      return;
    }

    navigate("/inspecciones");
  }

  if (!inspeccion) {
    return (
      <Menu>
        <div style={cargando}>Cargando inspección...</div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={contenedor}>
        <h1 style={titulo}>Inspección #{inspeccion.id}</h1>

        {mensaje && <p style={mensajeEstilo}>{mensaje}</p>}

        {/* 🔥 Tarjeta principal */}
        <div style={tarjeta}>
          <p><strong style={label}>Cliente:</strong> {cliente?.nombre}</p>
          <p><strong style={label}>Vivienda:</strong> {vivienda?.direccion}</p>
          <p><strong style={label}>Técnico:</strong> {tecnico?.nombre}</p>
          <p><strong style={label}>Contrato:</strong> {contrato?.modalidad}</p>
          <p><strong style={label}>Fecha:</strong> {String(inspeccion.fecha).slice(0,10)}</p>
          <p><strong style={label}>Estado:</strong> {inspeccion.estado}</p>
          <p><strong style={label}>Notas:</strong> {inspeccion.notas}</p>
        </div>

        {/* 🔥 Checklist */}
        <Bloque titulo="Checklist">
          {checklist.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Checklist vacío.</p>
          ) : (
            checklist.map((item) => (
              <div key={item.id} style={itemChecklist}>
                <p><strong>{item.item}</strong></p>
                <p>Estado: {item.estado}</p>
                <p>Obs: {item.observaciones}</p>
              </div>
            ))
          )}
        </Bloque>

        {/* 🔥 Fotos */}
        <Bloque titulo="Fotos">
          {fotos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay fotos.</p>
          ) : (
            <div style={galeria}>
              {fotos.map((f) => (
                <img key={f.id} src={f.url} style={foto} />
              ))}
            </div>
          )}
        </Bloque>

        {/* 🔥 Firma */}
        <Bloque titulo="Firma">
          {firma ? (
            <img src={firma} style={firmaEstilo} />
          ) : (
            <p style={{ opacity: 0.7 }}>Sin firma.</p>
          )}
        </Bloque>

        {/* 🔥 Acciones */}
        <h2 style={subtitulo}>Acciones</h2>

        <Link to={`/inspecciones/checklist/${id}`}>
          <button style={boton}>Checklist</button>
        </Link>

        <Link to={`/inspecciones/fotos/${id}`}>
          <button style={boton}>Fotos</button>
        </Link>

        <Link to={`/inspecciones/firma/${id}`}>
          <button style={boton}>Firma</button>
        </Link>

        <button style={boton} onClick={finalizarInspeccion}>
          Finalizar inspección
        </button>

        <button style={boton} onClick={generarPDF}>
          Generar PDF
        </button>

        <button style={boton} onClick={enviarEmail}>
          Enviar email
        </button>

        <button style={botonEliminar} onClick={eliminar}>
          Eliminar inspección
        </button>
      </div>
    </Menu>
  );
}

/* ---------------- ESTILOS ---------------- */

const contenedor = {
  padding: "20px",
  background: "#0a0f1a",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Inter, sans-serif",
};

const titulo = {
  color: "#4db8ff",
  marginBottom: "25px",
  fontSize: "28px",
  fontWeight: "700",
  textShadow: "0 0 8px rgba(0,153,255,0.6)",
  textAlign: "center",
};

const mensajeEstilo = {
  marginBottom: "15px",
  color: "#4db8ff",
  fontWeight: "600",
};

const tarjeta = {
  background: "rgba(255,255,255,0.05)",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
  marginBottom: "25px",
};

const label = { color: "#4db8ff" };

const Bloque = ({ titulo, children }) => (
  <div style={{ marginBottom: "25px" }}>
    <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "#4db8ff" }}>
      {titulo}
    </h2>
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  </div>
);

const itemChecklist = {
  padding: "10px",
  marginBottom: "10px",
  background: "rgba(255,255,255,0.06)",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.12)",
};

const galeria = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
  gap: "12px",
};

const foto = {
  width: "100%",
  height: "100px",
  objectFit: "cover",
  borderRadius: "10px",
  border: "2px solid #4db8ff",
};

const firmaEstilo = {
  width: "300px",
  borderRadius: "10px",
  border: "2px solid #4db8ff",
};

const subtitulo = {
  marginBottom: "15px",
  color: "#4db8ff",
  fontSize: "24px",
  fontWeight: "700",
};

const boton = {
  marginBottom: "15px",
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
};

const botonEliminar = {
  marginTop: "20px",
  padding: "14px",
  width: "100%",
  background: "red",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  fontSize: "17px",
  cursor: "pointer",
  boxShadow: "0 0 10px rgba(255,0,0,0.4)",
};

const cargando = {
  height: "100vh",
  background: "#0a0f1a",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Inter, sans-serif",
  fontSize: "18px",
};
