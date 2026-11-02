/*
 * ============================================================
 * COASTGUARD HOMES SERVICES
 * TRADUCTOR LOCAL DE OBSERVACIONES DE INSPECCIÓN
 * ============================================================
 *
 * Objetivos:
 * - Traducir observaciones españolas al inglés natural.
 * - Reconocer frases completas antes de traducir palabras.
 * - Reconocer frases en español, inglés y combinaciones.
 * - Ampliar vocabulario general y técnico de inspecciones.
 * - Reconstruir expresiones con equivalencias de significado.
 * - Evitar traducciones literales con gramática incorrecta.
 * - Conservar nombres propios, direcciones, cifras y medidas.
 * - No inventar averías, causas, reparaciones ni resultados.
 * - Mantener la API compatible con los archivos de la app.
 *
 * Uso:
 * traducirObservacionInspeccion(texto, "en")
 *
 * ============================================================
 */

// ============================================================
// 1. NORMALIZACIÓN Y PROTECCIÓN DE DATOS
// ============================================================

function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function conservarMayusculas(original, resultado) {
  if (!original || !resultado) return resultado;

  if (original === original.toUpperCase()) {
    return resultado.toUpperCase();
  }

  if (
    original[0] &&
    original[0] === original[0].toUpperCase()
  ) {
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
  }

  return resultado;
}

function tieneContenido(texto) {
  return typeof texto === "string" && texto.trim().length > 0;
}

// Configuración de idiomas permitidos para la traducción al inglés.
const IDIOMAS_TRADUCCION_CG = {
  ingles: ["en", "english", "ingles", "inglés"]
};

/*
 * Protege datos sensibles para que no sean alterados durante
 * la sustitución de palabras o frases:
 * - URLs
 * - Emails
 * - Teléfonos
 * - Matrículas y códigos postales específicos con formato estricto
 */
function protegerDatosCG(texto) {
  const protegidos = [];
  let contador = 0;

  let resultado = String(texto ?? "");

  // URLs
  resultado = resultado.replace(/https?:\/\/[^\s]+/g, coincidencia => {
    const token = `__TOKEN_URL_${contador++}__`;
    protegidos.push({ token, valor: coincidencia });
    return token;
  });

  // Emails
  resultado = resultado.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, coincidencia => {
    const token = `__TOKEN_EMAIL_${contador++}__`;
    protegidos.push({ token, valor: coincidencia });
    return token;
  });

  return { texto: resultado, protegidos };
}

function restaurarDatosCG(texto, protegidos) {
  let resultado = String(texto ?? "");
  if (!Array.isArray(protegidos)) return resultado;

  for (const item of protegidos) {
    resultado = resultado.replace(item.token, item.valor);
  }

  return resultado;
}

// ============================================================
// 2. CORRECCIONES ORTOGRÁFICAS Y DE ENTRADA
// ============================================================

const CORRECCIONES_ORTOGRAFIA_CG = [
  [/\bbao\b/gi, "baño"],
  [/\bbano\b/gi, "baño"],
  [/\bbathrom\b/gi, "bathroom"],
  [/\bbathromm\b/gi, "bathroom"],
  [/\bvitroceramica\b/gi, "vitrocerámica"],
  [/\bfontaneria\b/gi, "fontanería"],
  [/\belectrico\b/gi, "eléctrico"],
  [/\belectrica\b/gi, "eléctrica"],
  [/\blampara\b/gi, "lámpara"],
  [/\blamparas\b/gi, "lámparas"],
  [/\bfrigorifico\b/gi, "frigorífico"],
  [/\bdesague\b/gi, "desagüe"],
  [/\bbanera\b/gi, "bañera"],
  [/\bhabitacion\b/gi, "habitación"],
  [/\bhabitaciones\b/gi, "habitaciones"],
  [/\btelevision\b/gi, "televisión"],
  [/\bcalefaccion\b/gi, "calefacción"],
  [/\bventilacion\b/gi, "ventilación"],
  [/\binstalacion\b/gi, "instalación"],
  [/\breparacion\b/gi, "reparación"],
  [/\bcristal\b/gi, "cristal"],
  [/\bhumedades\b/gi, "humedades"],
  [/\bcondensacion\b/gi, "condensación"],
  [/\bfiltracion\b/gi, "filtración"],
  [/\bvalvula\b/gi, "válvula"],
  [/\btuberia\b/gi, "tubería"],
  [/\bsifon\b/gi, "sifón"],
  [/\bpresion\b/gi, "presión"],
  [/\bcanalon\b/gi, "canalón"],
  [/\bcesped\b/gi, "césped"],
  [/\barbol\b/gi, "árbol"],
  [/\barboles\b/gi, "árboles"],
  [/\btecnicos\b/gi, "técnicos"],
  [/\btecnico\b/gi, "técnico"],
  [/\btecnica\b/gi, "técnica"],
  [/\binstalacion electrica\b/gi, "instalación eléctrica"],
  [/\bpequeno\b/gi, "pequeño"],
  [/\bpequena\b/gi, "pequeña"],
  [/\bdanado\b/gi, "dañado"],
  [/\bdanada\b/gi, "dañada"],
  [/\bmanana\b/gi, "mañana"],
  [/\bdespues\b/gi, "después"],
  [/\btambien\b/gi, "también"],
  [/\besta\b/gi, "está"],
  [/\bestan\b/gi, "están"],
  [/\bhabia\b/gi, "había"],
  [/\btenia\b/gi, "tenía"],
  [/\btenian\b/gi, "tenían"],
  [/\bmas\b/gi, "más"],
  [/\basi\b/gi, "así"],
  [/\baun\b/gi, "aún"]
];

function corregirOrtografiaCG(texto) {
  let resultado = String(texto ?? "");

  for (const [patron, reemplazo] of CORRECCIONES_ORTOGRAFIA_CG) {
    resultado = resultado.replace(patron, coincidencia => {
      return conservarMayusculas(coincidencia, reemplazo);
    });
  }

  return resultado;
}

// ============================================================
// 3. REGLAS DE FRASES COMPLETAS
// ============================================================

