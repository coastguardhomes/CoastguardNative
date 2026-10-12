
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PoliticaPrivacidad from "./PoliticaPrivacidad.jsx";
import "./DocumentosLegales.css";

const estilos = {
  pagina: {
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
    background: "#f3f6fa",
    color: "#172033",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  contenido: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  volver: {
    display: "inline-block",
    marginBottom: "18px",
    padding: "10px 16px",
    background: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  tarjeta: {
    background: "#fff",
    padding: "24px",
    marginBottom: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(20, 40, 70, 0.08)",
    lineHeight: "1.7",
    overflowWrap: "anywhere",
  },
  titulo: {
    color: "#00356b",
    marginTop: 0,
    lineHeight: "1.3",
  },
  subtitulo: {
    color: "#00356b",
    marginTop: "24px",
  },
};

export default function DocumentosLegales() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace(/^#/, "");

    if (!id) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <main style={estilos.pagina}>
      <div style={estilos.contenido}>
        <button
          type="button"
          onClick={() => navigate("/register")}
          style={estilos.volver}
        >
          ← Volver al registro
        </button>

        <section id="contrato" style={estilos.tarjeta}>
          <h1 style={estilos.titulo}>
            CONTRATO MARCO DE SERVICIOS
          </h1>

          <h2 style={estilos.subtitulo}>1. Objeto</h2>
          <p>
            El presente contrato regula las condiciones generales de
            los servicios de gestión, avisos y mantenimiento de viviendas
            prestados a través de CoastGuard Homes Services y de su
            aplicación.
          </p>

          <h2 style={estilos.subtitulo}>
            2. Condiciones de contratación y pagos
          </h2>
          <p>
            Los servicios se prestarán conforme a las condiciones y
            tarifas comunicadas al usuario para cada servicio. Cuando
            corresponda un pago anticipado o se aplique una tarifa
            determinada, se informará al usuario de las condiciones
            económicas antes de la contratación.
          </p>

          <h2 style={estilos.subtitulo}>
            3. Disponibilidad de la aplicación y limitaciones técnicas
          </h2>
          <p>
            Se realizarán esfuerzos razonables para mantener la
            aplicación disponible. No obstante, el acceso puede verse
            temporalmente afectado por tareas de mantenimiento,
            incidencias técnicas, fallos de software, interrupciones
            de las redes de telecomunicaciones u otras circunstancias
            ajenas al control razonable del prestador.
          </p>
          <p>
            Las limitaciones técnicas no excluyen ni reducen las
            responsabilidades que legalmente no puedan excluirse,
            ni los derechos que correspondan al usuario conforme a
            la normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>4. Uso de la plataforma</h2>
          <p>
            El usuario deberá utilizar la aplicación de forma lícita,
            facilitar información correcta y mantener la
            confidencialidad de sus credenciales. También deberá
            comunicar las incidencias relevantes para la prestación
            de los servicios contratados.
          </p>

          <h2 style={estilos.subtitulo}>
            5. Servicios e incidencias
          </h2>
          <p>
            Los servicios se prestarán conforme al alcance acordado
            para cada solicitud. La existencia de funciones de avisos
            o comunicación de incidencias no implica que exista un
            servicio de emergencias permanente, salvo acuerdo expreso.
            Ante un peligro inmediato para personas o bienes, se
            deberá contactar con los servicios públicos de emergencia
            correspondientes.
          </p>

          <h2 style={estilos.subtitulo}>
            6. Protección de datos personales
          </h2>
          <p>
            El tratamiento de los datos personales se describe en la
            Política de Privacidad disponible en esta misma pantalla.
            La aceptación del contrato no sustituye los consentimientos
            específicos que puedan resultar necesarios conforme a
            la normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>
            7. Vigencia y aceptación
          </h2>
          <p>
            El contrato se acepta telemáticamente durante el proceso
            de registro. La aplicación podrá conservar constancia de
            la aceptación y de la versión del documento correspondiente,
            de acuerdo con las condiciones aplicables al tratamiento
            de datos personales.
          </p>

          <h2 style={estilos.subtitulo}>
            8. Legislación aplicable
          </h2>
          <p>
            El contrato se interpretará conforme a la legislación
            española y de la Unión Europea que resulte aplicable.
            Ninguna de sus cláusulas pretende eliminar derechos
            irrenunciables del usuario ni limitar responsabilidades
            que legalmente no puedan excluirse.
          </p>

          <p>
            <strong>Importante:</strong> este texto contiene las ocho
            cláusulas actualmente mostradas en la aplicación. Debe
            contrastarse con el contrato marco completo aprobado antes
            de utilizarlo como versión contractual definitiva.
          </p>
        </section>

        <section id="privacidad" style={estilos.tarjeta}>
          <PoliticaPrivacidad />
        </section>

        <button
          type="button"
          onClick={() => navigate("/register")}
          style={estilos.volver}
        >
          ← Volver al registro
        </button>
      </div>
    </main>
  );
}
