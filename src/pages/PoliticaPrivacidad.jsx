import React from "react";
import "./PoliticaPrivacidad.css";

const EMAIL = "coastguardhomes@gmail.com";

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    color: "#333",
    lineHeight: "1.6",
    overflowWrap: "anywhere",
  },
  title: {
    color: "#00356b",
    marginTop: "24px",
    marginBottom: "10px",
  },
  paragraph: {
    marginBottom: "14px",
  },
  mainTitle: {
    color: "#00356b",
    textAlign: "center",
    marginBottom: "20px",
  },
};

function EmailLink() {
  return <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;
}

function SpanishPolicy() {
  const p = styles.paragraph;
  const h = styles.title;

  return (
    <>
      <h1 style={styles.mainTitle}>POLÍTICA DE PRIVACIDAD</h1>

      <p style={p}>
        <strong>Última actualización:</strong> 6 de noviembre de 2026.
      </p>

      <p style={p}>
        Esta Política de Privacidad informa sobre el tratamiento de datos
        personales realizado por Roxana Collazo Alonso, bajo el nombre
        comercial CoastGuard Homes Services, en relación con la aplicación
        CoastGuard Homes y con la gestión de los servicios contratados por
        sus clientes.
      </p>

      <p style={p}>
        La aplicación es una herramienta para que los clientes puedan
        consultar y gestionar información relacionada con los servicios
        que hayan contratado. Su disponibilidad no significa que todos
        los servicios o funciones estén incluidos en cada contrato.
      </p>

      <p style={p}>
        Esta política se refiere a la aplicación y a los tratamientos
        relacionados con los servicios contratados. El sitio web
        independiente de CoastGuard Homes es un medio distinto y deberá
        facilitar su propia información de privacidad para los tratamientos
        que realice por separado.
      </p>

      <p style={p}>
        El tratamiento de los datos se rige por el Reglamento (UE) 2016/679,
        General de Protección de Datos (RGPD), la Ley Orgánica 3/2018,
        de Protección de Datos Personales y garantía de los derechos
        digitales (LOPDGDD), y las demás disposiciones que resulten aplicables.
      </p>

      <h3 style={h}>1. RESPONSABLE DEL TRATAMIENTO</h3>

      <ul>
        <li>
          <strong>Responsable:</strong> Roxana Collazo Alonso, trabajadora
          autónoma.
        </li>
        <li>
          <strong>Nombre comercial:</strong> CoastGuard Homes Services.
        </li>
        <li>
          <strong>NIF/NIE:</strong> Z1968154A.
        </li>
        <li>
          <strong>Domicilio profesional:</strong> Calle Casicas de Arriba,
          33, 1.º F, 03190 Pilar de la Horadada, Alicante, España.
        </li>
        <li>
          <strong>Teléfono de contacto:</strong> 610390998.
        </li>
        <li>
          <strong>Correo electrónico:</strong> <EmailLink />.
        </li>
      </ul>

      <p style={p}>
        La actividad desarrollada bajo el nombre comercial CoastGuard
        Homes Services comprende servicios de inspección de viviendas
        y, cuando se contrate expresamente, custodia y gestión de llaves
        y otros servicios relacionados con los inmuebles.
      </p>

      <p style={p}>
        Para realizar consultas sobre privacidad o ejercer los derechos
        descritos en esta política, puedes contactar con la responsable
        mediante el correo electrónico indicado o utilizar el teléfono
        de contacto facilitado.
      </p>

      <h3 style={h}>2. CATEGORÍAS DE DATOS PERSONALES</h3>

      <p style={p}>
        Dependiendo de la cuenta, de las funciones utilizadas y de los
        servicios contratados, podrán tratarse las siguientes categorías
        de datos:
      </p>

      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre, apellidos,
          correo electrónico, teléfono, dirección y demás datos de contacto
          facilitados.
        </li>
        <li>
          <strong>Cuenta y autenticación:</strong> identificador de usuario,
          datos necesarios para administrar la cuenta y registros técnicos
          relacionados con el acceso.
        </li>
        <li>
          <strong>Relación contractual:</strong> solicitudes, presupuestos,
          contratos, servicios contratados, aceptaciones, renovaciones,
          cancelaciones, comunicaciones y reclamaciones.
        </li>
        <li>
          <strong>Datos del inmueble:</strong> dirección de la vivienda y
          otra información necesaria para prestar el servicio contratado.
        </li>
        <li>
          <strong>Custodia de llaves:</strong> datos necesarios para
          identificar, recibir, controlar, custodiar y devolver las llaves,
          cuando se contrate esta modalidad.
        </li>
        <li>
          <strong>Visitas e inspecciones:</strong> información necesaria
          para organizar y documentar las visitas o inspecciones que
          se hayan contratado.
        </li>
        <li>
          <strong>Fotografías e informes:</strong> imágenes, observaciones
          e informes relacionados con el inmueble cuando sean necesarios
          para documentar una inspección u otro servicio contratado.
        </li>
        <li>
          <strong>Pagos y facturación:</strong> datos necesarios para
          gestionar cobros, suscripciones, facturas y obligaciones fiscales
          y contables. Los datos de tarjeta serán tratados por el proveedor
          de pagos que intervenga en la operación, conforme a sus funciones.
        </li>
        <li>
          <strong>Comunicaciones:</strong> consultas, avisos, mensajes,
          solicitudes y reclamaciones relacionadas con la cuenta o el servicio.
        </li>
        <li>
          <strong>Seguridad:</strong> registros técnicos necesarios para
          proteger las cuentas, controlar los accesos y resolver incidencias.
        </li>
      </ul>

      <p style={p}>
        La custodia de llaves, por sí sola, no implica visitas a la vivienda,
        inspecciones, fotografías ni informes sobre su estado. Estos
        tratamientos solo se realizarán cuando correspondan a otro servicio
        contratado o a una finalidad legítima debidamente informada.
      </p>

      <p style={p}>
        Se procurará recoger únicamente los datos adecuados y necesarios
        para cada finalidad. No deben introducirse contraseñas, datos
        completos de tarjetas bancarias ni información personal innecesaria
        en campos de observaciones, mensajes o documentos.
      </p>

      <h3 style={h}>3. FINALIDADES DEL TRATAMIENTO</h3>

      <p style={p}>Los datos podrán utilizarse para:</p>

      <ul>
        <li>Crear, administrar y proteger las cuentas de usuario.</li>
        <li>
          Atender consultas y gestionar solicitudes y medidas precontractuales.
        </li>
        <li>
          Formalizar, administrar y ejecutar los contratos de los servicios
          efectivamente contratados.
        </li>
        <li>
          Gestionar la recepción, custodia, control y devolución de llaves,
          cuando corresponda.
        </li>
        <li>
          Organizar y documentar visitas, inspecciones, fotografías e
          informes cuando estén incluidos en el servicio contratado.
        </li>
        <li>
          Preparar presupuestos para servicios adicionales y gestionar su
          aceptación antes de ejecutarlos cuando sea necesario.
        </li>
        <li>
          Gestionar pagos, suscripciones, facturas y obligaciones fiscales
          y contables.
        </li>
        <li>
          Tramitar comunicaciones, solicitudes de cancelación, consultas
          y reclamaciones.
        </li>
        <li>
          Proteger la aplicación, administrar permisos y prevenir accesos
          o usos no autorizados.
        </li>
        <li>
          Cumplir obligaciones legales y formular, ejercer o defender
          reclamaciones cuando resulte necesario.
        </li>
      </ul>

      <p style={p}>
        Los datos de la aplicación no se utilizarán actualmente para
        enviar publicidad o comunicaciones comerciales ajenas a la
        gestión de los servicios contratados. Las comunicaciones
        operativas relacionadas con cuentas, contratos, pagos,
        inspecciones o solicitudes de los clientes no se consideran
        por sí mismas comunicaciones publicitarias.
      </p>

      <p style={p}>
        Si en el futuro se quisiera utilizar información personal para
        una finalidad nueva o incompatible con las anteriores, se
        facilitará previamente la información exigida por el artículo
        13.3 del RGPD y se determinará la base jurídica adecuada.
        Cuando la normativa exija consentimiento, este se solicitará
        de forma específica y separada.
      </p>

      <h3 style={h}>4. BASE JURÍDICA DEL TRATAMIENTO</h3>

      <p style={p}>La base jurídica dependerá de la finalidad concreta:</p>

      <ul>
        <li>
          <strong>Contrato y medidas precontractuales:</strong> para gestionar
          solicitudes, formalizar contratos y prestar los servicios solicitados.
        </li>
        <li>
          <strong>Obligación legal:</strong> para cumplir las obligaciones
          fiscales, contables y demás deberes establecidos por la normativa.
        </li>
        <li>
          <strong>Interés legítimo:</strong> cuando exista un interés legítimo
          real, necesario y equilibrado, como proteger la seguridad de la
          aplicación o defender reclamaciones, después de valorar los derechos
          e intereses de las personas afectadas.
        </li>
        <li>
          <strong>Consentimiento:</strong> cuando una operación concreta
          requiera legalmente una autorización válida. El consentimiento
          podrá retirarse en cualquier momento, sin afectar a la licitud
          del tratamiento realizado antes de retirarlo.
        </li>
      </ul>

      <p style={p}>
        La aceptación de esta política sirve para acreditar que se ha
        facilitado la información de privacidad; no constituye por sí sola
        un consentimiento para cualquier tratamiento ni sustituye las
        autorizaciones específicas que puedan ser necesarias.
      </p>

      <p style={p}>
        Cuando el tratamiento se base en el consentimiento, este deberá
        ser libre, específico, informado e inequívoco. La negativa a
        consentir una finalidad opcional no deberá impedir la contratación
        de servicios que no dependan de esa finalidad.
      </p>

      <h3 style={h}>5. CARÁCTER OBLIGATORIO DE LOS DATOS</h3>

      <p style={p}>
        Los datos imprescindibles para crear una cuenta, formalizar un
        contrato o prestar un servicio deberán facilitarse cuando sean
        necesarios para esas finalidades. Si no se facilitan, puede resultar
        imposible completar el alta o prestar correctamente el servicio.
      </p>

      <p style={p}>
        Los datos adicionales que no sean necesarios deberán ser opcionales
        cuando la función correspondiente lo permita. La información
        solicitada deberá ser adecuada y proporcional al servicio o
        trámite que se esté realizando.
      </p>

      <h3 style={h}>6. CONSERVACIÓN DE LOS DATOS</h3>

      <p style={p}>
        Los datos se conservarán durante el tiempo necesario para cumplir
        cada finalidad y, cuando corresponda, durante los plazos legales
        de conservación y prescripción de responsabilidades.
      </p>

      <ul>
        <li>
          <strong>Datos de cuenta:</strong> durante la vigencia de la cuenta
          y el tiempo adicional necesario para atender obligaciones o
          reclamaciones pendientes.
        </li>
        <li>
          <strong>Contratos, aceptaciones y documentación contractual:</strong>{" "}
          durante la relación contractual y los plazos posteriores necesarios
          para cumplir obligaciones legales o atender posibles reclamaciones.
        </li>
        <li>
          <strong>Facturas y documentación contable:</strong> durante los
          plazos exigidos por la normativa fiscal, mercantil y contable
          aplicable.
        </li>
        <li>
          <strong>Datos de custodia de llaves:</strong> durante el período
          de custodia y el tiempo posterior que resulte necesario para
          documentar la devolución, gestionar incidencias y atender
          responsabilidades. No se conservarán indefinidamente sin una
          finalidad legítima.
        </li>
        <li>
          <strong>Fotografías de inspecciones:</strong> el plazo previsto
          de conservación es de un máximo de 60 días desde su creación o
          registro. Se ha configurado un proceso automatizado de limpieza
          para eliminar fotografías de inspección que superen ese plazo.
          Si se produce un error técnico que impida completar una
          eliminación, deberá revisarse la incidencia y completarse la
          eliminación pendiente.
        </li>
        <li>
          <strong>Informes y documentación de las inspecciones:</strong>{" "}
          durante el tiempo necesario para gestionar el servicio, atender
          las obligaciones aplicables y resolver posibles reclamaciones.
          El plazo de 60 días indicado para las fotografías no debe
          interpretarse automáticamente como el plazo de conservación
          de todos los informes o documentos.
        </li>
        <li>
          <strong>Comunicaciones y reclamaciones:</strong> durante el tiempo
          necesario para gestionarlas y atender las responsabilidades que
          puedan derivarse.
        </li>
        <li>
          <strong>Registros técnicos y de seguridad:</strong> durante un
          período proporcionado a las necesidades de seguridad, investigación
          de incidencias y cumplimiento de las obligaciones aplicables.
        </li>
      </ul>

      <p style={p}>
        Cuando los datos dejen de ser necesarios, se suprimirán o se
        anonimizarán y, cuando legalmente corresponda, se bloquearán durante
        el período exigible. La eliminación de una cuenta no implica borrar
        información que deba conservarse por obligación legal o para atender
        responsabilidades pendientes.
      </p>

      <p style={p}>
        El plazo de 60 días para las fotografías describe la política de
        conservación configurada. La ejecución efectiva de las eliminaciones
        debe comprobarse mediante los registros del proceso de limpieza.
      </p>

      <h3 style={h}>7. DESTINATARIOS Y PROVEEDORES</h3>

      <p style={p}>
        Para prestar los servicios pueden intervenir la responsable del
        tratamiento, las personas colaboradoras o el personal que esté
        debidamente autorizado y los proveedores tecnológicos, de pagos,
        facturación y comunicaciones que resulten necesarios.
      </p>

      <p style={p}>
        El acceso a los datos por parte de la responsable, colaboradores
        o personal autorizado se limitará a la información necesaria
        para realizar las funciones que tengan asignadas y estará sujeto
        a las obligaciones de confidencialidad y seguridad correspondientes.
      </p>

      <ul>
        <li>
          <strong>Supabase:</strong> infraestructura de base de datos,
          autenticación, almacenamiento y servicios asociados utilizados
          por la aplicación.
        </li>
        <li>
          <strong>Vercel:</strong> alojamiento, despliegue y distribución
          de la aplicación web. En función de los servicios utilizados,
          puede tratar datos técnicos necesarios para servir la aplicación,
          mantener su funcionamiento, protegerla y diagnosticar incidencias.
        </li>
        <li>
          <strong>Stripe:</strong> gestión de los pagos y las suscripciones
          procesados mediante su plataforma.
        </li>
        <li>
          <strong>FacturaDirecta:</strong> funciones de facturación y
          gestión administrativa o contable que se utilicen.
        </li>
        <li>
          <strong>Resend:</strong> envío de correos electrónicos cuando
          se utilice para comunicaciones de la aplicación o del servicio.
        </li>
        <li>
          <strong>Entidades bancarias y financieras:</strong> podrán
          intervenir cuando sea necesario para ejecutar pagos, cobros,
          transferencias u otras operaciones económicas relacionadas
          con los servicios contratados.
        </li>
      </ul>

      <p style={p}>
        Los proveedores que actúen como encargados del tratamiento deberán
        estar sujetos a las condiciones contractuales y garantías exigidas
        por el RGPD. Algunos proveedores pueden actuar como responsables
        independientes para determinadas operaciones realizadas bajo sus
        propias condiciones. El papel concreto de cada proveedor dependerá
        de los servicios y operaciones que efectivamente realice.
      </p>

      <p style={p}>
        GitHub se utiliza para alojar y gestionar el código fuente y los
        procesos de desarrollo. El repositorio no debe utilizarse para
        almacenar datos personales reales de clientes, documentos
        contractuales, credenciales ni secretos de producción. El acceso
        al código fuente no implica por sí mismo autorización para acceder
        a los datos personales de los usuarios de la aplicación.
      </p>

      <p style={p}>
        Los datos también podrán comunicarse a autoridades públicas,
        tribunales u otros destinatarios cuando exista una obligación legal
        válida o resulte necesario para formular, ejercer o defender
        reclamaciones.
      </p>

      <p style={p}>
        No se venderán datos personales a terceros. El acceso por parte
        de proveedores se limitará a las finalidades correspondientes
        y a las funciones que tengan encomendadas.
      </p>

      <h3 style={h}>8. TRANSFERENCIAS INTERNACIONALES</h3>

      <p style={p}>
        El proyecto de Supabase utilizado por la aplicación está configurado
        en la región eu-west-2, correspondiente a Londres, Reino Unido.
        La Comisión Europea mantiene una decisión de adecuación para las
        transferencias de datos personales al Reino Unido dentro del ámbito
        del RGPD.
      </p>

      <p style={p}>
        Otros proveedores pueden utilizar infraestructura, subencargados
        o personal situado en países distintos del Espacio Económico Europeo.
        La existencia de una transferencia internacional y el mecanismo
        jurídico aplicable deberán comprobarse en las condiciones y
        documentación vigentes de cada proveedor.
      </p>

      <p style={p}>
        Cuando una transferencia internacional no esté amparada por una
        decisión de adecuación, deberá utilizarse otra garantía válida
        prevista por el RGPD, cuando corresponda, y facilitarse la
        información exigida por la normativa.
      </p>

      <p style={p}>
        Puedes solicitar información adicional sobre las garantías
        aplicables a las transferencias relacionadas con tus datos
        escribiendo a <EmailLink />.
      </p>

      <h3 style={h}>9. DERECHOS DE LAS PERSONAS</h3>

      <p style={p}>
        Puedes ejercer, cuando proceda legalmente, los siguientes derechos:
      </p>

      <ul>
        <li>
          <strong>Acceso:</strong> conocer si se tratan tus datos personales
          y obtener acceso a ellos.
        </li>
        <li>
          <strong>Rectificación:</strong> solicitar la corrección de datos
          inexactos o incompletos.
        </li>
        <li>
          <strong>Supresión:</strong> solicitar la eliminación de tus datos
          cuando legalmente corresponda.
        </li>
        <li>
          <strong>Oposición:</strong> oponerte a determinados tratamientos
          en los supuestos previstos por la normativa.
        </li>
        <li>
          <strong>Limitación:</strong> solicitar la limitación del
          tratamiento en los casos legalmente establecidos.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir determinados datos en un
          formato estructurado y transmitirlos a otro responsable cuando
          se cumplan los requisitos legales.
        </li>
        <li>
          <strong>Retirada del consentimiento:</strong> retirar el
          consentimiento cuando esa sea la base jurídica del tratamiento.
        </li>
      </ul>

      <p style={p}>
        Puedes ejercer tus derechos escribiendo a <EmailLink /> e indicando
        claramente tu solicitud y el derecho que deseas ejercer. También
        puedes utilizar el teléfono de contacto para realizar consultas,
        aunque es recomendable presentar la solicitud por un medio que
        permita acreditar su envío y contenido.
      </p>

      <p style={p}>
        Si existen dudas razonables sobre la identidad de quien presenta
        la solicitud, podrá solicitarse información adicional que sea
        necesaria y proporcionada para verificarla. No se exigirá
        sistemáticamente una copia del documento de identidad.
      </p>

      <p style={p}>
        Se responderá dentro de los plazos establecidos por la normativa.
        Como regla general, las solicitudes de ejercicio de derechos
        deberán atenderse en el plazo de un mes, que podrá ampliarse
        en los supuestos y condiciones previstos por el RGPD. El ejercicio
        de los derechos será gratuito, salvo en los supuestos excepcionales
        previstos legalmente.
      </p>

      <p style={p}>
        Cuando el tratamiento se base en el consentimiento, puedes retirarlo
        en cualquier momento mediante una comunicación a <EmailLink />,
        indicando el tratamiento o autorización que deseas retirar.
        La retirada no afectará a la licitud del tratamiento realizado
        antes de dicha retirada ni eliminará los datos que deban conservarse
        por una obligación legal u otra base jurídica aplicable.
      </p>

      <h4 style={h}>Reclamaciones ante la Agencia Española de Protección de Datos</h4>

      <p style={p}>
        Si consideras que el tratamiento de tus datos personales no
        respeta la normativa de protección de datos, puedes presentar
        una reclamación ante la Agencia Española de Protección de Datos
        (AEPD), autoridad de control competente en España.
      </p>

      <p style={p}>
        Cuando la reclamación se refiera a que no se han atendido
        correctamente tus derechos de acceso, rectificación, supresión,
        oposición, limitación o portabilidad, deberás haberte dirigido
        previamente a la responsable del tratamiento por un medio que
        permita acreditar la solicitud. Si no recibes respuesta dentro
        del plazo legal o consideras que la respuesta no es adecuada,
        podrás acudir a la AEPD. Para otras posibles infracciones de
        protección de datos, la AEPD dispone de procedimientos de
        reclamación específicos según el asunto.
      </p>

      <ul>
        <li>
          <strong>Sede electrónica y presentación de reclamaciones:</strong>{" "}
          <a
            href="https://sedeaepd.gob.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            sedeaepd.gob.es
          </a>.
        </li>
        <li>
          <strong>Página web:</strong>{" "}
          <a
            href="https://www.aepd.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.aepd.es
          </a>.
        </li>
        <li>
          <strong>Dirección postal publicada por la AEPD:</strong> Agencia
          Española de Protección de Datos, Edificio Cuzco IV, Paseo de
          la Castellana, 141, planta 9, 28046 Madrid, España.
        </li>
        <li>
          <strong>Teléfono de información general:</strong> 900 293 183.
        </li>
      </ul>

      <p style={p}>
        La presentación de reclamaciones ante la AEPD es gratuita.
        La información sobre los requisitos, documentación y procedimiento
        aplicables puede consultarse en la propia sede electrónica de
        la Agencia.
      </p>

      <h3 style={h}>10. SEGURIDAD Y ACCESO A LA INFORMACIÓN</h3>

      <p style={p}>
        Se aplicarán medidas técnicas y organizativas adecuadas al riesgo
        para proteger los datos frente a la pérdida, destrucción, alteración,
        divulgación o acceso no autorizados.
      </p>

      <p style={p}>
        El acceso a la información deberá limitarse a las funciones y
        permisos de cada usuario. Los datos de clientes, contratos,
        facturas, fotografías e información sobre custodia de llaves
        deberán protegerse mediante controles de acceso adecuados.
      </p>

      <p style={p}>
        Los documentos y archivos con datos personales deberán almacenarse
        y compartirse mediante mecanismos de acceso restringido. Las
        credenciales, claves privadas y secretos de producción no deben
        publicarse en el repositorio ni compartirse mediante comunicaciones
        ordinarias.
      </p>

      <p style={p}>
        Ninguna medida puede garantizar un riesgo cero. Si se produce una
        violación de seguridad de datos personales, se gestionará conforme
        a las obligaciones legales aplicables, incluidas las notificaciones
        que correspondan.
      </p>

      <h3 style={h}>11. DATOS DEL INMUEBLE, LLAVES E INSPECCIONES</h3>

      <p style={p}>
        La dirección de la vivienda y la información vinculada a ella se
        utilizarán para gestionar los servicios contratados y cumplir las
        obligaciones relacionadas con su prestación.
      </p>

      <p style={p}>
        Cuando se contrate exclusivamente la custodia de llaves, los datos
        se limitarán a los necesarios para gestionar la recepción,
        conservación, control y devolución de las llaves. La custodia por
        sí sola no incluye visitas ni inspecciones de la vivienda.
      </p>

      <p style={p}>
        Cuando se contrate una visita o inspección, podrán tratarse los
        datos necesarios para organizar y documentar esa actuación.
        Las fotografías y observaciones deberán limitarse a la finalidad
        del servicio y evitar, en la medida de lo posible, captar personas,
        documentos u otros datos personales innecesarios.
      </p>

      <p style={p}>
        Los servicios adicionales que requieran presupuesto deberán contar
        con presupuesto previo y aceptación del cliente antes de ejecutarse
        o cobrarse cuando así corresponda.
      </p>

      <h3 style={h}>12. DATOS DE MENORES</h3>

      <p style={p}>
        Los servicios están dirigidos a personas que puedan contratar o
        utilizar legalmente los servicios correspondientes. No se pretende
        recoger deliberadamente datos de menores sin la base jurídica
        y las garantías exigidas por la normativa aplicable.
      </p>

      <h3 style={h}>13. DECISIONES AUTOMATIZADAS Y ELABORACIÓN DE PERFILES</h3>

      <p style={p}>
        La aplicación no está destinada a elaborar perfiles de clientes
        con fines comerciales o publicitarios. Tampoco se pretende adoptar
        decisiones basadas exclusivamente en tratamientos automatizados
        que produzcan efectos jurídicos o afecten significativamente
        a las personas.
      </p>

      <p style={p}>
        Si en el futuro se incorporase un tratamiento de elaboración
        de perfiles o de decisiones automatizadas que requiriese
        información adicional o garantías específicas, se facilitaría
        previamente la información exigida por el RGPD y se aplicarían
        las garantías correspondientes.
      </p>

      <h3 style={h}>14. ACTUALIZACIONES DE ESTA POLÍTICA</h3>

      <p style={p}>
        Esta política podrá actualizarse cuando cambien los servicios,
        los tratamientos de datos, los proveedores o la normativa aplicable.
        La versión vigente será la publicada en la aplicación junto con
        la fecha de su última actualización.
      </p>

      <p style={p}>
        Si un cambio requiere facilitar información adicional, obtener
        un consentimiento específico o adoptar otra medida legal, se
        realizará antes de iniciar el tratamiento correspondiente.
      </p>
    </>
  );
}