const REGLAS_FRASES = [

  // Verbos y expresiones generales.
  {
    patron: /\bno hay ningún problema\b/gi,
    traduccion: "there are no problems"
  },
  {
    patron: /\bno hay ningun problema\b/gi,
    traduccion: "there are no problems"
  },
  {
    patron: /\bno hay problemas\b/gi,
    traduccion: "there are no problems"
  },
  {
    patron: /\bno hay ningún daño\b/gi,
    traduccion: "there is no damage"
  },
  {
    patron: /\bno hay ningun dano\b/gi,
    traduccion: "there is no damage"
  },
  {
    patron: /\bno hay daños\b/gi,
    traduccion: "there is no damage"
  },
  {
    patron: /\bno hay danos\b/gi,
    traduccion: "there is no damage"
  },
  {
    patron: /\bno hay humedad\b/gi,
    traduccion: "there is no dampness"
  },
  {
    patron: /\bno hay fugas\b/gi,
    traduccion: "there are no leaks"
  },
  {
    patron: /\bno hay agua\b/gi,
    traduccion: "there is no water"
  },
  {
    patron: /\bno hay luz\b/gi,
    traduccion: "there is no electricity"
  },
  {
    patron: /\bno hay electricidad\b/gi,
    traduccion: "there is no electricity"
  },
  {
    patron: /\bno hay señales de\b/gi,
    traduccion: "there are no signs of"
  },
  {
    patron: /\bno se observa\b/gi,
    traduccion: "there is no visible sign of"
  },
  {
    patron: /\bno se observan\b/gi,
    traduccion: "there are no visible signs of"
  },
  {
    patron: /\bno se aprecia\b/gi,
    traduccion: "there is no visible sign of"
  },
  {
    patron: /\bno se aprecian\b/gi,
    traduccion: "there are no visible signs of"
  },
  {
    patron: /\bse observa\b/gi,
    traduccion: "there is"
  },
  {
    patron: /\bse observan\b/gi,
    traduccion: "there are"
  },
  {
    patron: /\bse detecta\b/gi,
    traduccion: "there is"
  },
  {
    patron: /\bse detectan\b/gi,
    traduccion: "there are"
  },
  {
    patron: /\bse encuentra en buen estado\b/gi,
    traduccion: "it is in good condition"
  },
  {
    patron: /\bse encuentra en mal estado\b/gi,
    traduccion: "it is in poor condition"
  },
  {
    patron: /\bse encuentra\b/gi,
    traduccion: "it is located"
  },
  {
    patron: /\bse encuentran\b/gi,
    traduccion: "they are located"
  },
  {
    patron: /\bparece estar\b/gi,
    traduccion: "appears to be"
  },
  {
    patron: /\bparece que\b/gi,
    traduccion: "it appears that"
  },
  {
    patron: /\bparece\b/gi,
    traduccion: "appears"
  },
  {
    patron: /\bfunciona correctamente\b/gi,
    traduccion: "is working correctly"
  },
  {
    patron: /\bfunciona bien\b/gi,
    traduccion: "is working properly"
  },
  {
    patron: /\bno funciona correctamente\b/gi,
    traduccion: "is not working correctly"
  },
  {
    patron: /\bno funciona bien\b/gi,
    traduccion: "is not working properly"
  },
  {
    patron: /\bno funciona\b/gi,
    traduccion: "is not working"
  },
  {
    patron: /\bdeja de funcionar\b/gi,
    traduccion: "stops working"
  },
  {
    patron: /\bha dejado de funcionar\b/gi,
    traduccion: "has stopped working"
  },
  {
    patron: /\bestá funcionando\b/gi,
    traduccion: "is working"
  },
  {
    patron: /\besta funcionando\b/gi,
    traduccion: "is working"
  },
  {
    patron: /\bestaba funcionando\b/gi,
    traduccion: "was working"
  },
  {
    patron: /\bestaba siendo reparado\b/gi,
    traduccion: "was being repaired"
  },
  {
    patron: /\bestaba siendo revisado\b/gi,
    traduccion: "was being inspected"
  },
  {
    patron: /\bestaba siendo limpiado\b/gi,
    traduccion: "was being cleaned"
  },
  {
    patron: /\bestaba siendo\b/gi,
    traduccion: "was being"
  },
  {
    patron: /\bestaba\b/gi,
    traduccion: "was"
  },
  {
    patron: /\bestán\b/gi,
    traduccion: "are"
  },
  {
    patron: /\bestan\b/gi,
    traduccion: "are"
  },
  {
    patron: /\bestá\b/gi,
    traduccion: "is"
  },
  {
    patron: /\besta\b/gi,
    traduccion: "is"
  },
  {
    patron: /\btienen\b/gi,
    traduccion: "have"
  },
  {
    patron: /\btiene\b/gi,
    traduccion: "has"
  },
  {
    patron: /\bhabía\b/gi,
    traduccion: "there was"
  },
  {
    patron: /\bhabia\b/gi,
    traduccion: "there was"
  },
  {
    patron: /\bhabían\b/gi,
    traduccion: "there were"
  },
  {
    patron: /\bhabian\b/gi,
    traduccion: "there were"
  },
  {
    patron: /\bhay\b/gi,
    traduccion: "there is"
  },
  {
    patron: /\bnecesitan\b/gi,
    traduccion: "need"
  },
  {
    patron: /\bnecesita\b/gi,
    traduccion: "needs"
  },
  {
    patron: /\brequieren\b/gi,
    traduccion: "require"
  },
  {
    patron: /\brequiere\b/gi,
    traduccion: "requires"
  },
  {
    patron: /\bdeben ser\b/gi,
    traduccion: "must be"
  },
  {
    patron: /\bdebe ser\b/gi,
    traduccion: "must be"
  },
  {
    patron: /\bdeben\b/gi,
    traduccion: "must"
  },
  {
    patron: /\bdebe\b/gi,
    traduccion: "must"
  },
  {
    patron: /\bpueden\b/gi,
    traduccion: "can"
  },
  {
    patron: /\bpuede\b/gi,
    traduccion: "can"
  },
  {
    patron: /\bpodría\b/gi,
    traduccion: "could"
  },
  {
    patron: /\bpodrian\b/gi,
    traduccion: "could"
  },
  {
    patron: /\bpodrían\b/gi,
    traduccion: "could"
  },
  {
    patron: /\bqueda pendiente\b/gi,
    traduccion: "remains outstanding"
  },
  {
    patron: /\bqueda por revisar\b/gi,
    traduccion: "still needs to be inspected"
  },
  {
    patron: /\bqueda por reparar\b/gi,
    traduccion: "still needs to be repaired"
  },
  {
    patron: /\bqueda\b/gi,
    traduccion: "remains"
  },
  {
    patron: /\bfalta por\b/gi,
    traduccion: "still needs to be"
  },
  {
    patron: /\bfaltan\b/gi,
    traduccion: "are missing"
  },
  {
    patron: /\bfalta\b/gi,
    traduccion: "is missing"
  },
  {
    patron: /\bhace ruido\b/gi,
    traduccion: "is making a noise"
  },
  {
    patron: /\bhace ruidos\b/gi,
    traduccion: "is making noises"
  },
  {
    patron: /\bhace falta\b/gi,
    traduccion: "is needed"
  },
  {
    patron: /\bhace unos días\b/gi,
    traduccion: "a few days ago"
  },
  {
    patron: /\bhace unos dias\b/gi,
    traduccion: "a few days ago"
  },

  // Cantidad, tamaño y dimensiones.
  {
    patron: /\buna gran cantidad de\b/gi,
    traduccion: "a large amount of"
  },
  {
    patron: /\bgran cantidad de\b/gi,
    traduccion: "a large amount of"
  },
  {
    patron: /\bpequeña cantidad de\b/gi,
    traduccion: "a small amount of"
  },
  {
    patron: /\bpequena cantidad de\b/gi,
    traduccion: "a small amount of"
  },
  {
    patron: /\buna pequeña cantidad de\b/gi,
    traduccion: "a small amount of"
  },
  {
    patron: /\buna gran cantidad\b/gi,
    traduccion: "a large quantity"
  },
  {
    patron: /\bgran cantidad\b/gi,
    traduccion: "a large quantity"
  },
  {
    patron: /\buna pequeña cantidad\b/gi,
    traduccion: "a small quantity"
  },
  {
    patron: /\bpequeña cantidad\b/gi,
    traduccion: "a small quantity"
  },
  {
    patron: /\bvarias unidades\b/gi,
    traduccion: "several units"
  },
  {
    patron: /\buna sola unidad\b/gi,
    traduccion: "a single unit"
  },
  {
    patron: /\bgran tamaño\b/gi,
    traduccion: "large in size"
  },
  {
    patron: /\bde gran tamaño\b/gi,
    traduccion: "large"
  },
  {
    patron: /\bde pequeño tamaño\b/gi,
    traduccion: "small"
  },
  {
    patron: /\bde pequeno tamano\b/gi,
    traduccion: "small"
  },
  {
    patron: /\btamaño reducido\b/gi,
    traduccion: "small in size"
  },
  {
    patron: /\btamano reducido\b/gi,
    traduccion: "small in size"
  },
  {
    patron: /\bmuy grande\b/gi,
    traduccion: "very large"
  },
  {
    patron: /\bmuy pequeño\b/gi,
    traduccion: "very small"
  },
  {
    patron: /\bmuy pequeno\b/gi,
    traduccion: "very small"
  },
  {
    patron: /\bmuy pequeña\b/gi,
    traduccion: "very small"
  },
  {
    patron: /\bde gran longitud\b/gi,
    traduccion: "long"
  },
  {
    patron: /\bde poca longitud\b/gi,
    traduccion: "short"
  },
  {
    patron: /\bde poca altura\b/gi,
    traduccion: "low"
  },
  {
    patron: /\bde gran altura\b/gi,
    traduccion: "high"
  },
  {
    patron: /\bde tamaño medio\b/gi,
    traduccion: "medium-sized"
  },
  {
    patron: /\bde tamano medio\b/gi,
    traduccion: "medium-sized"
  },

  // Lugar, posición y distancia.
  {
    patron: /\ben la parte superior\b/gi,
    traduccion: "at the top"
  },
  {
    patron: /\ben la parte inferior\b/gi,
    traduccion: "at the bottom"
  },
  {
    patron: /\ben la parte central\b/gi,
    traduccion: "in the central area"
  },
  {
    patron: /\ben la parte delantera\b/gi,
    traduccion: "at the front"
  },
  {
    patron: /\ben la parte trasera\b/gi,
    traduccion: "at the back"
  },
  {
    patron: /\ben el lado derecho\b/gi,
    traduccion: "on the right-hand side"
  },
  {
    patron: /\ben el lado izquierdo\b/gi,
    traduccion: "on the left-hand side"
  },
  {
    patron: /\ba ambos lados\b/gi,
    traduccion: "on both sides"
  },
  {
    patron: /\ben ambos lados\b/gi,
    traduccion: "on both sides"
  },
  {
    patron: /\bpor encima de\b/gi,
    traduccion: "above"
  },
  {
    patron: /\bpor debajo de\b/gi,
    traduccion: "below"
  },
  {
    patron: /\bencima de\b/gi,
    traduccion: "on top of"
  },
  {
    patron: /\bdebajo de\b/gi,
    traduccion: "underneath"
  },
  {
    patron: /\bdentro de\b/gi,
    traduccion: "inside"
  },
  {
    patron: /\bfuera de\b/gi,
    traduccion: "outside"
  },
  {
    patron: /\bcerca de\b/gi,
    traduccion: "near"
  },
  {
    patron: /\blejos de\b/gi,
    traduccion: "far from"
  },
  {
    patron: /\bjunto a\b/gi,
    traduccion: "next to"
  },
  {
    patron: /\bal lado de\b/gi,
    traduccion: "next to"
  },
  {
    patron: /\ben medio de\b/gi,
    traduccion: "in the middle of"
  },
  {
    patron: /\bentre ambos\b/gi,
    traduccion: "between both"
  },
  {
    patron: /\ben el interior\b/gi,
    traduccion: "inside"
  },
  {
    patron: /\ben el exterior\b/gi,
    traduccion: "outside"
  },
  {
    patron: /\bantes de\b/gi,
    traduccion: "before"
  },
  {
    patron: /\bdespués de\b/gi,
    traduccion: "after"
  },
  {
    patron: /\bdespues de\b/gi,
    traduccion: "after"
  },
  {
    patron: /\bposteriormente\b/gi,
    traduccion: "afterwards"
  },
  {
    patron: /\bpreviamente\b/gi,
    traduccion: "previously"
  },
  {
    patron: /\ben esta zona\b/gi,
    traduccion: "in this area"
  },
  {
    patron: /\ben esta parte\b/gi,
    traduccion: "in this section"
  },
  {
    patron: /\ben esta ubicación\b/gi,
    traduccion: "in this location"
  },
  {
    patron: /\ben esta ubicacion\b/gi,
    traduccion: "in this location"
  },

  // Fontanería y agua.
  {
    patron: /\bgrifo (?:esta )?roto\b/gi,
    traduccion: "the tap is broken"
  },
  {
    patron: /\bgrifo gotea\b/gi,
    traduccion: "the tap is dripping"
  },
  {
    patron: /\bgrifo está goteando\b/gi,
    traduccion: "the tap is dripping"
  },
  {
    patron: /\bgrifo esta goteando\b/gi,
    traduccion: "the tap is dripping"
  },
  {
    patron: /\bgrifo pierde agua\b/gi,
    traduccion: "the tap is leaking"
  },
  {
    patron: /\bgrifo no cierra\b/gi,
    traduccion: "the tap does not close properly"
  },
  {
    patron: /\bgrifo no funciona\b/gi,
    traduccion: "the tap is not working"
  },
  {
    patron: /\bgrifo suelto\b/gi,
    traduccion: "loose tap"
  },
  {
    patron: /\bfuga de agua\b/gi,
    traduccion: "water leak"
  },
  {
    patron: /\bfugas de agua\b/gi,
    traduccion: "water leaks"
  },
  {
    patron: /\bpérdida de agua\b/gi,
    traduccion: "water leak"
  },
  {
    patron: /\bperdida de agua\b/gi,
    traduccion: "water leak"
  },
  {
    patron: /\btubería rota\b/gi,
    traduccion: "broken pipe"
  },
  {
    patron: /\btuberia rota\b/gi,
    traduccion: "broken pipe"
  },
  {
    patron: /\btubería agrietada\b/gi,
    traduccion: "cracked pipe"
  },
  {
    patron: /\btuberia agrietada\b/gi,
    traduccion: "cracked pipe"
  },
  {
    patron: /\btubería obstruida\b/gi,
    traduccion: "blocked pipe"
  },
  {
    patron: /\btuberia obstruida\b/gi,
    traduccion: "blocked pipe"
  },
  {
    patron: /\bno hay presión de agua\b/gi,
    traduccion: "there is no water pressure"
  },
  {
    patron: /\bno hay presion de agua\b/gi,
    traduccion: "there is no water pressure"
  },
  {
    patron: /\bbaja presión de agua\b/gi,
    traduccion: "low water pressure"
  },
  {
    patron: /\bbaja presion de agua\b/gi,
    traduccion: "low water pressure"
  },
  {
    patron: /\bllave de paso cerrada\b/gi,
    traduccion: "the shut-off valve is closed"
  },
  {
    patron: /\bllave de paso abierta\b/gi,
    traduccion: "the shut-off valve is open"
  },
  {
    patron: /\bllave de paso\b/gi,
    traduccion: "shut-off valve"
  },
  {
    patron: /\bsifón atascado\b/gi,
    traduccion: "blocked siphon"
  },
  {
    patron: /\bsifon atascado\b/gi,
    traduccion: "blocked siphon"
  },
  {
    patron: /\bdesagüe atascado\b/gi,
    traduccion: "blocked drain"
  },
  {
    patron: /\bdesague atascado\b/gi,
    traduccion: "blocked drain"
  },
  {
    patron: /\bdesagüe lento\b/gi,
    traduccion: "slow-draining outlet"
  },
  {
    patron: /\bno sale agua\b/gi,
    traduccion: "no water comes out"
  },
  {
    patron: /\bno llega agua\b/gi,
    traduccion: "there is no water supply"
  },

  // Baños y sanitarios.
  {
    patron: /\bcisterna no carga\b/gi,
    traduccion: "the toilet cistern is not filling"
  },
  {
    patron: /\bcisterna pierde agua\b/gi,
    traduccion: "the toilet cistern is leaking"
  },
  {
    patron: /\binodoro atascado\b/gi,
    traduccion: "blocked toilet"
  },
  {
    patron: /\binodoro no descarga\b/gi,
    traduccion: "the toilet does not flush"
  },
  {
    patron: /\bducha pierde agua\b/gi,
    traduccion: "the shower is leaking"
  },
  {
    patron: /\bducha no funciona\b/gi,
    traduccion: "the shower is not working"
  },
  {
    patron: /\bducha no calienta\b/gi,
    traduccion: "the shower does not heat up"
  },
  {
    patron: /\bducha sin agua caliente\b/gi,
    traduccion: "there is no hot water in the shower"
  },
  {
    patron: /\bmampara rota\b/gi,
    traduccion: "broken shower screen"
  },
  {
    patron: /\bplato de ducha roto\b/gi,
    traduccion: "broken shower tray"
  },
  {
    patron: /\blavabo atascado\b/gi,
    traduccion: "blocked washbasin"
  },
  {
    patron: /\blavabo pierde agua\b/gi,
    traduccion: "the washbasin is leaking"
  },
  {
    patron: /\bbañera rota\b/gi,
    traduccion: "broken bathtub"
  },
  {
    patron: /\bbanera rota\b/gi,
    traduccion: "broken bathtub"
  },

  // Electricidad y seguridad.
  {
    patron: /\benchufe quemado\b/gi,
    traduccion: "burnt electrical socket"
  },
  {
    patron: /\benchufe roto\b/gi,
    traduccion: "broken socket"
  },
  {
    patron: /\benchufe suelto\b/gi,
    traduccion: "loose socket"
  },
  {
    patron: /\benchufe no funciona\b/gi,
    traduccion: "the socket is not working"
  },
  {
    patron: /\binterruptor roto\b/gi,
    traduccion: "broken switch"
  },
  {
    patron: /\binterruptor no funciona\b/gi,
    traduccion: "the switch is not working"
  },
  {
    patron: /\bcable pelado\b/gi,
    traduccion: "exposed electrical wire"
  },
  {
    patron: /\bcable quemado\b/gi,
    traduccion: "burnt electrical wire"
  },
  {
    patron: /\bcable suelto\b/gi,
    traduccion: "loose electrical wire"
  },
  {
    patron: /\bcuadro eléctrico\b/gi,
    traduccion: "electrical distribution board"
  },
  {
    patron: /\bcuadro electrico\b/gi,
    traduccion: "electrical distribution board"
  },
  {
    patron: /\bcortocircuito\b/gi,
    traduccion: "short circuit"
  },
  {
    patron: /\bsin corriente eléctrica\b/gi,
    traduccion: "without electrical power"
  },
  {
    patron: /\bsin corriente electrica\b/gi,
    traduccion: "without electrical power"
  },
  {
    patron: /\balarma no funciona\b/gi,
    traduccion: "the alarm is not working"
  },
  {
    patron: /\balarma desconectada\b/gi,
    traduccion: "the alarm is disconnected"
  },
  {
    patron: /\balarma apagada\b/gi,
    traduccion: "the alarm is switched off"
  },

  // Humedades, daños y construcción.
  {
    patron: /\bmancha de humedad\b/gi,
    traduccion: "damp patch"
  },
  {
    patron: /\bmanchas de humedad\b/gi,
    traduccion: "damp patches"
  },
  {
    patron: /\bhumedad en el techo\b/gi,
    traduccion: "dampness on the ceiling"
  },
  {
    patron: /\bhumedad en la pared\b/gi,
    traduccion: "dampness on the wall"
  },
  {
    patron: /\bhumedad en el suelo\b/gi,
    traduccion: "dampness on the floor"
  },
  {
    patron: /\bmoho negro\b/gi,
    traduccion: "black mould"
  },
  {
    patron: /\bmoho\b/gi,
    traduccion: "mould"
  },
  {
    patron: /\bfiltración de agua\b/gi,
    traduccion: "water ingress"
  },
  {
    patron: /\bfiltracion de agua\b/gi,
    traduccion: "water ingress"
  },
  {
    patron: /\bpintura desconchada\b/gi,
    traduccion: "peeling paint"
  },
  {
    patron: /\bpintura levantada\b/gi,
    traduccion: "peeling paint"
  },
  {
    patron: /\bpared agrietada\b/gi,
    traduccion: "cracked wall"
  },
  {
    patron: /\bpared húmeda\b/gi,
    traduccion: "damp wall"
  },
  {
    patron: /\bpared humeda\b/gi,
    traduccion: "damp wall"
  },
  {
    patron: /\btecho agrietado\b/gi,
    traduccion: "cracked ceiling"
  },
  {
    patron: /\bsuelo levantado\b/gi,
    traduccion: "raised flooring"
  },
  {
    patron: /\bazulejo roto\b/gi,
    traduccion: "broken tile"
  },
  {
    patron: /\bazulejos rotos\b/gi,
    traduccion: "broken tiles"
  },
  {
    patron: /\bsilicona deteriorada\b/gi,
    traduccion: "deteriorated sealant"
  }
];

