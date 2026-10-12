import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function GenerarPDFContrato({
  contrato,
  cliente,
  onGenerado,
}) {
  const { t, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function comprobarContrato() {
      if (!user || !contrato?.id) return;

      const { data, error } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", contrato.id)
        .single();

      if (error || !data) {
        alert(t("clienteAccesoDenegado"));
      }
    }

    comprobarContrato();
  }, [user, contrato?.id, t]);

  const generarPDF = async () => {
    if (!contrato?.id) {
      alert("No se puede generar el PDF: falta el identificador del contrato.");
      return;
    }

    setLoading(true);

    try {
      // Mantener el idioma configurado para el cliente.
      if (cliente?.idioma) {
        changeLanguage(cliente.idioma);
      }

      const idioma = String(cliente?.idioma || "es")
        .toLowerCase()
        .startsWith("en")
        ? "en"
        : "es";

      const textos = {
        es: {
          condiciones: [
            {
              titulo: "1. Objeto del contrato",
              texto:
                "El prestador realizará los servicios de inspección y revisión de la vivienda que se hayan acordado con el cliente. El alcance del servicio será el correspondiente a la modalidad contratada y a las características de la vivienda.",
            },
            {
              titulo: "2. Suscripción, frecuencia y precio",
              texto:
                "El servicio se presta mediante una suscripción con la frecuencia de revisión indicada en este contrato. La cuota mensual acordada es la que figura en el apartado de detalles del servicio. El precio pactado se mantendrá durante el periodo contractual, salvo que el cliente acepte expresamente una modificación. La aceptación deberá poder acreditarse.",
            },
            {
              titulo: "3. Duración y renovación",
              texto:
                "El contrato inicial tendrá una duración de doce (12) meses desde la fecha de inicio indicada en este documento. Al finalizar dicho periodo, se renovará automáticamente por periodos sucesivos de doce (12) meses, salvo que el cliente comunique su voluntad de no renovarlo conforme a las condiciones de cancelación aquí recogidas.",
            },
            {
              titulo: "4. Cancelación y preaviso",
              texto:
                "El cliente podrá solicitar la cancelación en cualquier momento, comunicándolo con un preaviso mínimo de un (1) mes. La prestación finalizará una vez transcurrido dicho preaviso. No se aplicará una penalización por las mensualidades correspondientes al tiempo restante del periodo contractual que no vaya a disfrutarse, sin perjuicio de las cantidades vencidas o de los servicios efectivamente prestados que estén pendientes de pago.",
            },
            {
              titulo: "5. Servicios extraordinarios y extras",
              texto:
                "Los trabajos o servicios que no estén incluidos en la suscripción se considerarán extras. Antes de realizarlos, el cliente recibirá un presupuesto con su alcance y precio y deberá aceptarlo expresamente. No se ejecutarán ni cobrarán extras sin la aceptación previa del cliente, salvo que este haya autorizado expresamente otra actuación conforme a la normativa aplicable.",
            },
            {
              titulo: "6. Funciones y límites del técnico",
              texto:
                "El técnico realizará las inspecciones y registrará las observaciones correspondientes. No está autorizado a modificar la cuota, el precio de los servicios, las condiciones administrativas ni otros términos económicos del contrato. Cualquier cambio de estas condiciones deberá tramitarse por los canales autorizados y contar con la aceptación expresa del cliente cuando corresponda.",
            },
            {
              titulo: "7. Alcance de las inspecciones",
              texto:
                "Las inspecciones se limitarán al alcance del servicio contratado y a las comprobaciones que puedan realizarse razonablemente durante la visita. Salvo pacto expreso por escrito, el servicio no equivale a una vigilancia continua de la vivienda, no garantiza la ausencia de averías o daños y no sustituye las reparaciones, intervenciones especializadas ni actuaciones de emergencia que puedan resultar necesarias.",
            },
            {
              titulo: "8. Incidencias y comunicación",
              texto:
                "Las incidencias detectadas se comunicarán mediante los canales habilitados para el servicio, de acuerdo con el alcance contratado. La comunicación de una incidencia no implica por sí sola que su reparación esté incluida en la suscripción. Cuando la solución requiera trabajos adicionales, se aplicará el procedimiento de presupuesto y aceptación previa de los extras.",
            },
            {
              titulo: "9. Contratación a distancia y desistimiento",
              texto:
                "Cuando el contrato se celebre a distancia o fuera del establecimiento y el cliente tenga legalmente la condición de consumidor, se respetará el derecho de desistimiento que resulte aplicable, incluidos los plazos, excepciones y requisitos establecidos por la normativa vigente. Si el cliente solicita que el servicio comience durante el plazo de desistimiento, se recabarán las manifestaciones y autorizaciones que legalmente correspondan. Esta cláusula no limita los derechos irrenunciables del consumidor.",
            },
            {
              titulo: "10. Protección de datos y confidencialidad",
              texto:
                "Los datos personales se tratarán para gestionar la relación contractual, coordinar las inspecciones, atender incidencias y cumplir las obligaciones legales aplicables. Su tratamiento se realizará conforme a la normativa de protección de datos vigente y a la información de privacidad facilitada al cliente. El prestador mantendrá la confidencialidad de la información a la que acceda durante la prestación del servicio, salvo obligación legal o autorización válida.",
            },
            {
              titulo: "11. Aceptación y derechos del cliente",
              texto:
                "La aceptación del contrato deberá quedar registrada por el procedimiento habilitado. El cliente podrá solicitar aclaraciones sobre el servicio, la cuota, los extras o la cancelación y ejercer los derechos que le reconozca la legislación aplicable. Ninguna condición de este documento pretende excluir derechos legalmente irrenunciables.",
            },
          ],
          firma: "Firma del cliente",
          fecha: "Fecha de generación",
          sinDato: "No indicado",
          pagina: "Página",
          de: "de",
        },
        en: {
          condiciones: [
            {
              titulo: "1. Purpose of the agreement",
              texto:
                "The provider will carry out the property inspection and review services agreed with the client. The scope of the service will be determined by the subscribed plan and the characteristics of the property.",
            },
            {
              titulo: "2. Subscription, frequency and price",
              texto:
                "The service is provided by subscription at the review frequency stated in this agreement. The agreed monthly fee is shown in the service details. The agreed price will remain unchanged during the contractual period unless the client expressly accepts a change. Such acceptance must be capable of being evidenced.",
            },
            {
              titulo: "3. Term and renewal",
              texto:
                "The initial term is twelve (12) months from the start date stated in this document. At the end of that term, the agreement will automatically renew for successive periods of twelve (12) months unless the client gives notice of non-renewal in accordance with the cancellation conditions below.",
            },
            {
              titulo: "4. Cancellation and notice",
              texto:
                "The client may request cancellation at any time by giving at least one (1) month's notice. The service will end when that notice period expires. No penalty will be charged for monthly fees relating to the unused remainder of the contractual period, without prejudice to amounts already due or services actually provided and still unpaid.",
            },
            {
              titulo: "5. Additional services",
              texto:
                "Work or services not included in the subscription are treated as extras. Before they are carried out, the client will receive a quotation describing their scope and price and must expressly accept it. Extras will not be performed or charged without the client's prior acceptance, unless the client has expressly authorised another arrangement in accordance with applicable law.",
            },
            {
              titulo: "6. Technician's role and limitations",
              texto:
                "The technician will carry out inspections and record relevant observations. The technician is not authorised to change the subscription fee, service prices, administrative conditions or other financial terms of this agreement. Changes must be handled through authorised channels and, where required, expressly accepted by the client.",
            },
            {
              titulo: "7. Scope of inspections",
              texto:
                "Inspections are limited to the subscribed service and checks that can reasonably be performed during the visit. Unless expressly agreed in writing, the service is not continuous property surveillance, does not guarantee that breakdowns or damage will not occur, and does not replace repairs, specialist work or emergency services that may be necessary.",
            },
            {
              titulo: "8. Issues and communication",
              texto:
                "Issues identified will be reported through the channels provided for the service and within the agreed scope. Reporting an issue does not by itself mean that its repair is included in the subscription. Where additional work is required, the quotation and prior acceptance procedure for extras will apply.",
            },
            {
              titulo: "9. Distance contracts and withdrawal",
              texto:
                "Where the agreement is concluded at a distance or away from business premises and the client qualifies as a consumer, any applicable statutory right of withdrawal will be respected, including the time limits, exceptions and requirements under applicable law. If the client asks for the service to begin during the withdrawal period, any legally required statements and authorisations will be obtained. This clause does not restrict non-waivable consumer rights.",
            },
            {
              titulo: "10. Data protection and confidentiality",
              texto:
                "Personal data will be processed to manage the contractual relationship, coordinate inspections, handle issues and comply with applicable legal obligations. Processing will follow applicable data protection law and the privacy information provided to the client. The provider will keep information accessed during service delivery confidential, except where disclosure is legally required or validly authorised.",
            },
            {
              titulo: "11. Acceptance and client rights",
              texto:
                "Acceptance of the agreement must be recorded through the designated procedure. The client may request clarification about the service, fee, extras or cancellation and may exercise rights granted by applicable law. No provision of this document is intended to exclude non-waivable statutory rights.",
            },
          ],
          firma: "Client signature",
          fecha: "Generation date",
          sinDato: "Not specified",
          pagina: "Page",
          de: "of",
        },
      };

      const contenido = textos[idioma];
      const doc = new jsPDF();
      const margenIzquierdo = 20;
      const margenDerecho = 20;
      const anchoUtil =
        doc.internal.pageSize.getWidth() -
        margenIzquierdo -
        margenDerecho;
      const altoPagina = doc.internal.pageSize.getHeight();
      const margenInferior = 20;
      let y = 20;

      const asegurarEspacio = (altoNecesario) => {
        if (y + altoNecesario > altoPagina - margenInferior) {
          doc.addPage();
          y = 20;
        }
      };

      const agregarTextoEnvuelto = (
        texto,
        x,
        ancho,
        tamano = 10,
        interlineado = 5
      ) => {
        doc.setFontSize(tamano);

        const lineas = doc.splitTextToSize(
          String(texto ?? ""),
          ancho
        );

        const altoTexto = lineas.length * interlineado;
        asegurarEspacio(altoTexto);

        doc.text(lineas, x, y);
        y += altoTexto;

        return altoTexto;
      };

      const agregarSeccion = (titulo, texto) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        const lineasTitulo = doc.splitTextToSize(
          titulo,
          anchoUtil
        );

        asegurarEspacio(lineasTitulo.length * 5 + 3);

        doc.text(lineasTitulo, margenIzquierdo, y);
        y += lineasTitulo.length * 5 + 2;

        doc.setFont("helvetica", "normal");
        agregarTextoEnvuelto(
          texto,
          margenIzquierdo,
          anchoUtil,
          9,
          4.5
        );

        y += 4;
      };

      // Título del documento.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      const tituloPDF = doc.splitTextToSize(
        t("pdfTitulo"),
        anchoUtil
      );

      doc.text(tituloPDF, margenIzquierdo, y);
      y += tituloPDF.length * 8 + 7;

      // Datos del cliente.
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      agregarTextoEnvuelto(
        `${t("pdfNombreCliente")}: ${cliente?.nombre || contenido.sinDato}`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfDireccion")}: ${cliente?.direccion || contenido.sinDato}`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfTelefono")}: ${cliente?.telefono || contenido.sinDato}`,
        margenIzquierdo,
        anchoUtil
      );

      y += 4;

      // Detalles del servicio contratado.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      asegurarEspacio(9);
      doc.text(t("pdfDetallesServicio"), margenIzquierdo, y);
      y += 8;

      doc.setFont("helvetica", "normal");

      agregarTextoEnvuelto(
        `${t("pdfTipoServicio")}: ${
          contrato?.frecuencia != null
            ? `${t("contratoCadaDias")} ${contrato.frecuencia}`
            : contenido.sinDato
        }`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfFechaInicio")}: ${
          contrato?.fecha_inicio || contenido.sinDato
        }`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfPrecioMensual")}: ${
          contrato?.precio != null
            ? `${contrato.precio} €`
            : contenido.sinDato
        }`,
        margenIzquierdo,
        anchoUtil
      );

      y += 5;

      // Condiciones contractuales.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      asegurarEspacio(10);
      doc.text(t("pdfCondiciones"), margenIzquierdo, y);
      y += 8;

      doc.setFont("helvetica", "normal");

      contenido.condiciones.forEach((seccion) => {
        agregarSeccion(seccion.titulo, seccion.texto);
      });

      // Firma del cliente, manteniendo la firma existente si está guardada.
      y += 2;
      asegurarEspacio(45);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(contenido.firma, margenIzquierdo, y);
      y += 7;

      let firmaAgregada = false;

      if (contrato?.firma) {
        try {
          const { data, error } = await supabase.storage
            .from("firmas")
            .download(contrato.firma);

          if (!error && data) {
            const reader = new FileReader();

            const base64 = await new Promise(
              (resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () =>
                  reject(new Error("No se pudo leer el archivo de firma."));
                reader.readAsDataURL(data);
              }
            );

            asegurarEspacio(35);

            doc.addImage(
              base64,
              "PNG",
              margenIzquierdo,
              y,
              60,
              25
            );

            y += 29;
            firmaAgregada = true;
          }
        } catch (error) {
          console.error("No se pudo cargar la firma:", error);
        }
      }

      if (!firmaAgregada) {
        asegurarEspacio(15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text(
          "________________________________________",
          margenIzquierdo,
          y
        );

        y += 7;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      agregarTextoEnvuelto(
        `${contenido.fecha}: ${new Date().toLocaleDateString(
          idioma === "en" ? "en-GB" : "es-ES"
        )}`,
        margenIzquierdo,
        anchoUtil,
        9,
        4
      );

      // Numeración de páginas.
      const totalPaginas = doc.internal.getNumberOfPages();

      for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        doc.setPage(pagina);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
          `${contenido.pagina} ${pagina} ${contenido.de} ${totalPaginas}`,
          doc.internal.pageSize.getWidth() - margenDerecho,
          altoPagina - 8,
          { align: "right" }
        );
      }

      // Guardar el PDF en el almacenamiento existente.
      const pdfBlob = doc.output("blob");
      const fileName = `contrato_${contrato.id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("contratos")
        .upload(fileName, pdfBlob, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        console.error("Error subiendo PDF:", uploadError);

        alert(
          t("errorSubirPdfStorage") +
            uploadError.message
        );

        return;
      }

      // Guardar la ruta del archivo, no una URL pública.
      const { error: updateError } = await supabase
        .from("contratos")
        .update({
          pdf_url: fileName,
          fecha_pdf: new Date().toISOString(),
          estado_pdf: "generado",
        })
        .eq("id", contrato.id);

      if (updateError) {
        throw new Error(
          "No se pudo actualizar el contrato con la ruta del PDF: " +
            updateError.message
        );
      }

      // Crear una URL firmada temporal para acceder al documento.
      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("contratos")
          .createSignedUrl(fileName, 3600);

      if (signedError || !signedData?.signedUrl) {
        throw new Error(
          signedError?.message ||
            "No se pudo generar la URL segura del contrato"
        );
      }

      alert(t("pdfGenerado"));

      if (onGenerado) {
        onGenerado(signedData.signedUrl);
      }
    } catch (err) {
      console.error("Error generando PDF:", err);

      alert(
        t("errorGenerarPdf") +
          (err?.message || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generarPDF}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#4db8ff",
        color: "#000",
        border: "none",
        borderRadius: "8px",
        cursor: loading ? "wait" : "pointer",
        marginTop: "20px",
        fontWeight: "700",
        fontSize: "16px",
        boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading
        ? t("pdfGenerando")
        : t("pdfGenerar")}
    </button>
  );
}
