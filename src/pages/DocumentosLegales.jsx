
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

        {/* AVISO LEGAL */}
        <section id="aviso-legal" style={estilos.tarjeta}>
          <h1 style={estilos.titulo}>AVISO LEGAL</h1>

          <h2 style={estilos.subtitulo}>1. Titular</h2>

          <ul>
            <li>
              <strong>Titular:</strong> Roxana Collazo Alonso.
            </li>
            <li>
              <strong>Nombre comercial:</strong> CoastGuard Homes Services.
            </li>
            <li>
              <strong>NIF:</strong> Z1968154A.
            </li>
            <li>
              <strong>Domicilio profesional:</strong> Calle Clásicas de
              Arriba, 33, 1.º F, Pilar de la Horadada, Alicante, España.
            </li>
            <li>
              <strong>Correo electrónico:</strong>{" "}
              <a href="mailto:coastguardhomes@gmail.com">
                coastguardhomes@gmail.com
              </a>
            </li>
          </ul>

          <h2 style={estilos.subtitulo}>2. Finalidad de la aplicación</h2>

          <p>
            CoastGuard Homes es una aplicación destinada a clientes
            autorizados para consultar información y documentación
            relacionada con sus viviendas y con los servicios
            contratados o gestionados con CoastGuard Homes Services.
          </p>

          <p>
            Según los permisos de cada cuenta, la aplicación puede
            permitir consultar datos de viviendas, contratos,
            revisiones, incidencias, fotografías, informes y otros
            documentos relacionados con los servicios correspondientes.
          </p>

          <p>
            La aplicación es una herramienta de consulta y gestión
            para clientes autorizados. Los servicios contratados,
            su alcance y sus condiciones se rigen por los contratos
            y acuerdos correspondientes.
          </p>

          <h2 style={estilos.subtitulo}>3. Uso de la aplicación</h2>

          <p>
            El usuario debe utilizar la aplicación de forma lícita
            y acceder únicamente a la información y las funciones
            autorizadas para su cuenta. No está permitido acceder
            sin autorización a datos de otras personas o viviendas,
            alterar información ni eludir los controles de acceso.
          </p>

          <h2 style={estilos.subtitulo}>4. Propiedad intelectual</h2>

          <p>
            Los contenidos, textos, diseños, logotipos y demás
            elementos de la aplicación están protegidos, cuando
            corresponda, por la normativa de propiedad intelectual
            e industrial. Su utilización no autorizada queda prohibida,
            salvo en los casos permitidos por la ley.
          </p>

          <h2 style={estilos.subtitulo}>5. Protección de datos</h2>

          <p>
            El tratamiento de los datos personales se explica en la{" "}
            <a href="#privacidad">Política de Privacidad</a> disponible
            en esta misma página.
          </p>

          <h2 style={estilos.subtitulo}>6. Legislación aplicable</h2>

          <p>
            Este aviso se rige por la legislación española y de la
            Unión Europea que resulte aplicable, respetando en todo
            caso los derechos irrenunciables de los consumidores
            y usuarios.
          </p>
        </section>

        {/* CONTRATO MARCO */}
        <section id="contrato" style={estilos.tarjeta}>
          <h1 style={estilos.titulo}>CONTRATO MARCO DE SERVICIOS</h1>

          <p>
            Este contrato establece las condiciones generales de los
            servicios de gestión, inspección, comunicación de incidencias
            y mantenimiento de viviendas ofrecidos por CoastGuard Homes
            Services y su aplicación.
          </p>

          <p>
            Las condiciones particulares de cada cliente se recogerán
            en la oferta o contrato individual aceptado, donde constarán
            la vivienda, los servicios incluidos, la frecuencia de las
            revisiones, la cuota mensual, los impuestos y la fecha de
            inicio. En caso de discrepancia, prevalecerán las condiciones
            particulares aceptadas en aquello que regulen específicamente,
            sin perjuicio de los derechos legales del cliente.
          </p>

          <h2 style={estilos.subtitulo}>1. Objeto y alcance</h2>

          <p>
            La plataforma permite gestionar información relacionada con
            viviendas, organizar revisiones, registrar observaciones,
            comunicar incidencias y solicitar servicios disponibles
            según la modalidad contratada.
          </p>

          <p>
            La suscripción cubre únicamente las revisiones y prestaciones
            expresamente incluidas en el plan aceptado. La aparición de
            una función, tarea o servicio en la aplicación no significa
            que esté incluido en la cuota mensual.
          </p>

          <h2 style={estilos.subtitulo}>
            2. Suscripción, frecuencia y cálculo del precio
          </h2>

          <p>
            La suscripción se factura mensualmente. La frecuencia de
            revisión se acordará con el cliente y podrá ser mensual,
            quincenal o semanal, según figure en sus condiciones
            particulares.
          </p>

          <p>
            La cuota se calcula de forma personalizada mediante la
            aplicación, teniendo en cuenta las características de la
            vivienda, que pueden incluir superficie en metros cuadrados,
            número de habitaciones y baños, piscina, jardín y otras
            características relevantes para el servicio.
          </p>

          <p>
            Antes de aceptar la contratación, el cliente recibirá
            información sobre la cuota mensual, los impuestos aplicables,
            el importe total mensual, la frecuencia de las revisiones
            y los servicios incluidos.
          </p>

          <p>
            La cuota acordada permanecerá fija mientras se mantengan
            las condiciones particulares aceptadas. No se aplicará una
            modificación del precio sin la aceptación expresa del cliente.
            Cualquier propuesta de cambio deberá comunicarse previamente,
            indicando el nuevo importe y la fecha propuesta para su
            aplicación. Si el cliente no acepta el cambio, podrá mantener
            las condiciones vigentes o cancelar la suscripción conforme
            a este contrato.
          </p>

          <h2 style={estilos.subtitulo}>
            3. Duración, renovación y cancelación
          </h2>

          <p>
            La suscripción se contrata por períodos mensuales, sin
            permanencia mínima anual. Comienza en la fecha indicada en
            las condiciones particulares y se renueva automáticamente
            mes a mes mientras ninguna de las partes la dé por terminada
            conforme a este contrato.
          </p>

          <p>
            El cliente puede cancelar la suscripción en cualquier momento,
            sin penalización por permanencia ni obligación de pagar los
            meses posteriores a la fecha efectiva de baja. Para organizar
            la finalización del servicio, deberá comunicar la cancelación
            con un (1) mes de preaviso, sin perjuicio de los derechos
            legales que puedan permitir una terminación más favorable.
          </p>

          <p>
            La cancelación surtirá efecto al cumplirse un mes desde que
            el prestador reciba la comunicación, salvo que confirme por
            escrito una fecha anterior o que la normativa aplicable
            otorgue al cliente un derecho más favorable. El prestador
            confirmará por un medio duradero la recepción de la solicitud
            y la fecha efectiva de finalización.
          </p>

          <p>
            Durante el preaviso, el servicio seguirá activo y se abonarán
            las cuotas mensuales que correspondan hasta la fecha efectiva
            de finalización, según el período de facturación y las
            condiciones comunicadas antes de contratar. No se cobrarán
            penalizaciones por meses de una supuesta permanencia anual ni
            cuotas correspondientes a períodos posteriores a la baja
            efectiva.
          </p>

          <p>
            La cancelación no elimina las cantidades válidamente
            devengadas hasta la fecha efectiva de finalización ni
            las facturas pendientes que correspondan a servicios
            efectivamente prestados. Los pagos anticipados, devoluciones
            y demás importes se tratarán conforme a las condiciones
            aceptadas y a la normativa aplicable.
          </p>

          <p>
            La cancelación podrá comunicarse desde los canales de contacto
            disponibles en la aplicación o por correo electrónico a{" "}
            <a href="mailto:coastguardhomes@gmail.com">
              coastguardhomes@gmail.com
            </a>
            . La comunicación deberá permitir identificar al cliente y la
            suscripción que desea cancelar. No será necesario justificar
            la decisión. El cliente podrá conservar el mensaje enviado
            y la confirmación de recepción.
          </p>

          <h2 style={estilos.subtitulo}>
            4. Servicios adicionales y presupuestos
          </h2>

          <p>
            Los trabajos adicionales, reparaciones, actuaciones
            extraordinarias y demás servicios que no estén incluidos
            expresamente en la suscripción se considerarán servicios
            extra y se cobrarán por separado.
          </p>

          <p>
            Antes de realizar un servicio extra, el prestador facilitará
            al cliente un presupuesto que indique el trabajo previsto,
            su alcance, el precio, los impuestos aplicables y las
            condiciones de pago.
          </p>

          <p>
            El servicio extra solo se considerará autorizado cuando
            el cliente haya aceptado el presupuesto de forma expresa.
            No se ejecutarán trabajos adicionales ni se cobrará su
            importe antes de dicha aceptación, salvo que exista una
            autorización previa, expresa y válida que contemple
            específicamente la actuación correspondiente.
          </p>

          <p>
            El pago del servicio extra se realizará conforme a las
            condiciones comunicadas y aceptadas para ese servicio.
          </p>

          <p>
            Si durante un trabajo autorizado se detecta la necesidad
            de realizar actuaciones adicionales que cambien el precio
            o el alcance, se solicitará una nueva aceptación antes
            de ejecutarlas.
          </p>

          <h2 style={estilos.subtitulo}>
            5. Funciones y límites del personal técnico
          </h2>

          <p>
            El personal técnico podrá realizar las inspecciones
            asignadas, registrar observaciones, aportar fotografías
            y documentación relacionada con la revisión y comunicar
            incidencias, dentro de los permisos de su cuenta.
          </p>

          <p>
            El técnico no está autorizado, por el mero hecho de realizar
            una inspección, a modificar la cuota de la suscripción,
            cambiar precios, aprobar descuentos, alterar condiciones
            administrativas, modificar facturas ni asumir compromisos
            económicos en nombre del prestador.
          </p>

          <p>
            Cualquier cambio económico o administrativo deberá ser
            gestionado por personal autorizado y, cuando afecte a
            las condiciones aceptadas por el cliente, requerirá la
            aceptación que corresponda.
          </p>

          <h2 style={estilos.subtitulo}>
            6. Prestación de servicios e incidencias
          </h2>

          <p>
            Los servicios se prestarán conforme a la modalidad,
            frecuencia, alcance y condiciones aceptadas por el cliente.
            Las visitas estarán sujetas a la coordinación necesaria
            para acceder a la vivienda y realizar la revisión.
          </p>

          <p>
            Las incidencias se comunicarán a través de los medios
            disponibles en la plataforma. La existencia de una función
            para comunicar incidencias no implica por sí sola que
            exista vigilancia permanente, atención de emergencias
            ni respuesta inmediata, salvo contratación expresa.
          </p>

          <p>
            Ante un peligro inmediato para personas o bienes, el
            usuario deberá contactar con los servicios públicos de
            emergencia correspondientes.
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
            información ajena a sus autorizaciones ni alterar,
            ocultar o manipular información sin autorización.
          </p>

          <h2 style={estilos.subtitulo}>
            8. Disponibilidad y limitaciones técnicas
          </h2>

          <p>
            Se realizarán esfuerzos razonables para mantener la
            aplicación disponible y segura. El acceso podrá verse
            temporalmente afectado por tareas de mantenimiento,
            incidencias técnicas, fallos de software, interrupciones
            de redes de telecomunicaciones u otras circunstancias
            ajenas al control razonable del prestador.
          </p>

          <p>
            Estas limitaciones no excluyen las responsabilidades
            que legalmente no puedan excluirse ni reducen los
            derechos que correspondan al cliente.
          </p>

          <h2 style={estilos.subtitulo}>
            9. Protección de datos personales
          </h2>

          <p>
            El tratamiento de los datos personales se describe en
            la Política de Privacidad disponible en esta misma pantalla.
            Los datos se tratarán conforme a la normativa aplicable
            y a la información facilitada al usuario.
          </p>

          <p>
            La aceptación de este contrato no sustituye los
            consentimientos específicos que puedan ser necesarios.
          </p>

          <h2 style={estilos.subtitulo}>
            10. Contratación a distancia y desistimiento
          </h2>

          <p>
            Si el cliente tiene la condición legal de consumidor y la
            contratación a distancia está sujeta al derecho de
            desistimiento, podrá desistir en un plazo de catorce (14)
            días naturales desde la celebración del contrato de servicios,
            salvo que resulte aplicable una regla legal distinta. El
            ejercicio de este derecho no requiere justificar la decisión
            ni conlleva penalización.
          </p>

          <p>
            Para ejercerlo, el cliente deberá enviar dentro del plazo una
            declaración inequívoca de que desea desistir a{" "}
            <a href="mailto:coastguardhomes@gmail.com">
              coastguardhomes@gmail.com
            </a>
            . También podrá utilizar el modelo orientativo que aparece
            al final de esta cláusula. Se recomienda indicar nombre y
            apellidos, correo asociado a la cuenta y servicio contratado
            para poder identificar la contratación. El plazo se respetará
            si la comunicación se envía antes de que finalice.
          </p>

          <p>
            Si el cliente solicita expresamente que el servicio comience
            durante el plazo de desistimiento, podrá tener que abonar,
            cuando legalmente proceda y se cumplan los requisitos de
            información y solicitud expresa, la parte proporcional del
            servicio efectivamente prestado hasta el momento en que
            comunique el desistimiento. La pérdida del derecho por
            ejecución completa solo podrá aplicarse si se cumplen todos
            los requisitos legales, incluida la solicitud o consentimiento
            previo expreso y el reconocimiento informado exigible. La mera
            contratación o el inicio parcial del servicio no supone por
            sí solo la pérdida automática del derecho.
          </p>

          <p>
            <strong>
              Modelo orientativo de comunicación de desistimiento:
            </strong>
          </p>

          <p>
            A la atención de Roxana Collazo Alonso, CoastGuard Homes Services
            (
            <a href="mailto:coastguardhomes@gmail.com">
              coastguardhomes@gmail.com
            </a>
            ): Por la presente comunico que desisto del contrato del
            siguiente servicio: [indicar servicio]. Nombre del consumidor:
            [nombre y apellidos]. Correo de la cuenta: [correo electrónico].
            Fecha de contratación: [fecha]. Fecha de la comunicación: [fecha].
          </p>

          <h2 style={estilos.subtitulo}>
            11. Vigencia y aceptación del contrato
          </h2>

          <p>
            Este contrato marco establece las condiciones generales
            de los servicios. Su aceptación durante el registro no
            implica por sí sola la contratación de una suscripción
            de pago ni de un servicio extra cuyo precio y condiciones
            no hayan sido comunicados y aceptados.
          </p>

          <p>
            La suscripción quedará concretada mediante las condiciones
            particulares aceptadas, en las que se indicarán la vivienda,
            el alcance del plan, la frecuencia de revisión, la cuota
            mensual, los impuestos, la periodicidad de facturación y
            la fecha de inicio. No existirá una fecha de finalización
            anual ni permanencia mínima, sin perjuicio de la cancelación
            conforme a este contrato.
          </p>

          <p>
            Se conservará constancia de la aceptación y de la versión
            del documento aceptado conforme a la normativa aplicable.
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
            las restantes conservarán su eficacia en la medida
            permitida por la ley.
          </p>
        </section>

        {/* POLÍTICA DE PRIVACIDAD */}
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