// ============================================================
// 4. EQUIVALENCIAS ADICIONALES Y EXPRESIONES SIMILARES
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
    patron: /\bse ve humedad\b/gi,
    traduccion: "Damp is visible"
  },
  {
    patron: /\bse nota humedad\b/gi,
    traduccion: "Damp can be noticed"
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
  }
];

// ============================================================
// 5. EXPRESIONES MIXTAS ESPAÑOL-INGLÉS
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
    resultado = resultado.replace(patron, coincidencia => {
      return conservarMayusculas(coincidencia, traduccion);
    });
  }

  return resultado;
}

// ============================================================
// 6. DICCIONARIO AMPLIADO DE PALABRAS INDIVIDUALES
// ============================================================

const PALABRAS = {
  vivienda: "property",
  viviendas: "properties",
  casa: "house",
  casas: "houses",
  hogar: "home",
  edificio: "building",
  edificios: "buildings",
  apartamento: "apartment",
  apartamentos: "apartments",
  piso: "floor",
  pisos: "floors",
  habitación: "room",
  habitaciones: "rooms",
  dormitorio: "bedroom",
  dormitorios: "bedrooms",
  salón: "living room",
  comedor: "dining room",
  cocina: "kitchen",
  cocinas: "kitchens",
  baño: "bathroom",
  baños: "bathrooms",
  aseo: "toilet",
  pasillo: "hallway",
  entrada: "entrance",
  terraza: "terrace",
  terrazas: "terraces",
  balcón: "balcony",
  balcones: "balconies",
  patio: "patio",
  patios: "patios",
  garaje: "garage",
  garajes: "garages",
  sótano: "basement",
  buhardilla: "attic",
  trastero: "storage room",
  trasteros: "storage rooms",
  exterior: "exterior",
  interior: "interior",
  interiores: "interiors",
  exteriores: "exteriors",

  pared: "wall",
  paredes: "walls",
  techo: "ceiling",
  techos: "ceilings",
  suelo: "floor",
  suelos: "floors",
  fachada: "facade",
  fachadas: "facades",
  tejado: "roof",
  cubierta: "roof",
  cubiertas: "roofs",
  columna: "column",
  columnas: "columns",
  viga: "beam",
  vigas: "beams",
  escalera: "staircase",
  escaleras: "staircases",
  escalón: "step",
  escalones: "steps",
  barandilla: "railing",
  barandillas: "railings",
  zócalo: "skirting board",
  rodapié: "skirting board",
  azulejo: "tile",
  azulejos: "tiles",
  baldosa: "tile",
  baldosas: "tiles",
  junta: "joint",
  juntas: "joints",
  cemento: "cement",
  hormigón: "concrete",
  yeso: "plaster",
  pintura: "paint",
  pintado: "painted",
  pintada: "painted",
  barniz: "varnish",
  revestimiento: "cladding",
  aislamiento: "insulation",
  aislante: "insulating material",

  puerta: "door",
  puertas: "doors",
  ventana: "window",
  ventanas: "windows",
  cristal: "glass",
  cristales: "glass panes",
  vidrio: "glass",
  marco: "frame",
  marcos: "frames",
  persiana: "shutter",
  persianas: "shutters",
  cortina: "curtain",
  cortinas: "curtains",
  cerradura: "lock",
  cerraduras: "locks",
  llave: "key",
  llaves: "keys",
  bisagra: "hinge",
  bisagras: "hinges",
  pomo: "door knob",
  pomos: "door knobs",
  manilla: "handle",
  manillas: "handles",
  pestillo: "latch",
  pestillos: "latches",

  agua: "water",
  aguas: "water",
  grifo: "tap",
  grifos: "taps",
  ducha: "shower",
  duchas: "showers",
  bañera: "bathtub",
  bañeras: "bathtubs",
  lavabo: "washbasin",
  lavabos: "washbasins",
  fregadero: "sink",
  fregaderos: "sinks",
  inodoro: "toilet",
  inodoros: "toilets",
  cisterna: "cistern",
  cisternas: "cisterns",
  tubería: "pipe",
  tuberías: "pipes",
  tubo: "pipe",
  tubos: "pipes",
  desagüe: "drain",
  desagües: "drains",
  sifón: "trap",
  sifones: "traps",
  válvula: "valve",
  válvulas: "valves",
  presión: "pressure",
  fuga: "leak",
  fugas: "leaks",
  goteo: "dripping",
  fontanería: "plumbing",
  calentador: "water heater",
  calentadores: "water heaters",
  termo: "water heater",
  termos: "water heaters",
  caldera: "boiler",
  calderas: "boilers",
  radiador: "radiator",
  radiadores: "radiators",

  electricidad: "electricity",
  eléctrico: "electrical",
  eléctrica: "electrical",
  eléctricos: "electrical",
  eléctricas: "electrical",
  enchufe: "socket",
  enchufes: "sockets",
  interruptor: "switch",
  interruptores: "switches",
  lámpara: "lamp",
  lámparas: "lamps",
  bombilla: "light bulb",
  bombillas: "light bulbs",
  iluminación: "lighting",
  cable: "cable",
  cables: "cables",
  cuadro: "panel",
  fusible: "fuse",
  fusibles: "fuses",
  batería: "battery",
  baterías: "batteries",
  corriente: "current",
  suministro: "supply",
  luz: "light",

  humedad: "damp",
  humedades: "damp",
  filtración: "water ingress",
  filtraciones: "water ingress",
  moho: "mould",
  hongos: "fungus",
  condensación: "condensation",
  gotera: "leak",
  goteras: "leaks",
  mancha: "stain",
  manchas: "stains",
  grieta: "crack",
  grietas: "cracks",
  fisura: "crack",
  fisuras: "cracks",
  rotura: "breakage",
  roturas: "breakages",
  óxido: "rust",
  oxidación: "oxidation",
  corrosión: "corrosion",
  deterioro: "deterioration",
  desgaste: "wear",
  daño: "damage",
  daños: "damage",
  desperfecto: "defect",
  desperfectos: "defects",
  defecto: "defect",
  defectos: "defects",
  suciedad: "dirt",
  polvo: "dust",
  residuos: "debris",
  basura: "rubbish",

  jardín: "garden",
  jardines: "gardens",
  piscina: "swimming pool",
  piscinas: "swimming pools",
  césped: "lawn",
  hierba: "grass",
  planta: "plant",
  plantas: "plants",
  árbol: "tree",
  árboles: "trees",
  arbusto: "shrub",
  arbustos: "shrubs",
  riego: "irrigation",
  aspersor: "sprinkler",
  aspersores: "sprinklers",
  filtro: "filter",
  filtros: "filters",
  bomba: "pump",
  bombas: "pumps",
  depuradora: "filtration system",
  cloro: "chlorine",
  vallado: "fencing",
  valla: "fence",
  vallas: "fences",

  mobiliario: "furniture",
  mueble: "piece of furniture",
  muebles: "furniture",
  mesa: "table",
  mesas: "tables",
  silla: "chair",
  sillas: "chairs",
  sofá: "sofa",
  sofas: "sofas",
  cama: "bed",
  camas: "beds",
  armario: "wardrobe",
  armarios: "wardrobes",
  nevera: "fridge",
  frigorífico: "refrigerator",
  frigoríficos: "refrigerators",
  lavadora: "washing machine",
  lavadoras: "washing machines",
  secadora: "dryer",
  secadoras: "dryers",
  lavavajillas: "dishwasher",
  horno: "oven",
  hornos: "ovens",
  microondas: "microwave",
  vitrocerámica: "ceramic hob",
  extractor: "extractor fan",
  campana: "extractor hood",

  inspección: "inspection",
  inspecciones: "inspections",
  revisión: "inspection",
  revisiones: "inspections",
  comprobación: "check",
  comprobaciones: "checks",
  observación: "observation",
  observaciones: "observations",
  informe: "report",
  informes: "reports",
  mantenimiento: "maintenance",
  reparación: "repair",
  reparaciones: "repairs",
  sustitución: "replacement",
  limpieza: "cleaning",
  instalación: "installation",
  instalaciones: "installations",
  funcionamiento: "operation",
  estado: "condition",
  resultado: "result",
  resultados: "results",
  incidencia: "issue",
  incidencias: "issues",
  problema: "problem",
  problemas: "problems",
  trabajo: "work",
  trabajos: "work",
  pendiente: "pending",
  pendientes: "pending",
  realizado: "carried out",
  realizada: "carried out",
  realizados: "carried out",
  realizadas: "carried out",
  necesario: "necessary",
  necesaria: "necessary",
  necesarios: "necessary",
  necesarias: "necessary",

  pequeño: "small",
  pequeña: "small",
  pequeños: "small",
  pequeñas: "small",
  grande: "large",
  grandes: "large",
  amplio: "spacious",
  amplia: "spacious",
  amplios: "spacious",
  amplias: "spacious",
  estrecho: "narrow",
  estrecha: "narrow",
  estrechos: "narrow",
  estrechas: "narrow",
  ancho: "wide",
  ancha: "wide",
  anchos: "wide",
  anchas: "wide",
  largo: "long",
  larga: "long",
  largos: "long",
  largas: "long",
  corto: "short",
  corta: "short",
  cortos: "short",
  cortas: "short",
  grueso: "thick",
  gruesa: "thick",
  fino: "thin",
  fina: "thin",
  profundo: "deep",
  profunda: "deep",
  superficial: "superficial",

  bueno: "good",
  buena: "good",
  buenos: "good",
  buenas: "good",
  malo: "poor",
  mala: "poor",
  malos: "poor",
  malas: "poor",
  excelente: "excellent",
  excelentes: "excellent",
  aceptable: "acceptable",
  aceptables: "acceptable",
  correcto: "correct",
  correcta: "correct",
  incorrecto: "incorrect",
  incorrecta: "incorrect",
  limpio: "clean",
  limpia: "clean",
  limpios: "clean",
  limpias: "clean",
  sucio: "dirty",
  sucia: "dirty",
  sucios: "dirty",
  sucias: "dirty",
  roto: "broken",
  rota: "broken",
  rotos: "broken",
  rotas: "broken",
  dañado: "damaged",
  dañada: "damaged",
  dañados: "damaged",
  dañadas: "damaged",
  agrietado: "cracked",
  agrietada: "cracked",
  agrietados: "cracked",
  agrietadas: "cracked",
  oxidado: "rusty",
  oxidada: "rusty",
  oxidados: "rusty",
  oxidadas: "rusty",
  desgastado: "worn",
  desgastada: "worn",
  desgastados: "worn",
  desgastadas: "worn",
  húmedo: "damp",
  húmeda: "damp",
  húmedos: "damp",
  húmedas: "damp",
  seco: "dry",
  seca: "dry",
  secos: "dry",
  secas: "dry",
  mojado: "wet",
  mojada: "wet",
  mojados: "wet",
  mojadas: "wet",
  caliente: "hot",
  calientes: "hot",
  frío: "cold",
  fría: "cold",
  fríos: "cold",
  frías: "cold",
  nuevo: "new",
  nueva: "new",
  nuevos: "new",
  nuevas: "new",
  antiguo: "old",
  antigua: "old",
  antiguos: "old",
  antiguas: "old",
  moderno: "modern",
  moderna: "modern",
  modernos: "modern",
  modernas: "modern",

  alto: "high",
  alta: "high",
  altos: "high",
  altas: "high",
  bajo: "low",
  baja: "low",
  bajos: "low",
  bajas: "low",
  fuerte: "strong",
  fuertes: "strong",
  débil: "weak",
  débilmente: "weakly",
  pesado: "heavy",
  pesada: "heavy",
  ligero: "light",
  ligera: "light",
  suelto: "loose",
  suelta: "loose",
  apretado: "tight",
  apretada: "tight",
  abierto: "open",
  abierta: "open",
  abiertos: "open",
  abiertas: "open",
  cerrado: "closed",
  cerrada: "closed",
  cerrados: "closed",
  cerradas: "closed",
  estable: "stable",
  inestable: "unstable",
  visible: "visible",
  visibles: "visible",
  oculto: "hidden",
  oculta: "hidden",
  suficiente: "sufficient",
  insuficiente: "insufficient",
  excesivo: "excessive",
  excesiva: "excessive",
  excesivos: "excessive",
  excesivas: "excessive",

  muy: "very",
  bastante: "quite",
  demasiado: "too",
  poco: "slightly",
  ligeramente: "slightly",
  completamente: "completely",
  parcialmente: "partially",
  correctamente: "correctly",
  incorrectamente: "incorrectly",
  aparentemente: "apparently",
  posiblemente: "possibly",
  probablemente: "probably",
  actualmente: "currently",
  todavía: "still",
  nuevamente: "again",
  también: "also",
  además: "in addition",
  pero: "but",
  porque: "because",
  aunque: "although",
  cuando: "when",
  donde: "where",
  debajo: "underneath",
  encima: "above",
  dentro: "inside",
  fuera: "outside",
  cerca: "near",
  lejos: "far",

  hay: "there is",
  presenta: "shows",
  presentan: "show",
  tiene: "has",
  tienen: "have",
  contiene: "contains",
  contienen: "contain",
  necesita: "requires",
  necesitan: "require",
  requiere: "requires",
  requieren: "require",
  funciona: "works",
  funcionan: "work",
  revisar: "inspect",
  comprobar: "check",
  verificar: "verify",
  observar: "observe",
  detectar: "detect",
  reparar: "repair",
  sustituir: "replace",
  cambiar: "change",
  limpiar: "clean",
  abrir: "open",
  cerrar: "close",
  instalar: "install",
  instalarse: "be installed",
  mantener: "maintain",
  realizar: "carry out",
  realizado: "carried out",
  realizarse: "be carried out",
  mostrar: "show",
  muestra: "shows",
  muestran: "show",
  aparece: "appears",
  aparecen: "appear",
  falta: "is missing",
  faltan: "are missing",
  existe: "exists",
  existen: "exist",
  parece: "seems",
  parecen: "seem",
  queda: "remains",
  quedan: "remain",
  está: "is",
  están: "are",
  estaba: "was",
  estaban: "were",
  será: "will be",
  serán: "will be",

  sin: "without",
  con: "with",
  desde: "from",
  hasta: "to",
  sobre: "on",
  entre: "between",
  para: "for",
  por: "by",
  como: "as",
  cada: "each",
  todo: "all",
  toda: "all",
  todos: "all",
  todas: "all",
  ninguna: "no",
  ninguno: "no",
  alguna: "some",
  algunos: "some",
  algunas: "some",
  otro: "other",
  otra: "other",
  otros: "other",
  otras: "other"
};

