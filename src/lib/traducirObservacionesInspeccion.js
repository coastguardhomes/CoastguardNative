/*
 * ============================================================
 * COASTGUARD HOMES SERVICES
 * GESTIÓN DE TEXTO DE OBSERVACIONES DE INSPECCIÓN
 * ============================================================
 *
 * VERSIÓN REDUCIDA Y ADAPTADA
 *
 * OBJETIVO:
 *
 * - No traducir automáticamente las observaciones del técnico.
 * - No modificar el contenido escrito por el técnico.
 * - No traducir automáticamente materiales.
 * - No traducir automáticamente el tiempo empleado.
 * - No traducir automáticamente descripciones de servicios extra.
 * - Conservar saltos de línea, números, fechas y códigos.
 * - Mantener compatibilidad con la API anterior.
 * - Mantener disponibles las funciones exportadas.
 * - Permitir la traducción independiente de etiquetas fijas.
 *
 * Los técnicos introducirán directamente sus textos en inglés
 * cuando el cliente tenga configurado ese idioma.
 *
 * La interfaz y las etiquetas fijas de los PDF mantienen
 * su sistema de traducción independiente.
 *
 * Este archivo no utiliza servicios externos ni IA.
 * ============================================================
 */

// ============================================================
// 1. CONFIGURACIÓN GENERAL
// ============================================================

const IDIOMAS_TRADUCCION_CG = {
  ingles: ["en", "english", "inglés", "ingles"],
  espanol: ["es", "español", "espanol", "spanish"]
};

// ============================================================
// 2. FUNCIONES GENERALES
// ============================================================

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFC")
    .toLocaleLowerCase("es")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function escaparRegex(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tieneContenido(texto) {
  return typeof texto === "string" && texto.trim().length > 0;
}

function conservarTextoOriginal(texto) {
  if (typeof texto !== "string") {
    return texto ?? "";
  }

  return texto;
}

// ============================================================
// 3. ETIQUETAS FIJAS DE INFORMES
// ============================================================

/*
 * Esta función permite traducir exclusivamente etiquetas
 * estructurales cuando se utiliza directamente.
 *
 * No traduce el contenido que aparece después de los dos puntos.
 *
 * Ejemplo:
 *
 * Dirección: Calle Mayor 10
 *
 * Resultado:
 *
 * Address: Calle Mayor 10
 */

const ETIQUETAS_CG = [
  [/^(\s*)identificador(\s*:)/gim, "$1Identifier$2"],
  [/^(\s*)código postal(\s*:)/gim, "$1Postcode$2"],
  [/^(\s*)código(\s*:)/gim, "$1Code$2"],
  [/^(\s*)dirección de la vivienda(\s*:)/gim, "$1Property address$2"],
  [/^(\s*)dirección del inmueble(\s*:)/gim, "$1Property address$2"],
  [/^(\s*)dirección(\s*:)/gim, "$1Address$2"],
  [/^(\s*)fecha(\s*:)/gim, "$1Date$2"],
  [/^(\s*)hora(\s*:)/gim, "$1Time$2"],
  [/^(\s*)cliente(\s*:)/gim, "$1Client$2"],
  [/^(\s*)propietario(\s*:)/gim, "$1Owner$2"],
  [/^(\s*)inspector(\s*:)/gim, "$1Inspector$2"],
  [/^(\s*)inspección(\s*:)/gim, "$1Inspection$2"],
  [/^(\s*)tipo de inspección(\s*:)/gim, "$1Inspection type$2"],
  [/^(\s*)observación(\s*:)/gim, "$1Observation$2"],
  [/^(\s*)observaciones(\s*:)/gim, "$1Observations$2"],
  [/^(\s*)incidencia(\s*:)/gim, "$1Issue$2"],
  [/^(\s*)incidencias(\s*:)/gim, "$1Issues$2"],
  [/^(\s*)estado(\s*:)/gim, "$1Condition$2"],
  [/^(\s*)resultado(\s*:)/gim, "$1Result$2"],
  [/^(\s*)descripción de la vivienda(\s*:)/gim, "$1Property description$2"],
  [/^(\s*)descripción(\s*:)/gim, "$1Description$2"],
  [/^(\s*)habitación(\s*:)/gim, "$1Room$2"],
  [/^(\s*)estancia(\s*:)/gim, "$1Area$2"],
  [/^(\s*)zona(\s*:)/gim, "$1Area$2"],
  [/^(\s*)ubicación(\s*:)/gim, "$1Location$2"],
  [/^(\s*)comentarios(\s*:)/gim, "$1Comments$2"],
  [/^(\s*)notas(\s*:)/gim, "$1Notes$2"],
  [/^(\s*)recomendaciones(\s*:)/gim, "$1Recommendations$2"],
  [/^(\s*)recomendación(\s*:)/gim, "$1Recommendation$2"],
  [/^(\s*)reparación(\s*:)/gim, "$1Repair$2"],
  [/^(\s*)mantenimiento(\s*:)/gim, "$1Maintenance$2"],
  [/^(\s*)prioridad(\s*:)/gim, "$1Priority$2"],
  [/^(\s*)pendiente(\s*:)/gim, "$1Pending$2"],
  [/^(\s*)completado(\s*:)/gim, "$1Completed$2"],
  [/^(\s*)información(\s*:)/gim, "$1Information$2"]
];

function traducirEtiquetas(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, traduccion] of ETIQUETAS_CG) {
    resultado = resultado.replace(patron, traduccion);
  }

  return resultado;
}

