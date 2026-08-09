import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TecnicoFotos() {
  const { id } = useParams(); // ID inspección
  const { user } = useAuth();

  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  async function cargarDatos() {
    setLoading(true);

    // 1️⃣ Validar técnico
    const { data: tecnico } = await supabase
      .from("tecnicos")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!tecnico) {
      setMensaje("No se pudo validar el técnico.");
      setLoading(false);
      return;
    }

    // 2️⃣ Cargar inspección
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .single();

    if (!insp) {
      setMensaje("Inspección no encontrada.");
      setLoading(false);
      return;
    }

    // 3️⃣ Validar que pertenece al técnico
    if (insp.tecnico_id !== tecnico.id) {
      setMensaje("No tienes permiso para ver estas fotos.");
      setLoading(false);
      return;
    }

    setInspeccion(insp);

    // 4️⃣ Vivienda
    const { data: viv } = await supabase
      .from("viviendas")
      .select("direccion, ciudad")
      .eq("id", insp.vivienda_id)
      .single();

    setVivienda(viv || null);

    // 5️⃣ Cliente
    let clienteFinal = null;

    if (insp.contrato_id) {
      const { data: contrato } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", insp.contrato_id)
        .single();

      if (contrato?.cliente_id) {
        const { data: cli } = await supabase
          .from("clientes")
          .select("nombre, telefono")
          .eq("id", contrato.cliente_id)
          .single();

        clienteFinal = cli;
      }
    }

    setCliente(clienteFinal);

    // 6️⃣ Fotos
    const { data: fotosData } = await supabase
      .from("fotos_inspeccion")
      .select("id, url")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    setFotos(fotosData || []);
    setLoading(false);
  }

  async function subirFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendo(true);
    setMensaje("");

    const nombreArchivo = `inspeccion_${id}_${Date.now()}`;

    // Subir a Storage
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      setMensaje("Error subiendo foto");
      setSubiendo(false);
      return;
    }

    // URL pública
    const urlPublica = supabase.storage
      .from("fotos")
      .getPublicUrl(nombreArchivo).data.publicUrl;

    // Guardar en tabla
    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .insert([{ inspeccion_id: id, url: urlPublica }]);

    if (dbError) {
      setMensaje("Error guardando foto en la inspección");
      setSubiendo(false);
      return;
    }

    // Actualizar estado
    await supabase
      .from("inspecciones")
      .update({
        fecha_fotos: new Date().toISOString(),
        estado: "fotos_completadas",
      })
      .eq("id", id);

    setSubiendo(false);
    cargarDatos();
  }

  if (loading || !inspeccion) {
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
          Cargando fotos...
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
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Fotos de la inspección
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#ff6b6b",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {/* Info */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "20px",
          }}
        >
          <p>
            <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
            {inspeccion.fecha}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
            {inspeccion.estado}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Cliente:</strong>{" "}
            {cliente ? `${cliente.nombre} (${cliente.telefono})` : "Sin cliente"}
          </p>
        </div>

        {/* Subir foto */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              padding: "14px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              fontWeight: "700",
              textAlign: "center",
              cursor: subiendo ? "not-allowed" : "pointer",
              opacity: subiendo ? 0.6 : 1,
            }}
          >
            {subiendo ? "Subiendo..." : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              onChange={subirFoto}
              disabled={subiendo}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Fotos */}
        {fotos.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No hay fotos subidas.</p>
        ) : (
          fotos.map((f) => (
            <div
              key={f.id}
              style={{
                marginBottom: "15px",
                background: "rgba(255,255,255,0.05)",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <img
                src={f.url}
                alt="Foto inspección"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
              />
            </div>
          ))
        )}

        {/* Navegación CORRECTA */}
        <Link to={`/tecnico/inspeccion/${id}/checklist`}>
          <button
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
            }}
          >
            Checklist
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/finalizar`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#4ade80",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Finalizar inspección
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Volver a inspección
          </button>
        </Link>
      </div>
    </Menu>
  );
}
