/*
 * ============================================================
 * COASTGUARD HOMES SERVICES
 * TRADUCTOR LOCAL DE OBSERVACIONES DE INSPECCIÓN
 * ============================================================
 *
 * COMBINACIÓN COMPLETA DE AMBAS PARTES (VERSIÓN REVISADA Y MEJORADA)
 *
 * Objetivos:
 * - Traducir observaciones españolas al inglés natural.
 * - Reconocer frases completas y expresiones mixtas.
 * - Reconstruir el orden gramatical de las frases.
 * - Interpretar habitaciones, objetos, estados y problemas.
 * - Reconocer adjetivos, concordancia y formas verbales.
 * - Evitar traducciones literales incorrectas.
 * - Conservar cifras, fechas, códigos y datos identificativos.
 * - No inventar averías, causas ni reparaciones.
 * - Mantener compatibilidad con la API existente.
 *
 * La traducción se realiza localmente mediante reglas.
 * No utiliza servicios externos ni inteligencia artificial.
 * ============================================================
 */

// ============================================================
// 1. CONFIGURACIÓN GENERAL
// ============================================================

const IDIOMAS_TRADUCCION_CG = {
  ingles: ["en", "english", "inglés", "ingles"],
  espanol: ["es", "español", "espanol", "spanish"]
};

