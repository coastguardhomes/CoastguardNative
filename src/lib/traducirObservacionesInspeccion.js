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
// 1. NORMALIZACIÓN
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

// ============================================================
// 2. CORRECCIONES CONTROLADAS
// ============================================================

const CORRECCIONES = [
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
  [/\baun\b/gi, "aún"],
];

// ============================================================
// 3. REGLAS DE FRASES COMPLETAS
// ============================================================

const REGLAS_FRASES = [

  // ----------------------------------------------------------
  // VERBOS Y EXPRESIONES GENERALES
  // ----------------------------------------------------------

  [/\bno hay ningún problema\b/gi, "there are no problems"],
  [/\bno hay ningun problema\b/gi, "there are no problems"],
  [/\bno hay problemas\b/gi, "there are no problems"],
  [/\bno hay ningún daño\b/gi, "there is no damage"],
  [/\bno hay ningun dano\b/gi, "there is no damage"],
  [/\bno hay daños\b/gi, "there is no damage"],
  [/\bno hay danos\b/gi, "there is no damage"],
  [/\bno hay humedad\b/gi, "there is no dampness"],
  [/\bno hay fugas\b/gi, "there are no leaks"],
  [/\bno hay agua\b/gi, "there is no water"],
  [/\bno hay luz\b/gi, "there is no electricity"],
  [/\bno hay electricidad\b/gi, "there is no electricity"],
  [/\bno hay señales de\b/gi, "there are no signs of"],
  [/\bno se observa\b/gi, "there is no visible sign of"],
  [/\bno se observan\b/gi, "there are no visible signs of"],
  [/\bno se aprecia\b/gi, "there is no visible sign of"],
  [/\bno se aprecian\b/gi, "there are no visible signs of"],
  [/\bse observa\b/gi, "there is"],
  [/\bse observan\b/gi, "there are"],
  [/\bse detecta\b/gi, "there is"],
  [/\bse detectan\b/gi, "there are"],
  [/\bse encuentra en buen estado\b/gi, "it is in good condition"],
  [/\bse encuentra en mal estado\b/gi, "it is in poor condition"],
  [/\bse encuentra\b/gi, "it is located"],
  [/\bse encuentran\b/gi, "they are located"],
  [/\bparece estar\b/gi, "appears to be"],
  [/\bparece que\b/gi, "it appears that"],
  [/\bparece\b/gi, "appears"],
  [/\bfunciona correctamente\b/gi, "is working correctly"],
  [/\bfunciona bien\b/gi, "is working properly"],
  [/\bno funciona correctamente\b/gi, "is not working correctly"],
  [/\bno funciona bien\b/gi, "is not working properly"],
  [/\bno funciona\b/gi, "is not working"],
  [/\bdeja de funcionar\b/gi, "stops working"],
  [/\bha dejado de funcionar\b/gi, "has stopped working"],
  [/\bestá funcionando\b/gi, "is working"],
  [/\besta funcionando\b/gi, "is working"],
  [/\bestaba funcionando\b/gi, "was working"],
  [/\bestaba siendo reparado\b/gi, "was being repaired"],
  [/\bestaba siendo revisado\b/gi, "was being inspected"],
  [/\bestaba siendo limpiado\b/gi, "was being cleaned"],
  [/\bestaba siendo\b/gi, "was being"],
  [/\bestaba\b/gi, "was"],
  [/\bestán\b/gi, "are"],
  [/\bestan\b/gi, "are"],
  [/\bestá\b/gi, "is"],
  [/\besta\b/gi, "is"],
  [/\btienen\b/gi, "have"],
  [/\btiene\b/gi, "has"],
  [/\bhabía\b/gi, "there was"],
  [/\bhabia\b/gi, "there was"],
  [/\bhabían\b/gi, "there were"],
  [/\bhabian\b/gi, "there were"],
  [/\bhay\b/gi, "there is"],
  [/\bnecesitan\b/gi, "need"],
  [/\bnecesita\b/gi, "needs"],
  [/\brequieren\b/gi, "require"],
  [/\brequiere\b/gi, "requires"],
  [/\bdeben ser\b/gi, "must be"],
  [/\bdebe ser\b/gi, "must be"],
  [/\bdeben\b/gi, "must"],
  [/\bdebe\b/gi, "must"],
  [/\bpueden\b/gi, "can"],
  [/\bpuede\b/gi, "can"],
  [/\bpodría\b/gi, "could"],
  [/\bpodrian\b/gi, "could"],
  [/\bpodrían\b/gi, "could"],
  [/\bqueda pendiente\b/gi, "remains outstanding"],
  [/\bqueda por revisar\b/gi, "still needs to be inspected"],
  [/\bqueda por reparar\b/gi, "still needs to be repaired"],
  [/\bqueda\b/gi, "remains"],
  [/\bfalta por\b/gi, "still needs to be"],
  [/\bfaltan\b/gi, "are missing"],
  [/\bfalta\b/gi, "is missing"],
  [/\bhace ruido\b/gi, "is making a noise"],
  [/\bhace ruidos\b/gi, "is making noises"],
  [/\bhace falta\b/gi, "is needed"],
  [/\bhace unos días\b/gi, "a few days ago"],
  [/\bhace unos dias\b/gi, "a few days ago"],

  // ----------------------------------------------------------
  // CANTIDAD, TAMAÑO Y DIMENSIONES
  // ----------------------------------------------------------

  [/\buna gran cantidad de\b/gi, "a large amount of"],
  [/\bgran cantidad de\b/gi, "a large amount of"],
  [/\bpequeña cantidad de\b/gi, "a small amount of"],
  [/\bpequena cantidad de\b/gi, "a small amount of"],
  [/\buna pequeña cantidad de\b/gi, "a small amount of"],
  [/\buna gran cantidad\b/gi, "a large quantity"],
  [/\bgran cantidad\b/gi, "a large quantity"],
  [/\buna pequeña cantidad\b/gi, "a small quantity"],
  [/\bpequeña cantidad\b/gi, "a small quantity"],
  [/\bvarias unidades\b/gi, "several units"],
  [/\buna sola unidad\b/gi, "a single unit"],
  [/\bgran tamaño\b/gi, "large in size"],
  [/\bde gran tamaño\b/gi, "large"],
  [/\bde pequeño tamaño\b/gi, "small"],
  [/\bde pequeno tamano\b/gi, "small"],
  [/\btamaño reducido\b/gi, "small in size"],
  [/\btamano reducido\b/gi, "small in size"],
  [/\bmuy grande\b/gi, "very large"],
  [/\bmuy pequeño\b/gi, "very small"],
  [/\bmuy pequeno\b/gi, "very small"],
  [/\bmuy pequeña\b/gi, "very small"],
  [/\bde gran longitud\b/gi, "long"],
  [/\bde poca longitud\b/gi, "short"],
  [/\bde poca altura\b/gi, "low"],
  [/\bde gran altura\b/gi, "high"],
  [/\bde tamaño medio\b/gi, "medium-sized"],
  [/\bde tamano medio\b/gi, "medium-sized"],

  // ----------------------------------------------------------
  // LUGAR, POSICIÓN Y DISTANCIA
  // ----------------------------------------------------------

  [/\ben la parte superior\b/gi, "at the top"],
  [/\ben la parte inferior\b/gi, "at the bottom"],
  [/\ben la parte central\b/gi, "in the central area"],
  [/\ben la parte delantera\b/gi, "at the front"],
  [/\ben la parte trasera\b/gi, "at the back"],
  [/\ben el lado derecho\b/gi, "on the right-hand side"],
  [/\ben el lado izquierdo\b/gi, "on the left-hand side"],
  [/\ba ambos lados\b/gi, "on both sides"],
  [/\ben ambos lados\b/gi, "on both sides"],
  [/\bpor encima de\b/gi, "above"],
  [/\bpor debajo de\b/gi, "below"],
  [/\bencima de\b/gi, "on top of"],
  [/\bdebajo de\b/gi, "underneath"],
  [/\bdentro de\b/gi, "inside"],
  [/\bfuera de\b/gi, "outside"],
  [/\bcerca de\b/gi, "near"],
  [/\blejos de\b/gi, "far from"],
  [/\bjunto a\b/gi, "next to"],
  [/\bal lado de\b/gi, "next to"],
  [/\ben medio de\b/gi, "in the middle of"],
  [/\bentre ambos\b/gi, "between both"],
  [/\ben el interior\b/gi, "inside"],
  [/\ben el exterior\b/gi, "outside"],
  [/\bantes de\b/gi, "before"],
  [/\bdespués de\b/gi, "after"],
  [/\bdespues de\b/gi, "after"],
  [/\bposteriormente\b/gi, "afterwards"],
  [/\bpreviamente\b/gi, "previously"],
  [/\ben esta zona\b/gi, "in this area"],
  [/\ben esta parte\b/gi, "in this section"],
  [/\ben esta ubicación\b/gi, "in this location"],
  [/\ben esta ubicacion\b/gi, "in this location"],

  // ----------------------------------------------------------
  // FONTANERÍA Y AGUA
  // ----------------------------------------------------------

  [/\bgrifo (?:esta )?roto\b/gi, "the tap is broken"],
  [/\bgrifo gotea\b/gi, "the tap is dripping"],
  [/\bgrifo está goteando\b/gi, "the tap is dripping"],
  [/\bgrifo esta goteando\b/gi, "the tap is dripping"],
  [/\bgrifo pierde agua\b/gi, "the tap is leaking"],
  [/\bgrifo no cierra\b/gi, "the tap does not close properly"],
  [/\bgrifo no funciona\b/gi, "the tap is not working"],
  [/\bgrifo suelto\b/gi, "loose tap"],
  [/\bfuga de agua\b/gi, "water leak"],
  [/\bfugas de agua\b/gi, "water leaks"],
  [/\bpérdida de agua\b/gi, "water leak"],
  [/\bperdida de agua\b/gi, "water leak"],
  [/\btubería rota\b/gi, "broken pipe"],
  [/\btuberia rota\b/gi, "broken pipe"],
  [/\btubería agrietada\b/gi, "cracked pipe"],
  [/\btuberia agrietada\b/gi, "cracked pipe"],
  [/\btubería obstruida\b/gi, "blocked pipe"],
  [/\btuberia obstruida\b/gi, "blocked pipe"],
  [/\bno hay presión de agua\b/gi, "there is no water pressure"],
  [/\bno hay presion de agua\b/gi, "there is no water pressure"],
  [/\bbaja presión de agua\b/gi, "low water pressure"],
  [/\bbaja presion de agua\b/gi, "low water pressure"],
  [/\bllave de paso cerrada\b/gi, "the shut-off valve is closed"],
  [/\bllave de paso abierta\b/gi, "the shut-off valve is open"],
  [/\bllave de paso\b/gi, "shut-off valve"],
  [/\bsifón atascado\b/gi, "blocked siphon"],
  [/\bsifon atascado\b/gi, "blocked siphon"],
  [/\bdesagüe atascado\b/gi, "blocked drain"],
  [/\bdesague atascado\b/gi, "blocked drain"],
  [/\bdesagüe lento\b/gi, "slow-draining outlet"],
  [/\bno sale agua\b/gi, "no water comes out"],
  [/\bno llega agua\b/gi, "there is no water supply"],

  // ----------------------------------------------------------
  // BAÑOS Y SANITARIOS
  // ----------------------------------------------------------

  [/\bcisterna no carga\b/gi, "the toilet cistern is not filling"],
  [/\bcisterna pierde agua\b/gi, "the toilet cistern is leaking"],
  [/\binodoro atascado\b/gi, "blocked toilet"],
  [/\binodoro no descarga\b/gi, "the toilet does not flush"],
  [/\bducha pierde agua\b/gi, "the shower is leaking"],
  [/\bducha no funciona\b/gi, "the shower is not working"],
  [/\bducha no calienta\b/gi, "the shower does not heat up"],
  [/\bducha sin agua caliente\b/gi, "there is no hot water in the shower"],
  [/\bmampara rota\b/gi, "broken shower screen"],
  [/\bplato de ducha roto\b/gi, "broken shower tray"],
  [/\blavabo atascado\b/gi, "blocked washbasin"],
  [/\blavabo pierde agua\b/gi, "the washbasin is leaking"],
  [/\bbañera rota\b/gi, "broken bathtub"],
  [/\bbanera rota\b/gi, "broken bathtub"],

  // ----------------------------------------------------------
  // ELECTRICIDAD Y SEGURIDAD
  // ----------------------------------------------------------

  [/\benchufe quemado\b/gi, "burnt electrical socket"],
  [/\benchufe roto\b/gi, "broken socket"],
  [/\benchufe suelto\b/gi, "loose socket"],
  [/\benchufe no funciona\b/gi, "the socket is not working"],
  [/\binterruptor roto\b/gi, "broken switch"],
  [/\binterruptor no funciona\b/gi, "the switch is not working"],
  [/\bcable pelado\b/gi, "exposed electrical wire"],
  [/\bcable quemado\b/gi, "burnt electrical wire"],
  [/\bcable suelto\b/gi, "loose electrical wire"],
  [/\bcuadro eléctrico\b/gi, "electrical distribution board"],
  [/\bcuadro electrico\b/gi, "electrical distribution board"],
  [/\bcortocircuito\b/gi, "short circuit"],
  [/\bsin corriente eléctrica\b/gi, "without electrical power"],
  [/\bsin corriente electrica\b/gi, "without electrical power"],
  [/\balarma no funciona\b/gi, "the alarm is not working"],
  [/\balarma desconectada\b/gi, "the alarm is disconnected"],
  [/\balarma apagada\b/gi, "the alarm is switched off"],

  // ----------------------------------------------------------
  // HUMEDADES, DAÑOS Y CONSTRUCCIÓN
  // ----------------------------------------------------------

  [/\bmancha de humedad\b/gi, "damp patch"],
  [/\bmanchas de humedad\b/gi, "damp patches"],
  [/\bhumedad en el techo\b/gi, "dampness on the ceiling"],
  [/\bhumedad en la pared\b/gi, "dampness on the wall"],
  [/\bhumedad en el suelo\b/gi, "dampness on the floor"],
  [/\bmoho negro\b/gi, "black mould"],
  [/\bmoho\b/gi, "mould"],
  [/\bfiltración de agua\b/gi, "water ingress"],
  [/\bfiltracion de agua\b/gi, "water ingress"],
  [/\bpintura desconchada\b/gi, "peeling paint"],
  [/\bpintura levantada\b/gi, "peeling paint"],
  [/\bpared agrietada\b/gi, "cracked wall"],
  [/\bpared húmeda\b/gi, "damp wall"],
  [/\bpared humeda\b/gi, "damp wall"],
  [/\btecho agrietado\b/gi, "cracked ceiling"],
  [/\bsuelo levantado\b/gi, "raised flooring"],
  [/\bazulejo roto\b/gi, "broken tile"],
  [/\bazulejos rotos\b/gi, "broken tiles"],
  [/\bsilicona deteriorada\b/gi, "deteriorated sealant"],

  // ----------------------------------------------------------
  // PLAGAS, INSECTOS Y ANIMALES
  // ----------------------------------------------------------

  [/\bplaga de hormigas\b/gi, "ant infestation"],
  [/\binfestación de hormigas\b/gi, "ant infestation"],
  [/\binfestacion de hormigas\b/gi, "ant infestation"],
  [/\bplaga de cucarachas\b/gi, "cockroach infestation"],
  [/\bplaga de insectos\b/gi, "insect infestation"],
  [/\bplaga de roedores\b/gi, "rodent infestation"],
  [/\bexcrementos de ratón\b/gi, "mouse droppings"],
  [/\bexcrementos de raton\b/gi, "mouse droppings"],
  [/\bexcrementos de rata\b/gi, "rat droppings"],
  [/\bexcrementos de animales\b/gi, "animal droppings"],
  [/\bpresencia de insectos\b/gi, "presence of insects"],
  [/\bpresencia de animales\b/gi, "presence of animals"],
  [/\bnido de avispas\b/gi, "wasp nest"],
  [/\bnido de pájaros\b/gi, "bird nest"],
  [/\bnido de pajaros\b/gi, "bird nest"],
  [/\btelarañas\b/gi, "cobwebs"],
  [/\bmosquitos\b/gi, "mosquitoes"],
  [/\bmoscas\b/gi, "flies"],
  [/\bhormigas\b/gi, "ants"],
  [/\bcucarachas\b/gi, "cockroaches"],
  [/\broedores\b/gi, "rodents"],
  [/\bratones\b/gi, "mice"],
  [/\bratas\b/gi, "rats"],
  [/\btermitas\b/gi, "termites"],
  [/\bchinches\b/gi, "bedbugs"],
  [/\bpulgas\b/gi, "fleas"],
  [/\bavispas\b/gi, "wasps"],
  [/\babejas\b/gi, "bees"],
  [/\bpalomas\b/gi, "pigeons"],
  [/\bpájaros\b/gi, "birds"],
  [/\bpajaros\b/gi, "birds"],

  // ----------------------------------------------------------
  // LIMPIEZA, OLORES Y RUIDOS
  // ----------------------------------------------------------

  [/\bmal olor\b/gi, "unpleasant smell"],
  [/\bmalos olores\b/gi, "unpleasant odours"],
  [/\bolor desagradable\b/gi, "unpleasant smell"],
  [/\bolor a humedad\b/gi, "musty smell"],
  [/\bolor a moho\b/gi, "musty smell"],
  [/\bolor a quemado\b/gi, "burning smell"],
  [/\bolor a gas\b/gi, "smell of gas"],
  [/\bolor a cloaca\b/gi, "sewer smell"],
  [/\bolor fuerte\b/gi, "strong smell"],
  [/\bruido extraño\b/gi, "unusual noise"],
  [/\bruido extrano\b/gi, "unusual noise"],
  [/\bruido constante\b/gi, "constant noise"],
  [/\bruido intermitente\b/gi, "intermittent noise"],
  [/\bruido fuerte\b/gi, "loud noise"],
  [/\bvibración constante\b/gi, "constant vibration"],
  [/\bvibracion constante\b/gi, "constant vibration"],
  [/\bse escucha un ruido\b/gi, "a noise can be heard"],
  [/\bse oye un ruido\b/gi, "a noise can be heard"],
  [/\bnecesita limpieza\b/gi, "requires cleaning"],
  [/\bpendiente de limpieza\b/gi, "cleaning is still required"],
  [/\brequiere una limpieza\b/gi, "requires cleaning"],

  // ----------------------------------------------------------
  // MOBILIARIO Y ELECTRODOMÉSTICOS
  // ----------------------------------------------------------

  [/\barmario empotrado\b/gi, "built-in wardrobe"],
  [/\bpuerta del armario\b/gi, "cupboard door"],
  [/\bcajón atascado\b/gi, "jammed drawer"],
  [/\bcajon atascado\b/gi, "jammed drawer"],
  [/\bmesa inestable\b/gi, "unstable table"],
  [/\bsilla rota\b/gi, "broken chair"],
  [/\bsofá roto\b/gi, "broken sofa"],
  [/\bsofa roto\b/gi, "broken sofa"],
  [/\bcama rota\b/gi, "broken bed"],
  [/\bcolchón dañado\b/gi, "damaged mattress"],
  [/\bcolchon danado\b/gi, "damaged mattress"],
  [/\bnevera no enfría\b/gi, "the fridge is not cooling"],
  [/\bnevera no enfria\b/gi, "the fridge is not cooling"],
  [/\blavadora no centrifuga\b/gi, "the washing machine is not spinning"],
  [/\blavavajillas no desagua\b/gi, "the dishwasher is not draining"],
  [/\bhorno no calienta\b/gi, "the oven is not heating"],
  [/\bvitrocerámica no funciona\b/gi, "the ceramic hob is not working"],
  [/\bvitroceramica no funciona\b/gi, "the ceramic hob is not working"],

  // ----------------------------------------------------------
  // EXTERIORES Y MANTENIMIENTO
  // ----------------------------------------------------------

  [/\bpiscina necesita limpieza\b/gi, "the pool needs cleaning"],
  [/\bpiscina sucia\b/gi, "dirty pool"],
  [/\bdepuradora no funciona\b/gi, "the pool filtration system is not working"],
  [/\briego automático\b/gi, "automatic irrigation system"],
  [/\briego automatico\b/gi, "automatic irrigation system"],
  [/\bpuerta del garaje\b/gi, "garage door"],
  [/\bportón de entrada\b/gi, "entrance gate"],
  [/\bporton de entrada\b/gi, "entrance gate"],
  [/\bvalla rota\b/gi, "broken fence"],
  [/\btejado dañado\b/gi, "damaged roof"],
  [/\btejado danado\b/gi, "damaged roof"],
  [/\bcanalón obstruido\b/gi, "blocked gutter"],
  [/\bcanalon obstruido\b/gi, "blocked gutter"],
  [/\btrabajo de mantenimiento\b/gi, "maintenance work"],
  [/\bmantenimiento pendiente\b/gi, "maintenance is still outstanding"],
  [/\brevisión general\b/gi, "general inspection"],
  [/\brevision general\b/gi, "general inspection"],
  [/\breparación pendiente\b/gi, "repair is still outstanding"],
  [/\breparacion pendiente\b/gi, "repair is still outstanding"],

  // ----------------------------------------------------------
  // LOCALIZACIONES HABITUALES
  // ----------------------------------------------------------

  [/\ben el cuarto de baño\b/gi, "in the bathroom"],
  [/\ben el cuarto de bano\b/gi, "in the bathroom"],
  [/\ben el baño\b/gi, "in the bathroom"],
  [/\ben el bano\b/gi, "in the bathroom"],
  [/\ben la cocina\b/gi, "in the kitchen"],
  [/\ben el salón\b/gi, "in the living room"],
  [/\ben el salon\b/gi, "in the living room"],
  [/\ben el dormitorio\b/gi, "in the bedroom"],
  [/\ben la habitación\b/gi, "in the room"],
  [/\ben la habitacion\b/gi, "in the room"],
  [/\ben el pasillo\b/gi, "in the hallway"],
  [/\ben la entrada\b/gi, "at the entrance"],
  [/\ben el jardín\b/gi, "in the garden"],
  [/\ben el jardin\b/gi, "in the garden"],
  [/\ben la terraza\b/gi, "on the terrace"],
  [/\ben el balcón\b/gi, "on the balcony"],
  [/\ben el balcon\b/gi, "on the balcony"],
  [/\ben el garaje\b/gi, "in the garage"],
  [/\ben el trastero\b/gi, "in the storage room"],
  [/\ben el exterior\b/gi, "outside"],
  [/\ben el interior\b/gi, "inside"],

  // ----------------------------------------------------------
  // HABITACIONES Y UBICACIONES
  // ----------------------------------------------------------

  [/\ben el jardin\b/gi, "in the garden"],
  [/\ben el jardín\b/gi, "in the garden"],
  [/\ben la terraza\b/gi, "on the terrace"],
  [/\ben el balcon\b/gi, "on the balcony"],
  [/\ben el balcón\b/gi, "on the balcony"],
  [/\ben el garaje\b/gi, "in the garage"],
  [/\ben el trastero\b/gi, "in the storage room"],
  [/\ben el lavadero\b/gi, "in the utility room"],
  [/\ben el techo\b/gi, "on the ceiling"],
  [/\ben la pared\b/gi, "on the wall"],
  [/\ben el suelo\b/gi, "on the floor"],
  [/\ben el dormitorio\b/gi, "in the bedroom"],
  [/\ben la habitacion\b/gi, "in the room"],
  [/\ben la habitación\b/gi, "in the room"],
  [/\ben el pasillo\b/gi, "in the hallway"],
  [/\ben la entrada\b/gi, "at the entrance"],
  [/\bdel baño\b/gi, "of the bathroom"],
  [/\bde el baño\b/gi, "of the bathroom"],
  [/\bde la cocina\b/gi, "of the kitchen"],
  [/\ben la cocina\b/gi, "in the kitchen"],
  [/\ben el salon\b/gi, "in the living room"],
  [/\ben el salón\b/gi, "in the living room"],
  [/\ben salon\b/gi, "in the living room"],
  [/\ben baño\b/gi, "in the bathroom"],
  [/\ben bano\b/gi, "in the bathroom"],
  [/\bsalon\b/gi, "living room"],
  [/\bsalón\b/gi, "living room"],
  [/\bcomedor\b/gi, "dining room"],
  [/\bdormitorio principal\b/gi, "master bedroom"],
  [/\bhabitacion principal\b/gi, "master bedroom"],
  [/\bhabitación principal\b/gi, "master bedroom"],
  [/\bdormitorio\b/gi, "bedroom"],
  [/\bdormitorios\b/gi, "bedrooms"],
  [/\bhabitacion\b/gi, "room"],
  [/\bhabitación\b/gi, "room"],
  [/\bhabitaciones\b/gi, "rooms"],
  [/\bcuarto\b/gi, "room"],
  [/\bcuartos\b/gi, "rooms"],
  [/\bpasillo\b/gi, "hallway"],
  [/\bentrada\b/gi, "entrance"],
  [/\brecibidor\b/gi, "hallway"],
  [/\btrastero\b/gi, "storage room"],
  [/\blavadero\b/gi, "utility room"],
  [/\blavanderia\b/gi, "laundry room"],
  [/\blavandería\b/gi, "laundry room"],
  [/\bgaraje\b/gi, "garage"],
  [/\bgarajes\b/gi, "garages"],
  [/\bterraza\b/gi, "terrace"],
  [/\bterrazas\b/gi, "terraces"],
  [/\bbalcon\b/gi, "balcony"],
  [/\bbalcón\b/gi, "balcony"],
  [/\bbalcones\b/gi, "balconies"],
  [/\bpatio\b/gi, "patio"],
  [/\bpatios\b/gi, "patios"],
  [/\bjardin\b/gi, "garden"],
  [/\bjardín\b/gi, "garden"],
  [/\bjardines\b/gi, "gardens"],
  [/\bexterior\b/gi, "outside"],
  [/\binterior\b/gi, "inside"],
  [/\bplanta baja\b/gi, "ground floor"],
  [/\bprimera planta\b/gi, "first floor"],
  [/\bsegunda planta\b/gi, "second floor"],
  [/\bultima planta\b/gi, "top floor"],
  [/\búltima planta\b/gi, "top floor"],
  [/\bático\b/gi, "penthouse"],
  [/\batico\b/gi, "penthouse"],

  // ----------------------------------------------------------
  // COCINA Y MOBILIARIO
  // ----------------------------------------------------------

  [/\bfregadero atascado\b/gi, "blocked kitchen sink"],
  [/\bfregadero pierde agua\b/gi, "kitchen sink is leaking"],
  [/\bfregadero roto\b/gi, "broken kitchen sink"],
  [/\bfregadero\b/gi, "kitchen sink"],
  [/\bencimera rota\b/gi, "broken worktop"],
  [/\bencimera agrietada\b/gi, "cracked worktop"],
  [/\bencimera\b/gi, "worktop"],
  [/\bmuebles de cocina\b/gi, "kitchen cabinets"],
  [/\bmueble de cocina\b/gi, "kitchen cabinet"],
  [/\barmario de cocina\b/gi, "kitchen cupboard"],
  [/\barmario roto\b/gi, "broken cupboard"],
  [/\barmario suelto\b/gi, "loose cupboard"],
  [/\barmarios\b/gi, "cupboards"],
  [/\barmario\b/gi, "cupboard"],
  [/\bcajon roto\b/gi, "broken drawer"],
  [/\bcajón roto\b/gi, "broken drawer"],
  [/\bcajon atascado\b/gi, "stuck drawer"],
  [/\bcajón atascado\b/gi, "stuck drawer"],
  [/\bcajones\b/gi, "drawers"],
  [/\bcajon\b/gi, "drawer"],
  [/\bcajón\b/gi, "drawer"],
  [/\bpuertas de armario\b/gi, "cupboard doors"],
  [/\bpuerta de armario\b/gi, "cupboard door"],
  [/\bmesa rota\b/gi, "broken table"],
  [/\bmesa\b/gi, "table"],
  [/\bsilla rota\b/gi, "broken chair"],
  [/\bsillas\b/gi, "chairs"],
  [/\bsilla\b/gi, "chair"],
  [/\bsofa roto\b/gi, "broken sofa"],
  [/\bsofá roto\b/gi, "broken sofa"],
  [/\bsofa\b/gi, "sofa"],
  [/\bsofá\b/gi, "sofa"],
  [/\bcamas\b/gi, "beds"],
  [/\bcama\b/gi, "bed"],
  [/\bcolchon\b/gi, "mattress"],
  [/\bcolchón\b/gi, "mattress"],
  [/\bestanterias\b/gi, "shelves"],
  [/\bestanterías\b/gi, "shelves"],
  [/\bestanteria\b/gi, "shelf"],
  [/\bestantería\b/gi, "shelf"],
  [/\bcortina rota\b/gi, "broken curtain"],
  [/\bcortinas\b/gi, "curtains"],
  [/\bcortina\b/gi, "curtain"],
  [/\bpersiana\b/gi, "shutter"],
  [/\bpersianas\b/gi, "shutters"],
  [/\bfrontal de cocina\b/gi, "kitchen splashback"],
  [/\bextractor\b/gi, "extractor"],
  [/\bgrasa acumulada\b/gi, "grease build-up"],
  [/\bgrasa\b/gi, "grease"],

  // ----------------------------------------------------------
  // CLIMATIZACIÓN Y VENTILACIÓN
  // ----------------------------------------------------------

  [/\baire acondicionado no enciende\b/gi, "air conditioning is not working"],
  [/\baire acondicionado no funciona\b/gi, "air conditioning is not working"],
  [/\baire acondicionado no enfria\b/gi, "air conditioning is not cooling"],
  [/\baire acondicionado no enfría\b/gi, "air conditioning is not cooling"],
  [/\baire acondicionado no calienta\b/gi, "air conditioning is not heating"],
  [/\baire acondicionado pierde agua\b/gi, "air conditioning is leaking water"],
  [/\baire acondicionado hace ruido\b/gi, "air conditioning is making a noise"],
  [/\baire acondicionado\b/gi, "air conditioning"],
  [/\bunidad exterior\b/gi, "outdoor unit"],
  [/\bunidad interior\b/gi, "indoor unit"],
  [/\bfiltro sucio\b/gi, "dirty filter"],
  [/\bfiltro obstruido\b/gi, "blocked filter"],
  [/\bfiltro\b/gi, "filter"],
  [/\bcalefaccion no funciona\b/gi, "heating is not working"],
  [/\bcalefacción no funciona\b/gi, "heating is not working"],
  [/\bcalefaccion no calienta\b/gi, "heating is not working"],
  [/\bcalefacción no calienta\b/gi, "heating is not working"],
  [/\bcalefaccion\b/gi, "heating"],
  [/\bcalefacción\b/gi, "heating"],
  [/\bradiador no calienta\b/gi, "radiator is not heating"],
  [/\bradiador pierde agua\b/gi, "radiator is leaking"],
  [/\bradiador\b/gi, "radiator"],
  [/\btermostato no funciona\b/gi, "thermostat is not working"],
  [/\btermostato\b/gi, "thermostat"],
  [/\bventilacion\b/gi, "ventilation"],
  [/\bventilación\b/gi, "ventilation"],
  [/\bextractor de baño\b/gi, "bathroom extractor fan"],
  [/\bextractor de bano\b/gi, "bathroom extractor fan"],
  [/\bextractor de cocina\b/gi, "kitchen extractor"],
  [/\bventilador de techo\b/gi, "ceiling fan"],
  [/\bcaldera no enciende\b/gi, "boiler is not working"],
  [/\bcaldera no funciona\b/gi, "boiler is not working"],
  [/\bcaldera pierde agua\b/gi, "boiler is leaking"],
  [/\bcaldera\b/gi, "boiler"],

  // ----------------------------------------------------------
  // JARDÍN, PISCINA Y EXTERIORES
  // ----------------------------------------------------------

  [/\bpiscina pierde agua\b/gi, "pool is leaking"],
  [/\bpiscina sucia\b/gi, "dirty pool"],
  [/\bpiscina limpia\b/gi, "clean pool"],
  [/\bpiscina vacia\b/gi, "empty pool"],
  [/\bpiscina vacía\b/gi, "empty pool"],
  [/\bpiscina llena\b/gi, "full pool"],
  [/\bpiscina verde\b/gi, "green pool water"],
  [/\bpiscina\b/gi, "pool"],
  [/\bdepuradora no funciona\b/gi, "pool filtration system is not working"],
  [/\bdepuradora\b/gi, "pool filtration system"],
  [/\bbomba de piscina\b/gi, "pool pump"],
  [/\bfiltro de piscina\b/gi, "pool filter"],
  [/\bskimmer\b/gi, "skimmer"],
  [/\bclorador\b/gi, "chlorinator"],
  [/\bcloro\b/gi, "chlorine"],
  [/\bcesped\b/gi, "grass"],
  [/\bcésped\b/gi, "grass"],
  [/\bsetos\b/gi, "hedges"],
  [/\bseto\b/gi, "hedge"],
  [/\barboles\b/gi, "trees"],
  [/\bárboles\b/gi, "trees"],
  [/\barbol\b/gi, "tree"],
  [/\bárbol\b/gi, "tree"],
  [/\bplantas\b/gi, "plants"],
  [/\bplanta\b/gi, "plant"],
  [/\bsistema de riego\b/gi, "irrigation system"],
  [/\briego automatico\b/gi, "automatic irrigation"],
  [/\briego automático\b/gi, "automatic irrigation"],
  [/\briego\b/gi, "irrigation"],
  [/\bmangueras\b/gi, "hoses"],
  [/\bmanguera\b/gi, "hose"],
  [/\bgrifo exterior\b/gi, "outdoor tap"],
  [/\bgrifo del jardin\b/gi, "garden tap"],
  [/\bgrifo del jardín\b/gi, "garden tap"],
  [/\bpuerta de jardin\b/gi, "garden gate"],
  [/\bpuerta de jardín\b/gi, "garden gate"],
  [/\bporton\b/gi, "gate"],
  [/\bportón\b/gi, "gate"],
  [/\bvalla rota\b/gi, "broken fence"],
  [/\bvalla\b/gi, "fence"],
  [/\bvallado\b/gi, "fencing"],
  [/\bmuro exterior\b/gi, "external wall"],
  [/\bmuro\b/gi, "wall"],
  [/\bbarbacoa\b/gi, "barbecue"],
  [/\bterraza exterior\b/gi, "outdoor terrace"],
  [/\bdesague exterior\b/gi, "external drain"],
  [/\bdesagüe exterior\b/gi, "external drain"],
  [/\bcanaletas\b/gi, "drainage channels"],
  [/\bcanaleta\b/gi, "drainage channel"],
  [/\biluminacion exterior\b/gi, "outdoor lighting"],
  [/\biluminación exterior\b/gi, "outdoor lighting"],
  [/\bluces exteriores\b/gi, "outdoor lights"],
  [/\bluz exterior\b/gi, "outdoor light"],

  // ----------------------------------------------------------
  // LIMPIEZA Y ESTADO GENERAL
  // ----------------------------------------------------------

  [/\blimpieza realizada\b/gi, "cleaning completed"],
  [/\blimpieza pendiente\b/gi, "cleaning pending"],
  [/\bpendiente de limpieza\b/gi, "cleaning pending"],
  [/\bnecesita limpieza\b/gi, "requires cleaning"],
  [/\brequiere limpieza\b/gi, "requires cleaning"],
  [/\bse ha limpiado\b/gi, "has been cleaned"],
  [/\bse limpio\b/gi, "was cleaned"],
  [/\bse limpió\b/gi, "was cleaned"],
  [/\bpolvo acumulado\b/gi, "dust build-up"],
  [/\bmucho polvo\b/gi, "a lot of dust"],
  [/\bmal olor en el baño\b/gi, "bad smell in the bathroom"],
  [/\bolor a humedad\b/gi, "musty smell"],
  [/\bmalos olores\b/gi, "bad smells"],
  [/\bmal olor\b/gi, "bad smell"],
  [/\bbuen estado\b/gi, "good condition"],
  [/\ben buen estado\b/gi, "in good condition"],
  [/\bmal estado\b/gi, "poor condition"],
  [/\ben mal estado\b/gi, "in poor condition"],
  [/\bestado correcto\b/gi, "good condition"],
  [/\bestado incorrecto\b/gi, "poor condition"],
  [/\bfunciona correctamente\b/gi, "works correctly"],
  [/\bfunciona bien\b/gi, "works well"],
  [/\bfuncionamiento correcto\b/gi, "working correctly"],
  [/\bfuncionamiento incorrecto\b/gi, "not working correctly"],
  [/\bpolvo\b/gi, "dust"],
  [/\bmanchas\b/gi, "stains"],
  [/\bmancha\b/gi, "stain"],
  [/\bdesordenado\b/gi, "untidy"],
  [/\bdesordenada\b/gi, "untidy"],
  [/\bordenado\b/gi, "tidy"],
  [/\bordenada\b/gi, "tidy"],

  // ----------------------------------------------------------
  // PLAGAS, INSECTOS Y ANIMALES
  // ----------------------------------------------------------

  [/\bcucarachas\b/gi, "cockroaches"],
  [/\bcucaracha\b/gi, "cockroach"],
  [/\bhormigas\b/gi, "ants"],
  [/\bhormiga\b/gi, "ant"],
  [/\btermitas\b/gi, "termites"],
  [/\btermita\b/gi, "termite"],
  [/\bmosquitos\b/gi, "mosquitoes"],
  [/\bmosquito\b/gi, "mosquito"],
  [/\bmoscas\b/gi, "flies"],
  [/\bmosca\b/gi, "fly"],
  [/\barañas\b/gi, "spiders"],
  [/\baraña\b/gi, "spider"],
  [/\bratones\b/gi, "mice"],
  [/\braton\b/gi, "mouse"],
  [/\bratón\b/gi, "mouse"],
  [/\bratas\b/gi, "rats"],
  [/\brata\b/gi, "rat"],
  [/\bplaga\b/gi, "pest infestation"],
  [/\bplagas\b/gi, "pest infestations"],
  [/\bnido de avispas\b/gi, "wasp nest"],
  [/\bavispas\b/gi, "wasps"],
  [/\bavispa\b/gi, "wasp"],
  [/\bpulgas\b/gi, "fleas"],
  [/\bpulga\b/gi, "flea"],
  [/\bchinches\b/gi, "bedbugs"],
  [/\bchinche\b/gi, "bedbug"],
  [/\bexcrementos\b/gi, "droppings"],
  [/\bexcremento\b/gi, "dropping"],
  [/\bhuellas de animales\b/gi, "animal traces"],
  [/\banimales\b/gi, "animals"],
  [/\banimal\b/gi, "animal"],

  // ----------------------------------------------------------
  // PUERTAS, VENTANAS Y CERRAJERÍA
  // ----------------------------------------------------------

  [/\bpuerta no cierra\b/gi, "door does not close"],
  [/\bpuerta no abre\b/gi, "door does not open"],
  [/\bpuerta atascada\b/gi, "stuck door"],
  [/\bpuerta descolgada\b/gi, "door is misaligned"],
  [/\bpuerta roza\b/gi, "door is rubbing"],
  [/\bventana no cierra\b/gi, "window does not close"],
  [/\bventana no abre\b/gi, "window does not open"],
  [/\bventana atascada\b/gi, "stuck window"],
  [/\bcristal roto\b/gi, "broken glass"],
  [/\bcristal agrietado\b/gi, "cracked glass"],
  [/\bcristal\b/gi, "glass"],
  [/\bcristales\b/gi, "glass panels"],
  [/\bmosquitera rota\b/gi, "damaged fly screen"],
  [/\bmosquitera\b/gi, "fly screen"],
  [/\bmosquiteras\b/gi, "fly screens"],
  [/\bcerradura rota\b/gi, "broken lock"],
  [/\bcerradura\b/gi, "lock"],
  [/\bcerraduras\b/gi, "locks"],
  [/\bmanilla\b/gi, "handle"],
  [/\bmanillas\b/gi, "handles"],
  [/\bbisagra\b/gi, "hinge"],
  [/\bbisagras\b/gi, "hinges"],
  [/\bmarco de ventana\b/gi, "window frame"],
  [/\bmarco de puerta\b/gi, "door frame"],

  // ----------------------------------------------------------
  // HUMEDAD, FILTRACIONES Y CONSTRUCCIÓN
  // ----------------------------------------------------------

  [/\bmanchas de humedad\b/gi, "damp patches"],
  [/\bhumedad por condensacion\b/gi, "condensation-related damp"],
  [/\bhumedad por condensación\b/gi, "condensation-related damp"],
  [/\bfiltracion de agua\b/gi, "water ingress"],
  [/\bfiltración de agua\b/gi, "water ingress"],
  [/\bfiltraciones de agua\b/gi, "water ingress"],
  [/\bpared agrietada\b/gi, "cracked wall"],
  [/\bpared desconchada\b/gi, "flaking wall"],
  [/\bpintura desconchada\b/gi, "peeling paint"],
  [/\bpintura levantada\b/gi, "peeling paint"],
  [/\btecho agrietado\b/gi, "cracked ceiling"],
  [/\btecho con manchas\b/gi, "stained ceiling"],
  [/\bmoho negro\b/gi, "black mould"],
  [/\bmoho\b/gi, "mould"],
  [/\bhongos\b/gi, "fungus"],
  [/\bcondensacion\b/gi, "condensation"],
  [/\bcondensación\b/gi, "condensation"],
  [/\bhumedades\b/gi, "dampness"],
  [/\bhumedad\b/gi, "dampness"],
  [/\bgrietas\b/gi, "cracks"],
  [/\bgrieta\b/gi, "crack"],
  [/\bfisuras\b/gi, "hairline cracks"],
  [/\bfisura\b/gi, "hairline crack"],
  [/\bdesprendimientos\b/gi, "loose or detached areas"],
  [/\bdesprendimiento\b/gi, "detachment"],
  [/\bsilicona rota\b/gi, "damaged sealant"],
  [/\bsilicona\b/gi, "sealant"],
  [/\bsellado\b/gi, "sealing"],
  [/\bsellar\b/gi, "seal"],
  [/\baislamiento termico\b/gi, "thermal insulation"],
  [/\baislamiento térmico\b/gi, "thermal insulation"],
  [/\baislamiento acustico\b/gi, "sound insulation"],
  [/\baislamiento acústico\b/gi, "sound insulation"],
  [/\baislamiento\b/gi, "insulation"],
  [/\bfachadas\b/gi, "facades"],
  [/\bfachada\b/gi, "facade"],
  [/\btecho exterior\b/gi, "external roof"],
  [/\btejado\b/gi, "roof"],
  [/\btejas\b/gi, "roof tiles"],
  [/\bteja\b/gi, "roof tile"],
  [/\bcanalones\b/gi, "gutters"],
  [/\bcanalon\b/gi, "gutter"],
  [/\bcanalón\b/gi, "gutter"],
  [/\bbajantes\b/gi, "downpipes"],
  [/\bbajante\b/gi, "downpipe"],
  [/\bobras\b/gi, "building works"],
  [/\bobra\b/gi, "building work"],
  [/\balbañil\b/gi, "bricklayer"],
  [/\balbanil\b/gi, "bricklayer"],
  [/\bconstruccion\b/gi, "construction"],
  [/\bconstrucción\b/gi, "construction"],
  [/\bdemolicion\b/gi, "demolition"],
  [/\bdemolición\b/gi, "demolition"],
  [/\brevestimientos\b/gi, "coverings"],
  [/\brevestimiento\b/gi, "covering"],

  // ----------------------------------------------------------
  // ELECTRODOMÉSTICOS
  // ----------------------------------------------------------

  [/\blavadora no funciona\b/gi, "washing machine is not working"],
  [/\blavadora no centrifuga\b/gi, "washing machine is not spinning"],
  [/\blavadora no centrifuga\b/gi, "washing machine is not spinning"],
  [/\blavadora pierde agua\b/gi, "washing machine is leaking"],
  [/\blavavajillas no funciona\b/gi, "dishwasher is not working"],
  [/\blavavajillas no lava\b/gi, "dishwasher is not washing"],
  [/\bnevera no enfria\b/gi, "fridge is not cooling"],
  [/\bnevera no enfría\b/gi, "fridge is not cooling"],
  [/\bnevera no funciona\b/gi, "fridge is not working"],
  [/\bhorno no calienta\b/gi, "oven is not heating"],
  [/\bhorno no funciona\b/gi, "oven is not working"],
  [/\bmicroondas no funciona\b/gi, "microwave is not working"],
  [/\bmicroondas no calienta\b/gi, "microwave is not heating"],
  [/\bfrigorifico\b/gi, "fridge"],
  [/\bfrigorífico\b/gi, "fridge"],
  [/\bcongelador\b/gi, "freezer"],
  [/\blavadora\b/gi, "washing machine"],
  [/\bsecadora\b/gi, "dryer"],
  [/\blavavajillas\b/gi, "dishwasher"],
  [/\bmicroondas\b/gi, "microwave"],
  [/\bhorno\b/gi, "oven"],
  [/\bvitroceramica\b/gi, "ceramic hob"],
  [/\bvitrocerámica\b/gi, "ceramic hob"],
  [/\bvitro\b/gi, "hob"],
  [/\bcampana extractora\b/gi, "extractor hood"],
  [/\bcampana\b/gi, "extractor hood"],
  [/\bcafetera\b/gi, "coffee machine"],
  [/\btelevisor\b/gi, "TV"],
  [/\btelevisión\b/gi, "TV"],
  [/\btelevision\b/gi, "TV"],
  [/\brouter\b/gi, "router"],
  [/\baspiradora\b/gi, "vacuum cleaner"],
  [/\bplancha\b/gi, "iron"],
  [/\bcalentador\b/gi, "water heater"],
  [/\btermo\b/gi, "water heater"],

  // ----------------------------------------------------------
  // FONTANERÍA Y ELECTRICIDAD
  // ----------------------------------------------------------

  [/\bllave de paso\b/gi, "shut-off valve"],
  [/\bvalvula de paso\b/gi, "shut-off valve"],
  [/\bválvula de paso\b/gi, "shut-off valve"],
  [/\bgrifo gotea\b/gi, "tap is dripping"],
  [/\bgrifo pierde agua\b/gi, "tap is leaking"],
  [/\bgrifo no funciona\b/gi, "tap is not working"],
  [/\bdesague atascado\b/gi, "blocked drain"],
  [/\bdesagüe atascado\b/gi, "blocked drain"],
  [/\bdesague\b/gi, "drain"],
  [/\bdesagüe\b/gi, "drain"],
  [/\bpresion del agua\b/gi, "water pressure"],
  [/\bpresión del agua\b/gi, "water pressure"],
  [/\bbaja presion\b/gi, "low pressure"],
  [/\bbaja presión\b/gi, "low pressure"],
  [/\bno hay agua caliente\b/gi, "there is no hot water"],
  [/\bno sale agua caliente\b/gi, "no hot water comes out"],
  [/\bno hay agua\b/gi, "there is no water"],
  [/\bno sale agua\b/gi, "no water comes out"],
  [/\benchufe roto\b/gi, "broken socket"],
  [/\binterruptor roto\b/gi, "broken switch"],
  [/\bcuadro electrico\b/gi, "electrical panel"],
  [/\bcuadro eléctrico\b/gi, "electrical panel"],
  [/\bsalto el diferencial\b/gi, "the residual current device tripped"],
  [/\bsaltó el diferencial\b/gi, "the residual current device tripped"],
  [/\bcortocircuito\b/gi, "short circuit"],
  [/\bchispa\b/gi, "spark"],
  [/\bchispas\b/gi, "sparks"],
  [/\bno hay electricidad\b/gi, "there is no electricity"],
  [/\bno hay luz\b/gi, "there is no power"],
  [/\bbombilla fundida\b/gi, "blown bulb"],
  [/\bluz intermitente\b/gi, "flickering light"],
  [/\bluces intermitentes\b/gi, "flickering lights"],

  // ----------------------------------------------------------
  // EXPRESIONES MIXTAS ESPAÑOL / INGLÉS
  // ----------------------------------------------------------

  [/\btap roto\b/gi, "tap is broken"],
  [/\btap rota\b/gi, "tap is broken"],
  [/\btap gotea\b/gi, "tap is dripping"],
  [/\btap pierde agua\b/gi, "tap is leaking"],
  [/\btap esta perdiendo agua\b/gi, "tap is leaking"],
  [/\btap está perdiendo agua\b/gi, "tap is leaking"],
  [/\btap no funciona\b/gi, "tap is not working"],
  [/\bdoor rota\b/gi, "door is broken"],
  [/\bdoor roto\b/gi, "door is broken"],
  [/\bdoor no cierra\b/gi, "door does not close"],
  [/\bdoor no abre\b/gi, "door does not open"],
  [/\bwindow rota\b/gi, "window is broken"],
  [/\bwindow roto\b/gi, "window is broken"],
  [/\bwindow no cierra\b/gi, "window does not close"],
  [/\bwindow no abre\b/gi, "window does not open"],
  [/\bbathroom sucio\b/gi, "bathroom is dirty"],
  [/\bbathroom sucia\b/gi, "bathroom is dirty"],
  [/\bkitchen sucia\b/gi, "kitchen is dirty"],
  [/\bkitchen sucio\b/gi, "kitchen is dirty"],
  [/\bpool sucia\b/gi, "pool is dirty"],
  [/\bpool sucio\b/gi, "pool is dirty"],
  [/\bfridge no enfria\b/gi, "fridge is not cooling"],
  [/\bfridge no funciona\b/gi, "fridge is not working"],
  [/\bfridge hace ruido raro\b/gi, "fridge is making an unusual noise"],
  [/\bfridge hace ruido\b/gi, "fridge is making a noise"],
  [/\bfridge pierde agua\b/gi, "fridge is leaking water"],
  [/\bno enciende\b/gi, "is not working"],
  [/\bno prende\b/gi, "is not working"],
  [/\bno arranca\b/gi, "does not start"],
  [/\bno funciona\b/gi, "is not working"],
  [/\bno esta funcionando\b/gi, "is not working"],
  [/\bno está funcionando\b/gi, "is not working"],
  [/\besta funcionando\b/gi, "is working"],
  [/\bestá funcionando\b/gi, "is working"],
  [/\bno sale water\b/gi, "no water comes out"],
  [/\bno hay water\b/gi, "there is no water"],
  [/\bno tiene water\b/gi, "has no water"],
  [/\bwater leak\b/gi, "water leak"],
  [/\bfuga repaired\b/gi, "leak repaired"],
  [/\bfuga fixed\b/gi, "leak fixed"],
  [/\bfuga pendiente\b/gi, "leak still pending"],
  [/\balarma apagada\b/gi, "alarm switched off"],
  [/\balarma encendida\b/gi, "alarm switched on"],
  [/\btelevisor no enciende\b/gi, "TV is not working"],
  [/\btv no enciende\b/gi, "TV is not working"],
  [/\btv no funciona\b/gi, "TV is not working"],
  [/\bno electricity\b/gi, "no electricity"],
  [/\bdoor closed\b/gi, "door closed"],
  [/\bdoor open\b/gi, "door open"],
  [/\bwindow closed\b/gi, "window closed"],
  [/\bwindow open\b/gi, "window open"],
];