function EnglishPolicy() {
  const p = styles.paragraph;
  const h = styles.title;

  return (
    <>
      <h1 style={styles.mainTitle}>PRIVACY POLICY</h1>

      <p style={p}>
        <strong>Last updated:</strong> 6 November 2026.
      </p>

      <p style={p}>
        This Privacy Policy explains how Roxana Collazo Alonso, trading as
        CoastGuard Homes Services, processes personal data in connection
        with the CoastGuard Homes application and the management of services
        contracted by its customers.
      </p>

      <p style={p}>
        The application is a tool that allows customers to consult and
        manage information relating to the services they have contracted.
        Its availability does not mean that every service or feature is
        included in every contract.
      </p>

      <p style={p}>
        This policy applies to the application and to data processing
        related to contracted services. The separate CoastGuard Homes
        website is a distinct channel and must provide its own privacy
        information for processing activities carried out separately
        through that website.
      </p>

      <p style={p}>
        Personal data is processed in accordance with Regulation (EU)
        2016/679, the General Data Protection Regulation (GDPR), Spanish
        Organic Law 3/2018 on Personal Data Protection and the Guarantee
        of Digital Rights (LOPDGDD), and any other applicable legislation.
      </p>

      <h3 style={h}>1. DATA CONTROLLER</h3>

      <ul>
        <li>
          <strong>Controller:</strong> Roxana Collazo Alonso, self-employed
          professional.
        </li>
        <li>
          <strong>Trade name:</strong> CoastGuard Homes Services.
        </li>
        <li>
          <strong>Tax identification number (NIF/NIE):</strong> Z1968154A.
        </li>
        <li>
          <strong>Business address:</strong> Calle Casicas de Arriba,
          33, 1.º F, 03190 Pilar de la Horadada, Alicante, Spain.
        </li>
        <li>
          <strong>Contact telephone:</strong> 610390998.
        </li>
        <li>
          <strong>Email:</strong> <EmailLink />.
        </li>
      </ul>

      <p style={p}>
        The activity carried out under the CoastGuard Homes Services
        trade name includes property inspection services and, where
        expressly contracted, key custody and management and other
        property-related services.
      </p>

      <p style={p}>
        For privacy enquiries or to exercise the rights described in this
        policy, you can contact the controller using the email address
        above or the telephone number provided.
      </p>

      <h3 style={h}>2. CATEGORIES OF PERSONAL DATA</h3>

      <p style={p}>
        Depending on the account, the features used and the services
        contracted, the following categories of personal data may be processed:
      </p>

      <ul>
        <li>
          <strong>Identification and contact details:</strong> first and
          last name, email address, telephone number, address and other
          contact details provided.
        </li>
        <li>
          <strong>Account and authentication data:</strong> user identifier,
          information needed to administer the account and technical records
          relating to access.
        </li>
        <li>
          <strong>Contractual relationship:</strong> enquiries, quotations,
          contracts, contracted services, acceptances, renewals,
          cancellations, communications and complaints.
        </li>
        <li>
          <strong>Property data:</strong> the property address and other
          information necessary to provide the contracted service.
        </li>
        <li>
          <strong>Key custody:</strong> information needed to identify,
          receive, track, safeguard and return keys where this service
          has been contracted.
        </li>
        <li>
          <strong>Visits and inspections:</strong> information needed to
          organise and document visits or inspections that have been
          contracted.
        </li>
        <li>
          <strong>Photographs and reports:</strong> images, observations
          and reports relating to the property where needed to document
          an inspection or another contracted service.
        </li>
        <li>
          <strong>Payments and invoicing:</strong> data needed to manage
          payments, subscriptions, invoices and tax and accounting
          obligations. Card data is processed by the payment provider
          involved in the transaction, according to its role.
        </li>
        <li>
          <strong>Communications:</strong> enquiries, notices, messages,
          requests and complaints relating to the account or service.
        </li>
        <li>
          <strong>Security data:</strong> technical records needed to
          protect accounts, control access and investigate incidents.
        </li>
      </ul>

      <p style={p}>
        Key custody alone does not involve visits to the property,
        inspections, photographs or reports on its condition. Such
        processing takes place only where it relates to another contracted
        service or to a legitimate purpose that has been duly explained.
      </p>

      <p style={p}>
        Only data that is appropriate and necessary for each purpose
        will be requested. Passwords, full bank card details and
        unnecessary personal information should not be entered in
        observation fields, messages or documents.
      </p>

      <h3 style={h}>3. PURPOSES OF PROCESSING</h3>

      <p style={p}>Personal data may be used to:</p>

      <ul>
        <li>Create, administer and protect user accounts.</li>
        <li>
          Respond to enquiries and handle requests and pre-contractual measures.
        </li>
        <li>
          Enter into, administer and perform contracts for services
          actually purchased.
        </li>
        <li>
          Manage the receipt, custody, tracking and return of keys where
          applicable.
        </li>
        <li>
          Organise and document visits, inspections, photographs and
          reports where included in the contracted service.
        </li>
        <li>
          Prepare quotations for additional services and obtain acceptance
          before carrying them out where required.
        </li>
        <li>
          Manage payments, subscriptions, invoices and tax and accounting
          obligations.
        </li>
        <li>
          Handle communications, cancellation requests, enquiries and complaints.
        </li>
        <li>
          Protect the application, manage permissions and prevent
          unauthorised access or use.
        </li>
        <li>
          Comply with legal obligations and establish, exercise or defend
          legal claims where necessary.
        </li>
      </ul>

      <p style={p}>
        Personal data collected through the application is not currently
        used to send advertising or marketing communications unrelated
        to the contracted services. Operational communications relating
        to accounts, contracts, payments, inspections or customer requests
        are not, by themselves, advertising communications.
      </p>

      <p style={p}>
        If personal data is to be used in the future for a new purpose
        or a purpose incompatible with those described above, the
        information required under Article 13(3) GDPR will be provided
        in advance and an appropriate legal basis will be identified.
        Where the law requires consent, it will be requested separately
        and specifically.
      </p>

      <h3 style={h}>4. LEGAL BASES FOR PROCESSING</h3>

      <p style={p}>The legal basis depends on the specific purpose:</p>

      <ul>
        <li>
          <strong>Contract and pre-contractual measures:</strong> to handle
          requests, enter into contracts and provide requested services.
        </li>
        <li>
          <strong>Legal obligation:</strong> to comply with tax, accounting
          and other statutory obligations.
        </li>
        <li>
          <strong>Legitimate interests:</strong> where a genuine, necessary
          and balanced legitimate interest exists, such as protecting
          application security or defending legal claims, after weighing
          the rights and interests of the individuals concerned.
        </li>
        <li>
          <strong>Consent:</strong> where a particular activity legally
          requires valid authorisation. Consent may be withdrawn at any
          time without affecting the lawfulness of processing carried
          out before withdrawal.
        </li>
      </ul>

      <p style={p}>
        Acceptance of this policy records that privacy information has
        been provided. It does not, by itself, constitute consent to
        every type of processing or replace any specific authorisation
        that may be required.
      </p>

      <p style={p}>
        Where processing is based on consent, consent must be freely
        given, specific, informed and unambiguous. Refusing consent
        for an optional purpose should not prevent the customer from
        purchasing services that do not depend on that purpose.
      </p>

      <h3 style={h}>5. WHETHER PROVIDING DATA IS REQUIRED</h3>

      <p style={p}>
        Data essential to create an account, enter into a contract or
        provide a service must be supplied where necessary for those
        purposes. If it is not provided, registration or proper service
        delivery may not be possible.
      </p>

      <p style={p}>
        Additional data that is not necessary should be optional where
        the relevant feature allows this. The information requested
        must be appropriate and proportionate to the service or
        procedure being carried out.
      </p>

      <h3 style={h}>6. DATA RETENTION</h3>

      <p style={p}>
        Data will be retained for as long as necessary to fulfil each
        purpose and, where applicable, for statutory retention periods
        and limitation periods for potential liabilities.
      </p>

      <ul>
        <li>
          <strong>Account data:</strong> for the duration of the account
          and any additional period needed to deal with outstanding
          obligations or claims.
        </li>
        <li>
          <strong>Contracts, acceptances and contractual documents:</strong>{" "}
          throughout the contractual relationship and for any subsequent
          period needed to comply with legal obligations or handle
          potential claims.
        </li>
        <li>
          <strong>Invoices and accounting records:</strong> for the
          periods required by applicable tax, commercial and accounting law.
        </li>
        <li>
          <strong>Key custody data:</strong> during the custody period
          and for any subsequent period needed to document the return
          of keys, handle incidents and address liabilities. It will
          not be retained indefinitely without a legitimate purpose.
        </li>
        <li>
          <strong>Inspection photographs:</strong> the intended retention
          period is a maximum of 60 days from creation or registration.
          An automated cleanup process has been configured to delete
          inspection photographs that exceed this period. If a technical
          error prevents deletion, the incident must be reviewed and
          the outstanding deletion completed.
        </li>
        <li>
          <strong>Inspection reports and documents:</strong> for as long
          as necessary to manage the service, meet applicable obligations
          and resolve potential claims. The 60-day period for photographs
          must not automatically be treated as the retention period
          for every report or document.
        </li>
        <li>
          <strong>Communications and complaints:</strong> for as long
          as needed to handle them and address any resulting liabilities.
        </li>
        <li>
          <strong>Technical and security logs:</strong> for a period
          proportionate to security needs, incident investigation and
          applicable legal obligations.
        </li>
      </ul>

      <p style={p}>
        When data is no longer necessary, it will be deleted or anonymised
        and, where legally required, blocked for the applicable period.
        Deleting an account does not mean deleting information that must
        be retained by law or to deal with outstanding liabilities.
      </p>

      <p style={p}>
        The 60-day period for photographs describes the configured
        retention policy. Actual deletion must be verified through
        the cleanup process logs.
      </p>

      <h3 style={h}>7. RECIPIENTS AND SERVICE PROVIDERS</h3>

      <p style={p}>
        The controller, duly authorised collaborators or staff, and
        technology, payment, invoicing and communications providers
        may be involved in delivering the services where necessary.
      </p>

      <p style={p}>
        Access to data by the controller, collaborators or authorised
        staff will be limited to the information needed to perform
        their assigned duties and will be subject to the relevant
        confidentiality and security obligations.
      </p>

      <ul>
        <li>
          <strong>Supabase:</strong> database infrastructure,
          authentication, storage and related services used by the application.
        </li>
        <li>
          <strong>Vercel:</strong> hosting, deployment and delivery of the
          web application. Depending on the services used, it may process
          technical data needed to serve the application, maintain its
          operation, protect it and diagnose incidents.
        </li>
        <li>
          <strong>Stripe:</strong> management of payments and subscriptions
          processed through its platform.
        </li>
        <li>
          <strong>FacturaDirecta:</strong> invoicing and administrative
          or accounting functions that are used.
        </li>
        <li>
          <strong>Resend:</strong> email delivery when used for application
          or service communications.
        </li>
        <li>
          <strong>Banks and financial institutions:</strong> may be involved
          where necessary to execute payments, collections, transfers
          or other financial transactions relating to the contracted services.
        </li>
      </ul>

      <p style={p}>
        Providers acting as data processors must be subject to the
        contractual terms and safeguards required by the GDPR. Some
        providers may act as independent controllers for particular
        operations carried out under their own terms. The specific
        role of each provider depends on the services and operations
        it actually performs.
      </p>

      <p style={p}>
        GitHub is used to host and manage source code and development
        processes. The repository must not be used to store real customer
        personal data, contractual documents, credentials or production
        secrets. Access to source code does not, by itself, authorise
        access to application users' personal data.
      </p>

      <p style={p}>
        Data may also be disclosed to public authorities, courts or
        other recipients where there is a valid legal obligation or
        where disclosure is necessary to establish, exercise or defend
        legal claims.
      </p>

      <p style={p}>
        Personal data will not be sold to third parties. Provider access
        will be limited to the relevant purposes and assigned functions.
      </p>

      <h3 style={h}>8. INTERNATIONAL DATA TRANSFERS</h3>

      <p style={p}>
        The Supabase project used by the application is configured in
        the eu-west-2 region, corresponding to London, United Kingdom.
        The European Commission has adopted an adequacy decision for
        transfers of personal data to the United Kingdom within the
        scope of the GDPR.
      </p>

      <p style={p}>
        Other providers may use infrastructure, subprocessors or staff
        located outside the European Economic Area. The existence of
        an international transfer and the applicable legal mechanism
        must be checked against each provider's current terms and
        documentation.
      </p>

      <p style={p}>
        Where an international transfer is not covered by an adequacy
        decision, another valid safeguard under the GDPR must be used
        where applicable, and the information required by law must
        be provided.
      </p>

      <p style={p}>
        You may request further information about safeguards applicable
        to transfers involving your data by contacting <EmailLink />.
      </p>

      <h3 style={h}>9. INDIVIDUAL RIGHTS</h3>

      <p style={p}>
        Where legally applicable, you may exercise the following rights:
      </p>

      <ul>
        <li>
          <strong>Access:</strong> find out whether your personal data
          is being processed and obtain access to it.
        </li>
        <li>
          <strong>Rectification:</strong> request correction of inaccurate
          or incomplete data.
        </li>
        <li>
          <strong>Erasure:</strong> request deletion of your data where
          legally applicable.
        </li>
        <li>
          <strong>Objection:</strong> object to certain processing
          activities in the circumstances provided by law.
        </li>
        <li>
          <strong>Restriction:</strong> request restriction of processing
          in legally established circumstances.
        </li>
        <li>
          <strong>Data portability:</strong> receive certain data in a
          structured format and transmit it to another controller where
          the legal requirements are met.
        </li>
        <li>
          <strong>Withdrawal of consent:</strong> withdraw consent where
          consent is the legal basis for processing.
        </li>
      </ul>

      <p style={p}>
        You can exercise your rights by emailing <EmailLink /> and
        clearly describing your request and the right you wish to exercise.
        You may also use the contact telephone number for enquiries,
        although it is advisable to submit your request through a method
        that allows you to prove its submission and content.
      </p>

      <p style={p}>
        If there are reasonable doubts about the identity of the person
        making the request, additional information that is necessary
        and proportionate to verify identity may be requested. A copy
        of an identity document will not be required systematically.
      </p>

      <p style={p}>
        Requests will be answered within the periods established by law.
        As a general rule, requests to exercise data protection rights
        must be handled within one month, which may be extended in
        the circumstances and under the conditions provided by the GDPR.
        Exercising these rights is free of charge except in the
        exceptional circumstances provided for by law.
      </p>

      <p style={p}>
        Where processing is based on consent, you may withdraw it at
        any time by contacting <EmailLink /> and identifying the
        processing activity or authorisation you wish to withdraw.
        Withdrawal does not affect the lawfulness of processing carried
        out before withdrawal and does not remove data that must be
        retained under a legal obligation or another applicable legal basis.
      </p>

      <h4 style={h}>Complaints to the Spanish Data Protection Agency</h4>

      <p style={p}>
        If you consider that the processing of your personal data
        does not comply with data protection law, you may lodge a
        complaint with the Spanish Data Protection Agency (AEPD),
        the supervisory authority in Spain.
      </p>

      <p style={p}>
        Where the complaint concerns the failure to properly handle
        your rights of access, rectification, erasure, objection,
        restriction or portability, you must first have contacted
        the data controller through a method that allows you to
        prove your request. If you do not receive a response within
        the legal time limit or consider the response inadequate,
        you may contact the AEPD. For other possible data protection
        infringements, the AEPD provides specific complaint procedures
        depending on the matter.
      </p>

      <ul>
        <li>
          <strong>Electronic office and complaint submissions:</strong>{" "}
          <a
            href="https://sedeaepd.gob.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            sedeaepd.gob.es
          </a>.
        </li>
        <li>
          <strong>Website:</strong>{" "}
          <a
            href="https://www.aepd.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.aepd.es
          </a>.
        </li>
        <li>
          <strong>Postal address published by the AEPD:</strong> Agencia
          Española de Protección de Datos, Edificio Cuzco IV, Paseo de
          la Castellana, 141, planta 9, 28046 Madrid, Spain.
        </li>
        <li>
          <strong>General information telephone:</strong> 900 293 183.
        </li>
      </ul>

      <p style={p}>
        Lodging a complaint with the AEPD is free of charge. Information
        about the applicable requirements, documentation and procedure
        can be found on the Agency's own electronic office.
      </p>

      <h3 style={h}>10. SECURITY AND ACCESS TO INFORMATION</h3>

      <p style={p}>
        Appropriate technical and organisational measures will be applied
        according to risk to protect data against loss, destruction,
        alteration, unauthorised disclosure or unauthorised access.
      </p>

      <p style={p}>
        Access to information must be limited according to each user's
        role and permissions. Customer data, contracts, invoices,
        photographs and key custody information must be protected
        through appropriate access controls.
      </p>

      <p style={p}>
        Documents and files containing personal data must be stored
        and shared using restricted-access mechanisms. Credentials,
        private keys and production secrets must not be published in
        the repository or shared through ordinary communications.
      </p>

      <p style={p}>
        No measure can guarantee zero risk. If a personal data breach
        occurs, it will be handled in accordance with applicable legal
        obligations, including any required notifications.
      </p>

      <h3 style={h}>11. PROPERTY DATA, KEYS AND INSPECTIONS</h3>

      <p style={p}>
        The property address and related information will be used to
        manage contracted services and meet obligations associated
        with their delivery.
      </p>

      <p style={p}>
        Where only key custody is contracted, data will be limited
        to what is necessary to receive, store, track and return the
        keys. Key custody alone does not include property visits or
        inspections.
      </p>

      <p style={p}>
        Where a visit or inspection is contracted, the information
        needed to organise and document that activity may be processed.
        Photographs and observations must be limited to the purpose
        of the service and should, as far as possible, avoid capturing
        people, documents or other unnecessary personal data.
      </p>

      <p style={p}>
        Additional services requiring a quotation must have a quotation
        prepared and accepted by the customer before they are carried
        out or charged for, where applicable.
      </p>

      <h3 style={h}>12. CHILDREN'S DATA</h3>

      <p style={p}>
        The services are intended for people who can legally purchase
        or use the relevant services. Personal data relating to children
        is not deliberately collected without the legal basis and
        safeguards required by applicable law.
      </p>

      <h3 style={h}>13. AUTOMATED DECISION-MAKING AND PROFILING</h3>

      <p style={p}>
        The application is not intended to create customer profiles
        for commercial or advertising purposes. Nor is it intended
        to make decisions based solely on automated processing that
        produce legal effects or similarly significantly affect
        individuals.
      </p>

      <p style={p}>
        If profiling or automated decision-making requiring additional
        information or specific safeguards is introduced in the future,
        the information required by the GDPR will be provided in advance
        and the relevant safeguards will be applied.
      </p>

      <h3 style={h}>14. UPDATES TO THIS POLICY</h3>

      <p style={p}>
        This policy may be updated when services, data processing
        activities, providers or applicable law change. The current
        version will be published in the application together with
        its latest update date.
      </p>

      <p style={p}>
        If a change requires additional information, specific consent
        or another legal measure, that step will be taken before the
        relevant processing begins.
      </p>
    </>
  );
}

export default function PoliticaPrivacidad({ idioma = "es" }) {
  const ingles = idioma === "en";

  return (
    <div className="privacy-container" style={styles.container}>
      {ingles ? <EnglishPolicy /> : <SpanishPolicy />}
    </div>
  );
}
