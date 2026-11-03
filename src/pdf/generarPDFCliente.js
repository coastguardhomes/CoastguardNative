import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Convierte una URL o un Base64 a una imagen Base64.
 * Las URL firmadas de Storage se reciben ya resueltas.
 */
async function urlToBase64(input) {
  if (!input) return null;

  if (
    typeof input === "string" &&
    input.startsWith("data:image")
  ) {
    return input;
  }

  try {
    const response = await fetch(input);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(
      "No se pudo convertir una fotografía para el PDF:",
      error
    );

    return null;
  }
}

function texto(valor, alternativa = "No especificado") {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return alternativa;
  }

  return String(valor);
}

function obtenerIdioma(inspeccion, opciones) {
  return (
    opciones?.idioma === "en" ||
    inspeccion?.idioma === "en" ||
    inspeccion?.cliente?.idioma === "en"
  )
    ? "en"
    : "es";
}

/**
 * Los textos libres escritos por el técnico no se traducen.
 * El técnico debe introducirlos directamente en el idioma del cliente.
 */
function conservarTextoTecnico(valor) {
  return texto(valor, "");
}

function fechaLegible(valor, idioma = "es") {
  if (!valor) {
    return idioma === "en" ? "No date" : "Sin fecha";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return texto(valor);
  }

  return fecha.toLocaleString(
    idioma === "en" ? "en-GB" : "es-ES"
  );
}

function obtenerUrlFoto(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  return (
    item.url ||
    item.signedUrl ||
    item.url_foto ||
    item.archivo ||
    null
  );
}

function obtenerDireccion(inspeccion) {
  const vivienda = inspeccion.vivienda || {};
  const partes = [
    inspeccion.direccion || vivienda.direccion,
    inspeccion.localidad || vivienda.localidad,
    inspeccion.ciudad || vivienda.ciudad,
    inspeccion.provincia || vivienda.provincia,
    inspeccion.codigo_postal || vivienda.codigo_postal,
  ]
    .map((parte) => texto(parte, ""))
    .filter(Boolean);

  return [...new Set(partes)].join(", ");
}

/**
 * Genera el PDF de una inspección normal o de un servicio extra.
 *
 * Para una inspección normal recibe los campos de inspecciones.
 * Para un extra recibe los campos de extras y esExtra: true.
 *
 * Las fotografías deben llegar con URL accesible temporalmente.
 */