// ============================================================
// 4. DICCIONARIO DE PALABRAS INDIVIDUALES
// ============================================================

const PALABRAS = {
  // ----------------------------------------------------------
  // VIVIENDA Y ZONAS
  // ----------------------------------------------------------

  vivienda: "property",
  viviendas: "properties",
  casa: "house",
  casas: "houses",
  hogar: "home",
  edificio: "building",
  edificios: "buildings",
  apartamento: "apartment",
  apartamentos: "apartments",
  piso: "flat",
  pisos: "flats",
  propiedad: "property",
  propiedades: "properties",
  habitacion: "room",
  habitación: "room",
  habitaciones: "rooms",
  baño: "bathroom",
  bano: "bathroom",
  cocina: "kitchen",
  salon: "living room",
  salón: "living room",
  comedor: "dining room",
  dormitorio: "bedroom",
  dormitorios: "bedrooms",
  pasillo: "hallway",
  entrada: "entrance",
  recibidor: "hallway",
  escalera: "staircase",
  escaleras: "stairs",
  escalon: "step",
  escalón: "step",
  techo: "ceiling",
  pared: "wall",
  paredes: "walls",
  suelo: "floor",
  jardin: "garden",
  jardín: "garden",
  jardines: "gardens",
  terraza: "terrace",
  terrazas: "terraces",
  balcon: "balcony",
  balcón: "balcony",
  garaje: "garage",
  trastero: "storage room",
  lavadero: "utility room",
  exterior: "outside",
  interior: "inside",
  tejado: "roof",
  fachada: "facade",
  patio: "patio",

  // ----------------------------------------------------------
  // VERBOS Y EXPRESIONES GENERALES
  // ----------------------------------------------------------

  hay: "there is",
  esta: "is",
  está: "is",
  estan: "are",
  están: "are",
  tiene: "has",
  tienen: "have",
  necesita: "needs",
  necesitan: "need",
  parece: "seems",
  queda: "remains",
  quedan: "remain",
  falta: "is missing",
  faltan: "are missing",
  funciona: "works",
  funcionan: "work",
  deja: "leaves",
  dejan: "leave",
  hace: "makes",
  hacen: "make",
  puede: "can",
  pueden: "can",
  debe: "must",
  deben: "must",
  estaba: "was",
  estaban: "were",
  siendo: "being",
  encuentra: "is located",
  encuentran: "are located",
  encuentrá: "is located",
  requiere: "requires",
  requieren: "require",
  permite: "allows",
  permiten: "allow",
  presenta: "shows",
  presentan: "show",
  muestra: "shows",
  muestran: "show",
  tieneque: "has to",
  realizar: "carry out",
  realizado: "carried out",
  realizada: "carried out",
  realizados: "carried out",
  realizadas: "carried out",
  observado: "observed",
  observada: "observed",
  observados: "observed",
  observadas: "observed",
  detectado: "detected",
  detectada: "detected",
  detectados: "detected",
  detectadas: "detected",
  encontrado: "found",
  encontrada: "found",
  encontrados: "found",
  encontradas: "found",

  // ----------------------------------------------------------
  // CANTIDAD, TAMAÑO Y ASPECTO
  // ----------------------------------------------------------

  cantidad: "quantity",
  tamaño: "size",
  tamano: "size",
  aspecto: "appearance",
  problema: "problem",
  problemas: "problems",
  situacion: "situation",
  situación: "situation",
  lugar: "place",
  parte: "part",
  partes: "parts",
  zona: "area",
  zonas: "areas",
  superficie: "surface",
  superficies: "surfaces",
  nivel: "level",
  niveles: "levels",
  tipo: "type",
  tipos: "types",
  medida: "measurement",
  medidas: "measurements",
  pequeño: "small",
  pequeña: "small",
  pequeños: "small",
  pequeñas: "small",
  grande: "large",
  grandes: "large",
  largo: "long",
  larga: "long",
  largos: "long",
  largas: "long",
  corto: "short",
  corta: "short",
  cortos: "short",
  cortas: "short",
  alto: "high",
  alta: "high",
  altos: "high",
  altas: "high",
  bajo: "low",
  baja: "low",
  bajos: "low",
  bajas: "low",
  ancho: "wide",
  ancha: "wide",
  estrecho: "narrow",
  estrecha: "narrow",
  grueso: "thick",
  gruesa: "thick",
  fino: "thin",
  fina: "thin",
  fuerte: "strong",
  fuertes: "strong",
  flojo: "loose",
  floja: "loose",
  ligero: "light",
  ligera: "light",
  pesado: "heavy",
  pesada: "heavy",
  suficiente: "sufficient",
  insuficiente: "insufficient",
  excesivo: "excessive",
  excesiva: "excessive",
  varios: "several",
  varias: "several",
  mucho: "a lot",
  mucha: "a lot",
  muchos: "many",
  muchas: "many",
  poco: "little",
  poca: "little",
  pocos: "few",
  pocas: "few",
  todo: "all",
  toda: "all",
  todos: "all",
  todas: "all",
  alguno: "some",
  alguna: "some",
  algunos: "some",
  algunas: "some",
  ninguno: "none",
  ninguna: "none",

  // ----------------------------------------------------------
  // CONECTORES Y TIEMPO
  // ----------------------------------------------------------

  tambien: "also",
  también: "also",
  solamente: "only",
  solo: "only",
  sola: "alone",
  solos: "alone",
  solas: "alone",
  antes: "before",
  despues: "after",
  después: "after",
  durante: "during",
  mientras: "while",
  cuando: "when",
  donde: "where",
  aqui: "here",
  aquí: "here",
  alli: "there",
  allí: "there",
  cerca: "near",
  lejos: "far",
  dentro: "inside",
  fuera: "outside",
  encima: "above",
  debajo: "below",
  alrededor: "around",
  aproximadamente: "approximately",
  aprox: "approx.",
  hora: "hour",
  horas: "hours",
  minuto: "minute",
  minutos: "minutes",
  segundo: "second",
  segundos: "seconds",
  dia: "day",
  día: "day",
  dias: "days",
  días: "days",
  semana: "week",
  semanas: "weeks",
  mes: "month",
  meses: "months",
  año: "year",
  anos: "years",
  años: "years",
  ayer: "yesterday",
  hoy: "today",
  mañana: "tomorrow",
  manana: "tomorrow",
  posteriormente: "afterwards",
  actualmente: "currently",
  finalmente: "finally",
  inicialmente: "initially",
  inmediatamente: "immediately",

  // ----------------------------------------------------------
  // FONTANERÍA
  // ----------------------------------------------------------

  grifo: "tap",
  grifos: "taps",
  tubo: "pipe",
  tubos: "pipes",
  tuberia: "pipe",
  tubería: "pipe",
  tuberias: "pipes",
  tuberías: "pipes",
  agua: "water",
  aguas: "water",
  fuga: "leak",
  fugas: "leaks",
  gotera: "leak",
  goteras: "leaks",
  goteo: "dripping",
  goteando: "dripping",
  sifon: "siphon",
  sifón: "siphon",
  cisterna: "cistern",
  inodoro: "toilet",
  retrete: "toilet",
  lavabo: "washbasin",
  lavabos: "washbasins",
  lavamanos: "washbasin",
  bidet: "bidet",
  ducha: "shower",
  duchas: "showers",
  bañera: "bathtub",
  banera: "bathtub",
  bañeras: "bathtubs",
  mampara: "shower screen",
  manguera: "hose",
  mangueras: "hoses",
  valvula: "valve",
  válvula: "valve",
  valvulas: "valves",
  válvulas: "valves",
  llave: "key",
  llaves: "keys",
  fontaneria: "plumbing",
  fontanería: "plumbing",
  presion: "pressure",
  presión: "pressure",
  caliente: "hot",
  calientes: "hot",
  frio: "cold",
  frío: "cold",
  fria: "cold",
  fría: "cold",
  caudal: "flow",
  suministro: "supply",
  suministros: "supplies",
  desague: "drain",
  desagüe: "drain",
  desagues: "drains",
  desagües: "drains",
  rebosadero: "overflow",
  rebosaderos: "overflows",
  tapón: "plug",
  tapon: "plug",
  atasco: "blockage",
  atascos: "blockages",
  bomba: "pump",
  bombas: "pumps",

  // ----------------------------------------------------------
  // ELECTRICIDAD Y SEGURIDAD
  // ----------------------------------------------------------

  enchufe: "socket",
  enchufes: "sockets",
  interruptor: "switch",
  interruptores: "switches",
  cable: "wire",
  cables: "wires",
  electricidad: "electricity",
  electrico: "electrical",
  eléctrico: "electrical",
  electrica: "electrical",
  eléctrica: "electrical",
  electricos: "electrical",
  eléctricos: "electrical",
  luz: "light",
  luces: "lights",
  lampara: "lamp",
  lámpara: "lamp",
  lamparas: "lamps",
  lámparas: "lamps",
  bombilla: "bulb",
  bombillas: "bulbs",
  corriente: "power",
  fusible: "fuse",
  fusibles: "fuses",
  diferencial: "residual current device",
  magnetotermico: "circuit breaker",
  magnetotérmico: "circuit breaker",
  cuadro: "panel",
  alarma: "alarm",
  alarmas: "alarms",
  sensor: "sensor",
  sensores: "sensors",
  detector: "detector",
  detectores: "detectors",
  bateria: "battery",
  batería: "battery",
  baterias: "batteries",
  baterías: "batteries",
  pilas: "batteries",
  pila: "battery",
  transformador: "transformer",
  voltaje: "voltage",
  tension: "voltage",
  tensión: "voltage",
  potencia: "power",
  enchufado: "plugged in",
  enchufada: "plugged in",

  // ----------------------------------------------------------
  // PUERTAS Y VENTANAS
  // ----------------------------------------------------------

  puerta: "door",
  puertas: "doors",
  ventana: "window",
  ventanas: "windows",
  persiana: "shutter",
  persianas: "shutters",
  cristal: "glass",
  cristales: "glass panels",
  vidrio: "glass",
  marco: "frame",
  marcos: "frames",
  bisagra: "hinge",
  bisagras: "hinges",
  cerradura: "lock",
  cerraduras: "locks",
  manilla: "handle",
  manillas: "handles",
  pomo: "knob",
  pomos: "knobs",
  mosquitera: "fly screen",
  mosquiteras: "fly screens",
  cortina: "curtain",
  cortinas: "curtains",
  cristalera: "glass panel",
  barandilla: "railing",
  barandillas: "railings",
  valla: "fence",
  vallado: "fencing",
  porton: "gate",
  portón: "gate",
  pestillo: "latch",
  pestillos: "latches",
  cerrojo: "bolt",
  cerrojos: "bolts",
  bisel: "bevel",

  // ----------------------------------------------------------
  // HUMEDAD Y CONSTRUCCIÓN
  // ----------------------------------------------------------

  humedad: "dampness",
  humedades: "dampness",
  moho: "mould",
  hongos: "fungus",
  condensacion: "condensation",
  condensación: "condensation",
  filtracion: "water ingress",
  filtración: "water ingress",
  filtraciones: "water ingress",
  grieta: "crack",
  grietas: "cracks",
  fisura: "hairline crack",
  fisuras: "hairline cracks",
  pintura: "paint",
  yeso: "plaster",
  escayola: "plaster",
  cemento: "cement",
  mortero: "mortar",
  ladrillo: "brick",
  ladrillos: "bricks",
  azulejo: "tile",
  azulejos: "tiles",
  baldosa: "floor tile",
  baldosas: "floor tiles",
  pavimento: "flooring",
  aislamiento: "insulation",
  silicona: "sealant",
  masilla: "filler",
  teja: "roof tile",
  tejas: "roof tiles",
  canalon: "gutter",
  canalón: "gutter",
  bajante: "downpipe",
  fachada: "facade",
  obra: "building work",
  obras: "building works",
  pared: "wall",
  paredes: "walls",
  techo: "ceiling",
  techos: "ceilings",
  suelo: "floor",
  suelos: "floors",
  grieteado: "cracked",

  // ----------------------------------------------------------
  // ELECTRODOMÉSTICOS
  // ----------------------------------------------------------

  nevera: "fridge",
  frigorifico: "fridge",
  frigorífico: "fridge",
  congelador: "freezer",
  microondas: "microwave",
  lavadora: "washing machine",
  secadora: "dryer",
  lavavajillas: "dishwasher",
  horno: "oven",
  vitroceramica: "ceramic hob",
  vitrocerámica: "ceramic hob",
  vitro: "hob",
  hornillo: "cooker burner",
  campana: "extractor hood",
  extractor: "extractor",
  cafetera: "coffee machine",
  televisor: "TV",
  television: "TV",
  televisión: "TV",
  tele: "TV",
  router: "router",
  ventilador: "fan",
  aspiradora: "vacuum cleaner",
  plancha: "iron",
  caldera: "boiler",
  calentador: "water heater",
  termo: "water heater",
  radiador: "radiator",
  termostato: "thermostat",
  filtro: "filter",
  filtros: "filters",

  // ----------------------------------------------------------
  // MOBILIARIO Y EQUIPAMIENTO
  // ----------------------------------------------------------

  mueble: "piece of furniture",
  muebles: "furniture",
  armario: "cupboard",
  armarios: "cupboards",
  cajon: "drawer",
  cajón: "drawer",
  cajones: "drawers",
  mesa: "table",
  mesas: "tables",
  silla: "chair",
  sillas: "chairs",
  sofa: "sofa",
  sofá: "sofa",
  cama: "bed",
  camas: "beds",
  colchon: "mattress",
  colchón: "mattress",
  estanteria: "shelf",
  estantería: "shelf",
  estanterias: "shelves",
  estanterías: "shelves",
  espejo: "mirror",
  espejos: "mirrors",
  encimera: "worktop",
  fregadero: "kitchen sink",
  escritorio: "desk",
  escritorios: "desks",
  lámpara: "lamp",
  alfombra: "rug",
  alfombras: "rugs",
  estor: "blind",
  estores: "blinds",
  colchones: "mattresses",

  // ----------------------------------------------------------
  // JARDÍN Y PISCINA
  // ----------------------------------------------------------

  piscina: "pool",
  piscinas: "pools",
  depuradora: "filtration system",
  skimmer: "skimmer",
  cloro: "chlorine",
  cesped: "grass",
  césped: "grass",
  arbol: "tree",
  árbol: "tree",
  arboles: "trees",
  árboles: "trees",
  planta: "plant",
  plantas: "plants",
  riego: "irrigation",
  barbacoa: "barbecue",
  jardinero: "gardener",
  jardineria: "gardening",
  jardinería: "gardening",
  seto: "hedge",
  setos: "hedges",
  arbusto: "shrub",
  arbustos: "shrubs",
  tierra: "soil",
  grava: "gravel",
  piedra: "stone",
  piedras: "stones",
  maceta: "plant pot",
  macetas: "plant pots",
  fertilizante: "fertiliser",
  fertilizantes: "fertilisers",

  // ----------------------------------------------------------
  // LIMPIEZA Y ESTADO
  // ----------------------------------------------------------

  limpieza: "cleaning",
  limpio: "clean",
  limpia: "clean",
  limpios: "clean",
  limpias: "clean",
  sucio: "dirty",
  sucia: "dirty",
  sucios: "dirty",
  sucias: "dirty",
  polvo: "dust",
  basura: "rubbish",
  residuo: "waste",
  residuos: "waste",
  mancha: "stain",
  manchas: "stains",
  olor: "smell",
  olores: "smells",
  ruido: "noise",
  ruidos: "noises",
  vibracion: "vibration",
  vibración: "vibration",
  vibraciones: "vibrations",
  rotura: "breakage",
  desgaste: "wear",
  deterioro: "deterioration",
  daño: "damage",
  danos: "damage",
  daños: "damage",
  danado: "damaged",
  dañado: "damaged",
  dañada: "damaged",
  danada: "damaged",
  roto: "broken",
  rota: "broken",
  rotos: "broken",
  rotas: "broken",
  agrietado: "cracked",
  agrietada: "cracked",
  rajado: "cracked",
  rajada: "cracked",
  suelto: "loose",
  suelta: "loose",
  sueltos: "loose",
  sueltas: "loose",
  atascado: "blocked",
  atascada: "blocked",
  atascados: "blocked",
  atascadas: "blocked",
  obstruido: "blocked",
  obstruida: "blocked",
  oxidado: "rusty",
  oxidada: "rusty",
  quemado: "burnt",
  quemada: "burnt",
  fundido: "blown",
  fundida: "blown",
  abierto: "open",
  abierta: "open",
  abiertos: "open",
  abiertas: "open",
  cerrado: "closed",
  cerrada: "closed",
  cerrados: "closed",
  cerradas: "closed",
  apagado: "switched off",
  apagada: "switched off",
  encendido: "switched on",
  encendida: "switched on",
  pendiente: "pending",
  pendientes: "pending",
  completado: "completed",
  completada: "completed",
  finalizado: "completed",
  finalizada: "completed",
  reparado: "repaired",
  reparada: "repaired",
  reparados: "repaired",
  reparadas: "repaired",
  instalado: "installed",
  instalada: "installed",
  instalados: "installed",
  instaladas: "installed",
  sustituido: "replaced",
  sustituida: "replaced",
  cambiado: "changed",
  cambiada: "changed",
  nuevo: "new",
  nueva: "new",
  nuevos: "new",
  nuevas: "new",
  viejo: "old",
  vieja: "old",
  antiguo: "old",
  antigua: "old",
  correcto: "correct",
  correcta: "correct",
  incorrecto: "incorrect",
  incorrecta: "incorrect",
  bueno: "good",
  buena: "good",
  malos: "bad",
  malo: "bad",
  mala: "bad",
  aparentemente: "apparently",
  posiblemente: "possibly",
  probablemente: "probably",
  correctamente: "correctly",
  bien: "well",
  mal: "badly",
  visible: "visible",
  invisible: "not visible",

  // ----------------------------------------------------------
  // ACCIONES Y TRABAJOS
  // ----------------------------------------------------------

  revisar: "inspect",
  revisión: "inspection",
  revision: "inspection",
  comprobar: "check",
  verificar: "verify",
  reparar: "repair",
  reparación: "repair",
  reparacion: "repair",
  reparaciones: "repairs",
  cambiar: "replace",
  sustituir: "replace",
  instalar: "install",
  instalación: "installation",
  instalacion: "installation",
  retirar: "remove",
  quitar: "remove",
  colocar: "fit",
  montar: "fit",
  desmontar: "remove",
  ajustar: "adjust",
  ajuste: "adjustment",
  apretar: "tighten",
  aflojar: "loosen",
  limpiar: "clean",
  desatascar: "unblock",
  pintar: "paint",
  sellar: "seal",
  medir: "measure",
  medicion: "measurement",
  medición: "measurement",
  probar: "test",
  prueba: "test",
  pruebas: "tests",
  terminado: "finished",
  terminada: "finished",
  urgente: "urgent",
  urgencia: "urgent issue",
  necesario: "necessary",
  necesaria: "necessary",
  necesarios: "necessary",
  necesarias: "necessary",
  recomendado: "recommended",
  recomendada: "recommended",
  mantenimiento: "maintenance",
  material: "material",
  materiales: "materials",
  herramienta: "tool",
  herramientas: "tools",
  tornillo: "screw",
  tornillos: "screws",
  teflon: "PTFE tape",
  teflón: "PTFE tape",
  cinta: "tape",
  mano: "hand",
  trabajo: "work",
  trabajos: "work",
  realizado: "carried out",
  realizada: "carried out",
  pendiente: "pending",

  // ----------------------------------------------------------
  // PERSONAS Y PROFESIONALES
  // ----------------------------------------------------------

  tecnico: "technician",
  técnico: "technician",
  tecnica: "technician",
  técnica: "technician",
  cliente: "client",
  clientes: "clients",
  propietario: "owner",
  propietaria: "owner",
  propietarios: "owners",
  inquilino: "tenant",
  inquilina: "tenant",
  inquilinos: "tenants",
  proveedor: "supplier",
  proveedores: "suppliers",
  fontanero: "plumber",
  fontaneros: "plumbers",
  electricista: "electrician",
  electricistas: "electricians",
  pintor: "painter",
  pintores: "painters",
  albañil: "bricklayer",
  albanil: "bricklayer",
  jardinero: "gardener",
  jardinera: "gardener",
  limpiador: "cleaner",
  limpiadora: "cleaner",

  // ----------------------------------------------------------
  // ETIQUETAS Y TÉRMINOS DE INFORMES
  // ----------------------------------------------------------

  descripcion: "description",
  descripción: "description",
  observacion: "observation",
  observación: "observation",
  observaciones: "observations",
  estado: "status",
  fecha: "date",
  direccion: "address",
  dirección: "address",
  localidad: "town",
  ciudad: "city",
  codigo: "code",
  código: "code",
  postal: "postal",
  identificador: "identifier",
  informe: "report",
  informes: "reports",
  inspeccion: "inspection",
  inspección: "inspection",
  inspecciones: "inspections",
  fotografia: "photograph",
  fotografía: "photograph",
  fotografias: "photographs",
  fotografías: "photographs",
  imagen: "image",
  imagenes: "images",
  imágenes: "images",
  documento: "document",
  documentos: "documents",
  firma: "signature",
  firmado: "signed",
  firmada: "signed",
  contrato: "contract",
  contratos: "contracts",
  pago: "payment",
  pagos: "payments",
  factura: "invoice",
  facturas: "invoices",
};