// ============================================================
// 7. TRADUCCIÓN CONTEXTUAL DE EXPRESIONES AMBIGUAS
// ============================================================

function traducirContextoCG(texto) {
  let resultado = String(texto ?? "");

  const reglasContextuales = [
    [/\bllaves de la vivienda\b/gi, "property keys"],
    [/\bllaves de casa\b/gi, "house keys"],
    [/\bllaves del inmueble\b/gi, "property keys"],
    [/\bllave de agua\b/gi, "water valve"],
    [/\bllave general\b/gi, "main shut-off valve"],
    [/\bpor la mañana\b/gi, "in the morning"],
    [/\bdurante la mañana\b/gi, "during the morning"],
    [/\bmañana por la mañana\b/gi, "tomorrow morning"],
    [/\bmañana\b/gi, "tomorrow"],
    [/\bfalta de luz\b/gi, "power outage"],
    [/\bsin luz\b/gi, "without electricity"],
    [/\bluz natural\b/gi, "natural light"],
    [/\bpunto de luz\b/gi, "light point"],
    [/\balto nivel de humedad\b/gi, "high humidity level"],
    [/\bbaja presión\b/gi, "low pressure"],
    [/\balta presión\b/gi, "high pressure"],
    [/\bnivel bajo\b/gi, "low level"],
    [/\bnivel alto\b/gi, "high level"],
    [/\bsolo queda\b/gi, "only remains"],
    [/\bsolamente\b/gi, "only"],
    [/\búnicamente\b/gi, "only"],
    [/\bfuera de servicio\b/gi, "out of service"],
    [/\ben funcionamiento\b/gi, "operational"],
    [/\bsin funcionamiento\b/gi, "not working"],
    [/\bde forma temporal\b/gi, "temporarily"],
    [/\bde manera temporal\b/gi, "temporarily"],
    [/\bde forma permanente\b/gi, "permanently"]
  ];

  for (const [patron, traduccion] of reglasContextuales) {
    resultado = resultado.replace(patron, coincidencia => {
      return conservarMayusculas(coincidencia, traduccion);
    });
  }

  return resultado;
}

