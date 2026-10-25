import React, {
useEffect,
useState,
} from "react";
import {
useParams,
Link,
useNavigate,
} from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext";

const BUCKET_FOTOS = "fotos";
const DURACION_URL_FIRMADA = 3600;

const textos = {
es: {
loading: "Cargando inspección…",
notFound: "No se encontró la inspección.",
notFoundId: "No se encontró la inspección con ID:",
back: "Volver",
backList: "← Volver al listado",
invalidId: "El identificador de la inspección no es válido.",
loadError: "Error cargando la inspección.",
loadErrorDetail: "No se pudo cargar la inspección: ",
propertyData: "Datos de la vivienda",
address: "Dirección",
locality: "Localidad",
city: "Ciudad",
province: "Provincia",
postalCode: "Código postal",
addressMissing: "Dirección no especificada",
unspecified: "No especificada",
date: "Fecha",
noDate: "Sin fecha",
status: "Estado",
technicalStatus: "Estado técnico",
adminStatus: "Estado administración",
pending: "Pendiente",
observations: "Observaciones del técnico",
noObservations: "Sin observaciones",
technicianPhotos: "Fotos del técnico",
noPhotos: "No hay fotos registradas para esta inspección.",
inspectionPhoto: "Foto de inspección",
viewPdf: "📄 Ver PDF",
reviewPublish: "✔ Revisar y publicar para el cliente",
deleteInspection: "Eliminar inspección",
confirmDelete:
"¿Seguro que deseas eliminar esta inspección? Se eliminarán también los registros asociados y se intentarán retirar sus fotografías.",
deleteFailed:
"No se ha podido completar la eliminación. La inspección puede seguir existiendo. Detalle: ",
supabaseCommunicationError: "error de comunicación con Supabase",
deleteNotConfirmed:
"Supabase no ha confirmado la eliminación. No se continuará.",
storagePending:
"La inspección se ha eliminado, pero algunas fotografías podrían seguir almacenadas. Es necesario revisar la limpieza de Storage.",
deleteSuccess:
"Inspección y fotografías asociadas eliminadas correctamente.",
unexpectedDeleteError:
"Error inesperado al eliminar la inspección. Comprueba el estado antes de volver a intentarlo.",
unknownStatus: "Pendiente",
statuses: {
pendiente: "Pendiente",
pending: "Pendiente",
completada_tecnico: "Completada por el técnico",
completada: "Completada",
completado: "Completado",
finalizada: "Finalizada",
finalizado: "Finalizado",
aprobada: "Aprobada",
aprobado: "Aprobado",
rechazada: "Rechazada",
rechazado: "Rechazado",
en_proceso: "En proceso",
en_revision: "En revisión",
cancelada: "Cancelada",
cancelado: "Cancelado",
publicada: "Publicada",
publicado: "Publicado",
},
},

en: {
loading: "Loading inspection…",
notFound: "Inspection not found.",
notFoundId: "Inspection not found with ID:",
back: "Back",
backList: "← Back to list",
invalidId: "The inspection ID is invalid.",
loadError: "Error loading the inspection.",
loadErrorDetail: "Could not load the inspection: ",
propertyData: "Property details",
address: "Address",
locality: "Locality",
city: "City",
province: "Province",
postalCode: "Postal code",
addressMissing: "Address not specified",
unspecified: "Not specified",
date: "Date",
noDate: "No date",
status: "Status",
technicalStatus: "Technical status",
adminStatus: "Administration status",
pending: "Pending",
observations: "Technician's observations",
noObservations: "No observations",
technicianPhotos: "Technician's photos",
noPhotos: "No photos are registered for this inspection.",
inspectionPhoto: "Inspection photo",
viewPdf: "📄 View PDF",
reviewPublish: "✔ Review and publish for the client",
deleteInspection: "Delete inspection",
confirmDelete:
"Are you sure you want to delete this inspection? Associated records will also be deleted, and an attempt will be made to remove its photos.",
deleteFailed:
"The deletion could not be completed. The inspection may still exist. Details: ",
supabaseCommunicationError: "Supabase communication error",
deleteNotConfirmed:
"Supabase has not confirmed the deletion. The process will not continue.",
storagePending:
"The inspection has been deleted, but some photos may still be stored. Storage cleanup needs to be checked.",
deleteSuccess:
"Inspection and associated photos deleted successfully.",
unexpectedDeleteError:
"Unexpected error deleting the inspection. Check its status before trying again.",
unknownStatus: "Pending",
statuses: {
pendiente: "Pending",
pending: "Pending",
completada_tecnico: "Completed by technician",
completada: "Completed",
completado: "Completed",
finalizada: "Finalized",
finalizado: "Finalized",
aprobada: "Approved",
aprobado: "Approved",
rechazada: "Rejected",
rechazado: "Rejected",
en_proceso: "In progress",
en_revision: "Under review",
cancelada: "Cancelled",
cancelado: "Cancelled",
publicada: "Published",
publicado: "Published",
},
},

fr: {
loading: "Chargement de l’inspection…",
notFound: "Inspection introuvable.",
notFoundId: "Inspection introuvable avec l’identifiant :",
back: "Retour",
backList: "← Retour à la liste",
invalidId: "L’identifiant de l’inspection n’est pas valide.",
loadError: "Erreur lors du chargement de l’inspection.",
loadErrorDetail: "Impossible de charger l’inspection : ",
propertyData: "Informations sur le logement",
address: "Adresse",
locality: "Localité",
city: "Ville",
province: "Province",
postalCode: "Code postal",
addressMissing: "Adresse non renseignée",
unspecified: "Non renseignée",
date: "Date",
noDate: "Aucune date",
status: "Statut",
technicalStatus: "Statut technique",
adminStatus: "Statut administratif",
pending: "En attente",
observations: "Observations du technicien",
noObservations: "Aucune observation",
technicianPhotos: "Photos du technicien",
noPhotos: "Aucune photo n’est enregistrée pour cette inspection.",
inspectionPhoto: "Photo d’inspection",
viewPdf: "📄 Voir le PDF",
reviewPublish: "✔ Vérifier et publier pour le client",
deleteInspection: "Supprimer l’inspection",
confirmDelete:
"Voulez-vous vraiment supprimer cette inspection ? Les enregistrements associés seront également supprimés et une tentative de suppression des photos sera effectuée.",
deleteFailed:
"La suppression n’a pas pu être terminée. L’inspection existe peut-être toujours. Détails : ",
supabaseCommunicationError: "Erreur de communication avec Supabase",
deleteNotConfirmed:
"Supabase n’a pas confirmé la suppression. L’opération ne sera pas poursuivie.",
storagePending:
"L’inspection a été supprimée, mais certaines photos peuvent encore être stockées. Le nettoyage du stockage doit être vérifié.",
deleteSuccess:
"L’inspection et les photos associées ont été supprimées correctement.",
unexpectedDeleteError:
"Erreur inattendue lors de la suppression de l’inspection. Vérifiez son état avant de réessayer.",
unknownStatus: "En attente",
statuses: {
pendiente: "En attente",
pending: "En attente",
completada_tecnico: "Terminée par le technicien",
completada: "Terminée",
completado: "Terminé",
finalizada: "Finalisée",
finalizado: "Finalisé",
aprobada: "Approuvée",
aprobado: "Approuvé",
rechazada: "Rejetée",
rechazado: "Rejeté",
en_proceso: "En cours",
en_revision: "En cours de vérification",
cancelada: "Annulée",
cancelado: "Annulé",
publicada: "Publiée",
publicado: "Publié",
},
},
};