// ============================================================
// 5. FUNCIONES DE TRADUCCIÓN
// ============================================================

// Mantiene las mayúsculas del texto original cuando es posible.
function ajustarMayusculasCG(original, traduccion) {
  if (!original || !traduccion) return traduccion;

  if (original === original.toUpperCase()) {
    return traduccion.toUpperCase();
  }

  if (
    original.length > 0 &&
    original[0] === original[0].toUpperCase() &&
    original[0] !== original[0].toLowerCase()
  ) {
    return traduccion.charAt(0).toUpperCase() + traduccion.slice(1);
  }

  return traduccion;
}

// Aplica las reglas de frases completas antes de traducir palabras.
function aplicarReglasFrases(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  let resultado = texto;

  for (const regla of REGLAS_FRASES) {
    if (!Array.isArray(regla) || regla.length < 2) continue;

    const [patron, traduccion] = regla;

    if (!(patron instanceof RegExp)) continue;

    resultado = resultado.replace(patron, coincidencia => {
      return ajustarMayusculasCG(coincidencia, traduccion);
    });
  }

  return resultado;
}

// Traduce palabras individuales sin alterar números ni signos.
function traducirPalabras(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  return texto.replace(
    /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g,
    palabra => {
      const traduccion = PALABRAS[palabra.toLowerCase()];

      if (!traduccion) return palabra;

      return ajustarMayusculasCG(palabra, traduccion);
    }
  );
}

