import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { useLanguage } from "../../context/LanguageContext";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY =
"0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = {
color: COLOR_DORADO,
textShadow: "0 0 12px rgba(224, 176, 52, 0.6)",
};

const PLANTILLA_CHECKLIST = [
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

const TEXTOS_CHECKLIST = {
loading: {
es: "Cargando checklist...",
en: "Loading checklist...",
fr: "Chargement de la liste de contrôle...",
},
noPermission: {
es: "No tienes permiso para acceder a esta inspección.",
en: "You do not have permission to access this inspection.",
fr: "Vous n’avez pas l’autorisation d’accéder à cette inspection.",
},
backPanel: {
es: "Volver al panel",
en: "Back to dashboard",
fr: "Retour au tableau de bord",
},
title: {
es: "Checklist Técnico",
en: "Technician checklist",
fr: "Liste de contrôle du technicien",
},
points: {
es: "puntos",
en: "items",
fr: "points",
},
back: {
es: "← Volver",
en: "← Back",
fr: "← Retour",
},
home: {
es: "Vivienda:",
en: "Property:",
fr: "Logement :",
},
address: {
es: "Dirección:",
en: "Address:",
fr: "Adresse :",
},
client: {
es: "Cliente:",
en: "Client:",
fr: "Client :",
},
takePhoto: {
es: "📸 Hacer Foto",
en: "📸 Take photo",
fr: "📸 Prendre une photo",
},
gallery: {
es: "🖼️ Galería",
en: "🖼️ Gallery",
fr: "🖼️ Galerie",
},
photos: {
es: "Fotografías",
en: "Photos",
fr: "Photos",
},
noPhotos: {
es: "Todavía no hay fotografías disponibles para esta inspección.",
en: "No photos are available for this inspection yet.",
fr: "Aucune photo n’est encore disponible pour cette inspection.",
},
refreshPhotos: {
es: "Actualizar fotografías",
en: "Refresh photos",
fr: "Actualiser les photos",
},
observations: {
es: "Observaciones de la inspección...",
en: "Inspection notes...",
fr: "Observations de l’inspection...",
},
saving: {
es: "Guardando...",
en: "Saving...",
fr: "Enregistrement...",
},
uploading: {
es: "Subiendo foto...",
en: "Uploading photo...",
fr: "Envoi de la photo...",
},
submit: {
es: "✅ Guardar y Enviar a Administración",
en: "✅ Save and Send to Administration",
fr: "✅ Enregistrer et envoyer à l’administration",
},
ok: {
es: "✓ OK",
en: "✓ OK",
fr: "✓ OK",
},
notOk: {
es: "✗ KO / Pendiente",
en: "✗ Not OK / Pending",
fr: "✗ Non conforme / En attente",
},
photoSaved: {
es: "Foto guardada correctamente",
en: "Photo saved successfully",
fr: "Photo enregistrée avec succès",
},
sentReview: {
es: "Checklist guardado y enviado a administración para revisión.",
en: "Checklist saved and sent to administration for review.",
fr: "Liste enregistrée et envoyée à l’administration pour vérification.",
},
propertyLoading: {
es: "Cargando...",
en: "Loading...",
fr: "Chargement...",
},
noClient: {
es: "Sin cliente asignado",
en: "No client assigned",
fr: "Aucun client attribué",
},
noAddress: {
es: "Sin dirección",
en: "No address",
fr: "Aucune adresse",
},
property: {
es: "Vivienda",
en: "Property",
fr: "Logement",
},
unassigned: {
es: "Vivienda no asignada",
en: "Unassigned property",
fr: "Logement non attribué",
},
};

const TRADUCCIONES_PUNTOS_CHECKLIST = {
"Puerta principal cerrada y asegurada correctamente": {
en: "Main door closed and securely locked",
fr: "Porte d’entrée fermée et correctement verrouillée",
},
"Cerraduras y bombines sin daños aparentes": {
en: "Locks and cylinders show no apparent damage",
fr: "Serrures et cylindres sans dommages apparents",
},
"Ventanas y ventanales cerrados y bloqueados": {
en: "Windows and large windows closed and locked",
fr: "Fenêtres et baies vitrées fermées et verrouillées",
},
"Persianas bajadas o en posición de seguridad": {
en: "Shutters lowered or in a secure position",
fr: "Volets baissés ou en position de sécurité",
},
"Rejas exteriores sin indicios de fuerza o daños": {
en: "No signs of forced entry or damage to exterior bars",
fr: "Grilles extérieures sans trace d’effraction ni dommage",
},
"Comprobación de sistema de alarma activo": {
en: "Check that the alarm system is active",
fr: "Vérifier que le système d’alarme est actif",
},
"Sensores de movimiento limpios y operativos": {
en: "Motion sensors clean and operational",
fr: "Détecteurs de mouvement propres et opérationnels",
},
"Comprobación de llaves de repuesto en su lugar": {
en: "Check that spare keys are in their designated place",
fr: "Vérifier que les clés de rechange sont à leur place",
},
"Accesos exteriores revisados (jardín, trastero, garaje)": {
en: "Exterior access points checked (garden, storage room, garage)",
fr: "Accès extérieurs vérifiés (jardin, débarras, garage)",
},
"Ausencia total de humedades o filtraciones en paredes": {
en: "No dampness or leaks on walls",
fr: "Absence d’humidité ou d’infiltrations sur les murs",
},
"Ausencia de humedades o manchas en techos": {
en: "No dampness or stains on ceilings",
fr: "Absence d’humidité ou de taches au plafond",
},
"Cuadro eléctrico principal sin interruptores disparados": {
en: "No tripped breakers in the main electrical panel",
fr: "Aucun disjoncteur déclenché dans le tableau électrique principal",
},
"Luces e interruptores funcionando correctamente": {
en: "Lights and switches working correctly",
fr: "Éclairage et interrupteurs fonctionnant correctement",
},
"Enchufes sin marcas de quemaduras ni holguras": {
en: "Sockets show no burn marks or looseness",
fr: "Prises sans traces de brûlure ni jeu",
},
"Electrodomésticos con suministro eléctrico correcto": {
en: "Appliances have a proper power supply",
fr: "Alimentation électrique correcte des appareils",
},
"Grifos y llaves de paso funcionando sin goteos": {
en: "Taps and shut-off valves work without dripping",
fr: "Robinets et vannes fonctionnant sans gouttes",
},
"Presión de agua correcta en red general": {
en: "Correct water pressure in the main supply",
fr: "Pression d’eau correcte dans le réseau général",
},
"Ausencia de fugas visibles en baños y cocina": {
en: "No visible leaks in bathrooms or kitchen",
fr: "Aucune fuite visible dans les salles de bains et la cuisine",
},
"Cisterna de WC funcionando y cargando bien": {
en: "Toilet cistern works and refills correctly",
fr: "Chasse d’eau fonctionnant et se remplissant correctement",
},
"Desagües limpios y ausencia de malos olores": {
en: "Drains are clear and there are no unpleasant odours",
fr: "Évacuations propres et absence de mauvaises odeurs",
},
"Estado general del jardín y limpieza de exteriores": {
en: "General garden condition and outdoor cleanliness",
fr: "État général du jardin et propreté des extérieurs",
},
"Piscina: nivel de agua correcto y bomba operativa": {
en: "Pool: correct water level and pump operational",
fr: "Piscine : niveau d’eau correct et pompe opérationnelle",
},
"Ausencia de plagas (insectos, hormigas o roedores)": {
en: "No pests (insects, ants or rodents)",
fr: "Absence de nuisibles (insectes, fourmis ou rongeurs)",
},
"Limpieza ligera y ausencia de basura interior": {
en: "Light cleaning and no rubbish indoors",
fr: "Nettoyage léger et absence de déchets à l’intérieur",
},
"Estado general del mobiliario y cristales sin roturas": {
en: "General furniture condition and no broken glass",
fr: "État général du mobilier et absence de vitres cassées",
},
};

export default function TecnicoChecklist() {
const { id } = useParams();
const navigate = useNavigate();
const { language } = useLanguage();
const idioma = ["es", "en", "fr"].includes(language) ? language : "es";

const t = (key) =>
TEXTOS_CHECKLIST[key]?.[idioma] || TEXTOS_CHECKLIST[key]?.es || key;

const traducirPuntoChecklist = (texto) =>
idioma === "es"
? texto
: TRADUCCIONES_PUNTOS_CHECKLIST[texto]?.[idioma] || texto;

const [inspeccion, setInspeccion] = useState(null);
const [tecnico, setTecnico] = useState(null);
const [autorizado, setAutorizado] = useState(false);

const [viviendaInfo, setViviendaInfo] = useState({
nombre: t("propertyLoading"),
direccion: "",
cliente: t("noClient"),
});

const [items, setItems] = useState([]);
const [fotos, setFotos] = useState([]);
const [loading, setLoading] = useState(true);
const [mensaje, setMensaje] = useState("");
const [observaciones, setObservaciones] = useState("");
const [guardando, setGuardando] = useState(false);
const [subiendoFoto, setSubiendoFoto] = useState(false);

function limpiarTexto(txt) {
return String(txt || "")
.replace(/\u2028|\u2029/g, "\n")
.replace(/[^\x00-\x7F]/g, "")
.trim();
}

async function actualizarFotosInspeccion() {
try {
const urls = await cargarFotosInspeccion(id);
setFotos(Array.isArray(urls) ? urls : []);
} catch (error) {
console.error("Error cargando las fotos del checklist:", error);
}
}

useEffect(() => {
let cancelado = false;

async function cargarDatos() {
  setLoading(true);
  setAutorizado(false);

  try {
    const {
      data: { user },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario) throw errorUsuario;

    if (!user?.id || !user?.email) {
      throw new Error("Debes iniciar sesión para acceder al checklist.");
    }

    const { data: tecnicoActual, error: errorTecnico } = await supabase
      .from("tecnicos")
      .select("id, email")
      .eq("email", user.email)
      .maybeSingle();

    if (errorTecnico) throw errorTecnico;

    if (!tecnicoActual) {
      throw new Error("No se pudo validar la cuenta del técnico.");
    }

    const { data: insp, error: errorInspeccion } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (errorInspeccion) throw errorInspeccion;

    if (!insp) {
      throw new Error(
        "No se encontró la inspección o no tienes permiso para verla."
      );
    }

    if (String(insp.tecnico_id) !== String(tecnicoActual.id)) {
      throw new Error("No tienes permiso para modificar esta inspección.");
    }

    if (cancelado) return;

    setTecnico(tecnicoActual);
    setInspeccion(insp);
    setObservaciones(insp.observaciones || "");

    if (insp.vivienda_id) {
      const { data: viv, error: errorVivienda } = await supabase
        .from("viviendas")
        .select("id, nombre, direccion, cliente_id")
        .eq("id", insp.vivienda_id)
        .maybeSingle();

      if (errorVivienda) throw errorVivienda;

      if (cancelado) return;

      let clienteNombre = t("noClient");

      if (insp.cliente_id) {
        const { data: cli, error: errorCliente } = await supabase
          .from("clientes")
          .select("nombre")
          .eq("id", insp.cliente_id)
          .maybeSingle();

        if (errorCliente) throw errorCliente;

        if (cli?.nombre) {
          clienteNombre = cli.nombre;
        }
      }

      if (cancelado) return;

      setViviendaInfo({
        nombre: viv?.nombre || viv?.direccion || t("property"),
        direccion: viv?.direccion || t("noAddress"),
        cliente: clienteNombre,
      });
    } else {
      setViviendaInfo({
        nombre: t("unassigned"),
        direccion: t("noAddress"),
        cliente: t("noClient"),
      });
    }

    if (!cancelado) {
      setAutorizado(true);
    }
  } catch (error) {
    console.error("Error cargando datos del checklist:", error);

    if (!cancelado) {
      setMensaje(
        error?.message || "Error cargando los datos de la inspección."
      );
      setLoading(false);
    }
  }
}

if (!id) {
  setMensaje("El identificador de la inspección no es válido.");
  setLoading(false);
} else {
  cargarDatos();
}

return () => {
  cancelado = true;
};

}, [id]);

useEffect(() => {
let cancelado = false;

async function cargarChecklist() {
  if (!autorizado || !inspeccion || !id) return;

  setLoading(true);

  try {
    let { data, error } = await supabase
      .from("checklist_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);

    if (error) throw error;

    if (!data || data.length === 0) {
      const nuevosItems = PLANTILLA_CHECKLIST.map((texto) => ({
        inspeccion_id: id,
        item: texto,
        completado: false,
      }));

      const { error: errorInsert } = await supabase
        .from("checklist_inspeccion")
        .insert(nuevosItems);

      if (errorInsert) throw errorInsert;

      const resultado = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", id);

      if (resultado.error) throw resultado.error;

      data = resultado.data;
    }

    if (!cancelado) {
      setItems(data || []);
    }
  } catch (error) {
    console.error("Error cargando checklist:", error);

    if (!cancelado) {
      setMensaje("Error cargando el checklist: " + error.message);
    }
  } finally {
    if (!cancelado) {
      setLoading(false);
    }
  }
}

cargarChecklist();

return () => {
  cancelado = true;
};

}, [id, autorizado, inspeccion]);

useEffect(() => {
let cancelado = false;

async function cargarFotos() {
  if (!autorizado || !inspeccion || !id) return;

  try {
    const urls = await cargarFotosInspeccion(id);

    if (!cancelado) {
      setFotos(Array.isArray(urls) ? urls : []);
    }
  } catch (error) {
    console.error("Error cargando fotos del técnico:", error);
    if (!cancelado) setFotos([]);
  }
}

cargarFotos();

return () => {
  cancelado = true;
};

}, [id, autorizado, inspeccion]);

async function validarPermisoActual() {
if (!autorizado || !inspeccion || !tecnico) {
throw new Error("No tienes permiso para modificar esta inspección.");
}

const {
  data: { user },
  error: errorUsuario,
} = await supabase.auth.getUser();

if (errorUsuario) throw errorUsuario;

if (!user?.email || user.email !== tecnico.email) {
  throw new Error("La sesión ha cambiado. Inicia sesión de nuevo.");
}

const { data: asignacion, error: errorAsignacion } = await supabase
  .from("inspecciones")
  .select("id, tecnico_id")
  .eq("id", id)
  .maybeSingle();

if (errorAsignacion) throw errorAsignacion;

if (
  !asignacion ||
  String(asignacion.tecnico_id) !== String(tecnico.id)
) {
  throw new Error("Esta inspección ya no está asignada a tu cuenta.");
}

}

async function actualizarItem(itemId, completado) {
if (guardando || subiendoFoto) return;

const anteriores = items;

try {
  await validarPermisoActual();

  setItems((prev) =>
    prev.map((item) =>
      String(item.id) === String(itemId)
        ? { ...item, completado }
        : item
    )
  );

  const { data, error } = await supabase
    .from("checklist_inspeccion")
    .update({ completado })
    .eq("id", itemId)
    .eq("inspeccion_id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error("No se pudo confirmar el guardado del elemento.");
  }

  setMensaje("");
} catch (error) {
  console.error("Error actualizando elemento del checklist:", error);
  setItems(anteriores);
  setMensaje(error?.message || "No se pudo guardar el cambio.");
}

}

async function procesarYSubirImagen(base64String) {
if (subiendoFoto || guardando) return;

let nombreArchivo = null;

try {
  await validarPermisoActual();

  setSubiendoFoto(true);
  setMensaje(t("uploading"));

  const base64Clean = base64String.includes("base64,")
    ? base64String.split("base64,")[1]
    : base64String;

  const byteCharacters = atob(base64Clean);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: "image/jpeg",
  });

  nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

  const { error: storageError } = await supabase.storage
    .from("fotos")
    .upload(nombreArchivo, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (storageError) {
    throw new Error("Error Storage: " + storageError.message);
  }

  const { error: insertError } = await supabase
    .from("fotos_inspeccion")
    .insert({
      inspeccion_id: id,
      archivo: nombreArchivo,
      url: nombreArchivo,
      principal: false,
      tipo: "checklist",
    });

  if (insertError) {
    const { error: removeError } = await supabase.storage
      .from("fotos")
      .remove([nombreArchivo]);

    if (removeError) {
      console.error(
        "No se pudo retirar la foto tras fallar el registro:",
        removeError
      );
    }

    throw new Error("Error BD fotos: " + insertError.message);
  }

  await actualizarFotosInspeccion();
  setMensaje(t("photoSaved"));
} catch (error) {
  console.error("Error procesando o subiendo foto:", error);
  setMensaje(error?.message || "Error al procesar la foto");
} finally {
  setSubiendoFoto(false);
}

}

async function tomarFoto() {
if (guardando || subiendoFoto) return;

try {
  await validarPermisoActual();

  const image = await Camera.getPhoto({
    quality: 70,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
  });

  if (image.base64String) {
    await procesarYSubirImagen(image.base64String);
  }
} catch (error) {
  console.error("Error usando la cámara:", error);
  setMensaje(error?.message || "Cámara cancelada o no disponible.");
}

}

async function seleccionarDeGaleria() {
if (guardando || subiendoFoto) return;

try {
  await validarPermisoActual();

  const image = await Camera.getPhoto({
    quality: 70,
    resultType: CameraResultType.Base64,
    source: CameraSource.Photos,
  });

  if (image.base64String) {
    await procesarYSubirImagen(image.base64String);
  }
} catch (error) {
  console.error("Error seleccionando foto:", error);
  setMensaje(error?.message || "Galería cancelada o no disponible.");
}

}

async function guardarChecklistCompleto() {
if (guardando || subiendoFoto) return;

setGuardando(true);
setMensaje("");

try {
  await validarPermisoActual();

  const textoLimpio = limpiarTexto(observaciones);
  const todoOk =
    items.length > 0 &&
    items.every((item) => item.completado === true);

  const { data, error } = await supabase
    .from("inspecciones")
    .update({
      observaciones: textoLimpio,
      checklist_completado: todoOk,
      fecha_checklist: new Date().toISOString(),
      estado: "completada_tecnico",
      estado_tecnico: "completada",
    })
    .eq("id", id)
    .eq("tecnico_id", tecnico.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error("No se pudo confirmar el guardado de la inspección.");
  }

  setMensaje(t("sentReview"));

  setTimeout(() => {
    navigate("/tecnico");
  }, 800);
} catch (error) {
  console.error("Error guardando checklist:", error);
  setMensaje(error?.message || "Error al guardar la inspección.");
} finally {
  setGuardando(false);
}

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
<h3 style={TEXTO_DORADO_BRILLO}>{t("loading")}</h3>
</div>
</Menu>
);
}

if (!autorizado || !inspeccion) {
return (
<Menu>
<div
style={{
minHeight: "100vh",
background: FONDO_PRINCIPAL,
color: "#fff",
padding: "20px",
boxSizing: "border-box",
}}
>
<p role="alert" style={{ color: "#ef4444" }}>
{mensaje || t("noPermission")}
</p>

      <button
        type="button"
        onClick={() => navigate("/tecnico")}
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: BORDE_DORADO_FINO,
          background: FONDO_TARJETA,
          color: COLOR_DORADO,
          fontWeight: "700",
        }}
      >
        {t("backPanel")}
      </button>
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
boxSizing: "border-box",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "12px",
marginBottom: "20px",
}}
>
<h1
style={{
...TEXTO_DORADO_BRILLO,
fontSize: "18px",
fontWeight: "900",
}}
>
{t("title")} ({items.length} {t("points")})
</h1>

      <button
        type="button"
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
        {t("back")}
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
      <div>
        🏠 <strong style={{ color: COLOR_DORADO }}>{t("home")}</strong>{" "}
        {viviendaInfo.nombre}
      </div>

      <div>
        📍 <strong style={{ color: COLOR_DORADO }}>{t("address")}</strong>{" "}
        {viviendaInfo.direccion}
      </div>

      <div>
        👤 <strong style={{ color: COLOR_DORADO }}>{t("client")}</strong>{" "}
        {viviendaInfo.cliente}
      </div>
    </div>

    {mensaje && (
      <div
        role="status"
        style={{
          marginBottom: "16px",
          padding: "12px 16px",
          background: "rgba(224, 176, 52, 0.15)",
          border: BORDE_DORADO_FINO,
          borderRadius: "12px",
          color: COLOR_DORADO,
          fontWeight: "700",
          textAlign: "center",
          overflowWrap: "anywhere",
        }}
      >
        {mensaje}
      </div>
    )}

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <button
        type="button"
        onClick={tomarFoto}
        disabled={subiendoFoto || guardando}
        style={{
          flex: 1,
          padding: "12px",
          background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
          color: "#fff",
          borderRadius: "12px",
          border: BORDE_DORADO_FINO,
          fontWeight: "900",
          opacity: subiendoFoto || guardando ? 0.6 : 1,
        }}
      >
        {t("takePhoto")}
      </button>

      <button
        type="button"
        onClick={seleccionarDeGaleria}
        disabled={subiendoFoto || guardando}
        style={{
          flex: 1,
          padding: "12px",
          background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
          color: "#fff",
          borderRadius: "12px",
          border: "1px solid rgba(16, 185, 129, 0.6)",
          fontWeight: "900",
          opacity: subiendoFoto || guardando ? 0.6 : 1,
        }}
      >
        {t("gallery")}
      </button>
    </div>

    <section
      aria-label={t("photos")}
      style={{
        background: FONDO_TARJETA,
        border: BORDE_DORADO_FINO,
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: SOMBRA_LUXURY,
      }}
    >
      <h2
        style={{
          color: COLOR_DORADO,
          fontSize: "16px",
          margin: "0 0 12px",
        }}
      >
        {t("photos")} ({fotos.length})
      </h2>

      {fotos.length === 0 ? (
        <p style={{ color: "#cbd5e1", fontSize: "14px", margin: 0 }}>
          {t("noPhotos")}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {fotos.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir fotografía ${index + 1}`}
              style={{
                display: "block",
                borderRadius: "10px",
                overflow: "hidden",
                border: BORDE_DORADO_FINO,
                background: "#030509",
              }}
            >
              <img
                src={url}
                alt={`Fotografía de la inspección ${index + 1}`}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                style={{
                  display: "block",
                  width: "100%",
                  height: "130px",
                  objectFit: "cover",
                }}
              />
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={actualizarFotosInspeccion}
        disabled={subiendoFoto}
        style={{
          marginTop: "12px",
          padding: "9px 12px",
          borderRadius: "8px",
          border: BORDE_DORADO_FINO,
          background: "rgba(11, 19, 32, 0.9)",
          color: COLOR_DORADO,
          fontWeight: "700",
          cursor: subiendoFoto ? "not-allowed" : "pointer",
        }}
      >
        {t("refreshPhotos")}
      </button>
    </section>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
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
          <p
            style={{
              marginBottom: "10px",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            {index + 1}. {traducirPuntoChecklist(item.item)}
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              disabled={guardando || subiendoFoto}
              onClick={() => actualizarItem(item.id, true)}
              style={{
                flex: 1,
                padding: "10px",
                background: item.completado
                  ? "#10b981"
                  : "rgba(11, 19, 32, 0.9)",
                color: item.completado ? "#fff" : COLOR_DORADO,
                border: item.completado
                  ? "1px solid #10b981"
                  : BORDE_DORADO_FINO,
                borderRadius: "10px",
                fontWeight: "900",
              }}
            >
              {t("ok")}
            </button>

            <button
              type="button"
              disabled={guardando || subiendoFoto}
              onClick={() => actualizarItem(item.id, false)}
              style={{
                flex: 1,
                padding: "10px",
                background: !item.completado
                  ? "#ef4444"
                  : "rgba(11, 19, 32, 0.9)",
                color: !item.completado ? "#fff" : "#ef4444",
                border: !item.completado
                  ? "1px solid #ef4444"
                  : "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "10px",
                fontWeight: "900",
              }}
            >
              {t("notOk")}
            </button>
          </div>
        </div>
      ))}
    </div>

    <textarea
      placeholder={t("observations")}
      value={observaciones}
      disabled={guardando || subiendoFoto}
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
        boxSizing: "border-box",
      }}
    />

    <button
      type="button"
      onClick={guardarChecklistCompleto}
      disabled={guardando || subiendoFoto}
      style={{
        width: "100%",
        padding: "14px",
        background:
          guardando || subiendoFoto
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
        color: guardando || subiendoFoto ? "#64748b" : "#ffffff",
        borderRadius: "16px",
        border: "1px solid rgba(16, 185, 129, 0.6)",
        fontWeight: "900",
        marginTop: "30px",
        cursor:
          guardando || subiendoFoto ? "not-allowed" : "pointer",
      }}
    >
      {guardando
        ? t("saving")
        : subiendoFoto
          ? t("uploading")
          : t("submit")}
    </button>
  </div>
</Menu>

);
}