export default function VerInspeccion() {
const { id } = useParams();
const navigate = useNavigate();
const { language } = useLanguage();
const t = textos[language] || textos.es;

const [inspeccion, setInspeccion] = useState(null);
const [vivienda, setVivienda] = useState(null);
const [fotos, setFotos] = useState([]);
const [loading, setLoading] = useState(true);
const [errorMsg, setErrorMsg] = useState("");

function traducirEstado(valor) {
if (valor === null || valor === undefined || valor === "") {
return t.pending;
}

const clave = String(valor).trim().toLowerCase();

return t.statuses[clave] || valor;

}

function formatearFecha(fechaISO) {
if (!fechaISO) return t.noDate;

const fecha = new Date(fechaISO);

if (Number.isNaN(fecha.getTime())) {
  return t.noDate;
}

const dia = String(fecha.getDate()).padStart(2, "0");
const mes = String(fecha.getMonth() + 1).padStart(2, "0");
const año = fecha.getFullYear();

return `${dia}/${mes}/${año}`;

}

function obtenerRutaStorage(valor) {
if (!valor || typeof valor !== "string") {
return null;
}

const texto = valor.trim();

if (!texto || /^data:/i.test(texto)) {
  return null;
}

if (/^https?:\/\//i.test(texto)) {
  try {
    const url = new URL(texto);
    const marcador = "/storage/v1/object/";
    const posicion = url.pathname.indexOf(marcador);

    if (posicion === -1) {
      return null;
    }

    const resto = url.pathname.slice(
      posicion + marcador.length
    );

    const prefijos = [
      `public/${BUCKET_FOTOS}/`,
      `sign/${BUCKET_FOTOS}/`,
      `authenticated/${BUCKET_FOTOS}/`,
    ];

    const prefijo = prefijos.find((item) =>
      resto.startsWith(item)
    );

    if (!prefijo) {
      return null;
    }

    return decodeURIComponent(
      resto.slice(prefijo.length)
    );
  } catch (error) {
    console.error(
      "Error interpretando la URL de la foto:",
      error
    );

    return null;
  }
}

return texto.replace(/^\/+/, "");

}

async function obtenerUrlFoto(foto) {
if (!foto) return "";

const candidatos = [
  foto.archivo,
  foto.url_storage_o_path,
  foto.url,
];

let urlExterna = "";

for (const candidato of candidatos) {
  if (
    typeof candidato !== "string" ||
    !candidato.trim()
  ) {
    continue;
  }

  const valor = candidato.trim();

  if (/^data:/i.test(valor)) {
    continue;
  }

  const ruta = obtenerRutaStorage(valor);

  if (ruta) {
    const { data, error } = await supabase.storage
      .from(BUCKET_FOTOS)
      .createSignedUrl(
        ruta,
        DURACION_URL_FIRMADA
      );

    if (error) {
      console.error(
        "Error generando URL firmada de la foto:",
        error
      );

      continue;
    }

    if (data?.signedUrl) {
      return data.signedUrl;
    }
  }

  if (/^https?:\/\//i.test(valor)) {
    try {
      const url = new URL(valor);

      if (
        url.protocol === "https:" ||
        url.protocol === "http:"
      ) {
        urlExterna = valor;
      }
    } catch {
      // Ignorar URLs antiguas no válidas.
    }
  }
}

return urlExterna;

}

async function normalizarFoto(foto, index = 0) {
if (!foto) return null;

const url = await obtenerUrlFoto(foto);

if (!url) {
  return null;
}

return {
  ...foto,
  id: foto.id || `foto-${index}-${url}`,
  url,
};

}

useEffect(() => {
let cancelado = false;
const mensajes = textos[language] || textos.es;

async function cargarInspeccion() {
  setLoading(true);
  setErrorMsg("");

  try {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "Error buscando inspección:",
        error
      );

      setErrorMsg(
        mensajes.loadErrorDetail + error.message
      );

      return;
    }

    if (cancelado) return;

    if (!data) {
      setErrorMsg(mensajes.notFound);
      return;
    }

    setInspeccion(data);

    if (data.vivienda_id) {
      const {
        data: viviendaData,
        error: viviendaError,
      } = await supabase
        .from("viviendas")
        .select("*")
        .eq("id", data.vivienda_id)
        .maybeSingle();

      if (cancelado) return;

      if (viviendaError) {
        console.error(
          "Error cargando vivienda:",
          viviendaError
        );
      } else if (viviendaData) {
        setVivienda(viviendaData);
      }
    }

    const {
      data: fotosData,
      error: fotosError,
    } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", String(id))
      .order("id", { ascending: false });

    if (cancelado) return;

    if (fotosError) {
      console.error(
        "Error cargando fotos:",
        fotosError
      );
    }

    const fotosTabla = await Promise.all(
      (fotosData || []).map((foto, index) =>
        normalizarFoto(foto, index)
      )
    );

    const fotosCampo = [];

    if (Array.isArray(data.fotos)) {
      const fotosOriginales = await Promise.all(
        data.fotos.map((foto, index) => {
          const objeto =
            typeof foto === "string"
              ? { url: foto, archivo: foto }
              : foto;

          return normalizarFoto(
            objeto,
            index + (fotosData || []).length
          );
        })
      );

      fotosCampo.push(
        ...fotosOriginales.filter(Boolean)
      );
    }

    if (cancelado) return;

    const todasLasFotos = [
      ...fotosTabla.filter(Boolean),
      ...fotosCampo,
    ];

    const fotosUnicas = [];
    const urlsVistas = new Set();

    todasLasFotos.forEach((foto) => {
      if (!foto?.url) return;

      const identificador =
        foto.archivo ||
        foto.url_storage_o_path ||
        foto.url;

      if (urlsVistas.has(identificador)) {
        return;
      }

      urlsVistas.add(identificador);
      fotosUnicas.push(foto);
    });

    setFotos(fotosUnicas);
  } catch (error) {
    console.error("Error general:", error);

    if (!cancelado) {
      setErrorMsg(mensajes.loadError);
    }
  } finally {
    if (!cancelado) {
      setLoading(false);
    }
  }
}

if (id) {
  cargarInspeccion();
} else {
  setErrorMsg(mensajes.invalidId);
  setLoading(false);
}

return () => {
  cancelado = true;
};

}, [id, language]);

