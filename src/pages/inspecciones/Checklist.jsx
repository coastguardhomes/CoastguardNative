import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cargar inspección
  useEffect(() => {
    async function cargarInspeccion() {
      const { data } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setInspeccion(data);
        if (data.observaciones) setObservaciones(data.observaciones);
      }
    }

    cargarInspeccion();
  }, [id]);

  // Cargar checklist asegurando la plantilla completa
  useEffect(() => {
    async function cargarChecklist() {
      setLoading(true);
      const { data, error } = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", id);

      if (error) {
        setMensaje("Error cargando checklist de Supabase");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        const plantilla = [
          "Puerta principal cerrada correctamente",
          "Cerraduras sin daños",
          "Ventanas cerradas",
          "Persianas bajadas o en posición correcta",
          "Rejas sin daños",
          "Comprobación de alarma (si existe)",
          "Comprobación de sensores de movimiento",
          "Comprobación de llaves en su lugar",
          "Accesos exteriores revisados (puertas jardín, trastero, garaje)",
          "Ausencia de humedades en paredes",
          "Ausencia de humedades en techos",
          "Ausencia de manchas nuevas",
          "Ausencia de filtraciones en ventanas",
          "Ausencia de filtraciones en puertas",
          "Ausencia de filtraciones en terraza",
          "Ausencia de filtraciones en sótano",
          "Ausencia de condensación en cristales",
          "Ausencia de olores a humedad",
          "Cuadro eléctrico sin disparos",
          "Luces funcionando correctamente",
          "Interruptores sin daños",
          "Enchufes sin quemaduras",
          "Electrodomésticos con corriente",
          "Aire acondicionado funcionando",
          "Calefacción funcionando",
          "Ausencia de chispazos o ruidos eléctricos",
          "Grifos funcionando",
          "Presión correcta",
          "Ausencia de fugas visibles",
          "Ausencia de fugas en baños",
          "Ausencia de fugas en cocina",
          "Ausencia de fugas en calentador",
          "Cisterna funcionando",
          "Agua caliente funcionando",
          "Ausencia de malos olores en desagües",
          "Ausencia de polvo excesivo",
          "Ausencia de suciedad en suelos",
          "Ausencia de basura",
          "Ausencia de objetos fuera de lugar",
          "Ausencia de insectos muertos",
          "Ausencia de manchas nuevas",
          "Ausencia de roturas visibles",
          "Ausencia de cristales rotos",
          "Ausencia de daños en mobiliario",
          "Estado general del jardín",
          "Ramas caídas",
          "Objetos movidos por viento",
          "Mobiliario exterior en su sitio",
          "Ausencia de daños en vallas",
          "Ausencia de daños en puertas exteriores",
          "Ausencia de daños en pérgolas",
          "Ausencia de daños en toldos",
          "Nivel de agua correcto",
          "Agua sin turbidez",
          "Bomba funcionando",
          "Skimmer limpio",
          "Ausencia de objetos en piscina",
          "Ausencia de fugas visibles",
          "Tapa del motor cerrada",
          "Cuadro eléctrico de piscina sin disparos",
          "Ausencia de hormigas",
          "Ausencia de cucarachas",
          "Ausencia de roedores",
          "Ausencia de nidos de insectos",
          "Ausencia de excrementos de animales",
          "Ausencia de mosquitos acumulados",
          "Ausencia de telarañas excesivas",
          "Ausencia de grietas nuevas",
          "Ausencia de pintura levantada",
          "Ausencia de baldosas sueltas",
          "Ausencia de puertas descolgadas",
          "Ausencia de muebles rotos",
          "Ausencia de fugas en electrodomésticos",
          "Ausencia de daños por tormenta",
          "Ausencia de daños por viento",
          "Aire acondicionado funcionando",
          "Agua caliente funcionando",
          "Limpieza ligera correcta",
          "Baño revisado",
          "Cocina revisada",
          "Camas revisadas",
          "Terraza revisada",
          "Fotos finales tomadas"
        ];

        const nuevosItems = plantilla.map((texto) => ({
          inspeccion_id: id,
          item: texto,
          completado: false,
        }));

        const { error: insertError } = await supabase.from("checklist_inspeccion").insert(nuevosItems);
        
        if (insertError) {
          setMensaje("Error al inicializar la plantilla de ítems.");
          setLoading(false);
          return;
        }

        const { data: dataFinal } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", id);

        setItems(dataFinal || []);
      } else {
        setItems(data);
      }

      setLoading(false);
    }

    cargarChecklist();
  }, [id]);

  // Actualizar OK/KO
  async function actualizarItem(itemId, completado) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completado } : i))
    );

    await supabase
      .from("checklist_inspeccion")
      .update({ completado })
      .eq("id", itemId);
  }

  // Procesar y subir imagen a Supabase Storage
  async function procesarYSubirImagen(base64String) {
    try {
      setMensaje("Subiendo foto...");
      const base64 = `data:image/jpeg;base64,${base64String}`;
      const blob = await (await fetch(base64)).blob();
      const nombreArchivo = `checklist_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, { contentType: "image/jpeg" });

      if (storageError) {
        setMensaje("Error al subir archivo al storage");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      await supabase.from("fotos_inspeccion").insert({
        inspeccion_id: id,
        archivo: nombreArchivo,
        url: urlData.publicUrl,
        principal: false,
        tipo: "checklist",
      });

      setMensaje("¡Foto guardada correctamente!");
      setTimeout(() => setMensaje(""), 3000);
    } catch (e) {
      setMensaje("Error procesando la imagen");
    }
  }

  // Tomar foto con la Cámara
  async function tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 75,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      if (image.base64String) {
        await procesarYSubirImagen(image.base64String);
      }
    } catch (e) {
      setMensaje("Cámara cancelada o no disponible");
    }
  }

  // Seleccionar foto de la Galería
  async function seleccionarDeGaleria() {
    try {
      const image = await Camera.getPhoto({
        quality: 75,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });
      if (image.base64String) {
        await procesarYSubirImagen(image.base64String);
      }
    } catch (e) {
      setMensaje("Galería cancelada o no disponible");
    }
  }

  // Guardar checklist completo
  async function guardarChecklistCompleto() {
    setGuardando(true);
    setMensaje("");

    const todoOk = items.length > 0 && items.every((i) => i.completado === true);

    await supabase
      .from("inspecciones")
      .update({
        observaciones,
        checklist_completado: todoOk,
        fecha_checklist: new Date().toISOString(),
        estado: todoOk ? "checklist_completado" : "checklist_incompleto",
      })
      .eq("id", id);

    navigate(`/inspecciones/fotos/${id}`);
    setGuardando(false);
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
            fontSize: "18px",
          }}
        >
          Cargando checklist completo...
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
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "15px",
            fontSize: "26px",
            fontWeight: "700",
          }}
        >
          Checklist de Inspección ({items.length} puntos)
        </h1>

        {mensaje && (
          <div style={{ marginBottom: "15px", padding: "10px", background: "rgba(77,184,255,0.1)", border: "1px solid #4db8ff", borderRadius: "8px", color: "#4db8ff", fontWeight: "600" }}>
            {mensaje}
          </div>
        )}

        {/* BOTONES MULTIMEDIA SUPERIORES */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={tomarFoto}
            style={{
              flex: 1,
              padding: "12px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            📸 Hacer Foto
          </button>
          <button
            onClick={seleccionarDeGaleria}
            style={{
              flex: 1,
              padding: "12px",
              background: "#2ecc71",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            🖼️ Galería
          </button>
        </div>

        {items.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              marginBottom: "15px",
              background: "rgba(255,255,255,0.05)",
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "600" }}>
              {index + 1}. {item.item}
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => actualizarItem(item.id, true)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: item.completado ? "#2ecc71" : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✓ OK
              </button>

              <button
                onClick={() => actualizarItem(item.id, false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: !item.completado && item.completado !== null ? "#e74c3c" : "rgba(255,215,0,0.15)",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✗ Pendiente / KO
              </button>
            </div>
          </div>
        ))}

        <textarea
          placeholder="Observaciones de la inspección..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            marginTop: "15px",
            padding: "12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.18)",
            fontSize: "15px",
          }}
        />

        <button
          onClick={guardarChecklistCompleto}
          disabled={guardando}
          style={{
            marginTop: "15px",
            padding: "14px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? "Guardando..." : "Guardar checklist completo"}
        </button>

        <h2
          style={{
            marginTop: "30px",
            color: "#4db8ff",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Acciones de Cierre
        </h2>

        <button
          onClick={() => navigate(`/inspecciones/fotos/${id}`)}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            fontWeight: "700",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Ver Gestor de Fotos
        </button>

        <button
          onClick={() => navigate(`/inspecciones/firma/${id}`)}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            fontWeight: "700",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Firma del cliente
        </button>

        <button
          onClick={() => navigate(`/inspecciones/pdf/${id}`)}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            fontWeight: "700",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          Generar PDF
        </button>
      </div>
    </Menu>
  );
}