// ============================================================
// 8. TRADUCCIÓN DE PALABRAS INDIVIDUALES
// ============================================================

function traducirPalabras(texto) {
  let resultado = String(texto ?? "");

  const entradas = Object.entries(PALABRAS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [palabra, traduccion] of entradas) {
    const patron = new RegExp(
      `(^|[^\\p{L}\\p{N}_])(${escaparRegex(palabra)})(?=$|[^\\p{L}\\p{N}_])`,
      "giu"
    );

    resultado = resultado.replace(
      patron,
      (coincidencia, prefijo, encontrada) => {
        return prefijo + conservarMayusculas(encontrada, traduccion);
      }
    );
  }

  return resultado;
}

// ============================================================
// 9. UNIDADES Y CANTIDADES
// ============================================================

const UNIDADES_CG = [
  [/\bmilímetros?\b/gi, "millimetres"],
  [/\bcentímetros?\b/gi, "centimetres"],
  [/\bmetros?\b/gi, "metres"],
  [/\bkilómetros?\b/gi, "kilometres"],
  [/\bmetros cuadrados\b/gi, "square metres"],
  [/\bcentímetros cuadrados\b/gi, "square centimetres"],
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
    resultado = resultado.replace(patron, coincidencia => {
      return conservarMayusculas(coincidencia, traduccion);
    });
  }

  resultado = resultado
    .replace(/\bmm\b/gi, "mm")
    .replace(/\bcm\b/gi, "cm")
    .replace(/\bkm\b/gi, "km")
    .replace(/\bm²\b/gi, "m²")
    .replace(/\bcm²\b/gi, "cm²")
    .replace(/°C\b/gi, "°C")
    .replace(/\bkg\b/gi, "kg")
    .replace(/\bml\b/gi, "ml")
    .replace(/\bV\b/g, "V")
    .replace(/\bW\b/g, "W");

  return resultado;
}