const OPCIONES_TRADUCCION_CG = {
  conservarSaltosLinea: true,
  conservarNumeros: true,
  conservarDecimales: true,
  conservarFechas: true,
  conservarCodigos: true,
  conservarDirecciones: true,
  conservarNombresPropios: true,
  reconocerFrasesCompletas: true,
  reconocerExpresionesMixtas: true,
  aplicarContexto: true,
  reconstruirGramatica: true,
  reconocerAdjetivos: true,
  reconocerConcordancia: true,
  detectarMezclasResidual: true,
  corregirErroresFrecuentes: true
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

function conservarMayusculas(original, traduccion) {
  if (!original || !traduccion) return traduccion;

  if (original === original.toUpperCase()) {
    return traduccion.toUpperCase();
  }

  if (
    original[0] === original[0].toUpperCase() &&
    original.slice(1) === original.slice(1).toLowerCase()
  ) {
    return traduccion.charAt(0).toUpperCase() + traduccion.slice(1);
  }

  return traduccion;
}

function reemplazarConMayusculas(texto, expresion, traduccion) {
  return String(texto ?? "").replace(expresion, coincidencia =>
    conservarMayusculas(coincidencia, traduccion)
  );
}

function tieneContenido(texto) {
  return typeof texto === "string" && texto.trim().length > 0;
}

function capitalizarInicioCG(texto) {
  const resultado = String(texto ?? "").trim();

  if (!resultado) return resultado;

  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}

/*
 * Crea expresiones regulares con límites Unicode.
 *
 * Se utiliza en lugar de \b cuando se necesita reconocer
 * correctamente palabras españolas con tildes o con ñ.
 *
 * JavaScript considera que \b depende principalmente de
 * caracteres ASCII. Por eso puede fallar en determinados
 * límites de palabras españolas.
 */
function crearPatronPalabraCG(palabra, flags = "giu") {
  return new RegExp(
    `(?<![\\p{L}\\p{N}_])${escaparRegex(palabra)}(?![\\p{L}\\p{N}_])`,
    flags
  );
}

/*
 * Reemplazo de palabras completas conservando el uso de
 * mayúsculas y minúsculas del texto original.
 */
function reemplazarPalabraCG(texto, palabra, traduccion) {
  const patron = crearPatronPalabraCG(palabra);

  return String(texto ?? "").replace(patron, coincidencia =>
    conservarMayusculas(coincidencia, traduccion)
  );
}

/*
 * Sustituye espacios repetidos sin eliminar saltos de línea.
 */
function limpiarEspaciosCG(texto) {
  return String(texto ?? "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .trim();
}

/*
 * Aplica límites de palabra compatibles con letras Unicode.
 *
 * JavaScript \b considera principalmente caracteres ASCII y puede
 * fallar con palabras que contienen tildes o la letra ñ.
 */
function reemplazarPatronUnicodeCG(texto, patron, reemplazo) {
  if (!(patron instanceof RegExp)) return texto;

  let indiceLimite = 0;

  const fuente = patron.source.replace(/\\b/g, () => {
    const esInicio = indiceLimite % 2 === 0;
    indiceLimite++;

    return esInicio
      ? "(?<![\\p{L}\\p{N}_])"
      : "(?![\\p{L}\\p{N}_])";
  });

  const flags = patron.flags.includes("u")
    ? patron.flags
    : patron.flags + "u";

  const patronUnicode = new RegExp(fuente, flags);

  return texto.replace(patronUnicode, reemplazo);
}

// ============================================================
// 3. PROTECCIÓN DE DATOS
// ============================================================

function protegerDatosCG(texto) {
  const protegidos = [];
  let resultado = String(texto ?? "");

  const patrones = [
    // Correos electrónicos.
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,

    // Direcciones web.
    /\bhttps?:\/\/[^\s<>"']+/gi,

    // UUID.
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,

    // Teléfonos.
    /\+?\d[\d\s().-]{6,}\d/g,

    // Fechas.
    /\b(?:\d{1,4}[/-]){1,2}\d{1,4}\b/g,

    // Horas.
    /\b\d{1,2}:\d{2}(?::\d{2})?\b/g,

    // Códigos alfanuméricos con separadores.
    /\b(?=[A-Z0-9_-]*\d)[A-Z0-9]+(?:[-_][A-Z0-9]+)+\b/gi,

    // Números y decimales.
    /\b\d+(?:[.,]\d+)?\b/g
  ];

  for (const patron of patrones) {
    resultado = resultado.replace(patron, coincidencia => {
      const marcador = `ZXQDATACG${protegidos.length}QXZ`;

      protegidos.push({
        marcador,
        valor: coincidencia
      });

      return marcador;
    });
  }

  return {
    texto: resultado,
    protegidos
  };
}

function restaurarDatosCG(texto, protegidos = []) {
  let resultado = String(texto ?? "");

  for (const dato of protegidos) {
    resultado = resultado.replaceAll(dato.marcador, dato.valor);
  }

  return resultado;
}

// ============================================================
// 4. CORRECCIONES ORTOGRÁFICAS
// ============================================================

const CORRECCIONES_ORTOGRAFICAS_CG = [
  [/\bba[oó]\b/gi, "baño"],
  [/\bbano\b/gi, "baño"],
  [/\bbanos\b/gi, "baños"],
  [/\bbanño\b/gi, "baño"],
  [/\bb añera\b/gi, "bañera"],
  [/\bfontaneria\b/gi, "fontanería"],
  [/\bdesague\b/gi, "desagüe"],
  [/\bdesagues\b/gi, "desagües"],
  [/\bfiltracion\b/gi, "filtración"],
  [/\bfiltraciones\b/gi, "filtraciones"],
  [/\bcanalon\b/gi, "canalón"],
  [/\bcanalones\b/gi, "canalones"],
  [/\binstalacion\b/gi, "instalación"],
  [/\binstalaciones\b/gi, "instalaciones"],
  [/\bcalefaccion\b/gi, "calefacción"],
  [/\bventilacion\b/gi, "ventilación"],
  [/\bhabitacion\b/gi, "habitación"],
  [/\bhabitaciones\b/gi, "habitaciones"],
  [/\bgriferia\b/gi, "grifería"],
  [/\bconexion\b/gi, "conexión"],
  [/\bconexiones\b/gi, "conexiones"],
  [/\bpresion\b/gi, "presión"],
  [/\brevision\b/gi, "revisión"],
  [/\breparacion\b/gi, "reparación"],
  [/\breparaciones\b/gi, "reparaciones"],
  [/\binstalacion electrica\b/gi, "instalación eléctrica"],
  [/\binstalacion de agua\b/gi, "instalación de agua"],
  [/\bhumedades\b/gi, "humedades"],
  [/\bhumedad\b/gi, "humedad"],
  [/\bconbun\b/gi, "con un"],
  [/\bconbuna\b/gi, "con una"],
  [/\bdesperfectos\b/gi, "desperfectos"],
  [/\bhumedadd\b/gi, "humedad"],
  [/\bfiltracción\b/gi, "filtración"],
  [/\bgrifos\b/gi, "grifos"],
  [/\bhabitaciónes\b/gi, "habitaciones"],
  [/\bpuertass\b/gi, "puertas"],
  [/\bventanass\b/gi, "ventanas"]
];

function corregirOrtografiaCG(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, correccion] of CORRECCIONES_ORTOGRAFICAS_CG) {
    resultado = resultado.replace(patron, coincidencia =>
      conservarMayusculas(coincidencia, correccion)
    );
  }

  return resultado;
}

// ============================================================
// 5. DICCIONARIO DE HABITACIONES Y UBICACIONES
// ============================================================

const HABITACIONES_CG = {
  "salón": "living room",
  "salon": "living room",
  "comedor": "dining room",
  "cocina": "kitchen",
  "baño": "bathroom",
  "bano": "bathroom",
  "aseo": "toilet",
  "dormitorio": "bedroom",
  "dormitorios": "bedrooms",
  "habitación": "room",
  "habitacion": "room",
  "habitaciones": "rooms",
  "pasillo": "hallway",
  "pasillos": "hallways",
  "entrada": "entrance",
  "entradas": "entrances",
  "terraza": "terrace",
  "terrazas": "terraces",
  "balcón": "balcony",
  "balcon": "balcony",
  "balcones": "balconies",
  "patio": "patio",
  "patios": "patios",
  "garaje": "garage",
  "garajes": "garages",
  "sótano": "basement",
  "sotano": "basement",
  "sótanos": "basements",
  "sotanos": "basements",
  "buhardilla": "attic",
  "buhardillas": "attics",
  "trastero": "storage room",
  "trasteros": "storage rooms",
  "jardín": "garden",
  "jardin": "garden",
  "jardines": "gardens",
  "piscina": "pool",
  "piscinas": "pools",
  "lavadero": "utility room",
  "lavaderos": "utility rooms",
  "despacho": "study",
  "despachos": "studies",
  "oficina": "office",
  "oficinas": "offices",
  "exterior": "outdoor area",
  "exteriores": "outdoor areas",
  "interior": "interior",
  "interiores": "interiors",
  "zona común": "communal area",
  "zonas comunes": "communal areas",
  "zona exterior": "outdoor area",
  "zonas exteriores": "outdoor areas"
};

// ============================================================
// 6. DICCIONARIO DE OBJETOS Y ELEMENTOS
// ============================================================

const OBJETOS_CG = {
  "mesa": "table",
  "mesas": "tables",
  "silla": "chair",
  "sillas": "chairs",
  "sofá": "sofa",
  "sofa": "sofa",
  "sofás": "sofas",
  "sofas": "sofas",
  "cama": "bed",
  "camas": "beds",
  "armario": "wardrobe",
  "armarios": "wardrobes",
  "mueble": "piece of furniture",
  "muebles": "furniture",
  "estantería": "shelf",
  "estanterias": "shelves",
  "estanterías": "shelves",
  "cajón": "drawer",
  "cajones": "drawers",
  "espejo": "mirror",
  "espejos": "mirrors",
  "cortina": "curtain",
  "cortinas": "curtains",
  "alfombra": "rug",
  "alfombras": "rugs",

  "puerta": "door",
  "puertas": "doors",
  "puerta principal": "main door",
  "ventana": "window",
  "ventanas": "windows",
  "cristal": "glass",
  "cristales": "glass panes",
  "vidrio": "glass",
  "marco": "frame",
  "marcos": "frames",
  "persiana": "shutter",
  "persianas": "shutters",
  "cerradura": "lock",
  "cerraduras": "locks",
  "llave": "key",
  "llaves": "keys",
  "bisagra": "hinge",
  "bisagras": "hinges",
  "pomo": "door knob",
  "manilla": "handle",
  "manillas": "handles",
  "pestillo": "latch",
  "pestillos": "latches",
  "cristal de la ventana": "window glass",
  "cristal de la puerta": "door glass",

  "grifo": "tap",
  "grifos": "taps",
  "ducha": "shower",
  "duchas": "showers",
  "bañera": "bathtub",
  "bañeras": "bathtubs",
  "lavabo": "washbasin",
  "lavabos": "washbasins",
  "fregadero": "sink",
  "fregaderos": "sinks",
  "inodoro": "toilet",
  "inodoros": "toilets",
  "cisterna": "cistern",
  "cisternas": "cisterns",
  "tubería": "pipe",
  "tuberias": "pipes",
  "tuberías": "pipes",
  "tubo": "pipe",
  "tubos": "pipes",
  "desagüe": "drain",
  "desagües": "drains",
  "desague": "drain",
  "sifón": "trap",
  "sifones": "traps",
  "válvula": "valve",
  "válvulas": "valves",
  "llave de paso": "shut-off valve",
  "calentador": "water heater",
  "calentadores": "water heaters",
  "caldera": "boiler",
  "calderas": "boilers",
  "radiador": "radiator",
  "radiadores": "radiators",
  "termo": "water heater",
  "termos": "water heaters",
  "depósito de agua": "water tank",
  "depósitos de agua": "water tanks",

  "enchufe": "socket",
  "enchufes": "sockets",
  "interruptor": "switch",
  "interruptores": "switches",
  "lámpara": "lamp",
  "lampara": "lamp",
  "lámparas": "lamps",
  "bombilla": "light bulb",
  "bombillas": "light bulbs",
  "iluminación": "lighting",
  "cable": "cable",
  "cables": "cables",
  "cuadro eléctrico": "electrical panel",
  "cuadro": "panel",
  "fusible": "fuse",
  "fusibles": "fuses",
  "luz": "light",
  "luces": "lights",
  "toma de corriente": "power socket",
  "tomas de corriente": "power sockets",
  "punto de luz": "light point",
  "puntos de luz": "light points",

  "pared": "wall",
  "paredes": "walls",
  "techo": "ceiling",
  "techos": "ceilings",
  "suelo": "floor",
  "suelos": "floors",
  "fachada": "facade",
  "fachadas": "facades",
  "tejado": "roof",
  "tejados": "roofs",
  "cubierta": "roof",
  "cubiertas": "roofs",
  "escalera": "stairs",
  "escaleras": "stairs",
  "escalón": "step",
  "escalon": "step",
  "escalones": "steps",
  "barandilla": "railing",
  "barandillas": "railings",
  "zócalo": "skirting board",
  "zócalos": "skirting boards",
  "rodapié": "skirting board",
  "rodapiés": "skirting boards",
  "azulejo": "tile",
  "azulejos": "tiles",
  "baldosa": "tile",
  "baldosas": "tiles",
  "junta": "joint",
  "juntas": "joints",
  "pintura": "paint",
  "cemento": "cement",
  "yeso": "plaster",
  "aislamiento": "insulation",
  "aislamientos": "insulation",
  "techo falso": "false ceiling",
  "falso techo": "false ceiling",
  "falsos techos": "false ceilings",

  "césped": "lawn",
  "cesped": "lawn",
  "hierba": "grass",
  "planta": "plant",
  "plantas": "plants",
  "árbol": "tree",
  "arbol": "tree",
  "árboles": "trees",
  "arbusto": "shrub",
  "arbustos": "shrubs",
  "filtro": "filter",
  "filtros": "filters",
  "bomba": "pump",
  "bombas": "pumps",
  "depuradora": "filtration system",
  "depuradoras": "filtration systems",
  "valla": "fence",
  "vallas": "fences",
  "vallado": "fencing",
  "riego": "irrigation",
  "aspersor": "sprinkler",
  "aspersores": "sprinklers",
  "borde de piscina": "pool edge",
  "bordes de piscina": "pool edges"
};

// ============================================================
// 7. DICCIONARIO DE ESTADOS Y DESCRIPCIONES
// ============================================================

const ESTADOS_CG = {
  "roto": "broken",
  "rota": "broken",
  "rotos": "broken",
  "rotas": "broken",
  "dañado": "damaged",
  "dañada": "damaged",
  "dañados": "damaged",
  "dañadas": "damaged",
  "deteriorado": "deteriorated",
  "deteriorada": "deteriorated",
  "deteriorados": "deteriorated",
  "deterioradas": "deteriorated",
  "agrietado": "cracked",
  "agrietada": "cracked",
  "agrietados": "cracked",
  "agrietadas": "cracked",
  "rajado": "cracked",
  "rajada": "cracked",
  "rajados": "cracked",
  "rajadas": "cracked",
  "oxidado": "rusty",
  "oxidada": "rusty",
  "oxidados": "rusty",
  "oxidadas": "rusty",
  "desgastado": "worn",
  "desgastada": "worn",
  "desgastados": "worn",
  "desgastadas": "worn",
  "estropeado": "damaged",
  "estropeada": "damaged",
  "estropeados": "damaged",
  "estropeadas": "damaged",
  "defectuoso": "faulty",
  "defectuosa": "faulty",
  "defectuosos": "faulty",
  "defectuosas": "faulty",

  "húmedo": "damp",
  "húmeda": "damp",
  "húmedos": "damp",
  "húmedas": "damp",
  "mojado": "wet",
  "mojada": "wet",
  "mojados": "wet",
  "mojadas": "wet",
  "empapado": "soaked",
  "empapada": "soaked",
  "seco": "dry",
  "seca": "dry",
  "secos": "dry",
  "secas": "dry",
  "limpio": "clean",
  "limpia": "clean",
  "limpios": "clean",
  "limpias": "clean",
  "sucio": "dirty",
  "sucia": "dirty",
  "sucios": "dirty",
  "sucias": "dirty",
  "manchado": "stained",
  "manchada": "stained",
  "manchados": "stained",
  "manchadas": "stained",

  "abierto": "open",
  "abierta": "open",
  "abiertos": "open",
  "abiertas": "open",
  "cerrado": "closed",
  "cerrada": "closed",
  "cerrados": "closed",
  "cerradas": "closed",
  "atascado": "stuck",
  "atascada": "stuck",
  "atascados": "stuck",
  "atascadas": "stuck",
  "obstruido": "blocked",
  "obstruida": "blocked",
  "obstruidos": "blocked",
  "obstruidas": "blocked",
  "suelto": "loose",
  "suelta": "loose",
  "sueltos": "loose",
  "sueltas": "loose",
  "flojo": "loose",
  "floja": "loose",
  "flojos": "loose",
  "flojas": "loose",
  "bloqueado": "blocked",
  "bloqueada": "blocked",
  "bloqueados": "blocked",
  "bloqueadas": "blocked",
  "desbloqueado": "unlocked",
  "desbloqueada": "unlocked",
  "conectado": "connected",
  "conectada": "connected",
  "desconectado": "disconnected",
  "desconectada": "disconnected",
  "encendido": "on",
  "encendida": "on",
  "apagado": "off",
  "apagada": "off",

  "estable": "stable",
  "inestable": "unstable",
  "nuevo": "new",
  "nueva": "new",
  "nuevos": "new",
  "nuevas": "new",
  "antiguo": "old",
  "antigua": "old",
  "antiguos": "old",
  "antiguas": "old",
  "bueno": "good",
  "buena": "good",
  "buenos": "good",
  "buenas": "good",
  "malo": "poor",
  "mala": "poor",
  "malos": "poor",
  "malas": "poor",
  "correcto": "correct",
  "correcta": "correct",
  "correctos": "correct",
  "correctas": "correct",
  "incorrecto": "incorrect",
  "incorrecta": "incorrect",
  "incorrectos": "incorrect",
  "incorrectas": "incorrect",
  "normal": "normal",
  "normales": "normal",
  "anormal": "abnormal",
  "anormales": "abnormal",
  "adecuado": "adequate",
  "adecuada": "adequate",
  "adecuados": "adequate",
  "adecuadas": "adequate",
  "inadecuado": "inadequate",
  "inadecuada": "inadequate",
  "inadecuados": "inadequate",
  "inadecuadas": "inadequate",

  "pequeño": "small",
  "pequeña": "small",
  "pequeños": "small",
  "pequeñas": "small",
  "grande": "large",
  "grandes": "large",
  "amplio": "spacious",
  "amplia": "spacious",
  "amplios": "spacious",
  "amplias": "spacious",
  "estrecho": "narrow",
  "estrecha": "narrow",
  "estrechos": "narrow",
  "estrechas": "narrow",
  "ancho": "wide",
  "ancha": "wide",
  "anchos": "wide",
  "anchas": "wide",
  "largo": "long",
  "larga": "long",
  "largos": "long",
  "largas": "long",
  "corto": "short",
  "corta": "short",
  "cortos": "short",
  "cortas": "short",
  "alto": "high",
  "alta": "high",
  "altos": "high",
  "altas": "high",
  "bajo": "low",
  "baja": "low",
  "bajos": "low",
  "bajas": "low",
  "profundo": "deep",
  "profunda": "deep",
  "superficial": "superficial",
  "superficiales": "superficial",

  "fuerte": "strong",
  "fuertes": "strong",
  "débil": "weak",
  "débiles": "weak",
  "visible": "visible",
  "visibles": "visible",
  "oculto": "hidden",
  "oculta": "hidden",
  "ocultos": "hidden",
  "ocultas": "hidden",
  "suficiente": "sufficient",
  "suficientes": "sufficient",
  "insuficiente": "insufficient",
  "insuficientes": "insufficient",
  "ligero": "slight",
  "ligera": "slight",
  "ligeros": "slight",
  "ligeras": "slight",
  "grave": "serious",
  "graves": "serious",
  "importante": "significant",
  "importantes": "significant",
  "leve": "minor",
  "leves": "minor",

  "perdido": "missing",
  "perdida": "missing",
  "perdidos": "missing",
  "perdidas": "missing",
  "ausente": "missing",
  "ausentes": "missing",
  "pendiente": "pending",
  "pendientes": "pending",
  "completo": "complete",
  "completa": "complete",
  "completos": "complete",
  "completas": "complete",
  "incompleto": "incomplete",
  "incompleta": "incomplete",
  "incompletos": "incomplete",
  "incompletas": "incomplete",
  "funcional": "functional",
  "funcionales": "functional",
  "operativo": "operational",
  "operativa": "operational",
  "operativos": "operational",
  "operativas": "operational"
};

// ============================================================
// 8. DICCIONARIO DE INCIDENCIAS Y MANTENIMIENTO
// ============================================================

const INCIDENCIAS_CG = {
  "humedad": "dampness",
  "humedades": "dampness",
  "filtración": "water ingress",
  "filtraciones": "water ingress",
  "moho": "mould",
  "hongos": "mould",
  "condensación": "condensation",
  "gotera": "leak",
  "goteras": "leaks",
  "mancha": "stain",
  "manchas": "stains",
  "grieta": "crack",
  "grietas": "cracks",
  "fisura": "crack",
  "fisuras": "cracks",
  "rotura": "breakage",
  "óxido": "rust",
  "corrosión": "corrosion",
  "deterioro": "deterioration",
  "desgaste": "wear",
  "daño": "damage",
  "daños": "damage",
  "desperfecto": "defect",
  "desperfectos": "defects",
  "defecto": "defect",
  "defectos": "defects",
  "suciedad": "dirt",
  "polvo": "dust",
  "residuos": "debris",
  "basura": "rubbish",
  "fuga": "leak",
  "fugas": "leaks",
  "goteo": "dripping",
  "presión": "pressure",
  "electricidad": "electricity",
  "fontanería": "plumbing",
  "mantenimiento": "maintenance",
  "reparación": "repair",
  "reparaciones": "repairs",
  "limpieza": "cleaning",
  "sustitución": "replacement",
  "inspección": "inspection",
  "inspecciones": "inspections",
  "revisión": "inspection",
  "observación": "observation",
  "observaciones": "observations",
  "incidencia": "issue",
  "incidencias": "issues",
  "problema": "problem",
  "problemas": "problems",
  "avería": "fault",
  "averías": "faults",
  "quemadura": "burn mark",
  "quemaduras": "burn marks",
  "marcas de quemado": "burn marks",
  "marcas de humedad": "damp marks",
  "manchas de humedad": "damp stains",
  "pérdida de agua": "water leak",
  "pérdidas de agua": "water leaks",
  "escape de agua": "water leak",
  "escapes de agua": "water leaks",
  "entrada de agua": "water ingress",
  "entrada de humedad": "moisture ingress",
  "mal funcionamiento": "malfunction",
  "falta de mantenimiento": "lack of maintenance",
  "falta de limpieza": "lack of cleaning",
  "daños por agua": "water damage",
  "daño por agua": "water damage",
  "cortocircuito": "short circuit",
  "cortocircuitos": "short circuits",
  "chispa": "spark",
  "chispas": "sparks"
};

// ============================================================
// 9. VOCABULARIO DE ACCIONES Y EXPRESIONES
// ============================================================

const ACCIONES_CG = {
  "necesita": "needs",
  "necesitan": "need",
  "necesitar": "need",
  "requiere": "requires",
  "requieren": "require",
  "requerir": "require",
  "funciona": "works",
  "funcionan": "work",
  "funcionando": "working",
  "no funciona": "does not work",
  "no funcionan": "do not work",
  "deja de funcionar": "stops working",
  "dejan de funcionar": "stop working",
  "revisar": "inspect",
  "comprobar": "check",
  "verificar": "verify",
  "observar": "observe",
  "detectar": "detect",
  "reparar": "repair",
  "repararse": "be repaired",
  "sustituir": "replace",
  "cambiar": "replace",
  "limpiar": "clean",
  "abrir": "open",
  "cerrar": "close",
  "instalar": "install",
  "mantener": "maintain",
  "realizar": "carry out",
  "muestra": "shows",
  "muestran": "show",
  "aparece": "appears",
  "aparecen": "appear",
  "falta": "is missing",
  "faltan": "are missing",
  "existe": "exists",
  "existen": "exist",
  "parece": "appears",
  "parecen": "appear",
  "queda": "remains",
  "quedan": "remain",
  "está": "is",
  "están": "are",
  "estaba": "was",
  "estaban": "were",
  "estuvo": "was",
  "estuvieron": "were",
  "estará": "will be",
  "estarán": "will be",
  "completada": "completed",
  "completado": "completed",
  "completadas": "completed",
  "completados": "completed",
  "terminada": "finished",
  "terminado": "finished",
  "terminadas": "finished",
  "terminados": "finished",
  "atascarse": "to stick",
  "se atasca": "is sticking",
  "se atascan": "are sticking",
  "se atascó": "got stuck",
  "se atascaron": "got stuck",
  "gotea": "is dripping",
  "gotean": "are dripping",
  "pierde agua": "is leaking water",
  "pierden agua": "are leaking water",
  "pierde": "is leaking",
  "pierden": "are leaking",
  "filtra": "is leaking through",
  "filtran": "are leaking through",
  "presenta": "shows",
  "presentan": "show",
  "presenta daños": "is damaged",
  "presentan daños": "are damaged",
  "se encuentra": "is located",
  "se encuentran": "are located",
  "se observa": "is observed",
  "se observan": "are observed",
  "se detecta": "is detected",
  "se detectan": "are detected",
  "se necesita": "is needed",
  "se necesitan": "are needed",
  "hay": "there is",
  "había": "there was",
  "habían": "there were",
  "no hay": "there is no",
  "no había": "there was no",
  "no habían": "there were no"
};

// ============================================================
// 10. VOCABULARIO GENERAL
// ============================================================

const VOCABULARIO_GENERAL_CG = {
  "vivienda": "property",
  "viviendas": "properties",
  "casa": "house",
  "casas": "houses",
  "hogar": "home",
  "edificio": "building",
  "edificios": "buildings",
  "apartamento": "apartment",
  "apartamentos": "apartments",

  /*
   * En España, «piso» suele referirse a una vivienda.
   * Para el suelo físico se conserva «suelo» → floor.
   */
  "piso": "apartment",
  "pisos": "apartments",

  "agua": "water",
  "aguas": "water",
  "eléctrico": "electrical",
  "eléctrica": "electrical",
  "eléctricos": "electrical",
  "eléctricas": "electrical",
  "inspección": "inspection",
  "inspecciones": "inspections",
  "informe": "report",
  "informes": "reports",
  "estado": "condition",
  "resultado": "result",
  "resultados": "results",
  "descripción": "description",
  "ubicación": "location",
  "comentario": "comment",
  "comentarios": "comments",
  "nota": "note",
  "notas": "notes",
  "recomendación": "recommendation",
  "recomendaciones": "recommendations",
  "pendiente": "pending",
  "pendientes": "pending",
  "realizado": "carried out",
  "realizada": "carried out",
  "realizados": "carried out",
  "realizadas": "carried out",
  "necesario": "necessary",
  "necesaria": "necessary",
  "necesarios": "necessary",
  "necesarias": "necessary",
  "muy": "very",
  "bastante": "quite",
  "demasiado": "too",
  "ligeramente": "slightly",
  "completamente": "completely",
  "parcialmente": "partially",
  "correctamente": "properly",
  "aparentemente": "apparently",
  "posible": "possible",
  "posibles": "possible",
  "posiblemente": "possibly",
  "probable": "likely",
  "probables": "likely",
  "probablemente": "probably",
  "improbable": "unlikely",
  "improbables": "unlikely",
  "quizás": "perhaps",
  "quizas": "perhaps",
  "tal vez": "perhaps",
  "parece": "appears",
  "parecen": "appear",
  "aparente": "apparent",
  "aparentes": "apparent",
  "todavía": "still",
  "aún": "still",
  "aun": "still",
  "nuevamente": "again",
  "también": "also",
  "además": "in addition",
  "pero": "but",
  "porque": "because",
  "aunque": "although",
  "debajo": "below",
  "encima": "above",
  "dentro": "inside",
  "fuera": "outside",
  "cerca": "near",
  "lejos": "far",
  "sin": "without",
  "con": "with",
  "desde": "from",
  "hasta": "to",
  "sobre": "on",
  "entre": "between",
  "para": "for",
  "cada": "each",
  "ninguna": "no",
  "ninguno": "no",
  "ningún": "no",
  "alguna": "some",
  "alguno": "some",
  "algunos": "some",
  "algunas": "some",
  "otro": "other",
  "otra": "other",
  "otros": "other",
  "otras": "other",
  "todo": "all",
  "toda": "all",
  "todos": "all",
  "todas": "all",
  "resto": "rest",
  "restos": "remains",
  "restante": "remaining",
  "restantes": "remaining",
  "parte": "part",
  "partes": "parts",
  "zona": "area",
  "zonas": "areas",
  "elemento": "element",
  "elementos": "elements",
  "material": "material",
  "materiales": "materials",
  "superficie": "surface",
  "superficies": "surfaces",
  "estructura": "structure",
  "estructuras": "structures",
  "acceso": "access",
  "accesos": "access points",
  "seguridad": "safety",
  "mantenimiento": "maintenance",
  "uso": "use",
  "funcionamiento": "operation",
  "función": "function",
  "funciones": "functions",
  "correcto funcionamiento": "proper operation",
  "buen estado": "good condition",
  "mal estado": "poor condition",
  "sin problemas": "without issues",
  "sin incidencias": "without issues",
  "sin daños": "without damage",
  "sin desperfectos": "without defects",

  // Vocabulario general adicional.
  "suciedad": "dirt",
  "sucio": "dirty",
  "sucia": "dirty",
  "sucios": "dirty",
  "sucias": "dirty",
  "limpieza": "cleaning",
  "mancha": "stain",
  "manchas": "stains",
  "cantidad": "quantity",
  "cantidades": "quantities",
  "medida": "measurement",
  "medidas": "measurements",
  "tamaño": "size",
  "tamanos": "sizes",
  "tamaños": "sizes",
  "altura": "height",
  "anchura": "width",
  "longitud": "length",
  "profundidad": "depth",
  "distancia": "distance",
  "distancias": "distances",
  "aproximadamente": "approximately",
  "aproximado": "approximate",
  "aproximada": "approximate",
  "exactamente": "exactly",
  "casi": "almost",
  "solamente": "only",
  "solo": "only",
  "sola": "alone",
  "principalmente": "mainly",
  "especialmente": "especially",
  "normalmente": "normally",
  "habitualmente": "usually",
  "ocasionalmente": "occasionally",
  "frecuentemente": "frequently",
  "raramente": "rarely",
  "antes": "before",
  "después": "after",
  "ahora": "now",
  "posteriormente": "later",
  "durante": "during",
  "mientras": "while",
  "inmediatamente": "immediately",
  "recientemente": "recently",
  "anteriormente": "previously",
  "primero": "first",
  "primera": "first",
  "segundo": "second",
  "segunda": "second",
  "último": "last",
  "última": "last",
  "actual": "current",
  "actualmente": "currently",
  "anterior": "previous",
  "posterior": "subsequent",
  "disponible": "available",
  "disponibles": "available",
  "necesidad": "need",
  "necesidades": "needs",
  "posibilidad": "possibility",
  "posibilidades": "possibilities",
  "duda": "doubt",
  "dudas": "doubts",
  "confirmado": "confirmed",
  "confirmada": "confirmed",
  "confirmados": "confirmed",
  "confirmadas": "confirmed",
  "desconocido": "unknown",
  "desconocida": "unknown",
  "desconocidos": "unknown",
  "desconocidas": "unknown",
  "sin confirmar": "unconfirmed",
  "no confirmado": "not confirmed",
  "no confirmada": "not confirmed",
  "apariencia": "appearance",
  "aspecto": "appearance",
  "aspectos": "aspects",
  "observado": "observed",
  "observada": "observed",
  "observados": "observed",
  "observadas": "observed",
  "indicado": "indicated",
  "indicada": "indicated",
  "indica": "indicates",
  "indican": "indicate",
  "señal": "sign",
  "señales": "signs",
  "indicio": "indication",
  "indicios": "indications",
  "presencia": "presence",
  "ausencia": "absence",
  "falta": "lack",
  "faltan": "are missing",
  "restante": "remaining",
  "restantes": "remaining",
  "algún": "some",
  "alguna": "some",
  "ningún": "no",
  "ninguna": "no"
};

// ============================================================
// 11. REGLAS DE FRASES COMPLETAS Y EQUIVALENCIAS
// ============================================================

const EQUIVALENCIAS_FRASES_CG = [
  {
    patron: /\b(?:todo|toda la zona|la zona) está en buen estado\b/gi,
    traduccion: "The area is in good condition"
  },
  {
    patron: /\b(?:todo|toda la zona|la zona) se encuentra bien\b/gi,
    traduccion: "The area is in good condition"
  },
  {
    patron: /\bno presenta signos de deterioro\b/gi,
    traduccion: "There are no signs of deterioration"
  },
  {
    patron: /\bno se aprecian signos de deterioro\b/gi,
    traduccion: "There are no visible signs of deterioration"
  },
  {
    patron: /\bse encuentra bastante deteriorado\b/gi,
    traduccion: "It is considerably deteriorated"
  },
  {
    patron: /\bse encuentra bastante deteriorada\b/gi,
    traduccion: "It is considerably deteriorated"
  },
  {
    patron: /\baparentemente está en buen estado\b/gi,
    traduccion: "It appears to be in good condition"
  },
  {
    patron: /\ba simple vista está bien\b/gi,
    traduccion: "It appears to be in good condition"
  },
  {
    patron: /\ba simple vista no se observan problemas\b/gi,
    traduccion: "No issues are visible at first glance"
  },
  {
    patron: /\bno hay ningún problema\b/gi,
    traduccion: "There are no problems"
  },
  {
    patron: /\bno hay ningun problema\b/gi,
    traduccion: "There are no problems"
  },
  {
    patron: /\bno hay problemas\b/gi,
    traduccion: "There are no problems"
  },
  {
    patron: /\bno hay ningún daño\b/gi,
    traduccion: "There is no damage"
  },
  {
    patron: /\bno hay daños\b/gi,
    traduccion: "There is no damage"
  },
  {
    patron: /\bno hay humedad\b/gi,
    traduccion: "There is no dampness"
  },
  {
    patron: /\bno hay fugas\b/gi,
    traduccion: "There are no leaks"
  },

  {
    patron: /\bse ha comprobado su funcionamiento\b/gi,
    traduccion: "Its operation has been checked"
  },
  {
    patron: /\bse comprobó su funcionamiento\b/gi,
    traduccion: "Its operation was checked"
  },
  {
    patron: /\bse ha probado y funciona\b/gi,
    traduccion: "It has been tested and is working"
  },
  {
    patron: /\bse ha probado y no funciona\b/gi,
    traduccion: "It has been tested and is not working"
  },
  {
    patron: /\bno se ha realizado ninguna prueba\b/gi,
    traduccion: "No test has been carried out"
  },
  {
    patron: /\bno se pudo realizar la comprobación\b/gi,
    traduccion: "The check could not be carried out"
  },

  {
    patron: /\bse sale el agua\b/gi,
    traduccion: "Water is leaking"
  },
  {
    patron: /\bse escapa el agua\b/gi,
    traduccion: "Water is leaking"
  },
  {
    patron: /\bhay agua acumulada\b/gi,
    traduccion: "There is standing water"
  },
  {
    patron: /\bse acumula agua\b/gi,
    traduccion: "Water is accumulating"
  },
  {
    patron: /\bno traga el agua\b/gi,
    traduccion: "The water is not draining"
  },
  {
    patron: /\btraga lentamente\b/gi,
    traduccion: "It drains slowly"
  },
  {
    patron: /\bel agua tarda en salir\b/gi,
    traduccion: "The water takes time to drain"
  },
  {
    patron: /\bno llega agua\b/gi,
    traduccion: "No water is reaching the outlet"
  },
  {
    patron: /\bno tiene agua\b/gi,
    traduccion: "There is no water supply"
  },
  {
    patron: /\bfugas? de agua\b/gi,
    traduccion: "Water leak"
  },

  {
    patron: /\bse ve humedad\b/gi,
    traduccion: "There are visible signs of damp"
  },
  {
    patron: /\bse nota humedad\b/gi,
    traduccion: "There are noticeable signs of damp"
  },
  {
    patron: /\bparece haber humedad\b/gi,
    traduccion: "There appears to be damp"
  },
  {
    patron: /\bposibles signos de humedad\b/gi,
    traduccion: "Possible signs of damp"
  },
  {
    patron: /\bposible filtración\b/gi,
    traduccion: "Possible water ingress"
  },
  {
    patron: /\bmancha de humedad\b/gi,
    traduccion: "Damp patch"
  },
  {
    patron: /\bmanchas de humedad\b/gi,
    traduccion: "Damp patches"
  },

  {
    patron: /\bcuesta abrir la puerta\b/gi,
    traduccion: "The door is difficult to open"
  },
  {
    patron: /\bcuesta cerrar la puerta\b/gi,
    traduccion: "The door is difficult to close"
  },
  {
    patron: /\bcuesta abrir la ventana\b/gi,
    traduccion: "The window is difficult to open"
  },
  {
    patron: /\bcuesta cerrar la ventana\b/gi,
    traduccion: "The window is difficult to close"
  },
  {
    patron: /\bno ajusta bien\b/gi,
    traduccion: "It does not fit properly"
  },
  {
    patron: /\bno encaja correctamente\b/gi,
    traduccion: "It does not fit correctly"
  },
  {
    patron: /\bpuerta no cierra\b/gi,
    traduccion: "The door does not close"
  },
  {
    patron: /\bpuerta no abre\b/gi,
    traduccion: "The door does not open"
  },
  {
    patron: /\bventana no cierra\b/gi,
    traduccion: "The window does not close"
  },
  {
    patron: /\bwindow no abre\b/gi,
    traduccion: "The window does not open"
  },

  {
    patron: /\bestá bastante sucio\b/gi,
    traduccion: "It is quite dirty"
  },
  {
    patron: /\bestá bastante sucia\b/gi,
    traduccion: "It is quite dirty"
  },
  {
    patron: /\bse encuentra sin limpiar\b/gi,
    traduccion: "It has not been cleaned"
  },
  {
    patron: /\bnecesita una limpieza a fondo\b/gi,
    traduccion: "It requires a thorough cleaning"
  },
  {
    patron: /\bsería conveniente revisar\b/gi,
    traduccion: "It would be advisable to inspect"
  },
  {
    patron: /\bconviene revisar\b/gi,
    traduccion: "It should be inspected"
  },
  {
    patron: /\bnecesita limpieza\b/gi,
    traduccion: "Requires cleaning"
  },
  {
    patron: /\brequiere limpieza\b/gi,
    traduccion: "Requires cleaning"
  }
];

// ============================================================
// 12. EXPRESIONES MIXTAS ESPAÑOL-INGLÉS
// ============================================================

const EXPRESIONES_MIXTAS_CG = [
  [/\bwater fuga\b/gi, "water leak"],
  [/\bfuga de water\b/gi, "water leak"],
  [/\bwater leak detectada\b/gi, "water leak detected"],
  [/\bdamp en la pared\b/gi, "damp on the wall"],
  [/\bhumedad en el ceiling\b/gi, "damp on the ceiling"],
  [/\bceiling con humedad\b/gi, "ceiling with damp"],
  [/\bwall con humedad\b/gi, "wall with damp"],
  [/\bpipe rota\b/gi, "broken pipe"],
  [/\bpipe dañado\b/gi, "damaged pipe"],
  [/\bpipe dañada\b/gi, "damaged pipe"],
  [/\btap goteando\b/gi, "dripping tap"],
  [/\bgrifo dripping\b/gi, "dripping tap"],
  [/\bdrain atascado\b/gi, "blocked drain"],
  [/\bdrain obstruido\b/gi, "blocked drain"],
  [/\bdoor no cierra\b/gi, "door does not close"],
  [/\bwindow no cierra\b/gi, "window does not close"],
  [/\bdoor dañada\b/gi, "damaged door"],
  [/\bwindow dañada\b/gi, "damaged window"],
  [/\blight no funciona\b/gi, "light is not working"],
  [/\bswitch no funciona\b/gi, "switch is not working"],
  [/\bsocket dañado\b/gi, "damaged socket"],
  [/\bsocket dañada\b/gi, "damaged socket"],
  [/\bpool en buen estado\b/gi, "pool in good condition"],
  [/\bgarden necesita mantenimiento\b/gi, "garden requires maintenance"],
  [/\bneeds reparación\b/gi, "requires repair"],
  [/\brequires limpieza\b/gi, "requires cleaning"],
  [/\bin good estado\b/gi, "in good condition"],
  [/\bin poor estado\b/gi, "in poor condition"],
  [/\bno issues detectados\b/gi, "no issues detected"],
  [/\bissues de humedad\b/gi, "damp issues"],
  [/\bmaintenance pendiente\b/gi, "maintenance pending"]
];

function traducirExpresionesMixtas(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, traduccion] of EXPRESIONES_MIXTAS_CG) {
    resultado = reemplazarPatronUnicodeCG(
      resultado,
      patron,
      coincidencia => conservarMayusculas(coincidencia, traduccion)
    );
  }

  return resultado;
}

