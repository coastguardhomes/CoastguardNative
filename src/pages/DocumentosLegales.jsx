
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

function AvisoLegalES() {
  return (
    <section id="aviso-legal" style={estilos.tarjeta}>
      <h1 style={estilos.titulo}>AVISO LEGAL</h1>

      <h2 style={estilos.subtitulo}>1. Titular</h2>
      <ul>
        <li><strong>Titular:</strong> Roxana Collazo Alonso.</li>
        <li><strong>Nombre comercial:</strong> CoastGuard Homes Services.</li>
        <li><strong>NIF/NIE:</strong> Z1968154A.</li>
        <li>
          <strong>Domicilio profesional:</strong>{" "}
          Calle Casicas de Arriba, 33, 1.º F, Pilar de la Horadada,
          Alicante, España.
        </li>
        <li><strong>Correo electrónico:</strong> <EnlaceCorreo /></li>
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
  );
}

function LegalNoticeEN() {
  return (
    <section id="aviso-legal" style={estilos.tarjeta}>
      <h1 style={estilos.titulo}>LEGAL NOTICE</h1>

      <h2 style={estilos.subtitulo}>1. Service provider</h2>
      <ul>
        <li><strong>Responsible person:</strong> Roxana Collazo Alonso.</li>
        <li><strong>Trade name:</strong> CoastGuard Homes Services.</li>
        <li><strong>NIF/NIE:</strong> Z1968154A.</li>
        <li>
          <strong>Business address:</strong>{" "}
          Calle Casicas de Arriba, 33, 1.º F, Pilar de la Horadada,
          Alicante, Spain.
        </li>
        <li><strong>Email:</strong> <EnlaceCorreo /></li>
      </ul>

      <h2 style={estilos.subtitulo}>2. Purpose of the application</h2>
      <p>
        CoastGuard Homes is an application that enables customers to
        consult and manage information relating to their properties,
        contracts, inspections, documents, invoices, communications and
        other data connected with the services they have contracted,
        according to the permissions associated with their account.
      </p>
      <p>
        The application is a support tool for customers who have a
        contractual relationship with CoastGuard Homes Services. Its
        availability does not mean that every service is included in
        every contract, nor does it replace the specific terms accepted
        by the customer.
      </p>
      <p>
        Services may include inspection subscriptions, additional
        inspections paid for separately and, where expressly contracted,
        key custody without visits. The exact scope of each service is
        established in the relevant contractual documentation.
      </p>
      <p>
        Key custody alone does not include visits, inspections or
        monitoring of the property. Such activities require an express
        agreement.
      </p>
      <p>
        The separate CoastGuard Homes website is distinct from the
        application and is governed by the information and terms
        applicable to the processing and services carried out through
        that website.
      </p>

      <h2 style={estilos.subtitulo}>3. Terms of use</h2>
      <p>
        Users must use the application lawfully, provide accurate
        information and access only the data and features authorised
        for their account. Unauthorised access to information about
        other people or properties, alteration of information and
        circumvention of access controls are prohibited.
      </p>

      <h2 style={estilos.subtitulo}>4. Intellectual property</h2>
      <p>
        The application's content, text, designs, logos and other
        elements are protected, where applicable, by intellectual and
        industrial property laws. Unauthorised use is prohibited except
        where permitted by law.
      </p>

      <h2 style={estilos.subtitulo}>5. Data protection</h2>
      <p>
        The processing of personal data is described in the Privacy
        Policy included on this page.
      </p>

      <h2 style={estilos.subtitulo}>6. Liability and applicable law</h2>
      <p>
        Reasonable efforts will be made to keep the application available
        and protect information. Interruptions may occur because of
        maintenance, technical incidents or circumstances beyond the
        responsible person's reasonable control.
      </p>
      <p>
        Nothing in this notice excludes liability that cannot lawfully
        be excluded or restricts the mandatory rights of consumers
        and users.
      </p>
      <p>
        This notice is governed by the applicable laws of Spain and
        the European Union.
      </p>
    </section>
  );
}

