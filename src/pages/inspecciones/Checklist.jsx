import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarChecklist() {
      // 1️⃣ Cargar checklist existente
      const { data, error } = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error cargando checklist:", error);
        setMensaje("Error cargando checklist");
        setLoading(false);
        return;
      }

      // 2️⃣ Si no existe checklist → generarlo automáticamente
      if (!data || data.length === 0) {
        const plantilla = [
          // 🔐 Seguridad y accesos
          "Puerta principal cerrada correctamente",
          "Cerraduras sin daños",
          "Ventanas cerradas",
          "Persianas bajadas o en posición correcta",
          "Rejas sin daños",
          "Comprobación de alarma (si existe)",
          "Comprobación de sensores de movimiento",
          "Comprobación de llaves en su lugar",
          "Accesos exteriores revisados (puertas jardín, trastero, garaje)",

          // 💧 Humedades y filtraciones
          "Ausencia de humedades en paredes",
          "Ausencia de humedades en techos",
          "Ausencia de manchas nuevas",
          "Ausencia de filtraciones en ventanas",
          "Ausencia de filtraciones en puertas",
          "Ausencia de filtraciones en terraza",
          "Ausencia de filtraciones en sótano",
          "Ausencia de condensación en cristales",
          "Ausencia de olores a humedad",

          // 🔌 Electricidad
          "Cuadro eléctrico sin disparos",
          "Luces funcionando correctamente",
          "Interruptores sin daños",
          "Enchufes sin quemaduras",
          "Electrodomésticos con corriente",
          "Aire acondicionado funcionando",
          "Calefacción funcionando",
          "Ausencia de chispazos o ruidos eléctricos",

          // 🚰 Agua y fontanería
          "Grifos funcionando",
          "Presión correcta",
          "Ausencia de fugas visibles",
          "Ausencia de fugas en baños",
          "Ausencia de fugas en cocina",
          "Ausencia de fugas en calentador",
          "Cisterna funcionando",
          "Agua caliente funcionando",
          "Ausencia de malos olores en desagües",

          // 🧼 Limpieza y estado general
          "Ausencia de polvo excesivo",
          "Ausencia de suciedad en suelos",
          "Ausencia de basura",
          "Ausencia de objetos fuera de lugar",
          "Ausencia de insectos muertos",
          "Ausencia de manchas nuevas",
          "Ausencia de roturas visibles",
          "Ausencia de cristales rotos",
          "Ausencia de daños en mobiliario",

          // 🌿 Exterior / Jardín
          "Estado general del jardín",
          "Ramas caídas",
          "Objetos movidos por viento",
          "Mobiliario exterior en su sitio",
          "Ausencia de daños en vallas",
          "Ausencia de daños en puertas exteriores",
          "Ausencia de daños en pérgolas",
          "Ausencia de daños en toldos",

          // 🏊 Piscina
          "Nivel de agua correcto",
          "Agua sin turbidez",
          "Bomba funcionando",
          "Skimmer limpio",
          "Ausencia de objetos en piscina",
          "Ausencia de fugas visibles",
          "Tapa del motor cerrada",
          "Cuadro eléctrico de piscina sin disparos",

          // 🐜 Plagas
          "Ausencia de hormigas",
          "Ausencia de cucarachas",
          "Ausencia de roedores",
          "Ausencia de nidos de insectos",
          "Ausencia de excrementos de animales",
          "Ausencia de mosquitos acumulados",
          "Ausencia de telarañas excesivas",

          // 🔧 Daños y mantenimiento
          "Ausencia de grietas nuevas",
          "Ausencia de pintura levantada",
          "Ausencia de baldosas sueltas",
          "Ausencia de puertas descolgadas",
          "Ausencia de muebles rotos",
          "Ausencia de fugas en electrodomésticos",
          "Ausencia de daños por tormenta",
          "Ausencia de daños por viento",

          // 🧾 Preparación para llegada de cliente
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

        const { error: errorInsert } = await supabase
          .from("checklist_inspeccion")
          .insert(nuevosItems);

        if (errorInsert) {
          console.error("Error generando checklist:", errorInsert);
          setMensaje("No se pudo generar el checklist.");
          setLoading(false);
          return;
        }

        const { data: dataFinal } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", id)
          .order("id", { ascending: true });

        setItems(dataFinal);
      } else {
        setItems(data);
      }

      // 3️⃣ Cargar observaciones
      const { data: inspeccionData } = await supabase
        .from("inspecciones")
        .select("observaciones")
        .eq("id", id)
        .single();

      if (inspeccionData?.observaciones) {
        setObservaciones(inspeccionData.observaciones);
      }

      setLoading(false);
    }

    cargarChecklist();
  }, [id]);

  async function actualizarItem(itemId, completado) {
    const { error } = await supabase
      .from("checklist_inspeccion")
      .update({ completado })
      .eq("id", itemId);

    if (error) {
      console.error("Error actualizando ítem:", error);
      setMensaje("Error actualizando ítem");
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completado } : i))
    );
  }

  async function guardarChecklistCompleto() {
    setGuardando(true);
    setMensaje("");

    try {
      const todoOk = items.length > 0 && items.every((i) => i.completado === true);

      const { error: updateError } = await supabase
        .from("inspecciones")
        .update({
          observaciones,
          checklist_completado: todoOk,
          fecha_checklist: new Date().toISOString(),
          estado: todoOk ? "checklist_completado" : "checklist_incompleto",
        })
        .eq("id", id);

      if (updateError) {
        console.error(updateError);
        setMensaje("Error guardando checklist.");
      } else {
        setMensaje("Checklist guardado correctamente.");
        navigate(`/inspecciones/fotos/${id}`);
      }
    } catch (e) {
      console.error(e);
      setMensaje("Error guardando checklist.");
    }

    setGuardando(false);
  }

  if (loading) {
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
          Cargando checklist...
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
          }}
        >
          Checklist de Inspección
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

        {items.length === 0 ? (
          <p>No hay ítems en el checklist.</p>
        ) : (
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                }}
              >
                <p
                  style={{
                    marginBottom: "12px",
                    fontSize: "17px",
                    fontWeight: "600",
                  }}
                >
                  {item.item}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => actualizarItem(item.id, true)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: item.completado
                        ? "#4db8ff"
                        : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: item.completado
                        ? "0 0 10px rgba(0,153,255,0.4)"
                        : "none",
                    }}
                  >
                    ✓ OK
                  </button>

                  <button
                    onClick={() => actualizarItem(item.id, false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: item.completado
                        ? "rgba(255,255,255,0.08)"
                        : "red",
                      color: "#fff",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: item.completado
                        ? "none"
                        : "0 0 10px rgba(255,0,0,0.4)",
                    }}
                  >
                    ✗ KO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <textarea
          placeholder="Observaciones de la inspección..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            marginTop: "20px",
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
            opacity: guardando ? 0.6 : 1,
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          {guardando ? "Guardando..." : "Guardar checklist completo"}
        </button>

        <h2
          style={{
            marginTop: "30px",
            color: "#4db8ff",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          Acciones
        </h2>

        <button
          onClick={() => navigate(`/inspecciones/fotos/${id}`)}
          style={{
            marginTop: "10px",
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
          }}
        >
          Fotos
        </button>

        <button
          onClick={() => navigate(`/inspecciones/firma/${id}`)}
          style={{
            marginTop: "10px",
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
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Generar PDF
        </button>
      </div>
    </Menu>
  );
}