// ============================================================
// 4. CONSERVACIÓN DE CANTIDADES Y UNIDADES
// ============================================================

/*
 * El técnico introduce los materiales, cantidades y tiempos
 * directamente en el idioma que corresponda.
 *
 * Por tanto, esta función ya no convierte palabras ni unidades.
 * Se conserva su nombre para mantener la compatibilidad.
 */

function traducirCantidadesTiempo(texto) {
  return conservarTextoOriginal(texto);
}

// ============================================================
// 5. CONSERVACIÓN DE OBSERVACIONES
// ============================================================

/*
 * IMPORTANTE:
 *
 * Esta función sustituye el comportamiento anterior.
 *
 * Antes:
 * - Detectaba el idioma del cliente.
 * - Corregía el texto.
 * - Aplicaba diccionarios.
 * - Traducía frases completas.
 * - Reconstruía expresiones.
 * - Modificaba el contenido escrito por el técnico.
 *
 * Ahora:
 * - Conserva exactamente el texto recibido.
 * - No traduce palabras.
 * - No corrige automáticamente la ortografía.
 * - No cambia frases.
 * - No altera mayúsculas.
 * - No elimina saltos de línea.
 * - Mantiene el parámetro idiomaCliente por compatibilidad.
 */

function traducirObservacionInspeccion(
  texto,
  idiomaCliente = "es"
) {
  return conservarTextoOriginal(texto);
}

// ============================================================
// 6. COMPATIBILIDAD CON FUNCIONES ANTERIORES
// ============================================================

/*
 * Estas funciones se mantienen porque formaban parte de la API
 * pública del archivo original.
 *
 * No aplican traducciones automáticas al contenido.
 */

function traducirFragmento(texto) {
  return conservarTextoOriginal(texto);
}

function traducirTextoCompletoCG(texto) {
  return conservarTextoOriginal(texto);
}

function corregirOrtografiaCG(texto) {
  return conservarTextoOriginal(texto);
}

function corregirTextoOriginalCG(texto) {
  return conservarTextoOriginal(texto);
}

function aplicarReglasFrases(texto) {
  return conservarTextoOriginal(texto);
}

// ============================================================
// 7. EXPORTACIONES
// ============================================================

export {
  traducirObservacionInspeccion,
  traducirTextoCompletoCG,
  traducirFragmento,
  traducirEtiquetas,
  traducirCantidadesTiempo,
  corregirOrtografiaCG,
  corregirTextoOriginalCG,
  aplicarReglasFrases
};

export default traducirObservacionInspeccion;

// ============================================================
// FIN DEL ARCHIVO
// COASTGUARD HOMES SERVICES
// ============================================================