function ContratoMarcoES() {
  return (
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

      <h2 style={estilos.subtitulo}>4. Duración, renovación y cancelación</h2>
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

      <h2 style={estilos.subtitulo}>5. Servicios adicionales y presupuestos</h2>
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
        inequívoca su decisión dentro del plazo a <EnlaceCorreo /> o
        mediante otro medio habilitado que permita dejar constancia
        de la comunicación. Puede utilizar el modelo orientativo
        incluido a continuación, aunque no es obligatorio emplearlo.
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
      <p><strong>Modelo orientativo de comunicación de desistimiento:</strong></p>
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
  );
}

function FrameworkAgreementEN() {
  return (
    <section id="contrato" style={estilos.tarjeta}>
      <h1 style={estilos.titulo}>FRAMEWORK SERVICE AGREEMENT</h1>

      <p>
        This agreement establishes the general terms applicable to
        services provided by CoastGuard Homes Services. The specific
        services, their scope, price, applicable taxes, payment frequency
        and start date will be identified in the specific terms, quotation
        or contractual documentation accepted by the customer.
      </p>
      <p>
        Accepting this framework agreement during registration does not,
        by itself, mean that the customer has purchased a paid subscription
        or an additional service whose price and terms have not yet been
        communicated and accepted.
      </p>

      <h2 style={estilos.subtitulo}>1. Purpose and scope of the service</h2>
      <p>
        CoastGuard Homes Services will provide the services expressly
        purchased and accepted by the customer, in accordance with the
        scope set out in the applicable specific terms.
      </p>
      <p>
        Services may include an inspection subscription with the agreed
        features and frequency, as well as additional inspections
        separately ordered and paid for. The specific terms will state
        which activities are included in the subscription fee and which
        incur an additional charge.
      </p>
      <p>
        Where key custody without visits is contracted, the service
        includes the agreed activities relating to receiving, storing,
        controlling and returning the keys. This arrangement does not,
        by itself, include visits or inspections.
      </p>
      <p>
        The availability of a feature in the application does not mean
        that the corresponding activity is included in the contract.
        Activities outside the contracted scope will not be carried out
        without the required authorisation.
      </p>

      <h2 style={estilos.subtitulo}>2. Key custody and management</h2>
      <p>
        Where key custody is contracted, the customer will provide the
        keys and the information strictly necessary to identify them
        and manage the service. Receipt and return will be coordinated
        using the means agreed between the parties.
      </p>
      <p>
        Keys will be stored using reasonable security measures, with
        access restricted to authorised persons. The customer must
        communicate any relevant circumstances affecting identification,
        management or return of the keys.
      </p>
      <p>
        Key custody does not, by itself, authorise entry into the
        property, visits, inspections or delivery of keys to third
        parties. Any such activity requires the relevant authorisation
        and applicable terms.
      </p>

      <h2 style={estilos.subtitulo}>3. Price and invoicing</h2>
      <p>
        Before confirming a purchase, the customer will receive
        information about the service, price, applicable taxes, total
        amount payable and payment terms.
      </p>
      <p>
        The subscription is invoiced and paid monthly in accordance
        with the accepted specific terms. Additional inspections and
        other services not included in the subscription will be quoted
        and paid for separately before they are carried out, under the
        terms communicated to the customer.
      </p>
      <p>
        Payments and invoicing will be handled through the procedures
        enabled for the purchase. Payment data will be processed
        according to the functions and terms applicable to the providers
        involved.
      </p>
      <p>
        Any proposed price change must be communicated in advance,
        stating the new amount and proposed effective date. The
        customer's acceptance will be obtained where required by the
        contract or applicable law.
      </p>

      <h2 style={estilos.subtitulo}>4. Term, renewal and cancellation</h2>
      <p>
        The subscription is paid monthly and has no minimum annual
        commitment. The customer may request cancellation at any time,
        subject to ordinary notice of one (1) month under these terms
        and without an annual commitment cancellation penalty.
      </p>
      <p>
        A cancellation request may be sent to <EnlaceCorreo /> or through
        another enabled channel that provides a record of the communication.
      </p>
      <p>
        The request must identify the customer and the subscription to
        be cancelled. CoastGuard Homes Services will process the request
        and communicate the effective termination date through a method
        that allows a record to be retained.
      </p>
      <p>
        Unless an earlier date is agreed in writing or applicable law
        gives the customer a more favourable right, the ordinary notice
        period is one (1) month from receipt of the request.
      </p>
      <p>
        During the notice period, the service will continue under the
        agreed terms and applicable charges remain payable until the
        effective termination date. Once cancellation takes effect, no
        further subscription fees will be charged for later periods,
        without prejudice to validly accrued amounts, outstanding
        invoices or other legally enforceable obligations.
      </p>
      <p>
        Administrative processing of cancellation may be performed
        manually after the request has been received and verified.
        Cancelling a payment method or taking an action on a payment
        platform does not, by itself, replace the cancellation notice
        or extinguish legitimately outstanding amounts.
      </p>
      <p>
        No fees for a non-existent annual commitment or penalties for
        cancellation in accordance with these terms will be charged.
        This clause is without prejudice to statutory withdrawal rights
        or any other applicable termination right.
      </p>

      <h2 style={estilos.subtitulo}>5. Additional services and quotations</h2>
      <p>
        Any service not expressly included in the specific terms will
        be treated as an additional service where applicable.
      </p>
      <p>
        Before carrying out an additional service requiring a quotation,
        the customer will receive information about the proposed work,
        its scope, price, taxes and payment terms.
      </p>
      <p>
        An additional service will only be authorised once the customer
        has expressly accepted the quotation or given another valid,
        express and prior authorisation that specifically covers the
        activity concerned. No additional work will be performed or
        charged for without the necessary authorisation.
      </p>
      <p>
        If a change to the price or scope becomes necessary during
        authorised work, further acceptance will be requested before
        the additional work is carried out, unless a valid prior
        authorisation specifically covers that situation.
      </p>

      <h2 style={estilos.subtitulo}>6. Customer obligations</h2>
      <p>
        The customer must provide accurate and sufficient information
        to identify the property and manage the contracted services,
        pay amounts due and report changes that may affect service
        delivery.
      </p>
      <p>
        Where relevant, the customer must identify persons authorised
        to receive the keys and keep contact details required for
        communications up to date.
      </p>

      <h2 style={estilos.subtitulo}>7. Provider obligations</h2>
      <p>
        CoastGuard Homes Services will provide services within the
        contracted scope, apply reasonable security measures to key
        custody where applicable, respond to service-related
        communications and provide relevant contractual and invoicing
        documentation.
      </p>
      <p>
        No obligation of continuous monitoring, inspection, property
        access or emergency response is assumed unless expressly
        included in the contracted service. This clause does not
        exclude liability that cannot lawfully be excluded.
      </p>

      <h2 style={estilos.subtitulo}>8. Incidents and communications</h2>
      <p>
        Communications concerning services, keys, payments, documents
        or cancellation may be made through the channels enabled for
        the contractual relationship.
      </p>
      <p>
        The availability of a channel for reporting incidents does
        not imply continuous monitoring, emergency assistance or an
        immediate response unless a service with those features has
        been expressly contracted. In the event of immediate danger
        to people or property, the relevant public emergency services
        must be contacted.
      </p>

      <h2 style={estilos.subtitulo}>9. Use of the application</h2>
      <p>
        Users must protect their credentials and use the application
        lawfully. They must not access information outside their
        permissions or alter, conceal or manipulate data without
        authorisation.
      </p>
      <p>
        Reasonable efforts will be made to keep the application
        available and secure. Interruptions may occur due to maintenance,
        technical incidents or circumstances beyond the provider's
        reasonable control. These limitations do not exclude legally
        enforceable liability.
      </p>

      <h2 style={estilos.subtitulo}>10. Personal data protection</h2>
      <p>
        Personal data processing is described in the Privacy Policy
        available on this page. Data will be processed in accordance
        with applicable law and the information provided to the user.
      </p>
      <p>
        Acceptance of this agreement does not replace any specific
        consent that may be required for particular processing
        activities, or any express request legally required before
        starting a service during the withdrawal period.
      </p>

      <h2 style={estilos.subtitulo}>
        11. Distance contracts and the right of withdrawal
      </h2>
      <p>
        Where the customer qualifies as a consumer under applicable
        law and the service contract is concluded at a distance or
        away from business premises, the customer will generally have
        fourteen (14) calendar days from the conclusion of the service
        contract to exercise the right of withdrawal, subject to
        applicable legal exceptions. The customer does not need to
        give a reason or pay a penalty for exercising this right.
        Where the law provides a different period, the applicable
        statutory period will apply.
      </p>
      <p>
        Accepting this framework agreement during registration does
        not, by itself, start the withdrawal period for a specific
        subscription or service where that service contract has not
        yet been concluded. The period will be determined by the
        actual purchase and applicable law.
      </p>
      <p>
        To exercise the right, the customer must clearly communicate
        their decision within the relevant period to <EnlaceCorreo />
        or through another enabled method that provides a record of
        the communication. The indicative template below may be used,
        but its use is not compulsory.
      </p>
      <p>
        If the customer expressly requests that the service begin
        during the withdrawal period and subsequently withdraws,
        an amount proportionate to the service actually provided up
        to the time of notification may be payable only where legally
        permitted and where the applicable information and express
        request requirements have been met.
      </p>
      <p>
        Loss of the right of withdrawal following full performance
        of the service may apply only when the relevant legal
        requirements are met, including prior express consent and
        acknowledgement that the right will be lost once the contract
        has been fully performed, where required by law. Partial
        commencement of the service does not, by itself, automatically
        extinguish the right.
      </p>
      <p>
        The statutory right of withdrawal is distinct from ordinary
        subscription cancellation with one month's notice. Ordinary
        cancellation terms do not restrict statutory rights available
        to the consumer.
      </p>
      <p><strong>Indicative withdrawal notice template:</strong></p>
      <p>
        To Roxana Collazo Alonso, CoastGuard Homes Services
        (<EnlaceCorreo />): I hereby give notice that I withdraw from
        the contract for the following service: [specify service].
        Consumer's name: [full name]. Email address associated with
        the account: [email]. Date of purchase: [date]. Date of notice:
        [date].
      </p>

      <h2 style={estilos.subtitulo}>12. Acceptance and documentation</h2>
      <p>
        This framework agreement establishes the general terms of the
        relationship between the parties. Acceptance during registration
        does not, by itself, purchase a paid subscription or additional
        service whose price and terms have not been communicated and
        accepted.
      </p>
      <p>
        The subscription will be defined by the accepted specific terms,
        which will state at least the service purchased, the identified
        property where applicable, the fee, taxes, payment frequency,
        cancellation terms and start date.
      </p>
      <p>
        A record of acceptance and of the version of the document
        accepted will be retained, subject to the system's capabilities
        and applicable law.
      </p>

      <h2 style={estilos.subtitulo}>
        13. Applicable law and customer rights
      </h2>
      <p>
        This agreement will be interpreted in accordance with the
        applicable laws of Spain and the European Union. No clause
        is intended to remove mandatory customer rights or limit
        liability that cannot lawfully be excluded.
      </p>
      <p>
        If any provision is held to be invalid or unenforceable, the
        remaining provisions will remain effective to the extent
        permitted by law.
      </p>
    </section>
  );
}