async function eliminarInspeccion() {
const confirmar = window.confirm(t.confirmDelete);

if (!confirmar) return;

try {
  const { data, error: invokeError } =
    await supabase.functions.invoke(
      "eliminarInspeccionCompleta",
      {
        body: { inspeccion_id: id },
      }
    );

  if (invokeError) {
    console.error(
      "Error eliminando inspección:",
      invokeError
    );

    alert(
      t.deleteFailed +
        (invokeError.message ||
          t.supabaseCommunicationError)
    );

    return;
  }

  if (!data || data.ok !== true) {
    console.error(
      "Respuesta inesperada al eliminar inspección:",
      data
    );

    alert(
      data?.error ||
        t.deleteNotConfirmed
    );

    return;
  }

  if (data.limpiezaStoragePendiente) {
    alert(t.storagePending);
  } else {
    alert(t.deleteSuccess);
  }

  navigate("/inspecciones");
} catch (error) {
  console.error(
    "Error inesperado eliminando inspección:",
    error
  );

  alert(t.unexpectedDeleteError);
}

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
fontSize: "18px",
}}
>
{t.loading}
</div>
</Menu>
);
}

if (!inspeccion) {
return (
<Menu>
<div
style={{
background: "#0a0f1a",
minHeight: "100vh",
color: "#fff",
padding: "20px",
}}
>
<h2>
{errorMsg ||
"${t.notFoundId} ${id}"}
</h2>

      <Link
        to="/inspecciones"
        style={{ color: "#4db8ff" }}
      >
        {t.back}
      </Link>
    </div>
  </Menu>
);

}