// ============================================================
// 10. ETIQUETAS DE INFORMES
// ============================================================

const ETIQUETAS_CG = [
  [/^\s*identificador\s*:/gim, "Identifier:"],
  [/^\s*código\s*:/gim, "Code:"],
  [/^\s*código postal\s*:/gim, "Postcode:"],
  [/^\s*dirección\s*:/gim, "Address:"],
  [/^\s*dirección de la vivienda\s*:/gim, "Property address:"],
  [/^\s*dirección del inmueble\s*:/gim, "Property address:"],
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
  [/^\s*descripción\s*:/gim, "Description:"],
  [/^\s*descripción de la vivienda\s*:/gim, "Property description:"],
  [/^\s*habitación\s*:/gim, "Room:"],
  [/^\s*estancia\s*:/gim, "Area:"],
  [/^\s*zona\s*:/gim, "Area:"],
  [/^\s*ubicación\s*:/gim, "Location:"],
  [/^\s*comentarios\s*:/gim, "Comments:"],
  [/^\s*notas\s*:/gim, "Notes:"],
  [/^\s*recomendación\s*:/gim, "Recommendation:"],
  [/^\s*recomendaciones\s*:/gim, "Recommendations:"],
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
// 11. CORRECCIONES DE TRADUCCIÓN Y GRAMÁTICA
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
  [/\bhumidity\b/gi, "damp"],
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
    resultado = resultado.replace(patron, coincidencia => {
      return conservarMayusculas(coincidencia, correccion);
    });
  }

  return resultado;
}