// ============================================================
// 13. UNIDADES Y ETIQUETAS DE INFORMES
// ============================================================

const UNIDADES_CG = [
  [/\bcentímetros cuadrados\b/gi, "square centimetres"],
  [/\bmetros cuadrados\b/gi, "square metres"],
  [/\bmilímetros?\b/gi, "millimetres"],
  [/\bcentímetros?\b/gi, "centimetres"],
  [/\bkilómetros?\b/gi, "kilometres"],
  [/\bmetros?\b/gi, "metres"],
  [/\blitros?\b/gi, "litres"],
  [/\bgrados centígrados\b/gi, "degrees Celsius"],
  [/\bgrados Celsius\b/gi, "degrees Celsius"],
  [/\bpor ciento\b/gi, "percent"],
  [/\bhoras?\b/gi, "hours"],
  [/\bminutos?\b/gi, "minutes"],
  [/\bdías?\b/gi, "days"],
  [/\bsemanas?\b/gi, "weeks"],
  [/\bmeses?\b/gi, "months"],
  [/\baños?\b/gi, "years"],
  [/\bkilogramos?\b/gi, "kilograms"],
  [/\bgramos?\b/gi, "grams"],
  [/\bvoltios?\b/gi, "volts"],
  [/\bamperios?\b/gi, "amps"],
  [/\bvatios?\b/gi, "watts"]
];