const direccion =
vivienda?.direccion ||
inspeccion.direccion ||
t.addressMissing;

const localidad =
vivienda?.localidad ||
inspeccion.localidad ||
vivienda?.ciudad ||
t.unspecified;

const ciudad =
vivienda?.ciudad ||
inspeccion.ciudad ||
null;

const provincia =
vivienda?.provincia ||
inspeccion.provincia ||
null;

const codigoPostal =
vivienda?.codigo_postal ||
vivienda?.cp ||
inspeccion.codigo_postal ||
inspeccion.cp ||
null;

const observaciones =
inspeccion.observaciones ||
inspeccion.notas_tecnico ||
inspeccion.notas ||
t.noObservations;

const estadoTecnico = traducirEstado(
inspeccion.estado_tecnico
);

const estadoAdmin = traducirEstado(
inspeccion.estado_admin
);

// Se conservan los valores originales para la lógica interna.
const pendienteRevision =
inspeccion.estado === "completada_tecnico" &&
inspeccion.estado_tecnico === "completada";

return (
<Menu>
<div
style={{
padding: "20px",
background: "#0a0f1a",
minHeight: "100vh",
color: "#fff",
paddingBottom: "80px",
fontFamily: "Inter, sans-serif",
}}
>
<h1
style={{
color: "#4db8ff",
marginBottom: "15px",
}}
>
{language === "en"
? "Inspection #${inspeccion.id}"
: language === "fr"
? "Inspection n° ${inspeccion.id}"
: "Inspección #${inspeccion.id}"}
</h1>

    {errorMsg && (
      <div
        style={{
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "10px",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#f87171",
        }}
      >
        {errorMsg}
      </div>
    )}

    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(77,184,255,0.25)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "18px",
      }}
    >
      <h3
        style={{
          color: "#4db8ff",
          marginTop: 0,
          marginBottom: "15px",
        }}
      >
        {t.propertyData}
      </h3>

      <p>
        <strong>{t.address}:</strong> {direccion}
      </p>

      <p>
        <strong>{t.locality}:</strong> {localidad}
      </p>

      {ciudad && ciudad !== localidad && (
        <p>
          <strong>{t.city}:</strong> {ciudad}
        </p>
      )}

      {provincia && (
        <p>
          <strong>{t.province}:</strong> {provincia}
        </p>
      )}

      {codigoPostal && (
        <p>
          <strong>{t.postalCode}:</strong> {codigoPostal}
        </p>
      )}
    </div>

    <p>
      <strong>{t.date}:</strong>{" "}
      {formatearFecha(inspeccion.fecha)}
    </p>

    <p>
      <strong>{t.status}:</strong>{" "}
      {traducirEstado(inspeccion.estado)}
    </p>

    <p>
      <strong>{t.technicalStatus}:</strong>{" "}
      {estadoTecnico}
    </p>

    <p>
      <strong>{t.adminStatus}:</strong>{" "}
      {estadoAdmin}
    </p>

    <h3
      style={{
        marginTop: "20px",
        color: "#ffd700",
      }}
    >
      {t.observations}
    </h3>

    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "10px",
        padding: "14px",
        whiteSpace: "pre-wrap",
        opacity: 0.9,
        marginBottom: "20px",
      }}
    >
      {observaciones}
    </div>

    <h3
      style={{
        marginTop: "20px",
        color: "#ffd700",
      }}
    >
      {t.technicianPhotos} ({fotos.length})
    </h3>

    {fotos.length === 0 ? (
      <div
        style={{
          padding: "16px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.05)",
          color: "#aaa",
          marginBottom: "20px",
        }}
      >
        {t.noPhotos}
      </div>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {fotos.map((foto, index) => (
          <a
            key={foto.id || `foto-${index}`}
            href={foto.url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <img
              src={foto.url}
              alt={
                foto.descripcion ||
                t.inspectionPhoto
              }
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
                border: foto.principal
                  ? "3px solid #4ade80"
                  : "1px solid rgba(77,184,255,0.5)",
                display: "block",
                background: "#111827",
              }}
              onError={(e) => {
                e.currentTarget.style.opacity = "0.35";
              }}
            />
          </a>
        ))}
      </div>
    )}

    <div
      style={{
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        marginTop: "20px",
      }}
    >
      <Link
        to={`/inspecciones/pdf/${id}`}
        style={{
          color: "#4db8ff",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        {t.viewPdf}
      </Link>
    </div>

    {pendienteRevision && (
      <button
        onClick={() =>
          navigate(`/inspecciones/finalizar/${id}`)
        }
        style={{
          marginTop: "25px",
          padding: "15px",
          width: "100%",
          background: "#4ade80",
          color: "#052e16",
          borderRadius: "10px",
          border: "none",
          fontWeight: "800",
          fontSize: "17px",
          cursor: "pointer",
        }}
      >
        {t.reviewPublish}
      </button>
    )}

    <button
      onClick={eliminarInspeccion}
      style={{
        marginTop: "30px",
        padding: "14px",
        width: "100%",
        background: "#e74c3c",
        color: "#fff",
        borderRadius: "10px",
        border: "none",
        fontWeight: "700",
        fontSize: "17px",
        cursor: "pointer",
      }}
    >
      {t.deleteInspection}
    </button>

    <button
      onClick={() => navigate("/inspecciones")}
      style={{
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
      }}
    >
      {t.backList}
    </button>
  </div>
</Menu>

);
}