export default function DocumentosLegales() {
  const navigate = useNavigate();
  const location = useLocation();

  const parametros = new URLSearchParams(location.search);
  const idiomaSolicitado = parametros.get("idioma");
  const idiomaGuardado =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("app_idioma")
      : "es";

  const idioma =
    idiomaSolicitado === "en" || (!idiomaSolicitado && idiomaGuardado === "en")
      ? "en"
      : "es";

  const ingles = idioma === "en";

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
  }, [location.hash, idioma]);

  const volverAlRegistro = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("app_idioma", idioma);
    }
    navigate("/register");
  };

  return (
    <main style={estilos.pagina}>
      <div style={estilos.contenido}>
        <button
          type="button"
          onClick={volverAlRegistro}
          style={estilos.volver}
        >
          {ingles ? "← Back to registration" : "← Volver al registro"}
        </button>

        {ingles ? <LegalNoticeEN /> : <AvisoLegalES />}

        {ingles ? <FrameworkAgreementEN /> : <ContratoMarcoES />}

        <section id="privacidad" style={estilos.tarjeta}>
          <PoliticaPrivacidad idioma={idioma} />
        </section>

        <button
          type="button"
          onClick={volverAlRegistro}
          style={estilos.volver}
        >
          {ingles ? "← Back to registration" : "← Volver al registro"}
        </button>
      </div>
    </main>
  );
}
