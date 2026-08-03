import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function FotosInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarFotos();
  }, [id]);

  async function cargarFotos() {
    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    if (error) {
      setMensaje("Error cargando fotos");
      setLoading(false);
      return;
    }

    const fotosConURL = data.map((f) => {
      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(f.archivo);

      return { ...f, publicUrl: urlData.publicUrl };
    });

    setFotos(fotosConURL);
    setLoading(false);
  }

  async function subirFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

    const { error: storageError } = await supabase.storage
      .from("fotos")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      setMensaje("Error subiendo foto");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("fotos")
      .getPublicUrl(nombreArchivo);

    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .insert([
        {
          inspeccion_id: id,
          archivo: nombreArchivo,
          url: urlData.publicUrl,   // 🔥 GUARDAMOS LA URL PARA EL PDF
          principal: false,
        },
      ]);

    if (dbError) {
      setMensaje("Error guardando foto en la base de datos");
      return;
    }

    // 🔥 Guardar fecha de fotos + estado
    await supabase
      .from("inspecciones")
      .update({
        fecha_fotos: new Date().toISOString(),
        estado: "fotos_completadas",
      })
      .eq("id", id);

    setMensaje("Foto subida correctamente");
    cargarFotos();
  }

  async function borrarFoto(foto) {
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove([foto.archivo]);

    if (storageError) {
      setMensaje("Error borrando foto del almacenamiento");
      return;
    }

    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    if (dbError) {
      setMensaje("Error borrando foto de la base de datos");
      return;
    }

    setMensaje("Foto eliminada correctamente");
    cargarFotos();
  }

  async function marcarPrincipal(foto) {
    try {
      await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", id);

      await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id);

      // 🔥 Guardar foto principal en inspecciones
      await supabase
        .from("inspecciones")
        .update({
          foto_principal: foto.url,
        })
        .eq("id", id);

      setMensaje("Foto marcada como principal");
      cargarFotos();
    } catch (e) {
      setMensaje("Error marcando foto como principal");
    }
  }

  function continuarAFirma() {
    if (fotos.length === 0) {
      setMensaje("Debes subir al menos una foto antes de continuar.");
      return;
    }

    navigate(`/inspecciones/firma/${id}`);
  }

  return (
    <Menu>
      <div style={contenedor}>
        <h1 style={titulo}>Fotos de la Inspección</h1>

        {mensaje && <p style={mensajeEstilo}>{mensaje}</p>}

        <label style={botonSubir}>
          Subir foto
          <input type="file" accept="image/*" onChange={subirFoto} style={{ display: "none" }} />
        </label>

        {loading ? (
          <p>Cargando fotos...</p>
        ) : fotos.length === 0 ? (
          <p>No hay fotos registradas.</p>
        ) : (
          <div style={grid}>
            {fotos.map((foto) => (
              <div key={foto.id} style={card}>
                <img
                  src={foto.publicUrl}
                  alt="Foto inspección"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    border: foto.principal ? "3px solid #4ade80" : "2px solid #4db8ff",
                    marginBottom: "10px",
                  }}
                />

                <button
                  onClick={() => marcarPrincipal(foto)}
                  style={{
                    ...boton,
                    background: foto.principal ? "#4ade80" : "#4db8ff",
                  }}
                >
                  {foto.principal ? "Principal ✔" : "Marcar como principal"}
                </button>

                <button onClick={() => borrarFoto(foto)} style={botonEliminar}>
                  Borrar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 Botón continuar */}
        <button
          onClick={continuarAFirma}
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
          Continuar a firma
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
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "25px",
  color: "#4db8ff",
  textAlign: "center",
};

const mensajeEstilo = {
  marginBottom: "15px",
  color: "#4db8ff",
  fontWeight: "600",
};

const botonSubir = {
  display: "block",
  marginBottom: "20px",
  background: "#4db8ff",
  color: "#000",
  padding: "14px",
  borderRadius: "10px",
  textAlign: "center",
  fontWeight: "700",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "18px",
};

const card = {
  background: "rgba(255,255,255,0.05)",
  padding: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
};

const boton = {
  width: "100%",
  padding: "10px",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "8px",
};

const botonEliminar = {
  width: "100%",
  padding: "10px",
  background: "red",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
};