function traducirCantidadesTiempo(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, traduccion] of UNIDADES_CG) {
    resultado = reemplazarPatronUnicodeCG(
      resultado,
      patron,
      coincidencia => conservarMayusculas(coincidencia, traduccion)
    );
  }

  resultado = resultado
    .replace(/\bmm\b/gi, "mm")
    .replace(/\bcm\b/gi, "cm")
    .replace(/\bkm\b/gi, "km")
    .replace(/m²/gi, "m²")
    .replace(/cm²/gi, "cm²")
    .replace(/°C/gi, "°C")
    .replace(/\bkg\b/gi, "kg")
    .replace(/\bml\b/gi, "ml")
    .replace(/\bV\b/g, "V")
    .replace(/\bW\b/g, "W");

  return resultado;
}

const ETIQUETAS_CG = [
  [/^\s*identificador\s*:/gim, "Identifier:"],
  [/^\s*código postal\s*:/gim, "Postcode:"],
  [/^\s*código\s*:/gim, "Code:"],
  [/^\s*dirección de la vivienda\s*:/gim, "Property address:"],
  [/^\s*dirección del inmueble\s*:/gim, "Property address:"],
  [/^\s*dirección\s*:/gim, "Address:"],
  [/^\s*fecha\s*:/gim, "Date:"],
  [/^\s*hora\s*:/gim, "Time:"],
  [/^\s*cliente\s*:/gim, "Client:"],
  [/^\s*propietario\s*:/gim, "Owner:"],
  [/^\s*inspector\s*:/gim, "Inspector:"],
  [/^\s*inspección\s*:/gim, "Inspection:"],
  [/^\s*tipo de inspección\s*:/gim, "Inspection type:"],
  [/^\s*observación\s*:/gim, "Observation:"],
  [/^\s*observaciones\s*:/gim, "Observations:"],
  [/^\s*incidencia\s*:/gim, "Issue:"],
  [/^\s*incidencias\s*:/gim, "Issues:"],
  [/^\s*estado\s*:/gim, "Condition:"],
  [/^\s*resultado\s*:/gim, "Result:"],
  [/^\s*descripción de la vivienda\s*:/gim, "Property description:"],
  [/^\s*descripción\s*:/gim, "Description:"],
  [/^\s*habitación\s*:/gim, "Room:"],
  [/^\s*estancia\s*:/gim, "Area:"],
  [/^\s*zona\s*:/gim, "Area:"],
  [/^\s*ubicación\s*:/gim, "Location:"],
  [/^\s*comentarios\s*:/gim, "Comments:"],
  [/^\s*notas\s*:/gim, "Notes:"],
  [/^\s*recomendaciones\s*:/gim, "Recommendations:"],
  [/^\s*recomendación\s*:/gim, "Recommendation:"],
  [/^\s*reparación\s*:/gim, "Repair:"],
  [/^\s*mantenimiento\s*:/gim, "Maintenance:"],
  [/^\s*prioridad\s*:/gim, "Priority:"],
  [/^\s*pendiente\s*:/gim, "Pending:"],
  [/^\s*completado\s*:/gim, "Completed:"],
  [/^\s*información\s*:/gim, "Information:"]
];

