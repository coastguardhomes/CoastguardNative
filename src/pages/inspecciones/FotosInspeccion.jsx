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
  const [fotoGrande, setFotoGrande] = useState(null);

  useEffect(() => {
    cargarFotosInspeccion();
  }, [id]);

  async function cargarFotosInspeccion() {
    setLoading(true);
    setMensaje("");

    try {
      // 1️⃣ Consultar los registros de la base de datos
      const { data, error } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", String(id))
        .order("id", { ascending: false });

      if (error) {
        console.error("Error BD fotos:", error);
        setMensaje("Error cargando fotos: " + error.message);
        setLoading(false);
        return;
      }

      // 2️⃣ Mapear y asegurar que cada foto tenga una URL pública válida
      const fotosProcesadas = (data || []).map((foto) => {
        let urlFinal = foto.url;

        // Si no hay URL directa o el path guardado es relativo, reconstruir con Supabase Storage
        if (!urlFinal || !urlFinal.startsWith("http")) {
          const nombreArchivo = foto.archivo || foto.url_storage_o_path;
          if (nombreArchivo) {
            const { data: pubUrl } = supabase.storage
              .from("fotos")
              .getPublicUrl(nombreArchivo);
            urlFinal = pubUrl?.publicUrl || "";
          }
        }

        return {
          ...foto,
          url: urlFinal,
        };
      });

      setFotos(fotosProcesadas);
    } catch (err) {
      console.error("Error inesperado al cargar fotos:", err);
      setMensaje("Error al procesar la galería de fotos.");
    } finally {
      setLoading(false);
    }
  }

  async function subirFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) return;

      setMensaje("Subiendo foto...");

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();
      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      // Subir archivo físico al Storage
      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (storageError) {
        console.error("Storage Error:", storageError);
        setMensaje("Error al subir imagen al servidor: " + storageError.message);
        return;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      const publicUrl = urlData?.publicUrl || "";

      // Guardar referencia en la tabla fotos_inspeccion
      const { error: insertError } = await supabase
        .from("fotos_inspeccion")
        .insert([
          {
            inspeccion_id: String(id),
            archivo: nombreArchivo,
            url: publicUrl,
            principal: false,
            tipo: "inspeccion",
          },
        ]);

      if (insertError) {
        console.error("Insert Error:", insertError);
        setMensaje("Error guardando en BD: " + insertError.message);
        return;
      }

      setMensaje("¡Foto subida con éxito! ✔");
      setTimeout(() => setMensaje(""), 3000);

      // Recargar lista
      cargarFotosInspeccion();
    } catch (e) {
      console.error("Error en cámara:", e);
      setMensaje("Operación de cámara cancelada o con error.");
    }
  }

  async function borrarFoto(foto) {
    if (!window.confirm("¿Seguro que quieres eliminar esta foto?")) return;

    // 1. Borrar de la base de datos
    const { error } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    if (error) {
      setMensaje("Error al eliminar foto de la base de datos");
      return;
    }

    // 2. Intentar borrar del Storage si existe el nombre de archivo
    if (foto.archivo) {
      await supabase.storage.from("fotos").remove([foto.archivo]);
    }

    cargarFotosInspeccion();
  }

  async function marcarPrincipal(foto) {
    await supabase
      .from("fotos_inspeccion")
      .update({ principal: false })
      .eq("inspeccion_id", String(id));

    await supabase
      .from("fotos_inspeccion")
      .update({ principal: true })
      .eq("id", foto.id);

    cargarFotosInspeccion();
  }

  return (
    <Menu>
      <div style={contenedor}>
        <h1 style={titulo}>Galería de Fotos de la Inspección</h1>

        {mensaje && <p style={mensajeEstilo}>{mensaje}</p>}

        <button onClick={subirFoto} style={botonSubir}>
          📸 Tomar foto
        </button>

        {fotoGrande && (
          <div style={contenedorGrande}>
            <img src={fotoGrande.url} alt="Grande" style={imagenGrandeEstilo} />
            <button
              onClick={() => setFotoGrande(null)}
              style={botonCerrarGrande}
            >
              Cerrar foto
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", color: "#4db8ff" }}>
            Cargando fotos...
          </p>
        ) : fotos.length === 0 ? (
          <p style={vacioEstilo}>
            No hay fotos registradas para esta inspección todavía.
          </p>
        ) : (
          <div style={grid}>
            {fotos.map((foto) => (
              <div key={foto.id} style={card}>
                <img
                  src={foto.url}
                  alt="Inspección"
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: foto.principal
                      ? "3px solid #4ade80"
                      : "2px solid #4db8ff",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setFotoGrande(foto)}
                  onError={(e) => {
                    console.error("Error al renderizar imagen:", foto.url);
                    e.target.src =
                      "https://via.placeholder.com/150?text=Error+Carga";
                  }}
                />
                <button
                  onClick={() => marcarPrincipal(foto)}
                  style={{
                    ...boton,
                    background: foto.principal ? "#4ade80" : "#4db8ff",
                  }}
                >
                  {foto.principal ? "Principal ✔" : "Hacer principal"}
                </button>
                <button onClick={() => borrarFoto(foto)} style={botonEliminar}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* RUTAS CORREGIDAS PARA ROL TÉCNICO */}
        <button
          onClick={() => navigate(`/tecnico/inspeccion/${id}/checklist`)}
          style={botonContinuar}
        >
          Ir a Checklist ➔
        </button>

        <button
          onClick={() => navigate(`/tecnico/inspeccion/${id}`)}
          style={botonVolver}
        >
          Volver a la inspección
        </button>
      </div>
    </Menu>
  );
}

const contenedor = {
  padding: "20px",
  background: "#0a0f1a",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Inter, sans-serif",
  paddingBottom: "100px",
};
const titulo = {
  fontSize: "22px",
  fontWeight: "700",
  marginBottom: "20px",
  color: "#4db8ff",
  textAlign: "center",
};
const mensajeEstilo = {
  marginBottom: "15px",
  color: "#4db8ff",
  fontWeight: "600",
  textAlign: "center",
};
const botonSubir = {
  width: "100%",
  padding: "14px",
  background: "#4db8ff",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  marginBottom: "20px",
};
const contenedorGrande = {
  marginBottom: "25px",
  textAlign: "center",
  background: "rgba(255,255,255,0.05)",
  padding: "20px",
  borderRadius: "14px",
};
const imagenGrandeEstilo = {
  width: "100%",
  maxHeight: "400px",
  objectFit: "contain",
  borderRadius: "10px",
  marginBottom: "15px",
};
const botonCerrarGrande = {
  padding: "12px",
  background: "#4db8ff",
  border: "none",
  borderRadius: "10px",
  color: "#000",
  cursor: "pointer",
  fontWeight: "700",
  width: "100%",
};
const vacioEstilo = { textAlign: "center", color: "#a0aec0", margin: "20px 0" };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "20px",
};
const card = {
  background: "rgba(255,255,255,0.05)",
  padding: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  textAlign: "center",
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
  padding: "12px",
  background: "#ff4444",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
};
const botonContinuar = {
  marginTop: "30px",
  padding: "14px",
  width: "100%",
  background: "#4ade80",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  fontSize: "17px",
  cursor: "pointer",
};
const botonVolver = {
  marginTop: "12px",
  padding: "14px",
  width: "100%",
  background: "transparent",
  color: "#4db8ff",
  borderRadius: "10px",
  border: "1px solid #4db8ff",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
};
