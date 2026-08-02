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

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      // 1️⃣ Cargar inspección
      const { data: insp, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !insp) {
        setMensaje("Error cargando inspección");
        return;
      }

      setInspeccion(insp);

      // 2️⃣ Cargar vivienda
      const { data: viv } = await supabase
        .from("viviendas")
        .select("*")
        .eq("id", insp.vivienda_id)
        .maybeSingle();

      setVivienda(viv);

      // 3️⃣ Cargar cliente
      if (viv?.cliente_id) {
        const { data: cli } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", viv.cliente_id)
          .maybeSingle();

        setCliente(cli);
      }

      // 4️⃣ Cargar técnico
      const { data: tec } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", insp.tecnico_id)
        .maybeSingle();

      setTecnico(tec);

      // 5️⃣ Cargar contrato
      const { data: cont } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", insp.contrato_id)
        .maybeSingle();

      setContrato(cont);

      // 6️⃣ Cargar fotos
      const { data: fotosData } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: false });

      setFotos(fotosData || []);

      // 7️⃣ Cargar firma
      const { data: firmas } = await supabase
        .from("firmas_inspeccion")
        .select("url")
        .eq("inspeccion_id", id)
        .order("id", { ascending: false })
        .limit(1);

      setFirma(firmas?.[0]?.url || null);
    }

    cargar();
  }, [id]);

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

    setMensaje("Inspección eliminada correctamente");
    navigate("/inspecciones");
  }

  if (!inspeccion) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando inspección...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Inspección #{inspeccion.id}
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {/* 🔥 Tarjeta completa */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "25px",
          }}
        >
          <p><strong style={{ color: "#4db8ff" }}>Cliente:</strong> {cliente?.nombre}</p>
          <p><strong style={{ color: "#4db8ff" }}>Teléfono:</strong> {cliente?.telefono}</p>

          <p><strong style={{ color: "#4db8ff" }}>Vivienda:</strong> {vivienda?.direccion}</p>
          <p><strong style={{ color: "#4db8ff" }}>Localidad:</strong> {vivienda?.localidad}</p>

          <p><strong style={{ color: "#4db8ff" }}>Técnico:</strong> {tecnico?.nombre}</p>

          <p><strong style={{ color: "#4db8ff" }}>Contrato:</strong> {contrato?.modalidad}</p>

          <p><strong style={{ color: "#4db8ff" }}>Fecha:</strong> {String(inspeccion.fecha).slice(0,10)}</p>

          <p><strong style={{ color: "#4db8ff" }}>Estado:</strong> {inspeccion.estado}</p>

          <p><strong style={{ color: "#4db8ff" }}>Notas:</strong> {inspeccion.notas}</p>

          <p><strong style={{ color: "#4db8ff" }}>Checklist:</strong> {inspeccion.checklist_completado ? "Completado ✔" : "Pendiente"}</p>

          <p><strong style={{ color: "#4db8ff" }}>Firma:</strong> {firma ? "Capturada ✔" : "Pendiente"}</p>

          <p><strong style={{ color: "#4db8ff" }}>Fotos:</strong> {fotos.length}</p>
        </div>

        {/* 🔥 Mini galería */}
        {fotos.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "12px",
              marginBottom: "25px",
            }}
          >
            {fotos.map((f) => (
              <img
                key={f.id}
                src={f.url}
                alt="foto"
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: f.principal ? "3px solid #4ade80" : "2px solid #4db8ff",
                }}
              />
            ))}
          </div>
        )}

        {/* 🔥 Firma */}
        {firma && (
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <img
              src={firma}
              alt="firma"
              style={{
                width: "300px",
                borderRadius: "10px",
                border: "2px solid #4db8ff",
              }}
            />
          </div>
        )}

        <h2
          style={{
            marginBottom: "15px",
            color: "#4db8ff",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          Acciones
        </h2>

        <Link to={`/inspecciones/checklist/${id}`}>
          <button style={boton}>Checklist</button>
        </Link>

        <Link to={`/inspecciones/fotos/${id}`}>
          <button style={boton}>Fotos</button>
        </Link>

        <Link to={`/inspecciones/firma/${id}`}>
          <button style={boton}>Firma</button>
        </Link>

        <Link to={`/inspecciones/pdf/${id}`}>
          <button style={boton}>Ver PDF</button>
        </Link>

        <Link to={`/inspecciones/detalle/${id}`}>
          <button style={boton}>Detalle completo</button>
        </Link>

        <Link to={`/inspecciones/editar/${id}`}>
          <button style={boton}>Editar inspección</button>
        </Link>

        <button
          onClick={eliminar}
          style={{
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
          }}
        >
          Eliminar inspección
        </button>
      </div>
    </Menu>
  );
}

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