export async function generarPDFCliente(
  inspeccion,
  opciones = {}
) {
  if (!inspeccion || typeof inspeccion !== "object") {
    throw new Error(
      "No se han proporcionado los datos del informe."
    );
  }

  const idioma = obtenerIdioma(inspeccion, opciones);
  const esIngles = idioma === "en";

  const etiquetas = esIngles
    ? {
        tituloInspeccion: "Inspection Report",
        tituloExtra: "Extra Service Report",
        identificador: "Reference",
        contrato: "Contract",
        sinContrato: "No contract",
        fecha: "Date",
        direccion: "Address",
        localidad: "Town / City",
        provincia: "Province",
        codigoPostal: "Postcode",
        cliente: "Client",
        telefono: "Phone",
        inspector: "Inspector / Technician",
        tipoInspeccion: "Inspection type",
        factura: "Invoice",
        noEspecificada: "Not specified",
        precio: "Price",
        campo: "Field",
        informacion: "Information",
        descripcionServicio: "Service description",
        observaciones: "Technician's observations",
        sinDescripcion: "No description recorded",
        sinObservaciones: "No observations recorded",
        materiales: "Materials used",
        tiempo: "Time spent",
        fotografias: "Photographs",
        fotografia: "Photograph",
        generado: "Generated",
        pagina: "Page",
        de: "of",
        noEspecificado: "Not specified",
        sinDireccion: "Address not specified",
      }
    : {
        tituloInspeccion: "Informe de inspección",
        tituloExtra: "Informe de servicio extra",
        identificador: "Identificador",
        contrato: "Contrato",
        sinContrato: "Sin contrato",
        fecha: "Fecha",
        direccion: "Dirección",
        localidad: "Localidad / Ciudad",
        provincia: "Provincia",
        codigoPostal: "Código postal",
        cliente: "Cliente",
        telefono: "Teléfono",
        inspector: "Inspector / técnico",
        tipoInspeccion: "Tipo de inspección",
        factura: "Factura",
        noEspecificada: "No especificada",
        precio: "Precio",
        campo: "Campo",
        informacion: "Información",
        descripcionServicio: "Descripción del servicio",
        observaciones: "Observaciones del técnico",
        sinDescripcion: "Sin descripción registrada",
        sinObservaciones: "Sin observaciones registradas",
        materiales: "Materiales utilizados",
        tiempo: "Tiempo empleado",
        fotografias: "Fotografías",
        fotografia: "Fotografía",
        generado: "Generado",
        pagina: "Página",
        de: "de",
        noEspecificado: "No especificado",
        sinDireccion: "Dirección no especificada",
      };

  const esExtra =
    opciones.esExtra === true ||
    inspeccion.tipoDocumento === "extra";

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margen = 40;
  const anchoContenido = pageWidth - margen * 2;

  const azul = [0, 91, 160];
  const gris = [75, 85, 99];

  let y = 45;

  // CABECERA
  if (inspeccion.logoBase64) {
    try {
      doc.addImage(
        inspeccion.logoBase64,
        "PNG",
        margen,
        y - 10,
        105,
        52
      );
    } catch (error) {
      console.warn("No se pudo añadir el logotipo:", error);
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...azul);

  const titulo = esExtra
    ? etiquetas.tituloExtra
    : etiquetas.tituloInspeccion;

  doc.text(
    titulo,
    inspeccion.logoBase64 ? 175 : margen,
    y + 20
  );

  y = 105;

  doc.setDrawColor(...azul);
  doc.setLineWidth(1.5);
  doc.line(margen, y, pageWidth - margen, y);

  y += 22;

  // DATOS GENERALES
  const fecha = esExtra
    ? inspeccion.creado_en || inspeccion.created_at
    : inspeccion.fecha ||
      inspeccion.fecha_finalizacion ||
      inspeccion.created_at ||
      inspeccion.fecha_creacion;

  const direccionCompleta = obtenerDireccion(inspeccion);

  const direccion = direccionCompleta || etiquetas.sinDireccion;

  const localidad = texto(
    inspeccion.localidad ||
      inspeccion.vivienda?.localidad ||
      inspeccion.ciudad ||
      inspeccion.vivienda?.ciudad,
    etiquetas.noEspecificado
  );

  const provincia = texto(
    inspeccion.provincia ||
      inspeccion.vivienda?.provincia,
    ""
  );

  const codigoPostal = texto(
    inspeccion.codigo_postal ||
      inspeccion.vivienda?.codigo_postal,
    ""
  );

  const observacionesOriginales = esExtra
    ? inspeccion.descripcion ||
      inspeccion.observaciones ||
      inspeccion.notas_tecnico
    : inspeccion.notas_tecnico ||
      inspeccion.observaciones ||
      inspeccion.notas;

  const observaciones = conservarTextoTecnico(
    observacionesOriginales ||
      (esExtra
        ? etiquetas.sinDescripcion
        : etiquetas.sinObservaciones)
  );

  const tecnico = texto(
    inspeccion.inspector ||
      inspeccion.tecnico_nombre ||
      inspeccion.nombre_tecnico ||
      inspeccion.tecnico?.nombre ||
      inspeccion.tecnico?.nombre_completo,
    etiquetas.noEspecificado
  );

  const clienteNombre = texto(
    inspeccion.cliente_nombre ||
      inspeccion.nombre_cliente ||
      inspeccion.cliente?.nombre ||
      inspeccion.cliente?.nombre_completo,
    ""
  );

  const clienteTelefono = texto(
    inspeccion.cliente_telefono ||
      inspeccion.telefono_cliente ||
      inspeccion.cliente?.telefono,
    ""
  );

  const filas = [
    [etiquetas.identificador, texto(inspeccion.id)],
    [
      etiquetas.contrato,
      texto(inspeccion.contrato_id, etiquetas.sinContrato),
    ],
    [
      etiquetas.fecha,
      fechaLegible(fecha, idioma),
    ],
    [etiquetas.direccion, direccion],
  ];

  if (localidad && localidad !== etiquetas.noEspecificado) {
    filas.push([etiquetas.localidad, localidad]);
  }

  if (provincia) {
    filas.push([etiquetas.provincia, provincia]);
  }

  if (codigoPostal) {
    filas.push([etiquetas.codigoPostal, codigoPostal]);
  }

  if (clienteNombre) {
    filas.push([etiquetas.cliente, clienteNombre]);
  }

  if (clienteTelefono) {
    filas.push([etiquetas.telefono, clienteTelefono]);
  }

  if (esExtra) {
    filas.push([
      etiquetas.factura,
      texto(inspeccion.factura_id, etiquetas.noEspecificada),
    ]);

    filas.push([
      etiquetas.precio,
      inspeccion.precio !== null &&
      inspeccion.precio !== undefined
        ? `${Number(inspeccion.precio).toFixed(2)} €`
        : etiquetas.noEspecificado,
    ]);
  } else {
    filas.push([etiquetas.inspector, tecnico]);

    filas.push([
      etiquetas.tipoInspeccion,
      texto(
        inspeccion.tipo_inspeccion ||
          inspeccion.tipo ||
          inspeccion.origen ||
          etiquetas.noEspecificado
      ),
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [[etiquetas.campo, etiquetas.informacion]],
    body: filas,
    theme: "grid",
    headStyles: {
      fillColor: azul,
      textColor: [255, 255, 255],
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      overflow: "linebreak",
      valign: "middle",
    },
    columnStyles: {
      0: {
        cellWidth: 125,
        fontStyle: "bold",
      },
      1: {
        cellWidth: anchoContenido - 125,
      },
    },
    margin: {
      left: margen,
      right: margen,
    },
  });

  y = doc.lastAutoTable.finalY + 25;

  // TÍTULOS DE SECCIÓN
  const añadirTitulo = (tituloSeccion) => {
    if (y + 45 > pageHeight - 55) {
      doc.addPage();
      y = 50;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...azul);
    doc.text(tituloSeccion, margen, y);

    y += 12;

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.6);
    doc.line(
      margen,
      y,
      pageWidth - margen,
      y
    );

    y += 16;
  };

  // OBSERVACIONES / DESCRIPCIÓN
  añadirTitulo(
    esExtra
      ? etiquetas.descripcionServicio
      : etiquetas.observaciones
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(35, 35, 35);

  const lineasObservaciones = doc.splitTextToSize(
    observaciones,
    anchoContenido
  );

  for (const linea of lineasObservaciones) {
    if (y + 16 > pageHeight - 55) {
      doc.addPage();
      y = 50;
    }

    doc.text(linea, margen, y);
    y += 14;
  }

  y += 12;

  // MATERIALES
  const materialesOriginales = esExtra
    ? inspeccion.materiales
    : inspeccion.materiales_usados || inspeccion.materiales;

  const materiales = conservarTextoTecnico(
    materialesOriginales
  );

  if (materiales) {
    añadirTitulo(etiquetas.materiales);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(35, 35, 35);

    const lineas = doc.splitTextToSize(
      materiales,
      anchoContenido
    );

    for (const linea of lineas) {
      if (y + 16 > pageHeight - 55) {
        doc.addPage();
        y = 50;
      }

      doc.text(linea, margen, y);
      y += 14;
    }

    y += 12;
  }

  // TIEMPO EMPLEADO
  if (inspeccion.tiempo_empleado) {
    añadirTitulo(etiquetas.tiempo);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(35, 35, 35);

    const tiempo = conservarTextoTecnico(
      inspeccion.tiempo_empleado
    );

    const lineas = doc.splitTextToSize(
      tiempo,
      anchoContenido
    );

    for (const linea of lineas) {
      if (y + 16 > pageHeight - 55) {
        doc.addPage();
        y = 50;
      }

      doc.text(linea, margen, y);
      y += 14;
    }

    y += 12;
  }

  // FOTOGRAFÍAS
  const fotos = Array.isArray(inspeccion.fotos)
    ? inspeccion.fotos
    : [];

  if (fotos.length > 0) {
    añadirTitulo(etiquetas.fotografias);

    const anchoFoto = 220;
    const altoFoto = 155;
    const espacioHorizontal = 25;
    const espacioVertical = 28;

    let columna = 0;

    for (let index = 0; index < fotos.length; index++) {
      const foto = fotos[index];
      const imageUrl = obtenerUrlFoto(foto);

      if (!imageUrl) {
        continue;
      }

      const base64 = await urlToBase64(imageUrl);

      if (!base64) {
        console.warn(
          `No se pudo incorporar la fotografía ${index + 1}.`
        );
        continue;
      }

      if (y + altoFoto + 35 > pageHeight - 55) {
        doc.addPage();
        y = 50;
        columna = 0;
      }

      const x =
        margen +
        columna * (anchoFoto + espacioHorizontal);

      try {
        const formato = base64.startsWith("data:image/png")
          ? "PNG"
          : base64.startsWith("data:image/webp")
            ? "WEBP"
            : "JPEG";

        doc.addImage(
          base64,
          formato,
          x,
          y,
          anchoFoto,
          altoFoto,
          undefined,
          "FAST"
        );

        doc.setDrawColor(190, 190, 190);
        doc.rect(x, y, anchoFoto, altoFoto);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...gris);

        doc.text(
          `${etiquetas.fotografia} ${index + 1}`,
          x,
          y + altoFoto + 13
        );
      } catch (error) {
        console.warn(
          `No se pudo insertar la fotografía ${index + 1}:`,
          error
        );
      }

      columna++;

      if (columna >= 2) {
        columna = 0;
        y += altoFoto + espacioVertical;
      }
    }

    if (columna === 1) {
      y += altoFoto + espacioVertical;
    }
  }

  // PIE Y NUMERACIÓN
  const numeroPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= numeroPaginas; pagina++) {
    doc.setPage(pagina);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    doc.text(
      "CoastGuard Homes Services",
      margen,
      pageHeight - 28
    );

    doc.text(
      `${etiquetas.generado}: ${new Date().toLocaleString(
        esIngles ? "en-GB" : "es-ES"
      )}`,
      margen,
      pageHeight - 15
    );

    doc.text(
      `${etiquetas.pagina} ${pagina} ${etiquetas.de} ${numeroPaginas}`,
      pageWidth - margen,
      pageHeight - 20,
      { align: "right" }
    );
  }

  const pdfArray = doc.output("arraybuffer");

  const blob = new Blob([pdfArray], {
    type: "application/pdf",
  });

  if (!blob.size) {
    throw new Error("El PDF generado está vacío.");
  }

  return blob;
}
