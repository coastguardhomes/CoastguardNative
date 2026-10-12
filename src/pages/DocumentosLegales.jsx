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
        servicios de gestión, inspección, comunicación de incidencias
        y mantenimiento de viviendas ofrecidos a través de
        CoastGuard Homes Services y su aplicación.
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
        La cuota acordada permanecerá fija durante el periodo
        contratado. No se aplicará una modificación del precio
        sin la aceptación expresa del cliente. Cualquier propuesta
        de cambio deberá comunicarse previamente, indicando el
        nuevo importe y la fecha propuesta para su aplicación.
      </p>

      <h2 style={estilos.subtitulo}>
        3. Duración, renovación y cancelación
      </h2>

      <p>
        La duración inicial de la suscripción será de doce (12)
        meses desde la fecha de inicio indicada en las condiciones
        particulares.
      </p>

      <p>
        Una vez finalizado el periodo inicial, la suscripción se
        renovará automáticamente por periodos sucesivos de doce
        (12) meses, salvo que el cliente comunique su cancelación.
      </p>

      <p>
        Aunque exista un periodo inicial de doce meses y renovación
        automática, el cliente podrá solicitar la cancelación en
        cualquier momento, tanto durante el periodo inicial como
        durante cualquiera de las renovaciones, mediante un preaviso
        de un (1) mes.
      </p>

      <p>
        La cancelación surtirá efecto al cumplirse un mes desde la
        comunicación del cliente, salvo que las partes acuerden
        expresamente una fecha anterior o la normativa aplicable
        establezca una condición más favorable para el cliente.
        El prestador confirmará la fecha efectiva de finalización.
      </p>

      <p>
        No se cobrará una penalización por los meses que queden
        pendientes del periodo anual. Durante el preaviso, el
        servicio seguirá activo y se abonarán las cuotas que
        correspondan hasta la fecha efectiva de finalización,
        conforme a las condiciones de facturación aceptadas.
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
        La solicitud de cancelación podrá realizarse mediante
        los canales habilitados por el prestador que permitan
        dejar constancia de la comunicación.
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
        El pago del servicio extra se realizará después de la
        aceptación del presupuesto, conforme a las condiciones
        comunicadas y aceptadas para ese servicio.
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
        Cuando la contratación se realice a distancia con un
        consumidor y la normativa reconozca un derecho de
        desistimiento, se informará al cliente del plazo, del
        procedimiento para ejercerlo y de sus consecuencias.
      </p>

      <p>
        Cuando resulte aplicable, el plazo general de desistimiento
        para contratos de servicios celebrados a distancia será
        de catorce días naturales desde la celebración del contrato,
        sin perjuicio de las excepciones, requisitos y reglas
        especiales previstos legalmente.
      </p>

      <p>
        Si el cliente solicita que el servicio comience durante
        el periodo de desistimiento, se recabará la solicitud
        expresa y los reconocimientos que correspondan conforme
        a la normativa. La pérdida del derecho de desistimiento
        solo se aplicará cuando se cumplan los requisitos legales.
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
        el alcance del plan, la frecuencia de revisión, la cuota,
        los impuestos, la fecha de inicio y la fecha prevista
        de finalización del periodo inicial.
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

      <p>
        <strong>Información importante:</strong> este texto es
        una propuesta contractual adaptada a las condiciones
        comerciales indicadas. Antes de utilizarlo como versión
        definitiva con clientes reales, debe revisarse jurídicamente
        y coordinarse con las condiciones particulares, la
        facturación y el documento contractual que se entregue
        al cliente.
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
