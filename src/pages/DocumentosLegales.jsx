
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PoliticaPrivacidad from "./PoliticaPrivacidad.jsx";
import "./DocumentosLegales.css";

const EMAIL = "coastguardhomes@gmail.com";

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

function EnlaceCorreo() {
  return <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;
}

export default function DocumentosLegales() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace(/^#/, "");

    if (!id) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
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
              <strong>NIF/NIE:</strong> Z1968154A.
            </li>
            <li>
              <strong>Domicilio profesional:</strong>{" "}
              Calle Casicas de Arriba, 33, 1.º F, Pilar de la Horadada,
              Alicante, España.
            </li>
            <li>
              <strong>Correo electrónico:</strong> <EnlaceCorreo />
            </li>
          </ul>

          <h2 style={estilos.subtitulo}>2. Finalidad de la aplicación</h2>

          <p>
            CoastGuard Homes es una aplicación destinada a que los clientes
            puedan consultar y gestionar información relacionada con sus
            viviendas, contratos, inspecciones, documentación, facturas,
            comunicaciones y otros datos vinculados a los servicios que
            hayan contratado, según los permisos de su cuenta.
          </p>

          <p>
            La aplicación es una herramienta de apoyo para clientes con una
            relación contractual con CoastGuard Homes Services. La aplicación
            no implica que todos los servicios estén incluidos en cada
            contratación ni sustituye las condiciones particulares aceptadas
            por el cliente.
          </p>

          <p>
            Los servicios pueden incluir suscripciones de inspecciones,
            inspecciones adicionales abonadas por separado y, cuando se
            contrate expresamente, custodia de llaves sin visitas. El alcance
            concreto de cada servicio se determina en la documentación
            contractual correspondiente.
          </p>

          <p>
            La custodia de llaves por sí sola no incluye visitas, inspecciones
            ni vigilancia de la vivienda. Estas actuaciones requieren una
            contratación expresa.
          </p>

          <p>
            El sitio web independiente de CoastGuard Homes constituye un
            medio distinto de la aplicación y se rige por la información
            y las condiciones que correspondan a los tratamientos y servicios
            que se realicen a través de ese sitio.
          </p>

          <h2 style={estilos.subtitulo}>3. Condiciones de uso</h2>

          <p>
            El usuario debe utilizar la aplicación de forma lícita, facilitar
            información veraz y acceder únicamente a los datos y funciones
            autorizados para su cuenta. No está permitido acceder sin
            autorización a información de otras personas o viviendas,
            alterar información ni eludir los controles de acceso.
          </p>

          <h2 style={estilos.subtitulo}>4. Propiedad intelectual</h2>

          <p>
            Los contenidos, textos, diseños, logotipos y demás elementos
            de la aplicación están protegidos, cuando corresponda, por la
            normativa de propiedad intelectual e industrial. Su utilización
            no autorizada queda prohibida, salvo en los casos permitidos
            por la ley.
          </p>

          <h2 style={estilos.subtitulo}>5. Protección de datos</h2>

          <p>
            El tratamiento de los datos personales se describe en la Política
            de Privacidad incluida en esta página.
          </p>

          <h2 style={estilos.subtitulo}>6. Responsabilidad y legislación</h2>

          <p>
            Se realizarán esfuerzos razonables para mantener la aplicación
            disponible y proteger la información. Pueden producirse
            interrupciones por mantenimiento, incidencias técnicas o
            circunstancias ajenas al control razonable de la responsable.
          </p>

          <p>
            Lo anterior no excluye las responsabilidades que legalmente
            no puedan excluirse ni limita los derechos irrenunciables
            de los consumidores y usuarios.
          </p>

          <p>
            Este aviso se rige por la legislación española y de la Unión
            Europea que resulte aplicable.
          </p>
        </section>

        <section id="contrato" style={estilos.tarjeta}>
          <h1 style={estilos.titulo}>CONTRATO MARCO DE SERVICIOS</h1>

          <p>
            Este contrato establece las condiciones generales aplicables
            a los servicios de CoastGuard Homes Services. Los servicios
            concretos, su alcance, precio, impuestos, periodicidad de pago
            y fecha de inicio se identificarán en las condiciones
            particulares, el presupuesto o la documentación contractual
            aceptada por el cliente.
          </p>

          <p>
            La aceptación de este contrato marco durante el registro no
            implica por sí sola la contratación de una suscripción de pago
            ni de un servicio adicional cuyo precio y condiciones todavía
            no se hayan comunicado y aceptado.
          </p>

          <h2 style={estilos.subtitulo}>1. Objeto y alcance del servicio</h2>

          <p>
            CoastGuard Homes Services prestará los servicios que el cliente
            haya contratado y aceptado expresamente, de acuerdo con el
            alcance descrito en sus condiciones particulares.
          </p>

          <p>
            Los servicios podrán incluir una suscripción de inspecciones
            con las prestaciones y la frecuencia acordadas, así como
            inspecciones adicionales contratadas y abonadas por separado.
            Las condiciones particulares indicarán qué actuaciones están
            incluidas en la cuota y cuáles tienen un coste adicional.
          </p>

          <p>
            Cuando se contrate custodia de llaves sin visitas, el servicio
            comprenderá las actuaciones acordadas relacionadas con la
            recepción, conservación, control y devolución de las llaves.
            Esa modalidad no incluye por sí sola visitas ni inspecciones.
          </p>

          <p>
            La disponibilidad de una función en la aplicación no significa
            que la actividad correspondiente esté incluida en el contrato.
            No se realizarán actuaciones fuera del alcance contratado
            sin la autorización que corresponda.
          </p>

          <h2 style={estilos.subtitulo}>2. Custodia y gestión de llaves</h2>

          <p>
            Cuando se contrate la custodia de llaves, el cliente facilitará
            las llaves y la información estrictamente necesaria para
            identificarlas y gestionar el servicio. La recepción y devolución
            se coordinarán por los medios acordados entre las partes.
          </p>

          <p>
            Las llaves se custodiarán aplicando medidas razonables de
            seguridad y limitando su acceso a las personas autorizadas.
            El cliente deberá comunicar cualquier circunstancia relevante
            para su identificación, gestión o devolución.
          </p>

          <p>
            La custodia no autoriza por sí sola a entrar en la vivienda,
            realizar visitas, inspeccionar el inmueble ni entregar las
            llaves a terceros. Cualquier actuación de ese tipo deberá
            contar con la autorización y las condiciones que correspondan.
          </p>

          <h2 style={estilos.subtitulo}>3. Precio y facturación</h2>

          <p>
            Antes de confirmar la contratación, el cliente recibirá
            información sobre el servicio contratado, el precio, los
            impuestos aplicables, el importe total que corresponda y las
            condiciones de pago.
          </p>

          <p>
            La suscripción se factura y abona mensualmente conforme a las
            condiciones particulares aceptadas. Las inspecciones adicionales
            u otros servicios no incluidos en la suscripción se presupuestarán
            y abonarán por separado antes de su ejecución, según las
            condiciones comunicadas al cliente.
          </p>

          <p>
            Los cobros y la facturación se gestionarán mediante los
            procedimientos habilitados para la contratación. Los datos
            de pago serán tratados conforme a las funciones y condiciones
            aplicables a los proveedores que intervengan.
          </p>

          <p>
            Cualquier propuesta de modificación del precio deberá comunicarse
            previamente, indicando el nuevo importe y la fecha propuesta
            de aplicación. Se solicitará la aceptación del cliente cuando
            así lo exijan el contrato o la normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>
            4. Duración, renovación y cancelación
          </h2>

          <p>
            La suscripción tiene periodicidad de pago mensual y no establece
            una permanencia mínima anual. El cliente podrá solicitar su
            cancelación en cualquier momento, con un preaviso ordinario
            de un (1) mes, conforme a estas condiciones y sin penalización
            por permanencia anual.
          </p>

          <p>
            La solicitud de cancelación podrá enviarse al correo electrónico{" "}
            <EnlaceCorreo /> o mediante otro canal habilitado que permita
            dejar constancia de la comunicación.
          </p>

          <p>
            La comunicación deberá permitir identificar al cliente y la
            suscripción que desea cancelar. CoastGuard Homes Services
            gestionará la solicitud y comunicará la fecha efectiva de
            finalización por un medio que permita conservar constancia
            de la comunicación.
          </p>

          <p>
            Salvo que se acuerde por escrito una fecha anterior o la
            normativa otorgue al cliente un derecho más favorable, el
            preaviso ordinario será de un (1) mes desde la recepción
            de la comunicación.
          </p>

          <p>
            Durante el preaviso, el servicio continuará en los términos
            contratados y se abonarán las cantidades que correspondan
            hasta la fecha efectiva de finalización. Una vez efectiva
            la baja, no se cobrarán nuevas cuotas por períodos posteriores,
            sin perjuicio de las cantidades válidamente devengadas,
            facturas pendientes u otras obligaciones legalmente exigibles.
          </p>

          <p>
            La gestión administrativa de la baja podrá realizarse
            manualmente después de recibir y verificar la solicitud.
            La cancelación de un método de pago o una acción en la
            plataforma de pagos no sustituye por sí sola la comunicación
            de baja ni elimina cantidades legítimamente pendientes.
          </p>

          <p>
            No se exigirán cuotas correspondientes a una permanencia anual
            inexistente ni penalizaciones por cancelar la suscripción
            conforme a estas condiciones. Esta cláusula se entiende sin
            perjuicio del derecho legal de desistimiento y de cualquier
            otro derecho de terminación que resulte aplicable.
          </p>

          <h2 style={estilos.subtitulo}>
            5. Servicios adicionales y presupuestos
          </h2>

          <p>
            Cualquier servicio que no esté incluido expresamente en las
            condiciones particulares se considerará adicional cuando
            corresponda.
          </p>

          <p>
            Antes de realizar un servicio adicional que requiera presupuesto,
            se facilitará información sobre el trabajo previsto, su alcance,
            el precio, los impuestos y las condiciones de pago.
          </p>

          <p>
            El servicio adicional solo quedará autorizado cuando el cliente
            haya aceptado expresamente el presupuesto o haya otorgado otra
            autorización previa, expresa y válida que contemple específicamente
            la actuación correspondiente. No se realizarán trabajos ni
            se cobrarán importes adicionales sin la autorización necesaria.
          </p>

          <p>
            Si durante un trabajo autorizado se detecta la necesidad de
            modificar el precio o el alcance, se solicitará una nueva
            aceptación antes de ejecutar las actuaciones adicionales,
            salvo que exista una autorización previa válida que contemple
            específicamente ese supuesto.
          </p>

          <h2 style={estilos.subtitulo}>6. Obligaciones del cliente</h2>

          <p>
            El cliente deberá facilitar información veraz y suficiente
            para identificar la vivienda y gestionar los servicios
            contratados, abonar las cantidades debidas y comunicar los
            cambios que puedan afectar a la prestación del servicio.
          </p>

          <p>
            Cuando corresponda, el cliente deberá informar de las personas
            autorizadas para recibir las llaves y mantener actualizados
            los datos de contacto necesarios para las comunicaciones.
          </p>

          <h2 style={estilos.subtitulo}>7. Obligaciones de la prestadora</h2>

          <p>
            CoastGuard Homes Services prestará los servicios dentro del
            alcance contratado, aplicará medidas razonables de seguridad
            para la custodia de llaves cuando corresponda, atenderá las
            comunicaciones relacionadas con el servicio y facilitará
            la documentación contractual y de facturación que proceda.
          </p>

          <p>
            No se asumen obligaciones de vigilancia permanente, inspección,
            acceso a la vivienda o atención de emergencias que no estén
            expresamente incluidas en el servicio contratado. Esta cláusula
            no excluye responsabilidades que legalmente no puedan excluirse.
          </p>

          <h2 style={estilos.subtitulo}>8. Incidencias y comunicaciones</h2>

          <p>
            Las comunicaciones relativas a los servicios, las llaves,
            los pagos, la documentación o la cancelación podrán realizarse
            mediante los canales habilitados para la relación contractual.
          </p>

          <p>
            La existencia de un canal para comunicar incidencias no implica
            vigilancia permanente, atención de emergencias ni respuesta
            inmediata, salvo que se haya contratado expresamente un servicio
            con esas características. Ante un peligro inmediato para
            personas o bienes, deberán utilizarse los servicios públicos
            de emergencia correspondientes.
          </p>

          <h2 style={estilos.subtitulo}>9. Uso de la aplicación</h2>

          <p>
            El usuario deberá proteger sus credenciales y utilizar la
            aplicación de forma lícita. No podrá acceder a información
            ajena a sus permisos ni alterar, ocultar o manipular datos
            sin autorización.
          </p>

          <p>
            Se realizarán esfuerzos razonables para mantener la aplicación
            disponible y segura. Pueden producirse interrupciones por
            mantenimiento, incidencias técnicas o circunstancias ajenas
            al control razonable de la prestadora. Estas limitaciones
            no excluyen responsabilidades legalmente exigibles.
          </p>

          <h2 style={estilos.subtitulo}>10. Protección de datos personales</h2>

          <p>
            El tratamiento de los datos personales se describe en la Política
            de Privacidad disponible en esta página. Los datos se tratarán
            conforme a la normativa aplicable y a la información facilitada
            al usuario.
          </p>

          <p>
            La aceptación de este contrato no sustituye los consentimientos
            específicos que puedan ser necesarios para tratamientos concretos
            ni las solicitudes expresas que legalmente deban obtenerse para
            comenzar la prestación de un servicio durante el plazo de
            desistimiento.
          </p>

          <h2 style={estilos.subtitulo}>
            11. Contratación a distancia y derecho de desistimiento
          </h2>

          <p>
            Cuando el cliente tenga la condición legal de consumidor y
            el contrato de servicios se celebre a distancia o fuera del
            establecimiento mercantil, dispondrá, con carácter general
            y salvo las excepciones legales aplicables, de catorce (14)
            días naturales para ejercer el derecho de desistimiento desde
            la celebración del contrato de servicios, sin necesidad de
            justificar su decisión ni soportar penalización por ejercer
            este derecho. En los supuestos en que la normativa establezca
            un plazo diferente, se aplicará el plazo legal correspondiente.
          </p>

          <p>
            La aceptación de este contrato marco durante el registro no
            inicia por sí sola el plazo de desistimiento de una suscripción
            o servicio concreto cuando todavía no se haya celebrado ese
            contrato de servicios. El plazo se determinará atendiendo a
            la contratación efectiva y a la normativa aplicable.
          </p>

          <p>
            Para ejercer el derecho, el cliente deberá comunicar de forma
            inequívoca su decisión dentro del plazo a{" "}
            <EnlaceCorreo /> o mediante otro medio habilitado que permita
            dejar constancia de la comunicación. Puede utilizar el modelo
            orientativo incluido a continuación, aunque no es obligatorio
            emplearlo.
          </p>

          <p>
            Si el cliente solicita expresamente que el servicio comience
            durante el plazo de desistimiento y después ejerce ese derecho,
            solo podrá exigirse, cuando legalmente proceda y se cumplan
            los requisitos de información y solicitud expresa, el importe
            proporcional al servicio efectivamente prestado hasta el
            momento de comunicar el desistimiento.
          </p>

          <p>
            La pérdida del derecho de desistimiento por la ejecución completa
            del servicio solo podrá aplicarse cuando se cumplan los requisitos
            legales correspondientes, incluidos el consentimiento previo
            expreso y el reconocimiento de que se perderá el derecho una
            vez ejecutado íntegramente el contrato, cuando así lo exija
            la normativa. El mero inicio parcial del servicio no implica
            por sí solo la pérdida automática del derecho.
          </p>

          <p>
            El derecho de desistimiento legal es distinto de la cancelación
            ordinaria de la suscripción con un mes de preaviso. Las
            condiciones de cancelación ordinaria no limitan los derechos
            legales que puedan corresponder al consumidor.
          </p>

          <p>
            <strong>
              Modelo orientativo de comunicación de desistimiento:
            </strong>
          </p>

          <p>
            A la atención de Roxana Collazo Alonso, CoastGuard Homes Services
            (<EnlaceCorreo />): Por la presente comunico que desisto del
            contrato del siguiente servicio: [indicar servicio]. Nombre
            del consumidor: [nombre y apellidos]. Correo electrónico
            asociado a la cuenta: [correo]. Fecha de contratación: [fecha].
            Fecha de comunicación: [fecha].
          </p>

          <h2 style={estilos.subtitulo}>12. Aceptación y documentación</h2>

          <p>
            Este contrato marco establece las condiciones generales de
            la relación entre las partes. Su aceptación durante el registro
            no implica por sí sola la contratación de una suscripción de
            pago ni de un servicio adicional cuyo precio y condiciones
            no hayan sido comunicados y aceptados.
          </p>

          <p>
            La suscripción quedará concretada mediante las condiciones
            particulares aceptadas, en las que constarán, como mínimo,
            el servicio contratado, la vivienda identificada cuando
            corresponda, la cuota, los impuestos, la periodicidad de pago,
            las condiciones de cancelación y la fecha de inicio.
          </p>

          <p>
            Se conservará constancia de la aceptación y de la versión
            del documento aceptado conforme a las posibilidades del
            sistema y a la normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>
            13. Legislación aplicable y derechos del cliente
          </h2>

          <p>
            El contrato se interpretará conforme a la legislación española
            y de la Unión Europea que resulte aplicable. Ninguna cláusula
            pretende eliminar derechos irrenunciables del cliente ni
            limitar responsabilidades que legalmente no puedan excluirse.
          </p>

          <p>
            Si una disposición fuera declarada inválida o inaplicable,
            las restantes conservarán su eficacia en la medida permitida
            por la ley.
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