// ============================================================
// 6. EXPRESIONES FRECUENTES Y FRASES MIXTAS
// ============================================================

const EXPRESIONES_MIXTAS_CG = [
  [/\bneeds repair\b/gi, "needs repair"],
  [/\bneeds cleaning\b/gi, "needs cleaning"],
  [/\bneeds replacing\b/gi, "needs replacing"],
  [/\bneeds to be repaired\b/gi, "needs to be repaired"],
  [/\bneeds to be cleaned\b/gi, "needs to be cleaned"],
  [/\bneeds to be replaced\b/gi, "needs to be replaced"],
  [/\bpendiente repair\b/gi, "repair pending"],
  [/\bpendiente cleaning\b/gi, "cleaning pending"],
  [/\bpendiente de repair\b/gi, "repair pending"],
  [/\bpendiente de limpieza\b/gi, "cleaning pending"],
  [/\bno funciona correctamente\b/gi, "is not working properly"],
  [/\bfunciona correctamente\b/gi, "is working properly"],
  [/\bse encuentra roto\b/gi, "is broken"],
  [/\bse encuentra rota\b/gi, "is broken"],
  [/\bse encuentra abierto\b/gi, "is open"],
  [/\bse encuentra abierta\b/gi, "is open"],
  [/\bse encuentra cerrado\b/gi, "is closed"],
  [/\bse encuentra cerrada\b/gi, "is closed"],
  [/\bse encuentra en buen estado\b/gi, "is in good condition"],
  [/\bse encuentra en mal estado\b/gi, "is in poor condition"],
  [/\bse necesita reparar\b/gi, "needs to be repaired"],
  [/\bse necesita limpiar\b/gi, "needs to be cleaned"],
  [/\bse necesita cambiar\b/gi, "needs to be replaced"],
  [/\bhay que reparar\b/gi, "needs to be repaired"],
  [/\bhay que limpiar\b/gi, "needs to be cleaned"],
  [/\bhay que cambiar\b/gi, "needs to be replaced"],
  [/\bno se puede abrir\b/gi, "cannot be opened"],
  [/\bno se puede cerrar\b/gi, "cannot be closed"],
  [/\bno se puede utilizar\b/gi, "cannot be used"],
  [/\bse puede abrir\b/gi, "can be opened"],
  [/\bse puede cerrar\b/gi, "can be closed"],
  [/\bse puede utilizar\b/gi, "can be used"],
  [/\bparece estar roto\b/gi, "appears to be broken"],
  [/\bparece estar rota\b/gi, "appears to be broken"],
  [/\bparece que funciona\b/gi, "appears to be working"],
  [/\bparece que no funciona\b/gi, "appears not to be working"],
  [/\bqueda pendiente\b/gi, "remains pending"],
  [/\bqueda por reparar\b/gi, "still needs repair"],
  [/\bqueda por limpiar\b/gi, "still needs cleaning"],
  [/\bfalta por instalar\b/gi, "still needs to be installed"],
  [/\bfalta instalar\b/gi, "still needs to be installed"],
  [/\bfalta reparar\b/gi, "still needs to be repaired"],
  [/\bfalta limpiar\b/gi, "still needs to be cleaned"],
  [/\bse ha observado\b/gi, "has been observed"],
  [/\bse ha detectado\b/gi, "has been detected"],
  [/\bse ha encontrado\b/gi, "has been found"],
  [/\bse ha comprobado\b/gi, "has been checked"],
  [/\bse ha revisado\b/gi, "has been inspected"],
  [/\bse ha reparado\b/gi, "has been repaired"],
  [/\bse ha sustituido\b/gi, "has been replaced"],
  [/\bse ha instalado\b/gi, "has been installed"],
  [/\bse ha limpiado\b/gi, "has been cleaned"],
  [/\bse ha dejado\b/gi, "has been left"],
  [/\bse encuentra ubicado\b/gi, "is located"],
  [/\bse encuentra ubicada\b/gi, "is located"],
  [/\bse encuentran ubicados\b/gi, "are located"],
  [/\bse encuentran ubicadas\b/gi, "are located"],
  [/\bpor el momento\b/gi, "for the time being"],
  [/\bde momento\b/gi, "for now"],
  [/\ben este momento\b/gi, "at this time"],
  [/\ben caso necesario\b/gi, "if necessary"],
  [/\bsi es necesario\b/gi, "if necessary"],
  [/\bsi fuera necesario\b/gi, "if required"],
  [/\bdebido a\b/gi, "due to"],
  [/\ba causa de\b/gi, "because of"],
  [/\bcon respecto a\b/gi, "regarding"],
  [/\ben relacion con\b/gi, "in relation to"],
  [/\ben relación con\b/gi, "in relation to"],
  [/\bjunto a\b/gi, "next to"],
  [/\bdebajo de\b/gi, "under"],
  [/\bencima de\b/gi, "on top of"],
  [/\bal lado de\b/gi, "next to"],
  [/\bfrente a\b/gi, "in front of"],
  [/\bdetras de\b/gi, "behind"],
  [/\bdetrás de\b/gi, "behind"],
  [/\bparte superior\b/gi, "upper part"],
  [/\bparte inferior\b/gi, "lower part"],
  [/\bparte central\b/gi, "central part"],
  [/\bparte trasera\b/gi, "rear part"],
  [/\bparte delantera\b/gi, "front part"],
  [/\bcon signos de\b/gi, "showing signs of"],
  [/\bpresenta signos de\b/gi, "shows signs of"],
  [/\bse observan\b/gi, "there are"],
  [/\bse observa\b/gi, "there is"],
  [/\bse aprecia\b/gi, "there is"],
  [/\bse aprecian\b/gi, "there are"],
  [/\bno presenta\b/gi, "does not show"],
  [/\bno presentan\b/gi, "do not show"],
  [/\bno dispone de\b/gi, "does not have"],
  [/\bdispone de\b/gi, "has"],
  [/\bcuenta con\b/gi, "has"],
  [/\bno cuenta con\b/gi, "does not have"],
  [/\bse recomienda\b/gi, "it is recommended"],
  [/\bse aconseja\b/gi, "it is advisable"],
  [/\bes necesario\b/gi, "it is necessary"],
  [/\bes necesaria\b/gi, "it is necessary"],
  [/\bes conveniente\b/gi, "it is advisable"],
  [/\bno es posible\b/gi, "it is not possible"],
  [/\bes posible\b/gi, "it is possible"],
  [/\bno se aprecia\b/gi, "is not visible"],
  [/\bno se observan\b/gi, "are not visible"],
  [/\bno se observa\b/gi, "is not visible"],
  [/\bse mantiene\b/gi, "remains"],
  [/\bse mantienen\b/gi, "remain"],
  [/\bse encuentra pendiente\b/gi, "is still pending"],
  [/\bse encuentran pendientes\b/gi, "are still pending"]
];

