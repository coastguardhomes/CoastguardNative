import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function ChecklistUnificado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [viviendaInfo, setViviendaInfo] = useState({
    nombre: "Cargando...",
    direccion: "",
    cliente: "Sin cliente asignado",
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  // 1. Cargar inspección y datos de la vivienda/cliente real
  useEffect(() => {
    async function cargarDatosInspeccion() {
      try {
        const { data: insp, error: inspError } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .single();

        if (inspError || !insp) {
          setMensaje("No se encontró la inspección.");
          return;
        }

        setInspeccion(insp);
        if (insp.observaciones) setObservaciones(insp.observaciones);

        if (insp.vivienda_id) {
          const { data: viv } = await supabase
            .from("viviendas")
            .select("*, clientes(nombre)")
            .eq("id", insp.vivienda_id)
            .single();

          if (viv) {
            setViviendaInfo({
              nombre: viv.nombre || viv.direccion || "Vivienda",
              direccion: viv.direccion || "Sin dirección",
              cliente: viv.clientes?.nombre || viv.cliente || "Cliente asignado",
            });
          }
        }
      } catch (e) {
        console.error("Error cargando metadatos:", e);
      }
    }

    if (id) cargarDatosInspeccion();
  }, [id]);

  // 2. Cargar o generar los ítems del checklist
  useEffect(() => {
    async function gestionarChecklist() {
      setLoading(true);

      let { data, error } = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", String(id));

      if (error) {
        console.error("Error checklist:", error);
        setMensaje("Error conectando con la tabla checklist_inspeccion");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        const plantillaCompleta = [
          "Puerta principal cerrada y asegurada correctamente",
          "Cerraduras y bombines sin daños aparentes",
          "Ventanas y ventanales cerrados y bloqueados",
          "Persianas bajadas o en posición de seguridad",
          "Rejas exteriores sin indicios de fuerza o daños",
          "Comprobación de sistema de alarma activo",
          "Sensores de movimiento limpios y operativos",
          "Comprobación de llaves de repuesto en su lugar",
          "Accesos exteriores revisados (jardín, trastero, garaje)",
          "Ausencia total de humedades o filtraciones en paredes",
          "Ausencia de humedades o manchas en techos",
          "Cuadro eléctrico principal sin interruptores disparados",
          "Luces e interruptores funcionando correctamente",
          "Enchufes sin marcas de quemaduras ni holguras",
          "Electrodomésticos con suministro eléctrico correcto",
          "Grifos y llaves de paso funcionando sin goteos",
          "Presión de agua correcta en red general",
          "Ausencia de fugas visibles en baños y cocina",
          "Cisterna de WC funcionando y cargando bien",
          "Desagües limpios y ausencia de malos olores",
          "Estado general del jardín y limpieza de exteriores",
          "Piscina: nivel de agua correcto y bomba operativa",
          "Ausencia de plagas (insectos, hormigas o roedores)",
          "Limpieza ligera y ausencia de basura interior",
          "Estado general del mobiliario y cristales sin roturas",
        ];

        const nuevosItems = plantillaCompleta.map((texto) => ({
          inspeccion_id: String(id),
          item: texto,
          completado: false,
        }));

        const { error: insertError } = await supabase
          .from("checklist_inspeccion")
          .insert(nuevosItems);

        if (insertError) {
          setMensaje("Error generando plantilla: " + insertError.message);
          setLoading(false);
          return;
        }

        const { data: dataRecargada } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", String(id));

        data = dataRecargada || [];
      }

      setItems(data);
      setLoading(false);
    }

    if (id) gestionarChecklist();
  }, [id]);

  // Actualizar OK / KO de un ítem
  async function actualizarItem(itemId, completado) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completado } : i))
    );

    await supabase
      .from("checklist_inspeccion")
      .update({ completado })
      .eq("id", itemId);
  }

  // Subida de fotos integrada
  async function procesarYSubirImagen(base64String) {
    try {
      setMensaje("Subiendo foto...");

      const base64Clean = base64String.includes("base64,")
        ? base64String.split("base64,")[1]
        : base64String;

      const byteCharacters = atob(base64Clean);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      const nombreArchivo = `checklist_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, { contentType: "image/jpeg", upsert: true });

      if (storageError) {
        setMensaje("Error Storage: " + storageError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      const { error: insertError } = await supabase.from("fotos_inspeccion").insert({
        inspeccion_id: String(id),
        archivo: nombreArchivo,
        url: urlData.publicUrl,
        principal: false,
        tipo: "checklist",
      });

      if (insertError) {
        setMensaje("Error al registrar foto en BD: " + insertError.message);
        return;
      }

      setMensaje("¡Foto guardada con éxito!");
      setTimeout(() => setMensaje(""), 3000);
    } catch (e) {
      console.error("Excepción al subir foto:", e);
      setMensaje("Error crítico al procesar la foto.");
    }
  }

  async function tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      if (image.base64String) await procesarYSubirImagen(image.base64String);
    } catch (e) {
      setMensaje("Cámara cancelada.");
    }
  }

  async function seleccionarDeGaleria() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });
      if (image.base64String) await procesarYSubirImagen(image.base64String);
    } catch (e) {
      setMensaje("Galería cancelada.");
    }
  }

  // CORREGIDO: Redirección post-guardado correcta
  async function guardarChecklistCompleto() {
    setGuardando(true);
    const todoOk = items.length > 0 && items.every((i) => i.completado === true);

    const { error } = await supabase
      .from("inspecciones")
      .update({
        observaciones,
        checklist_completado: todoOk,
        fecha_checklist: new Date().toISOString(),
        estado: todoOk ? "checklist_completado" : "checklist_incompleto",
      })
      .eq("id", String(id));

    if (error) {
      setMensaje("Error al guardar inspección: " + error.message);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    
    // Redirección corregida al detalle principal de la inspección
    navigate(`/tecnico/inspeccion/${id}`);
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#04070c",
            color: "#ffd700",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          Cargando puntos del checklist...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "16px",
          background: "#04070c",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "sans-serif",
          paddingBottom: "100px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h1 style={{ color: "#ffd700", fontSize: "18px", margin: 0 }}>
            Checklist Técnico ({items.length} puntos)
          </h1>
          <button
            onClick={() => navigate(`/tecnico/inspeccion/${id}`)}
            style={{
              background: "#16263f",
              border: "1px solid #d4af37",
              color: "#ffd700",
              padding: "6px 10px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>
        </div>

        <div
          style={{
            background: "#09101d",
            border: "1px solid #d4af37",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "15px",
            fontSize: "13px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            🏠 <strong style={{ color: "#ffd700" }}>Vivienda:</strong>{" "}
            {viviendaInfo.nombre}
          </div>
          <div style={{ marginBottom: "4px" }}>
            📍 <strong style={{ color: "#ffd700" }}>Dirección:</strong>{" "}
            {viviendaInfo.direccion}
          </div>
          <div>
            👤 <strong style={{ color: "#ffd700" }}>Cliente:</strong>{" "}
            {viviendaInfo.cliente}
          </div>
        </div>

        {mensaje && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px",
              background: "rgba(212,175,55,0.1)",
              border: "1px solid #ffd700",
              borderRadius: "6px",
              color: "#ffd700",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {mensaje}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
          <button
            onClick={tomarFoto}
            style={{
              flex: 1,
              padding: "10px",
              background: "#d4af37",
              color: "#070b12",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            📸 Hacer Foto
          </button>
          <button
            onClick={seleccionarDeGaleria}
            style={{
              flex: 1,
              padding: "10px",
              background: "#27ae60",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            🖼️ Galería
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                background: "#09101d",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #1e3050",
              }}
            >
              <p
                style={{
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                {index + 1}. {item.item}
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => actualizarItem(item.id, true)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: item.completado ? "#27ae60" : "#111b2e",
                    color: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #27ae60",
                    fontWeight: "bold",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  ✓ OK
                </button>

                <button
                  onClick={() => actualizarItem(item.id, false)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background:
                      !item.completado && item.completado !== null
                        ? "#e74c3c"
                        : "#111b2e",
                    color: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e74c3c",
                    fontWeight: "bold",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  ✗ KO / Pendiente
                </button>
              </div>
            </div>
          ))}
        </div>

        <textarea
          placeholder="Observaciones de la inspección..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          style={{
            width: "100%",
            minHeight: "90px",
            marginBottom: "15px",
            padding: "10px",
            borderRadius: "8px",
            background: "#09101d",
            color: "#fff",
            border: "1px solid #1e3050",
            fontSize: "13px",
          }}
        />

        <button
          onClick={guardarChecklistCompleto}
          disabled={guardando}
          style={{
            width: "100%",
            padding: "12px",
            background:
              "linear-gradient(to bottom, #f3e0aa 0%, #d4af37 50%, #b8860b 100%)",
            color: "#070b12",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          {guardando ? "Guardando..." : "✅ Guardar y Finalizar Checklist"}
        </button>
      </div>
    </Menu>
  );
}