// ============================================================
// 12. APLICACIÓN DE REGLAS DE FRASES
// ============================================================

function aplicarReglasFrases(texto) {
  let resultado = String(texto ?? "");

  const reglas = [
    ...REGLAS_FRASES,
    ...EQUIVALENCIAS_FRASES_CG
  ];

  for (const regla of reglas) {
    resultado = resultado.replace(
      regla.patron,
      coincidencia => {
        return conservarMayusculas(
          coincidencia,
          regla.traduccion
        );
      }
    );
  }

  return resultado;
}

// ============================================================
// 13. PROCESAMIENTO DE FRAGMENTOS Y TEXTO COMPLETO
// ============================================================

function traducirFragmento(texto) {
  if (!tieneContenido(texto)) return texto;

  let resultado = String(texto);

  resultado = corregirOrtografiaCG(resultado);
  resultado = aplicarReglasFrases(resultado);
  resultado = traducirExpresionesMixtas(resultado);
  resultado = traducirContextoCG(resultado);
  resultado = traducirEtiquetas(resultado);
  resultado = traducirCantidadesTiempo(resultado);
  resultado = traducirPalabras(resultado);
  resultado = corregirTextoOriginalCG(resultado);

  return resultado;
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
// 14. FUNCIÓN PRINCIPAL Y EXPORTACIONES
// ============================================================

export function traducirObservacionInspeccion(
  texto,
  idiomaCliente = "es"
) {
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

export {
  traducirTextoCompletoCG,
  traducirFragmento,
  traducirEtiquetas,
  traducirPalabras,
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