function traducirExpresionesMixtas(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  let resultado = texto;

  for (const [patron, traduccion] of EXPRESIONES_MIXTAS_CG) {
    resultado = resultado.replace(patron, coincidencia => {
      return ajustarMayusculasCG(coincidencia, traduccion);
    });
  }

  return resultado;
}

// ============================================================
// 7. CANTIDADES, MEDIDAS Y UNIDADES DE TIEMPO
// ============================================================

const UNIDADES_CG = {
  milimetro: "millimetre",
  milimetros: "millimetres",
  milímetro: "millimetre",
  milímetros: "millimetres",
  centimetro: "centimetre",
  centimetros: "centimetres",
  centímetro: "centimetre",
  centímetros: "centimetres",
  metro: "metre",
  metros: "metres",
  kilometro: "kilometre",
  kilometros: "kilometres",
  kilómetro: "kilometre",
  kilómetros: "kilometres",
  litro: "litre",
  litros: "litres",
  gramo: "gram",
  gramos: "grams",
  kilogramo: "kilogram",
  kilogramos: "kilograms",
  kilo: "kilo",
  kilos: "kilos",
  grado: "degree",
  grados: "degrees",
  hora: "hour",
  horas: "hours",
  minuto: "minute",
  minutos: "minutes",
  segundo: "second",
  segundos: "seconds",
  dia: "day",
  día: "day",
  dias: "days",
  días: "days",
  semana: "week",
  semanas: "weeks",
  mes: "month",
  meses: "months",
  año: "year",
  años: "years",
  ano: "year",
  anos: "years"
};

