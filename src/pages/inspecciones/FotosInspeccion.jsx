import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

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

  async function subirFoto() {
    try {
      // 📸 Cámara REAL con Capacitor
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();

      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
        });

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
            url: urlData.publicUrl,
            principal: false,
          },
        ]);

      if (dbError) {
        setMensaje("Error guardando foto en la base de datos");
        return;
      }

      await supabase
        .from("inspecciones")
        .update({
          fecha_fotos: new Date().toISOString(),
          estado: "fotos_completadas",
        })
        .eq("id", id);

      setMensaje("Foto subida correctamente");
      cargarFotos();
    } catch (e) {
      console.error(e);
      setMensaje("Error tomando foto");
    }
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

        <button onClick={subirFoto} style={botonSubir}>
          Tomar foto
        </button>

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

        <button onClick={continuarAFirma} style={botonContinuar}>
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
  width: "100%",
  padding: "14px",
  background: "#4db8ff",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "20px",
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

const botonContinuar = {
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
};
