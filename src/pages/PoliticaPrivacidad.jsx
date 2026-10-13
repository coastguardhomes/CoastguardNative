
import React from "react";
import { useNavigate } from "react-router-dom";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();

  return (
    <div
      className="privacy-container"
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#333",
        lineHeight: "1.6",
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

      <p>
        Última actualización: 13 de octubre de 2026.
      </p>

      <p>
        Esta Política de Privacidad explica cómo CoastGuard Homes Services
        trata los datos personales de las personas que utilizan la aplicación,
        el sitio web y los servicios asociados. El tratamiento se realizará
        conforme al Reglamento (UE) 2016/679, General de Protección de Datos
        (RGPD), a la Ley Orgánica 3/2018, de Protección de Datos Personales y
        garantía de los derechos digitales (LOPDGDD), y a las demás normas
        aplicables.
      </p>

      <h3>1. RESPONSABLE DEL TRATAMIENTO</h3>

      <ul>
        <li>
          <strong>Responsable:</strong> Roxana Collazo Alonso.
        </li>
        <li>
          <strong>Nombre comercial:</strong> CoastGuard Homes Services.
        </li>
        <li>
          <strong>Domicilio profesional:</strong> Calle Clásicas de Arriba,
          33, 1.º F, Pilar de la Horadada, Alicante, España.
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href="mailto:coastguardhomes@gmail.com">
            coastguardhomes@gmail.com
          </a>
        </li>
      </ul>

      <p>
        Para consultas sobre privacidad o para ejercer los derechos indicados
        en esta política, puedes escribir al correo electrónico anterior.
      </p>

      <h3>2. CATEGORÍAS DE DATOS PERSONALES</h3>

      <p>
        Dependiendo de las funciones utilizadas y de la relación con
        CoastGuard Homes Services, podrán tratarse las siguientes categorías
        de datos:
      </p>

      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre, apellidos,
          correo electrónico, teléfono y otros datos de contacto que se
          faciliten.
        </li>
        <li>
          <strong>Cuenta y autenticación:</strong> identificador de usuario,
          datos necesarios para gestionar el acceso, preferencias y registros
          técnicos relacionados con la autenticación. Las contraseñas deben
          gestionarse mediante los mecanismos de autenticación habilitados y
          no deben compartirse por correo ni introducirse en campos de texto.
        </li>
        <li>
          <strong>Relación contractual:</strong> datos necesarios para
          gestionar solicitudes, contratos, duración del servicio,
          comunicaciones, renovaciones, cancelaciones y servicios adicionales
          que se hayan solicitado.
        </li>
        <li>
          <strong>Datos del inmueble:</strong> dirección de la vivienda y
          demás información estrictamente necesaria para prestar el servicio
          de custodia de llaves.
        </li>
        <li>
          <strong>Gestión de llaves:</strong> información necesaria para
          identificar y controlar la custodia de las llaves, su recepción,
          conservación y devolución, cuando corresponda. Se limitará el
          acceso a esta información por motivos de seguridad.
        </li>
        <li>
          <strong>Facturación y pagos:</strong> datos necesarios para emitir
          facturas, gestionar cobros, administrar suscripciones y cumplir
          obligaciones fiscales y contables. Los datos de tarjeta bancaria
          serán tratados por el proveedor de pagos correspondiente cuando
          intervenga en la operación.
        </li>
        <li>
          <strong>Comunicaciones:</strong> mensajes, solicitudes, avisos,
          reclamaciones y comunicaciones relacionadas con la prestación del
          servicio.
        </li>
        <li>
          <strong>Seguridad y funcionamiento:</strong> registros técnicos
          necesarios para gestionar accesos, proteger las cuentas, prevenir
          usos indebidos y resolver incidencias de la aplicación.
        </li>
        <li>
          <strong>Servicios adicionales:</strong> si el cliente solicita y
          acepta expresamente un servicio adicional, podrán tratarse los datos
          estrictamente necesarios para presupuestarlo y ejecutarlo.
        </li>
      </ul>

      <p>
        El servicio ordinario contratado es la custodia de llaves sin visitas
        a la vivienda ni inspecciones periódicas incluidas. Por tanto, no se
        presupone la recogida sistemática de fotografías, informes de
        inspección ni observaciones técnicas sobre el estado del inmueble.
        Si se solicita un servicio adicional que requiera otros datos, estos
        se tratarán únicamente en la medida necesaria para su gestión y
        conforme a la información que corresponda facilitar.
      </p>

      <p>
        Se procurará recoger únicamente datos adecuados, pertinentes y
        necesarios. No deben introducirse contraseñas, datos completos de
        tarjetas bancarias ni información personal innecesaria en campos de
        observaciones, mensajes o documentos.
      </p>

      <h3>3. FINALIDADES DEL TRATAMIENTO</h3>

      <p>Los datos podrán tratarse para las siguientes finalidades:</p>

      <ul>
        <li>Crear y administrar las cuentas de usuario.</li>
        <li>
          Gestionar las solicitudes de información y las medidas
          precontractuales que solicite la persona interesada.
        </li>
        <li>
          Formalizar, administrar y ejecutar los contratos de custodia de
          llaves.
        </li>
        <li>
          Gestionar la identificación del inmueble y la información necesaria
          para la custodia segura de las llaves.
        </li>
        <li>
          Gestionar cobros, suscripciones, facturas, pagos y obligaciones
          contables y fiscales.
        </li>
        <li>
          Atender las solicitudes de cancelación, las comunicaciones
          contractuales y las gestiones administrativas relacionadas.
        </li>
        <li>
          Preparar presupuestos y gestionar servicios adicionales cuando
          hayan sido solicitados y aceptados expresamente por el cliente.
        </li>
        <li>
          Enviar comunicaciones necesarias para gestionar el contrato,
          responder consultas y atender reclamaciones.
        </li>
        <li>
          Proteger la aplicación, gestionar los permisos de acceso y prevenir
          usos no autorizados.
        </li>
        <li>
          Cumplir obligaciones legales y formular, ejercer o defender
          reclamaciones cuando resulte necesario.
        </li>
      </ul>

      <p>
        Los datos no se utilizarán para finalidades incompatibles con aquellas
        para las que fueron recogidos. Si se pretende realizar un tratamiento
        adicional que requiera información específica o una nueva base
        jurídica, se facilitará la información exigida por la normativa.
      </p>

      <h3>4. BASE JURÍDICA DEL TRATAMIENTO</h3>

      <p>
        La base jurídica dependerá de la finalidad concreta del tratamiento:
      </p>

      <ul>
        <li>
          <strong>
            Ejecución de un contrato o medidas precontractuales:
          </strong>{" "}
          para gestionar solicitudes, formalizar contratos, prestar el
          servicio de custodia de llaves y administrar la relación con el
          cliente.
        </li>
        <li>
          <strong>Obligación legal:</strong> para cumplir las obligaciones
          fiscales, contables y demás deberes establecidos por la normativa.
        </li>
        <li>
          <strong>Interés legítimo:</strong> cuando exista un interés legítimo
          real, necesario y equilibrado, como proteger la seguridad de la
          aplicación o defender reclamaciones, respetando los derechos y
          libertades de las personas afectadas.
        </li>
        <li>
          <strong>Consentimiento:</strong> para aquellos tratamientos que
          requieran una autorización válida. El consentimiento podrá retirarse
          en cualquier momento, sin que ello afecte a la licitud del
          tratamiento realizado antes de su retirada.
        </li>
      </ul>

      <p>
        La aceptación de esta política no sustituye al consentimiento
        específico que pueda ser necesario para otros tratamientos. Cuando un
        tratamiento se base en el consentimiento, su retirada no afectará a
        los tratamientos que cuenten con otra base jurídica válida.
      </p>

      <h3>5. CARÁCTER OBLIGATORIO DE LOS DATOS</h3>

      <p>
        Los datos estrictamente necesarios para crear una cuenta, gestionar
        una solicitud, formalizar el contrato o prestar el servicio deberán
        facilitarse cuando sean imprescindibles para esas finalidades. La
        falta de dichos datos puede impedir el alta, la formalización del
        contrato o la correcta prestación del servicio.
      </p>

      <p>
        Los datos adicionales que no sean necesarios deberán ser opcionales.
        Se procurará identificar los campos obligatorios en los formularios
        correspondientes.
      </p>

      <h3>6. CONSERVACIÓN DE LOS DATOS</h3>

      <p>
        Los datos se conservarán durante el tiempo necesario para cumplir
        cada finalidad y, cuando corresponda, durante los plazos legales de
        conservación y prescripción de responsabilidades.
      </p>

      <ul>
        <li>
          <strong>Datos de cuenta:</strong> durante la vigencia de la cuenta
          y el tiempo adicional necesario para gestionar obligaciones o
          reclamaciones pendientes.
        </li>
        <li>
          <strong>Contratos y documentación de la relación contractual:</strong>{" "}
          durante la vigencia de la relación y los plazos adicionales que
          resulten necesarios para cumplir obligaciones legales o atender
          posibles reclamaciones.
        </li>
        <li>
          <strong>Facturas y documentación contable:</strong> durante los
          plazos de conservación exigidos por la normativa fiscal, mercantil
          y contable que resulte aplicable.
        </li>
        <li>
          <strong>Datos relacionados con la custodia de llaves:</strong>{" "}
          durante el tiempo necesario para gestionar la custodia, su
          devolución y las responsabilidades relacionadas, con acceso
          restringido y sin conservarlos indefinidamente.
        </li>
        <li>
          <strong>Comunicaciones y reclamaciones:</strong> durante el tiempo
          necesario para atenderlas y gestionar las posibles responsabilidades
          posteriores.
        </li>
        <li>
          <strong>Registros de seguridad:</strong> durante el período
          proporcionado y necesario para proteger el servicio, investigar
          incidencias y cumplir las obligaciones aplicables.
        </li>
      </ul>

      <p>
        Los períodos concretos deberán ajustarse a las necesidades reales de
        cada tratamiento y a la normativa aplicable. Cuando los datos dejen
        de ser necesarios, se suprimirán, anonimizarán o bloquearán cuando
        legalmente corresponda.
      </p>

      <h3>7. DESTINATARIOS Y PROVEEDORES</h3>

      <p>
        Para gestionar CoastGuard Homes Services pueden intervenir proveedores
        tecnológicos y administrativos. Su intervención dependerá de las
        funcionalidades efectivamente utilizadas y de la configuración del
        servicio.
      </p>

      <ul>
        <li>
          <strong>Supabase:</strong> plataforma utilizada para los servicios
          de infraestructura que correspondan, como base de datos,
          autenticación, almacenamiento y servicios asociados.
        </li>
        <li>
          <strong>Stripe:</strong> proveedor utilizado para gestionar los
          pagos y las operaciones de suscripción que se realicen a través de
          su plataforma. Stripe tratará los datos necesarios para las
          operaciones que gestione conforme a sus condiciones y política de
          privacidad.
        </li>
        <li>
          <strong>FacturaDirecta:</strong> servicio de facturación y gestión
          administrativa y contable cuando se utilice para esas funciones.
        </li>
        <li>
          <strong>Resend:</strong> proveedor de infraestructura de correo
          electrónico cuando se utilice para enviar comunicaciones
          relacionadas con la aplicación o el servicio.
        </li>
        <li>
          <strong>GitHub:</strong> plataforma utilizada para alojar y
          gestionar el código fuente y los procesos de desarrollo. El
          repositorio no debe utilizarse para almacenar datos personales
          reales de clientes, credenciales ni secretos de producción.
        </li>
      </ul>

      <p>
        Cuando un proveedor trate datos personales por cuenta de la
        responsable, deberán establecerse las condiciones contractuales y las
        garantías exigidas por la normativa de protección de datos. Cada
        proveedor podrá tener además sus propias responsabilidades para los
        tratamientos que realice como responsable independiente, cuando
        corresponda.
      </p>

      <p>
        Los datos podrán comunicarse a autoridades públicas, tribunales u
        otros destinatarios cuando exista una obligación legal válida o
        cuando sea necesario para formular, ejercer o defender reclamaciones.
      </p>

      <p>
        No se venderán datos personales a terceros. El acceso de proveedores
        y las comunicaciones de datos se limitarán a lo necesario para la
        finalidad correspondiente.
      </p>

      <h3>8. TRANSFERENCIAS INTERNACIONALES</h3>

      <p>
        Algunos proveedores tecnológicos pueden tratar datos personales desde
        países situados fuera del Espacio Económico Europeo. Cuando se
        produzca una transferencia internacional, deberá contar con un
        mecanismo válido conforme al RGPD, como una decisión de adecuación,
        cláusulas contractuales tipo u otra garantía legalmente reconocida,
        según corresponda.
      </p>

      <p>
        La ubicación efectiva del tratamiento, las condiciones contractuales
        y las garantías aplicables deberán comprobarse para cada proveedor y
        servicio utilizado. El uso de un proveedor tecnológico no significa,
        por sí solo, que cualquier transferencia internacional esté
        autorizada.
      </p>

      <h3>9. DERECHOS DE LAS PERSONAS</h3>

      <p>
        Cuando se cumplan los requisitos legales, puedes ejercer los
        siguientes derechos:
      </p>

      <ul>
        <li>
          <strong>Acceso:</strong> conocer si se están tratando tus datos y
          obtener acceso a ellos.
        </li>
        <li>
          <strong>Rectificación:</strong> solicitar la corrección de datos
          inexactos o incompletos.
        </li>
        <li>
          <strong>Supresión:</strong> solicitar la eliminación de los datos
          cuando proceda legalmente.
        </li>
        <li>
          <strong>Oposición:</strong> oponerte a determinados tratamientos
          cuando concurran los requisitos previstos en la normativa.
        </li>
        <li>
          <strong>Limitación:</strong> solicitar la limitación del
          tratamiento en los supuestos legalmente establecidos.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir determinados datos en un
          formato estructurado y transmitirlos a otro responsable cuando se
          cumplan los requisitos legales.
        </li>
        <li>
          <strong>Retirada del consentimiento:</strong> retirar el
          consentimiento cuando el tratamiento se base en él, sin afectar a
          la licitud del tratamiento anterior a la retirada.
        </li>
      </ul>

      <p>
        Puedes ejercer tus derechos escribiendo a{" "}
        <a href="mailto:coastguardhomes@gmail.com">
          coastguardhomes@gmail.com
        </a>{" "}
        e indicando tu solicitud.
      </p>

      <p>
        Cuando existan dudas razonables sobre la identidad de la persona
        solicitante, podrá solicitarse información adicional que resulte
        necesaria y proporcionada para verificarla. No se exigirá
        sistemáticamente una copia del documento de identidad.
      </p>

      <p>
        Se responderá dentro de los plazos establecidos por la normativa
        aplicable. El ejercicio de los derechos será gratuito salvo en los
        supuestos excepcionales previstos legalmente.
      </p>

      <p>
        También puedes presentar una reclamación ante la Agencia Española de
        Protección de Datos (AEPD):{" "}
        <a
          href="https://www.aepd.es/"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.aepd.es
        </a>
        .
      </p>

      <h3>10. SEGURIDAD Y ACCESO A LA INFORMACIÓN</h3>

      <p>
        Se deberán aplicar medidas técnicas y organizativas adecuadas al
        riesgo para proteger los datos frente a destrucción, pérdida,
        alteración, divulgación o acceso no autorizados.
      </p>

      <p>
        El acceso a la información deberá limitarse a las funciones y
        permisos de cada usuario. Los datos de clientes, contratos, facturas
        y custodia de llaves deberán protegerse mediante controles de acceso
        adecuados y revisiones periódicas de permisos.
      </p>

      <p>
        Las credenciales, claves privadas y secretos de producción no deben
        publicarse en el repositorio ni compartirse en comunicaciones
        ordinarias. Los documentos y archivos que contengan datos personales
        deberán almacenarse y compartirse mediante mecanismos adecuados de
        acceso restringido.
      </p>

      <p>
        Ninguna medida de seguridad puede garantizar un riesgo cero. Si se
        produce una violación de seguridad de los datos personales, se
        gestionará conforme a las obligaciones legales aplicables, incluidas
        las notificaciones que correspondan.
      </p>

      <h3>11. DATOS DEL INMUEBLE Y CUSTODIA DE LLAVES</h3>

      <p>
        La dirección de la vivienda y la información vinculada a la custodia
        de llaves se utilizarán únicamente para gestionar el servicio
        contratado, mantener el control de las llaves y atender las
        obligaciones relacionadas.
      </p>

      <p>
        Dado que la custodia de llaves no incluye visitas ni inspecciones de
        la vivienda, no se recogerán de forma sistemática datos sobre el
        estado interior del inmueble, fotografías o informes de inspección
        como parte del servicio ordinario.
      </p>

      <p>
        Si el cliente solicita un servicio adicional que requiera tratar
        información distinta, se utilizarán únicamente los datos necesarios
        para el servicio solicitado y se facilitará la información que
        corresponda. Cuando sea necesario, el servicio adicional requerirá
        presupuesto previo y aceptación expresa del cliente.
      </p>

      <h3>12. DATOS DE MENORES</h3>

      <p>
        Los servicios están dirigidos a personas que puedan contratar o
        utilizar legalmente los servicios correspondientes. No se pretende
        recoger deliberadamente datos de menores sin la base jurídica y las
        garantías que resulten necesarias conforme a la normativa aplicable.
      </p>

      <h3>13. DECISIONES AUTOMATIZADAS</h3>

      <p>
        Si se incorporasen tratamientos que impliquen decisiones basadas
        exclusivamente en procesos automatizados y que produzcan efectos
        jurídicos o afecten significativamente a las personas, se
        identificarían y someterían a los requisitos establecidos por el
        RGPD. Cuando proceda, se facilitará la información exigida sobre la
        lógica aplicada, la importancia y las consecuencias previstas, así
        como sobre los derechos de la persona afectada.
      </p>

      <h3>14. ACTUALIZACIONES DE ESTA POLÍTICA</h3>

      <p>
        Esta política podrá actualizarse cuando cambien los servicios, los
        tratamientos de datos o la normativa aplicable. La versión vigente
        será la publicada en la aplicación o en el sitio web correspondiente,
        junto con la fecha de su última actualización.
      </p>

      <p>
        Si se introduce un cambio que requiera información adicional, una
        nueva base jurídica o la obtención de consentimiento, se adoptarán
        las medidas exigidas por la normativa antes de realizar el
        tratamiento que corresponda.
      </p>
    </div>
  );
}
