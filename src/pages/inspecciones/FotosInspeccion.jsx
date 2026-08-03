import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";

export default function FotosInspeccion() {
  const { id } = useParams();
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

    // 🔥 Generar URL pública desde el archivo
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

    // 1️⃣ Subir a Storage
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      setMensaje("Error subiendo foto");
      return;
    }

    // 2️⃣ Guardar en la tabla (solo el nombre del archivo)
    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .insert([{ inspeccion_id: id, archivo: nombreArchivo, principal: false }]);

    if (dbError) {
      setMensaje("Error guardando foto en la base de datos");
      return;
    }

    setMensaje("Foto subida correctamente");
    cargarFotos();
  }

  async function borrarFoto(foto) {
    // 1️⃣ Borrar de Storage usando el nombre del archivo
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove([foto.archivo]);

    if (storageError) {
      setMensaje("Error borrando foto del almacenamiento");
      return;
    }

    // 2️⃣ Borrar de la tabla
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
      // Quitar principal de todas
      await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", id);

      // Marcar esta como principal
      await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id);

      setMensaje("Foto marcada como principal");
      cargarFotos();
    } catch (e) {
      setMensaje("Error marcando foto como principal");
    }
  }

  return (
    <Menu>
      <div style={contenedor}>
        <h1 style={titulo}>Fotos de la Inspección</h1>

        {mensaje && <p style={mensajeEstilo}>{mensaje}</p>}

        {/* Botón subir foto */}
        <label style={botonSubir}>
          Subir foto
          <input type="file" accept="image/*" onChange={subirFoto} style={{ display: "none" }} />
        </label>

        {/* Grid de fotos */}
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
