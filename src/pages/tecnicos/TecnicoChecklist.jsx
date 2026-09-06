import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

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

  function limpiarTexto(txt) {
    return txt
      .replace(/\u2028|\u2029/g, "\n")
      .replace(/[^\x00-\x7F]/g, "")
      .trim();
  }

  // Cargar inspección + vivienda + cliente
  useEffect(() => {
    async function cargarDatos() {
      const { data: insp } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (!insp) {
        setMensaje("No se encontró la inspección.");
        return;
      }

      setInspeccion(insp);
      if (insp.observaciones) setObservaciones(insp.observaciones);

      // Cargar vivienda REAL
      const { data: viv } = await supabase
        .from("viviendas")
        .select("id, nombre, direccion, cliente_id")
        .eq("id", insp.vivienda_id)
        .single();

      let clienteNombre = "Sin cliente asignado";

      // Cliente REAL desde inspecciones.cliente_id
      if (insp.cliente_id) {
        const { data: cli } = await supabase
          .from("clientes")
          .select("nombre")
          .eq("id", insp.cliente_id)
          .maybeSingle();

        if (cli?.nombre) clienteNombre = cli.nombre;
      }

      setViviendaInfo({
        nombre: viv?.nombre || viv?.direccion || "Vivienda",
        direccion: viv?.direccion || "Sin dirección",
        cliente: clienteNombre,
      });
    }

    cargarDatos();
  }, [id]);

  // Cargar checklist
  useEffect(() => {
    async function cargarChecklist() {
      setLoading(true);

      let { data } = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", id);

      if (!data || data.length === 0) {
        const plantilla = [
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

        const nuevosItems = plantilla.map((texto) => ({
          inspeccion_id: id,
          item: texto,
          completado: false,
        }));

        await supabase.from("checklist_inspeccion").insert(nuevosItems);

        const { data: recargado } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", id);

        data = recargado;
      }

      setItems(data);
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

  // Subida de fotos (versión que funcionaba)
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
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (storageError) {
        setMensaje("Error Storage: " + storageError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      const { error: insertError } = await supabase
        .from("fotos_inspeccion")
        .insert({
          inspeccion_id: id,
          archivo: nombreArchivo,
          url: urlData.publicUrl,
          principal: false,
          tipo: "checklist",
        });

      if (insertError) {
        setMensaje("Error BD fotos: " + insertError.message);
        return;
      }

      setMensaje("Foto guardada correctamente");
      setTimeout(() => setMensaje(""), 2000);
    } catch (e) {
      setMensaje("Error al procesar la foto");
    }
  }

  async function tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image.base64String) procesarYSubirImagen(image.base64String);
    } catch {
      setMensaje("Cámara cancelada");
    }
  }

  async function seleccionarDeGaleria() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      if (image.base64String) procesarYSubirImagen(image.base64String);
    } catch {
      setMensaje("Galería cancelada");
    }
  }

  // Guardar checklist
  async function guardarChecklistCompleto() {
    setGuardando(true);

    const textoLimpio = limpiarTexto(observaciones);
    const todoOk = items.every((i) => i.completado === true);

    await supabase
      .from("inspecciones")
      .update({
        observaciones: textoLimpio,
        checklist_completado: todoOk,
        fecha_checklist: new Date().toISOString(),

        // ⭐ ESTA LÍNEA HACE QUE DESAPAREZCA DEL DASHBOARD TÉCNICO
        estado: "finalizada",
      })
      .eq("id", id);

    setGuardando(false);
    navigate(`/tecnico/inspeccion/${id}`);
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            minHeight: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando checklist...</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "20px",
          color: "#fff",
          paddingBottom: "100px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ ...TEXTO_DORADO_BRILLO, fontSize: "18px", fontWeight: "900" }}>
            Checklist Técnico ({items.length} puntos)
          </h1>

          <button
            onClick={() => navigate(`/tecnico/inspeccion/${id}`)}
            style={{
              background: "transparent",
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              padding: "6px 12px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>
        </div>

        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            boxShadow: SOMBRA_LUXURY,
          }}
        >
          <div>🏠 <strong style={{ color: COLOR_DORADO }}>Vivienda:</strong> {viviendaInfo.nombre}</div>
          <div>📍 <strong style={{ color: COLOR_DORADO }}>Dirección:</strong> {viviendaInfo.direccion}</div>
          <div>👤 <strong style={{ color: COLOR_DORADO }}>Cliente:</strong> {viviendaInfo.cliente}</div>
        </div>

        {mensaje && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: "rgba(224, 176, 52, 0.15)",
              border: BORDE_DORADO_FINO,
              borderRadius: "12px",
              color: COLOR_DORADO,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={tomarFoto}
            style={{
              flex: 1,
              padding: "12px",
              background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
              color: "#fff",
              borderRadius: "12px",
              border: BORDE_DORADO_FINO,
              fontWeight: "900",
            }}
          >
            📸 Hacer Foto
          </button>

          <button
            onClick={seleccionarDeGaleria}
            style={{
              flex: 1,
              padding: "12px",
              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              color: "#fff",
              borderRadius: "12px",
              border: "1px solid rgba(16, 185, 129, 0.6)",
              fontWeight: "900",
            }}
          >
            🖼️ Galería
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                background: FONDO_TARJETA,
                padding: "16px",
                borderRadius: "16px",
                border: BORDE_DORADO_FINO,
                boxShadow: SOMBRA_LUXURY,
              }}
            >
              <p style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "700" }}>
                {index + 1}. {item.item}
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => actualizarItem(item.id, true)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: item.completado ? "#10b981" : "rgba(11, 19, 32, 0.9)",
                    color: item.completado ? "#fff" : COLOR_DORADO,
                    borderRadius: "10px",
                    border: item.completado ? "1px solid #10b981" : BORDE_DORADO_FINO,
                    fontWeight: "900",
                  }}
                >
                  ✓ OK
                </button>

                <button
                  onClick={() => actualizarItem(item.id, false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: !item.completado ? "#ef4444" : "rgba(11, 19, 32, 0.9)",
                    color: !item.completado ? "#fff" : "#ef4444",
                    borderRadius: "10px",
                    border: !item.completado ? "1px solid #ef4444" : "1px solid rgba(239, 68, 68, 0.4)",
                    fontWeight: "900",
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
            minHeight: "100px",
            marginTop: "20px",
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(11, 19, 32, 0.8)",
            color: "#fff",
            border: BORDE_DORADO_FINO,
            fontSize: "14px",
          }}
        />

        <button
          onClick={guardarChecklistCompleto}
          disabled={guardando}
          style={{
            width: "100%",
            padding: "14px",
            background: guardando
              ? "rgba(255,255,255,0.08)"
              : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
            color: guardando ? "#64748b" : "#ffffff",
            borderRadius: "16px",
            border: "1px solid rgba(16, 185, 129, 0.6)",
            fontWeight: "900",
            marginTop: "30px",
            cursor: guardando ? "not-allowed" : "pointer",
          }}
        >
          {guardando ? "Guardando..." : "✅ Guardar y Finalizar Checklist"}
        </button>
      </div>
    </Menu>
  );
}