function traducirEtiquetas(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, traduccion] of ETIQUETAS_CG) {
    resultado = resultado.replace(patron, traduccion);
  }

  return resultado;
}

// ============================================================
// 14. CORRECCIONES GRAMATICALES DE INGLÉS
// ============================================================

const CORRECCIONES_TRADUCCION_CG = [
  [/\bthere are no any\b/gi, "there are no"],
  [/\bthere is no any\b/gi, "there is no"],
  [/\bit have\b/gi, "it has"],
  [/\bit don't\b/gi, "it does not"],
  [/\bit doesn't working\b/gi, "it is not working"],
  [/\bnot works\b/gi, "does not work"],
  [/\bno works\b/gi, "does not work"],
  [/\bmore better\b/gi, "better"],
  [/\bvery deteriorated\b/gi, "severely deteriorated"],
  [/\bwater entrance\b/gi, "water ingress"],
  [/\bplumbing installation\b/gi, "plumbing system"],
  [/\bthe door not close\b/gi, "the door does not close"],
  [/\bthe window not close\b/gi, "the window does not close"],
  [/\bthe water not flow\b/gi, "the water does not flow"],
  [/\bthe light not work\b/gi, "the light does not work"],
  [/\bin a good state\b/gi, "in good condition"],
  [/\bin bad state\b/gi, "in poor condition"],
  [/\bworks correct\b/gi, "works correctly"],
  [/\bworking correct\b/gi, "working correctly"],
  [/\bneeds to maintenance\b/gi, "needs maintenance"],
  [/\brequires to repair\b/gi, "requires repair"],
  [/\bclose correctly\b/gi, "close properly"],
  [/\bopen correctly\b/gi, "open properly"]
];

function corregirTextoOriginalCG(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, correccion] of CORRECCIONES_TRADUCCION_CG) {
    resultado = reemplazarPatronUnicodeCG(
      resultado,
      patron,
      coincidencia => conservarMayusculas(coincidencia, correccion)
    );
  }

  return resultado;
}

