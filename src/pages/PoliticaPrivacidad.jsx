
import React from "react";
import { useNavigate } from "react-router-dom";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();
  const email = "coastguardhomes@gmail.com";

  const titulo = {
    color: "#00356b",
    marginTop: "24px",
    marginBottom: "10px",
  };

  const parrafo = {
    marginBottom: "14px",
  };

  return (
    <div
      className="privacy-container"
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#333",
        lineHeight: "1.6",
        overflowWrap: "anywhere",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#0056b3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      <h1
        style={{
          color: "#00356b",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        POLÍTICA DE PRIVACIDAD
      </h1>

      <p style={parrafo}>
        <strong>Última actualización:</strong> 18 de octubre de 2026.
      </p>

      <p style={parrafo}>
        Esta Política de Privacidad informa sobre el tratamiento de datos
        personales realizado por Roxana Collazo Alonso, bajo el nombre
        comercial CoastGuard Homes Services, en relación con la aplicación
        CoastGuard Homes y con la gestión de los servicios contratados por
        sus clientes.
      </p>

      <p style={parrafo}>
        La aplicación es una herramienta para que los clientes puedan
        consultar y gestionar información relacionada con los servicios
        que hayan contratado. Su disponibilidad no significa que todos
        los servicios o funciones estén incluidos en cada contrato.
      </p>

      <p style={parrafo}>
        Esta política se refiere a la aplicación y a los tratamientos
        relacionados con los servicios contratados. El sitio web
        independiente de CoastGuard Homes es un medio distinto y deberá
        facilitar su propia información de privacidad para los tratamientos
        que realice por separado.
      </p>

      <p style={parrafo}>
        El tratamiento de los datos se rige por el Reglamento (UE) 2016/679,
        General de Protección de Datos (RGPD), la Ley Orgánica 3/2018,
        de Protección de Datos Personales y garantía de los derechos
        digitales (LOPDGDD), y las demás disposiciones que resulten aplicables.
      </p>

      <h3 style={titulo}>1. RESPONSABLE DEL TRATAMIENTO</h3>

      <ul>
        <li>
          <strong>Responsable:</strong> Roxana Collazo Alonso, trabajadora
          autónoma.
        </li>
        <li>
          <strong>Nombre comercial:</strong> CoastGuard Homes Services.
        </li>
        <li>
          <strong>Domicilio profesional:</strong> Calle Casicas de Arriba,
          33, 1.º F, Pilar de la Horadada, Alicante, España.
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </li>
      </ul>

      <p style={parrafo}>
        Para realizar consultas sobre privacidad o ejercer los derechos
        descritos en esta política, puedes contactar con la responsable
        mediante el correo electrónico indicado.
      </p>

      <h3 style={titulo}>2. CATEGORÍAS DE DATOS PERSONALES</h3>

      <p style={parrafo}>
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

      <p style={parrafo}>
        La custodia de llaves, por sí sola, no implica visitas a la vivienda,
        inspecciones, fotografías ni informes sobre su estado. Estos
        tratamientos solo se realizarán cuando correspondan a otro servicio
        contratado o a una finalidad legítima debidamente informada.
      </p>

      <p style={parrafo}>
        Se procurará recoger únicamente los datos adecuados y necesarios
        para cada finalidad. No deben introducirse contraseñas, datos
        completos de tarjetas bancarias ni información personal innecesaria
        en campos de observaciones, mensajes o documentos.
      </p>

      <h3 style={titulo}>3. FINALIDADES DEL TRATAMIENTO</h3>

      <p style={parrafo}>Los datos podrán utilizarse para:</p>

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

      <h3 style={titulo}>4. BASE JURÍDICA DEL TRATAMIENTO</h3>

      <p style={parrafo}>
        La base jurídica dependerá de la finalidad concreta:
      </p>

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
          aplicación o defender reclamaciones.
        </li>
        <li>
          <strong>Consentimiento:</strong> cuando una operación concreta
          requiera legalmente una autorización válida. El consentimiento
          podrá retirarse en cualquier momento, sin afectar a la licitud
          del tratamiento realizado antes de retirarlo.
        </li>
      </ul>

      <p style={parrafo}>
        La aceptación de esta política sirve para acreditar que se ha
        facilitado la información de privacidad; no constituye por sí sola
        un consentimiento para cualquier tratamiento ni sustituye las
        autorizaciones específicas que puedan ser necesarias.
      </p>

      <h3 style={titulo}>5. CARÁCTER OBLIGATORIO DE LOS DATOS</h3>

      <p style={parrafo}>
        Los datos imprescindibles para crear una cuenta, formalizar un
        contrato o prestar un servicio deberán facilitarse cuando sean
        necesarios para esas finalidades. Si no se facilitan, puede resultar
        imposible completar el alta o prestar correctamente el servicio.
      </p>

      <p style={parrafo}>
        Los datos adicionales que no sean necesarios deberán ser opcionales
        cuando la función correspondiente lo permita.
      </p>

      <h3 style={titulo}>6. CONSERVACIÓN DE LOS DATOS</h3>

      <p style={parrafo}>
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

      <p style={parrafo}>
        Cuando los datos dejen de ser necesarios, se suprimirán o se
        anonimizarán y, cuando legalmente corresponda, se bloquearán durante
        el período exigible. La eliminación de una cuenta no implica borrar
        información que deba conservarse por obligación legal o para atender
        responsabilidades pendientes.
      </p>

      <p style={parrafo}>
        El plazo de 60 días para las fotografías describe la política de
        conservación configurada. La ejecución efectiva de las eliminaciones
        debe comprobarse mediante los registros del proceso de limpieza.
      </p>

      <h3 style={titulo}>7. DESTINATARIOS Y PROVEEDORES</h3>

      <p style={parrafo}>
        Para prestar los servicios pueden intervenir proveedores tecnológicos,
        de pagos, facturación y comunicaciones. Solo deberán acceder a los
        datos necesarios para las funciones que tengan encomendadas.
      </p>

      <ul>
        <li>
          <strong>Supabase:</strong> infraestructura de base de datos,
          autenticación, almacenamiento y servicios asociados utilizados
          por la aplicación.
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
      </ul>

      <p style={parrafo}>
        Los proveedores que actúen como encargados del tratamiento deberán
        estar sujetos a las condiciones contractuales y garantías exigidas
        por el RGPD. Algunos proveedores pueden actuar como responsables
        independientes para determinadas operaciones realizadas bajo sus
        propias condiciones.
      </p>

      <p style={parrafo}>
        GitHub se utiliza para alojar y gestionar el código fuente y los
        procesos de desarrollo. El repositorio no debe utilizarse para
        almacenar datos personales reales de clientes, documentos
        contractuales, credenciales ni secretos de producción.
      </p>

      <p style={parrafo}>
        Los datos también podrán comunicarse a autoridades públicas,
        tribunales u otros destinatarios cuando exista una obligación legal
        válida o resulte necesario para formular, ejercer o defender
        reclamaciones.
      </p>

      <p style={parrafo}>
        No se venderán datos personales a terceros. El acceso por parte
        de proveedores se limitará a las finalidades correspondientes.
      </p>

      <h3 style={titulo}>8. TRANSFERENCIAS INTERNACIONALES</h3>

      <p style={parrafo}>
        El proyecto de Supabase utilizado por la aplicación está configurado
        en la región eu-west-2, correspondiente a Londres, Reino Unido.
        La Comisión Europea mantiene una decisión de adecuación para las
        transferencias de datos personales al Reino Unido dentro del ámbito
        del RGPD.
      </p>

      <p style={parrafo}>
        Otros proveedores pueden utilizar infraestructura, subencargados
        o personal situado en países distintos del Espacio Económico Europeo.
        La existencia de una transferencia internacional y el mecanismo
        jurídico aplicable deberán comprobarse en las condiciones y
        documentación vigentes de cada proveedor.
      </p>

      <p style={parrafo}>
        Cuando una transferencia internacional no esté amparada por una
        decisión de adecuación, deberá utilizarse otra garantía válida
        prevista por el RGPD, cuando corresponda, y facilitarse la
        información exigida por la normativa.
      </p>

      <p style={parrafo}>
        Puedes solicitar información adicional sobre las garantías
        aplicables a las transferencias relacionadas con tus datos
        escribiendo a{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h3 style={titulo}>9. DERECHOS DE LAS PERSONAS</h3>

      <p style={parrafo}>
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

      <p style={parrafo}>
        Puedes ejercer tus derechos escribiendo a{" "}
        <a href={`mailto:${email}`}>{email}</a> e indicando claramente
        tu solicitud.
      </p>

      <p style={parrafo}>
        Si existen dudas razonables sobre la identidad de quien presenta
        la solicitud, podrá solicitarse información adicional que sea
        necesaria y proporcionada para verificarla. No se exigirá
        sistemáticamente una copia del documento de identidad.
      </p>

      <p style={parrafo}>
        Se responderá dentro de los plazos establecidos por la normativa.
        El ejercicio de los derechos será gratuito, salvo en los supuestos
        excepcionales previstos legalmente.
      </p>

      <p style={parrafo}>
        También puedes presentar una reclamación ante la Agencia Española
        de Protección de Datos (AEPD):{" "}
        <a
          href="https://www.aepd.es/"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.aepd.es
        </a>.
      </p>

      <h3 style={titulo}>10. SEGURIDAD Y ACCESO A LA INFORMACIÓN</h3>

      <p style={parrafo}>
        Se aplicarán medidas técnicas y organizativas adecuadas al riesgo
        para proteger los datos frente a la pérdida, destrucción, alteración,
        divulgación o acceso no autorizados.
      </p>

      <p style={parrafo}>
        El acceso a la información deberá limitarse a las funciones y
        permisos de cada usuario. Los datos de clientes, contratos,
        facturas, fotografías e información sobre custodia de llaves
        deberán protegerse mediante controles de acceso adecuados.
      </p>

      <p style={parrafo}>
        Los documentos y archivos con datos personales deberán almacenarse
        y compartirse mediante mecanismos de acceso restringido. Las
        credenciales, claves privadas y secretos de producción no deben
        publicarse en el repositorio ni compartirse mediante comunicaciones
        ordinarias.
      </p>

      <p style={parrafo}>
        Ninguna medida puede garantizar un riesgo cero. Si se produce una
        violación de seguridad de datos personales, se gestionará conforme
        a las obligaciones legales aplicables, incluidas las notificaciones
        que correspondan.
      </p>

      <h3 style={titulo}>11. DATOS DEL INMUEBLE, LLAVES E INSPECCIONES</h3>

      <p style={parrafo}>
        La dirección de la vivienda y la información vinculada a ella se
        utilizarán para gestionar los servicios contratados y cumplir las
        obligaciones relacionadas con su prestación.
      </p>

      <p style={parrafo}>
        Cuando se contrate exclusivamente la custodia de llaves, los datos
        se limitarán a los necesarios para gestionar la recepción,
        conservación, control y devolución de las llaves. La custodia por
        sí sola no incluye visitas ni inspecciones de la vivienda.
      </p>

      <p style={parrafo}>
        Cuando se contrate una visita o inspección, podrán tratarse los
        datos necesarios para organizar y documentar esa actuación.
        Las fotografías y observaciones deberán limitarse a la finalidad
        del servicio y evitar, en la medida de lo posible, captar personas,
        documentos u otros datos personales innecesarios.
      </p>

      <p style={parrafo}>
        Los servicios adicionales que requieran presupuesto deberán contar
        con presupuesto previo y aceptación del cliente antes de ejecutarse
        o cobrarse cuando así corresponda.
      </p>

      <h3 style={titulo}>12. DATOS DE MENORES</h3>

      <p style={parrafo}>
        Los servicios están dirigidos a personas que puedan contratar o
        utilizar legalmente los servicios correspondientes. No se pretende
        recoger deliberadamente datos de menores sin la base jurídica
        y las garantías exigidas por la normativa aplicable.
      </p>

      <h3 style={titulo}>13. DECISIONES AUTOMATIZADAS</h3>

      <p style={parrafo}>
        No se pretende adoptar decisiones basadas exclusivamente en
        tratamientos automatizados que produzcan efectos jurídicos o
        afecten significativamente a las personas. Si se incorporase
        un tratamiento de ese tipo, se facilitaría la información exigida
        por el RGPD y se aplicarían las garantías correspondientes.
      </p>

      <h3 style={titulo}>14. ACTUALIZACIONES DE ESTA POLÍTICA</h3>

      <p style={parrafo}>
        Esta política podrá actualizarse cuando cambien los servicios,
        los tratamientos de datos, los proveedores o la normativa aplicable.
        La versión vigente será la publicada en la aplicación junto con
        la fecha de su última actualización.
      </p>

      <p style={parrafo}>
        Si un cambio requiere facilitar información adicional, obtener
        un consentimiento específico o adoptar otra medida legal, se
        realizará antes de iniciar el tratamiento correspondiente.
      </p>
    </div>
  );
}
