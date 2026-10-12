
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

          <p>
            Este contrato establece las condiciones generales de los
            servicios de gestión, avisos, inspección y mantenimiento
            de viviendas ofrecidos a través de CoastGuard Homes
            Services y de su aplicación.
          </p>

          <p>
            Las condiciones particulares de cada suscripción o
            servicio se comunicarán al cliente antes de su contratación.
            En caso de discrepancia, las condiciones particulares
            aceptadas prevalecerán únicamente en aquello que regulen
            específicamente, siempre que sean compatibles con la
            normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>1. Objeto y alcance</h2>

          <p>
            La plataforma permite gestionar información relacionada
            con viviendas, comunicar incidencias, organizar inspecciones
            y solicitar los servicios que estén disponibles en cada
            modalidad de contratación.
          </p>

          <p>
            La inclusión de una función en la aplicación no significa
            por sí sola que todos los servicios estén incluidos en
            una suscripción. El alcance contratado será el que figure
            en la oferta, suscripción o presupuesto aceptado por el
            cliente.
          </p>

          <h2 style={estilos.subtitulo}>
            2. Modalidades de contratación y precios
          </h2>

          <p>
            La contratación podrá realizarse mediante cualquiera de
            estas modalidades:
          </p>

          <ul>
            <li>
              <strong>Suscripción periódica:</strong> permite acceder
              a los servicios incluidos en el plan contratado durante
              el periodo correspondiente.
            </li>
            <li>
              <strong>Servicios individuales:</strong> se contratan
              por separado y se ejecutan conforme al alcance,
              precio y condiciones del presupuesto aceptado.
            </li>
          </ul>

          <p>
            Antes de contratar, se informará al cliente del precio
            total, los impuestos aplicables, los servicios incluidos,
            la periodicidad de los cobros, la forma de pago y las
            condiciones económicas que correspondan.
          </p>

          <p>
            No se considerará contratado un servicio adicional por
            el mero hecho de que aparezca en la aplicación, sea
            recomendado por un técnico o se haya solicitado
            información sobre él. Su contratación requerirá la
            aceptación correspondiente.
          </p>

          <h2 style={estilos.subtitulo}>
            3. Suscripciones, duración y cancelación
          </h2>

          <p>
            La modalidad habitual de suscripción podrá tener una
            duración de un año. La duración concreta, la periodicidad
            de facturación y las fechas aplicables se mostrarán al
            cliente antes de confirmar la contratación.
          </p>

          <p>
            La suscripción no implica un compromiso mínimo obligatorio
            de permanencia. El cliente podrá solicitar su cancelación
            con un preaviso mínimo de un mes.
          </p>

          <p>
            La solicitud de cancelación deberá realizarse por un
            canal habilitado por el prestador que permita dejar
            constancia de la comunicación. Se indicará al cliente
            la fecha efectiva de finalización de la suscripción.
          </p>

          <p>
            Las cantidades correspondientes a servicios ya prestados
            o importes válidamente devengados seguirán siendo exigibles
            cuando proceda legalmente. El tratamiento de pagos
            anticipados, posibles devoluciones y cobros pendientes
            deberá ajustarse a las condiciones económicas informadas
            antes de contratar y a la normativa aplicable.
          </p>

          <p>
            La cancelación no podrá utilizarse para imponer una
            penalización contraria a la ley ni para restringir los
            derechos irrenunciables del cliente. Las condiciones
            concretas de renovación y facturación se comunicarán
            antes de aceptar cada suscripción.
          </p>

          <h2 style={estilos.subtitulo}>
            4. Presupuestos y servicios individuales
          </h2>

          <p>
            Los servicios individuales estarán sujetos a un presupuesto
            que describirá, según corresponda, el trabajo solicitado,
            su alcance, el precio total, los impuestos, las condiciones
            de pago y cualquier exclusión relevante.
          </p>

          <p>
            El servicio solo se considerará autorizado cuando el
            cliente o una persona debidamente autorizada haya aceptado
            el presupuesto por el procedimiento habilitado.
          </p>

          <p>
            Si durante la ejecución se detecta la necesidad de realizar
            trabajos adicionales que afecten al precio o al alcance
            acordado, se solicitará la aprobación correspondiente
            antes de ejecutarlos, salvo las actuaciones que estén
            legalmente justificadas y debidamente autorizadas.
          </p>

          <h2 style={estilos.subtitulo}>
            5. Funciones y límites del personal técnico
          </h2>

          <p>
            El personal técnico podrá realizar las inspecciones
            asignadas, registrar observaciones, aportar fotografías
            o documentación relacionada con la inspección y comunicar
            incidencias conforme a los permisos de su cuenta.
          </p>

          <p>
            El personal técnico no está autorizado, por el mero hecho
            de realizar una inspección, a modificar precios, aprobar
            descuentos, alterar condiciones administrativas, cambiar
            facturas ni asumir compromisos económicos en nombre
            del prestador.
          </p>

          <p>
            Las decisiones administrativas y económicas corresponderán
            a las personas que tengan autorización para ello.
            Cualquier modificación del presupuesto deberá seguir
            el procedimiento de aprobación correspondiente.
          </p>

          <h2 style={estilos.subtitulo}>
            6. Prestación de servicios e incidencias
          </h2>

          <p>
            Los servicios se prestarán conforme a la modalidad
            contratada, al presupuesto aceptado y a la disponibilidad
            de los recursos necesarios.
          </p>

          <p>
            Las fechas o plazos comunicados al cliente se entenderán
            sujetos a las condiciones expresamente indicadas y a las
            circunstancias que puedan afectar razonablemente a la
            ejecución. Cualquier retraso relevante se comunicará
            cuando resulte posible.
          </p>

          <p>
            La disponibilidad de funciones para registrar avisos
            o comunicar incidencias no implica que exista un servicio
            permanente de emergencias, vigilancia continua o respuesta
            inmediata, salvo que se haya contratado expresamente.
          </p>

          <p>
            Ante un peligro inmediato para personas o bienes, el
            usuario deberá contactar con los servicios públicos de
            emergencia que correspondan.
          </p>

          <h2 style={estilos.subtitulo}>
            7. Uso de la plataforma y cuentas
          </h2>

          <p>
            El usuario deberá facilitar información veraz, utilizar
            la aplicación de forma lícita, proteger sus credenciales
            y comunicar las incidencias relevantes para la prestación
            de los servicios.
          </p>

          <p>
            Cada usuario deberá actuar dentro de las funciones y
            permisos asignados a su cuenta. No deberá acceder a
            información ajena a sus autorizaciones ni utilizar la
            plataforma para alterar, ocultar o manipular información
            sin autorización.
          </p>

          <p>
            El usuario deberá comunicar cualquier sospecha de acceso
            no autorizado a su cuenta o uso indebido de sus credenciales.
          </p>

          <h2 style={estilos.subtitulo}>
            8. Disponibilidad y limitaciones técnicas
          </h2>

          <p>
            Se realizarán esfuerzos razonables para mantener la
            aplicación disponible y segura. El acceso podrá verse
            temporalmente afectado por tareas de mantenimiento,
            incidencias técnicas, fallos de software, interrupciones
            de las redes de telecomunicaciones u otras circunstancias
            ajenas al control razonable del prestador.
          </p>

          <p>
            Estas limitaciones no excluyen ni reducen las
            responsabilidades que legalmente no puedan excluirse,
            ni los derechos que correspondan al cliente conforme
            a la normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>
            9. Protección de datos personales
          </h2>

          <p>
            El tratamiento de los datos personales se describe en
            la Política de Privacidad disponible en esta misma
            pantalla.
          </p>

          <p>
            La aceptación de este contrato no sustituye los
            consentimientos específicos que puedan ser necesarios.
            Los datos se tratarán conforme a la normativa de protección
            de datos aplicable y a la información facilitada al usuario.
          </p>

          <h2 style={estilos.subtitulo}>
            10. Contratación a distancia y desistimiento
          </h2>

          <p>
            Cuando la contratación se realice a distancia con un
            consumidor y la normativa reconozca un derecho de
            desistimiento, se informará al cliente del plazo, del
            procedimiento para ejercerlo y de las consecuencias
            correspondientes.
          </p>

          <p>
            En los casos en que resulte aplicable, el plazo general
            de desistimiento para contratos de servicios celebrados
            a distancia es de catorce días naturales desde la
            celebración del contrato, sin perjuicio de los plazos
            especiales y las excepciones previstos legalmente.
          </p>

          <p>
            Si el cliente solicita expresamente que un servicio
            comience durante el periodo de desistimiento, se recabará
            la aceptación o el reconocimiento que legalmente
            corresponda. La pérdida del derecho de desistimiento
            solo se aplicará cuando se cumplan los requisitos legales.
          </p>

          <p>
            Esta cláusula no limita los derechos legales de
            consumidores y usuarios ni sustituye la información
            específica que deba entregarse antes de contratar.
          </p>

          <h2 style={estilos.subtitulo}>
            11. Vigencia y aceptación del contrato
          </h2>

          <p>
            El contrato marco se presenta para su aceptación durante
            el proceso de registro. La aceptación de este documento
            no supone por sí sola la contratación de una suscripción
            de pago ni de un servicio individual cuyo precio y
            condiciones no hayan sido comunicados y aceptados.
          </p>

          <p>
            Cuando corresponda, se conservará constancia de la
            aceptación y de la versión del documento aceptado,
            conforme a la normativa aplicable y a la Política
            de Privacidad.
          </p>

          <h2 style={estilos.subtitulo}>
            12. Legislación aplicable y derechos del cliente
          </h2>

          <p>
            El contrato se interpretará conforme a la legislación
            española y de la Unión Europea que resulte aplicable.
            Ninguna cláusula pretende eliminar derechos irrenunciables
            del cliente ni limitar responsabilidades que legalmente
            no puedan excluirse.
          </p>

          <p>
            Si una disposición fuera declarada inválida o inaplicable,
            las restantes disposiciones conservarán su eficacia
            en la medida permitida por la ley.
          </p>

          <p>
            <strong>Información importante:</strong> este contrato
            establece condiciones generales. Antes de activar la
            contratación con clientes reales, deberán estar definidas
            y mostrarse las condiciones particulares de cada plan,
            incluidos precios, periodicidad de cobro, renovación,
            fecha efectiva de baja y tratamiento de importes
            anticipados. Este texto debe someterse a revisión jurídica
            antes de utilizarse como versión contractual definitiva.
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