// ============================================================
// 15. APLICACIÓN DE DICCIONARIOS Y ORDEN GRAMATICAL
// ============================================================

function ajustarOrdenAdjetivosCG(texto) {
  let resultado = String(texto ?? "");

  const sujetos = [
    "wall",
    "door",
    "window",
    "pipe",
    "tap",
    "drain",
    "socket",
    "switch",
    "ceiling",
    "floor",
    "room",
    "bathroom",
    "kitchen",
    "roof",
    "pool",
    "garden",
    "toilet",
    "shower",
    "faucet",
    "lock",
    "hinge",
    "tile",
    "tiles",
    "fence",
    "gate",
    "handle",
    "light",
    "electrical outlet"
  ];

  const adjetivos = [
    "broken",
    "damaged",
    "deteriorated",
    "cracked",
    "rusty",
    "worn",
    "damp",
    "wet",
    "clean",
    "dirty",
    "blocked",
    "loose",
    "open",
    "closed",
    "stained",
    "leaking",
    "faulty"
  ];

  const sujetosRegex = sujetos
    .sort((a, b) => b.length - a.length)
    .map(escaparRegex)
    .join("|");

  const adjetivosRegex = adjetivos
    .sort((a, b) => b.length - a.length)
    .map(escaparRegex)
    .join("|");

  const patron = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:(the|a|an)\\s+)?(${sujetosRegex})\\s+(${adjetivosRegex})(?![\\p{L}\\p{N}_])`,
    "giu"
  );

  resultado = resultado.replace(
    patron,
    (coincidencia, articulo, sujeto, adjetivo) => {
      const articuloFinal = articulo
        ? articulo.toLowerCase()
        : "the";

      return `${articuloFinal} ${sujeto.toLowerCase()} is ${adjetivo.toLowerCase()}`;
    }
  );

  return resultado;
}

function traducirPalabrasIndividuales(texto) {
  let resultado = String(texto ?? "");

  const diccionarios = {
    ...ESTADOS_CG,
    ...OBJETOS_CG,
    ...HABITACIONES_CG,
    ...INCIDENCIAS_CG,
    ...ACCIONES_CG,
    ...VOCABULARIO_GENERAL_CG
  };

  const entradas = Object.entries(diccionarios)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [palabra, traduccion] of entradas) {
    const patron = new RegExp(
      `(^|[^\\p{L}\\p{N}_])(${escaparRegex(palabra)})(?=$|[^\\p{L}\\p{N}_])`,
      "giu"
    );

    resultado = resultado.replace(
      patron,
      (coincidencia, prefijo, encontrada) =>
        prefijo + conservarMayusculas(encontrada, traduccion)
    );
  }

  return resultado;
}

function aplicarReglasFrases(texto) {
  let resultado = String(texto ?? "");

  for (const regla of EQUIVALENCIAS_FRASES_CG) {
    resultado = reemplazarPatronUnicodeCG(
      resultado,
      regla.patron,
      coincidencia => conservarMayusculas(
        coincidencia,
        regla.traduccion
      )
    );
  }

  return resultado;
}

// ============================================================
// 16. PROCESAMIENTO DE FRAGMENTOS Y TEXTO COMPLETO
// ============================================================

function traducirFragmento(texto) {
  if (!tieneContenido(texto)) return texto;

  let resultado = String(texto);

  resultado = corregirOrtografiaCG(resultado);
  resultado = aplicarReglasFrases(resultado);
  resultado = traducirExpresionesMixtas(resultado);
  resultado = traducirEtiquetas(resultado);
  resultado = traducirCantidadesTiempo(resultado);
  resultado = traducirPalabrasIndividuales(resultado);
  resultado = ajustarOrdenAdjetivosCG(resultado);
  resultado = corregirTextoOriginalCG(resultado);

  return capitalizarInicioCG(resultado);
}

function traducirTextoCompletoCG(texto) {
  const lineas = String(texto ?? "").split("\n");

  return lineas
    .map(linea => {
      if (!linea.trim()) return linea;

      const protegidos = protegerDatosCG(linea);

      let resultado = traducirFragmento(protegidos.texto);

      resultado = restaurarDatosCG(
        resultado,
        protegidos.protegidos
      );

      return resultado;
    })
    .join("\n");
}

// ============================================================
// 17. FUNCIÓN PÚBLICA PRINCIPAL
// ============================================================

function traducirObservacionInspeccion(texto, idiomaCliente = "es") {
  if (typeof texto !== "string") {
    return texto ?? "";
  }

  if (!texto.trim()) {
    return texto;
  }

  const idioma = normalizar(idiomaCliente);

  const esIngles = IDIOMAS_TRADUCCION_CG.ingles.some(
    idiomaPermitido => normalizar(idiomaPermitido) === idioma
  );

  if (!esIngles) {
    return texto;
  }

  try {
    return traducirTextoCompletoCG(texto);
  } catch (error) {
    return texto;
  }
}

// ============================================================
// 18. EXPORTACIONES
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