function traducirCantidadesTiempo(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  return texto.replace(
    /(\d+(?:[.,]\d+)?)\s*(milímetros?|milimetros?|centímetros?|centimetros?|kilómetros?|kilometros?|metros?|milímetros?|litros?|gramos?|kilogramos?|kilos?|grados?|horas?|minutos?|segundos?|días?|dias?|semanas?|meses?|años?|anos?)\b/gi,
    (coincidencia, cantidad, unidad) => {
      const traduccion = UNIDADES_CG[unidad.toLowerCase()];

      if (!traduccion) return coincidencia;

      return `${cantidad} ${traduccion}`;
    }
  );
}

// ============================================================
// 8. ETIQUETAS HABITUALES DE INFORMES
// ============================================================

const ETIQUETAS_CG = [
  [/\bdescripcion\s*:/gi, "Description:"],
  [/\bdescripción\s*:/gi, "Description:"],
  [/\bobservacion\s*:/gi, "Observation:"],
  [/\bobservación\s*:/gi, "Observation:"],
  [/\bobservaciones\s*:/gi, "Observations:"],
  [/\bestado\s*:/gi, "Condition:"],
  [/\bfecha\s*:/gi, "Date:"],
  [/\bdireccion\s*:/gi, "Address:"],
  [/\bdirección\s*:/gi, "Address:"],
  [/\bciudad\s*:/gi, "City:"],
  [/\blocalidad\s*:/gi, "Town:"],
  [/\bcodigo postal\s*:/gi, "Postcode:"],
  [/\bcódigo postal\s*:/gi, "Postcode:"],
  [/\bidentificador\s*:/gi, "Identifier:"],
  [/\binforme\s*:/gi, "Report:"],
  [/\binspeccion\s*:/gi, "Inspection:"],
  [/\binspección\s*:/gi, "Inspection:"],
  [/\binspecciones\s*:/gi, "Inspections:"],
  [/\bcliente\s*:/gi, "Client:"],
  [/\bpropietario\s*:/gi, "Owner:"],
  [/\btecnico\s*:/gi, "Technician:"],
  [/\btécnico\s*:/gi, "Technician:"],
  [/\bfotografias\s*:/gi, "Photographs:"],
  [/\bfotografías\s*:/gi, "Photographs:"],
  [/\bfirma\s*:/gi, "Signature:"],
  [/\bcontrato\s*:/gi, "Contract:"],
  [/\bpago\s*:/gi, "Payment:"],
  [/\bfactura\s*:/gi, "Invoice:"]
];

function traducirEtiquetas(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  let resultado = texto;

  for (const [patron, traduccion] of ETIQUETAS_CG) {
    resultado = resultado.replace(patron, traduccion);
  }

  return resultado;
}

// ============================================================
// 9. CORRECCIONES Y NORMALIZACIÓN DE ERRORES FRECUENTES
// ============================================================

const CORRECCIONES_TRADUCCION_CG = [
  [/\blavadora\b/gi, "lavadora"],
  [/\blavavajilla\b/gi, "lavavajillas"],
  [/\bfrigorifico\b/gi, "frigorífico"],
  [/\bfontaneria\b/gi, "fontanería"],
  [/\belectricidad\b/gi, "electricidad"],
  [/\bhabitacion\b/gi, "habitación"],
  [/\bdesague\b/gi, "desagüe"],
  [/\bcalefaccion\b/gi, "calefacción"],
  [/\bcondensacion\b/gi, "condensación"],
  [/\bfiltracion\b/gi, "filtración"],
  [/\bpresion\b/gi, "presión"],
  [/\bvalvula\b/gi, "válvula"],
  [/\bconexion\b/gi, "conexión"],
  [/\biluminacion\b/gi, "iluminación"]
];

function corregirTextoOriginalCG(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  let resultado = texto;

  for (const [patron, reemplazo] of CORRECCIONES_TRADUCCION_CG) {
    resultado = resultado.replace(patron, reemplazo);
  }

  return resultado;
}

// ============================================================
// 10. TRADUCCIÓN DE CADA FRAGMENTO
// ============================================================

function traducirFragmento(texto) {
  if (typeof texto !== "string" || !texto.trim()) return texto;

  let resultado = texto;

  // Primero se corrigen errores ortográficos frecuentes.
  resultado = corregirTextoOriginalCG(resultado);

  // Después se traducen las expresiones completas.
  resultado = aplicarReglasFrases(resultado);

  // Se reconocen expresiones que mezclan inglés y español.
  resultado = traducirExpresionesMixtas(resultado);

  // Se traducen las palabras que todavía estén en español.
  resultado = traducirPalabras(resultado);

  // Se traducen las etiquetas de los informes.
  resultado = traducirEtiquetas(resultado);

  // Finalmente se traducen las unidades y cantidades.
  resultado = traducirCantidadesTiempo(resultado);

  return resultado;
}

// ============================================================
// 11. FUNCIÓN PRINCIPAL
// ============================================================

export function traducirObservacionInspeccion(
  texto,
  idiomaCliente = "es"
) {
  if (typeof texto !== "string") return texto;

  if (!texto.trim()) return texto;

  const idioma = String(idiomaCliente || "es")
    .trim()
    .toLowerCase();

  // El español continúa siendo el idioma predeterminado.
  if (
    idioma !== "en" &&
    idioma !== "english" &&
    idioma !== "ingles" &&
    idioma !== "inglés"
  ) {
    return texto;
  }

  // Se conservan los saltos de línea y la estructura original.
  return texto
    .split("\n")
    .map(linea => {
      if (!linea.trim()) return linea;

      return linea.replace(
        /[^.!?;]+[.!?;]?/g,
        fragmento => {
          if (!fragmento.trim()) return fragmento;

          return traducirFragmento(fragmento);
        }
      );
    })
    .join("\n");
}

// ============================================================
// 12. EXPORTACIÓN POR DEFECTO
// ============================================================

export default traducirObservacionInspeccion;
