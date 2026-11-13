/* ============================================================
   DULCE ESTACIÓN · datos compartidos de la página y las fichas de servicio
   (cargar antes que script.js y servicio.js)
   ============================================================ */

const CONFIG = {
  // Número de WhatsApp en formato internacional, sin + ni espacios
  whatsapp: '56927535859',

  // Redes de la empresa
  redes: {
    instagram: 'https://www.instagram.com/dulce_estacionccp/',
    tiktok: 'https://www.tiktok.com/@dulce_estacionccp'
  },

  // Base de operaciones (desde donde se calcula el traslado)
  base: { lat: -36.8270, lng: -73.0503, nombre: 'Concepción centro' },
  pais: 'cl',                // código de país para la búsqueda de direcciones

  // Direcciones fuera de las zonas pero cerca de una: hasta estos km de distancia
  // se cobra la tarifa de la zona más cercana más un extra que se confirma por WhatsApp.
  // Más lejos, el traslado queda "por cotizar".
  kmZonaCercana: 3,

  // PDF de la cotización: días de validez y datos de contacto del pie
  validezCotizacionDias: 15,
  correo: 'Dulceestacion.contacto@gmail.com',
  web: 'dulcestacion.cl',

};

/* ------------------------------------------------------------
   Zonas de traslado — datos tomados del mapa "Candybar" de la
   empresa en Google My Maps. Precios en CLP tal cual el mapa:
   A $5.000 · B $10.000 · C $15.000 · D $20.000

   Para actualizarlas: edita el mapa en Google My Maps y descarga el KML desde
   https://www.google.com/maps/d/kml?mid=1b7oHN4OvMe15QxjDgeXpe4AeX2ARbKM&forcekml=1
   (ojo: el KML trae las coordenadas como longitud,latitud — aquí van al revés).
------------------------------------------------------------ */
const ZONAS_TRASLADO = [
  { zona: 'A', precio: 5000, nombre: 'Concepción', poligono: [[-36.86017,-73.04796],[-36.85392,-73.03809],[-36.84005,-73.04753],[-36.83922,-73.02805],[-36.8316,-73.02418],[-36.84767,-73.01225],[-36.84328,-72.9938],[-36.83119,-72.98719],[-36.81385,-72.97305],[-36.80684,-72.98403],[-36.80457,-72.99871],[-36.80567,-73.01408],[-36.75955,-72.99236],[-36.75735,-73.00592],[-36.76725,-73.02824],[-36.76966,-73.05141],[-36.77694,-73.05639],[-36.78182,-73.05914],[-36.79049,-73.06274],[-36.7966,-73.0666],[-36.79915,-73.06875],[-36.8021,-73.0727],[-36.8054,-73.07733],[-36.80725,-73.08008],[-36.80925,-73.08154],[-36.8122,-73.08137],[-36.81488,-73.08257],[-36.81667,-73.08283],[-36.84552,-73.05759],[-36.86017,-73.04796]] },
  { zona: 'B', precio: 10000, nombre: 'Hualpén', poligono: [[-36.81488,-73.08257],[-36.8094,-73.08214],[-36.80747,-73.08136],[-36.80039,-73.07089],[-36.79545,-73.06634],[-36.78974,-73.06274],[-36.78582,-73.07338],[-36.77661,-73.11278],[-36.77592,-73.11355],[-36.76987,-73.14127],[-36.78871,-73.14771],[-36.79015,-73.11939],[-36.80369,-73.12145],[-36.81488,-73.08257]] },
  { zona: 'B', precio: 10000, nombre: 'San Pedro de la Paz · sector 1', poligono: [[-36.87254,-73.07573],[-36.88421,-73.06217],[-36.88338,-73.05788],[-36.86457,-73.06166],[-36.84094,-73.07316],[-36.82995,-73.08397],[-36.82432,-73.10234],[-36.82116,-73.13084],[-36.82198,-73.13736],[-36.82597,-73.13564],[-36.82872,-73.13358],[-36.83751,-73.12689],[-36.84699,-73.12088],[-36.8496,-73.12002],[-36.85001,-73.1159],[-36.85166,-73.10406],[-36.85606,-73.10818],[-36.86045,-73.10989],[-36.86539,-73.10595],[-36.8691,-73.09702],[-36.87034,-73.08689],[-36.87254,-73.07573]] },
  { zona: 'B', precio: 10000, nombre: 'Talcahuano · sector 1', poligono: [[-36.71028,-73.11365],[-36.71094,-73.1149],[-36.71238,-73.11533],[-36.71328,-73.11545],[-36.71462,-73.11674],[-36.71534,-73.11799],[-36.71713,-73.11867],[-36.71885,-73.1185],[-36.72053,-73.11846],[-36.72208,-73.11846],[-36.72377,-73.11782],[-36.72452,-73.1176],[-36.72501,-73.11747],[-36.7256,-73.12232],[-36.72608,-73.12579],[-36.72642,-73.12811],[-36.72707,-73.1288],[-36.72924,-73.12794],[-36.73103,-73.12712],[-36.73364,-73.12687],[-36.73812,-73.12725],[-36.74142,-73.12841],[-36.74376,-73.12927],[-36.7473,-73.13129],[-36.74998,-73.13335],[-36.75184,-73.13519],[-36.75679,-73.14021],[-36.76078,-73.14828],[-36.76411,-73.1512],[-36.76934,-73.14279],[-36.78006,-73.09592],[-36.7857,-73.07138],[-36.78872,-73.06262],[-36.77635,-73.05747],[-36.76975,-73.05267],[-36.76356,-73.05696],[-36.76026,-73.07121],[-36.74884,-73.07395],[-36.73935,-73.07859],[-36.73316,-73.09129],[-36.72972,-73.09472],[-36.72615,-73.09781],[-36.72353,-73.10331],[-36.72154,-73.10661],[-36.7172,-73.10794],[-36.71655,-73.10704],[-36.7117,-73.10747],[-36.70974,-73.10773],[-36.71028,-73.11365]] },
  { zona: 'B', precio: 10000, nombre: 'Penco', poligono: [[-36.759,-73.01088],[-36.7568,-73.00599],[-36.759,-72.99423],[-36.75178,-72.99011],[-36.74614,-72.98213],[-36.74002,-72.97964],[-36.7372,-72.97131],[-36.73314,-72.97663],[-36.73369,-72.98118],[-36.72908,-72.97749],[-36.72729,-72.96899],[-36.72052,-72.97194],[-36.71453,-72.96448],[-36.70868,-72.96164],[-36.70074,-72.96885],[-36.70122,-72.97817],[-36.70724,-72.97924],[-36.71089,-72.97971],[-36.71525,-72.98838],[-36.72874,-72.99538],[-36.73534,-73.00087],[-36.73617,-73.01065],[-36.759,-73.01088]] },
  { zona: 'C', precio: 15000, nombre: 'San Pedro de la Paz · sector 2', poligono: [[-36.91561,-73.15343],[-36.91533,-73.13798],[-36.90545,-73.13627],[-36.90023,-73.12665],[-36.87607,-73.12391],[-36.85135,-73.11944],[-36.83569,-73.12906],[-36.83129,-73.13318],[-36.82195,-73.14004],[-36.82085,-73.14828],[-36.82607,-73.15412],[-36.84503,-73.15584],[-36.85794,-73.15275],[-36.88101,-73.15309],[-36.9049,-73.15412],[-36.91561,-73.15343]] },
  { zona: 'C', precio: 15000, nombre: 'Chiguayante', poligono: [[-36.85392,-73.03809],[-36.86201,-73.05169],[-36.87108,-73.0486],[-36.88399,-73.04482],[-36.89826,-73.03967],[-36.91281,-73.04173],[-36.93148,-73.04173],[-36.95316,-73.03177],[-36.96578,-73.01014],[-36.96495,-73.00568],[-36.95425,-73.00259],[-36.94685,-73.00087],[-36.93669,-73.00019],[-36.92709,-73.00877],[-36.91885,-73.01186],[-36.90897,-73.01735],[-36.89607,-73.02113],[-36.88646,-73.02971],[-36.88371,-73.02491],[-36.873,-73.03006],[-36.86449,-73.03177],[-36.85392,-73.03809]] },
  { zona: 'C', precio: 15000, nombre: 'Talcahuano · sector 2', poligono: [[-36.67543,-73.11012],[-36.67729,-73.11578],[-36.68279,-73.11836],[-36.68692,-73.11887],[-36.68975,-73.1193],[-36.69085,-73.11853],[-36.69511,-73.12119],[-36.70275,-73.12325],[-36.70592,-73.13175],[-36.70716,-73.1381],[-36.71005,-73.14951],[-36.71431,-73.15123],[-36.72436,-73.14445],[-36.72752,-73.14325],[-36.73247,-73.1429],[-36.73392,-73.13775],[-36.72945,-73.13423],[-36.72759,-73.13235],[-36.72635,-73.13295],[-36.72566,-73.13123],[-36.72718,-73.1296],[-36.72707,-73.1288],[-36.72632,-73.12825],[-36.72487,-73.11754],[-36.72247,-73.11844],[-36.71682,-73.11881],[-36.71543,-73.11831],[-36.71404,-73.1163],[-36.71335,-73.11567],[-36.7122,-73.11548],[-36.71144,-73.11514],[-36.7107,-73.11497],[-36.71025,-73.11394],[-36.70893,-73.11213],[-36.70547,-73.11198],[-36.70084,-73.10904],[-36.69984,-73.10855],[-36.6994,-73.10767],[-36.69749,-73.10673],[-36.69498,-73.10576],[-36.69281,-73.10246],[-36.69818,-73.10198],[-36.69806,-73.09904],[-36.69525,-73.09846],[-36.6957,-73.09587],[-36.6925,-73.09475],[-36.69102,-73.10005],[-36.69076,-73.10239],[-36.68539,-73.10153],[-36.67543,-73.11012]] },
  { zona: 'C', precio: 15000, nombre: 'Camino a Bulnes', poligono: [[-36.81248,-72.9748],[-36.81254,-72.97042],[-36.81261,-72.96639],[-36.80663,-72.96828],[-36.80471,-72.95806],[-36.80808,-72.94639],[-36.81625,-72.94476],[-36.81983,-72.94544],[-36.82258,-72.93712],[-36.82855,-72.92854],[-36.83247,-72.9239],[-36.8381,-72.92021],[-36.83714,-72.90442],[-36.82787,-72.90682],[-36.82285,-72.85309],[-36.81461,-72.85309],[-36.80856,-72.86142],[-36.8179,-72.87798],[-36.82182,-72.87978],[-36.81907,-72.88734],[-36.82182,-72.89472],[-36.82278,-72.89635],[-36.82203,-72.90493],[-36.82711,-72.91678],[-36.82422,-72.92811],[-36.81186,-72.9324],[-36.80272,-72.94235],[-36.79873,-72.94562],[-36.79701,-72.96373],[-36.79282,-72.96725],[-36.79413,-72.97188],[-36.79907,-72.96999],[-36.80883,-72.97754],[-36.81248,-72.9748]] },
  { zona: 'D', precio: 20000, nombre: 'Tomé', poligono: [[-36.70074,-72.96885],[-36.67261,-72.95378],[-36.66435,-72.9416],[-36.65374,-72.95155],[-36.64837,-72.95069],[-36.6419,-72.94348],[-36.6357,-72.94718],[-36.63439,-72.94881],[-36.62468,-72.94632],[-36.62482,-72.93705],[-36.62103,-72.93044],[-36.61552,-72.92967],[-36.61442,-72.93061],[-36.616,-72.93284],[-36.61628,-72.93413],[-36.61194,-72.93533],[-36.60828,-72.93559],[-36.60546,-72.94074],[-36.60146,-72.93919],[-36.59988,-72.94357],[-36.60008,-72.94572],[-36.59512,-72.94863],[-36.59492,-72.94984],[-36.59044,-72.94932],[-36.59168,-72.95224],[-36.58996,-72.95353],[-36.5843,-72.9525],[-36.58437,-72.95636],[-36.58796,-72.95799],[-36.58851,-72.96202],[-36.59085,-72.96168],[-36.59202,-72.9573],[-36.5934,-72.95748],[-36.5954,-72.96614],[-36.59223,-72.96906],[-36.59375,-72.97224],[-36.59478,-72.97232],[-36.59533,-72.97825],[-36.60443,-72.9791],[-36.60918,-72.98099],[-36.61276,-72.97696],[-36.61235,-72.96863],[-36.61442,-72.96529],[-36.61807,-72.96443],[-36.62082,-72.964],[-36.62069,-72.9622],[-36.61924,-72.96048],[-36.62172,-72.95902],[-36.63067,-72.9567],[-36.6368,-72.95885],[-36.64059,-72.95301],[-36.64486,-72.9555],[-36.6607,-72.95868],[-36.66373,-72.96503],[-36.6691,-72.97361],[-36.6713,-72.97627],[-36.6766,-72.97516],[-36.67543,-72.95988],[-36.69367,-72.97061],[-36.69876,-72.97232],[-36.70074,-72.96885]] },
  { zona: 'D', precio: 20000, nombre: 'Coronel', poligono: [[-36.91533,-73.13798],[-36.91901,-73.15739],[-36.92889,-73.1591],[-36.97389,-73.17764],[-36.99939,-73.19172],[-37.02653,-73.18485],[-37.03092,-73.1773],[-37.02598,-73.17181],[-37.02818,-73.16288],[-37.02571,-73.15636],[-37.02845,-73.15189],[-37.04435,-73.14606],[-37.04983,-73.13473],[-37.03832,-73.11859],[-37.02324,-73.1155],[-37.01831,-73.13026],[-36.99665,-73.12511],[-36.96923,-73.12511],[-36.95057,-73.14159],[-36.91533,-73.13798]] },
];

// Color de cada zona en el mapa y la leyenda: de más clara (más cerca) a más intensa (más lejos)
const COLOR_ZONA = { A: '#F2A33A', B: '#EB7A31', C: '#E1462C', D: '#A82E1C' };

/* Tarifas aprobadas por Maus vía ADMIN: Costos-y-Promos-Dulce-Estacion-v2.xlsx.
   Precio por persona para cada tramo; traslado aparte. */
const CAPACIDADES = [20, 30, 40, 50, 60, 70, 80, 100];

/* Validez de la cotización (regla de Maus, aprobada por ADMIN 12-nov):
   · 2 o más estaciones: válido (desde 20).
   · 1 estación: válido solo si tramo + porciones extra de esa estación >= 40.
   · 0 estaciones: inválido.
   `elegidas` acepta un array de ids (strings) o de objetos { id, … }. */
const cotizacionValida = (elegidas, cap, extras) => {
  const ids = (elegidas || []).map(x => (typeof x === 'string' ? x : x.id));
  if (!ids.length) return false;               // 0 estaciones
  if (ids.length >= 2) return true;            // 2+ estaciones
  if (cap == null) return true;                // "más de 100": 1 estación siempre >= 40
  if (!CAPACIDADES.includes(cap)) return false;
  const extra = (extras && extras[ids[0]]) || 0;
  return cap + extra >= 40;
};
// Único lugar para actualizar tarifas (Excel v2, revisión de Maus del 7-nov).
const TARIFAS_SERVICIO = {
  descuentos: [0, 0, 5, 5, 10, 10, 20, 20], // porcentajes del Excel por tramo
  dulces: [3000, 3000, 2850, 2850, 2700, 2700, 2400, 2400],
  helado: [1500, 1500, 1450, 1450, 1350, 1350, 1200, 1200],
  ilimitados: [1000, 1000, 950, 950, 900, 900, 800, 800],
  combosFijos: { 'algodon+palomitas': 60000 }
};

/* tipo/tags pendientes de datos reales del dueño (ver CLAUDE.md, sección
   "Pendientes"): no mostrar toppings ni categorías de máquina inventados. */
const MAQUINAS = {
  crepes: {
    nombre: 'Crepes', ico: '🥐', tipo: null, slug: 'crepes',
    precios: TARIFAS_SERVICIO.dulces, admiteExtras: true,
    foto: 'img/dulce-estacion-crepe-preparacion.webp', fw: 618, fh: 771,
    fotoAlt: 'Mezcla de crepe cayendo sobre la plancha circular al momento de prepararlo',
    fotos: [{ src: 'img/dulce-estacion-crepe-preparacion.webp', alt: 'Mezcla de crepe cayendo sobre la plancha circular al momento de prepararlo' }],
    incluye: [
          "Operador atendiendo durante todo el servicio",
          "Crepes preparados en el momento, con insumos incluidos",
          "Salsa, topping a elecci\u00f3n, mostacilla y fruta",
          "Montaje y desarme"
    ],
    parrafos: [
          "Pocas cosas atraen tanto la mirada en un evento como un crepe que se prepara frente a ti. Con el servicio de crepes, la masa se cocina en el momento, a la vista de todos, y los invitados se acercan a mirar, conversar y pedir el suyo.",
          "Cada persona recibe su crepe en un plato, con tenedor de madera. Lleva salsa, topping, mostacilla y fruta, que puede ser pl\u00e1tano, frutilla, frambuesa o ar\u00e1ndanos. Los toppings son a elecci\u00f3n, as\u00ed que cada invitado lo pide a su gusto.",
          "Es un servicio que se luce en matrimonios, donde se vuelve un punto de encuentro entre el c\u00f3ctel y la fiesta. Tambi\u00e9n funciona en cumplea\u00f1os de todas las edades, en baby showers y en celebraciones de empresa, donde acompa\u00f1a bien una conversaci\u00f3n larga.",
    ],
    desc: 'Crepes dulces extendidos a la vista de tus invitados y rellenos al gusto de cada uno.',
    tags: []
  },
  waffles: {
    nombre: 'Waffles', ico: '🧇', tipo: null, slug: 'waffles',
    precios: TARIFAS_SERVICIO.dulces, admiteExtras: true,
    foto: 'img/dulce-estacion-waffle-oreo-crema.webp', fw: 736, fh: 981,
    fotoAlt: 'Waffle con crema, salsa de chocolate y galleta triturada por encima',
    fotos: [{ src: 'img/dulce-estacion-waffle-oreo-crema.webp', alt: 'Waffle con crema, salsa de chocolate y galleta triturada por encima' }],
    incluye: [
          "Un waffle por porci\u00f3n, preparado en el momento",
          "Salsa, topping a elecci\u00f3n, mostacilla y fruta",
          "Bandeja de cart\u00f3n con papel antigrasa y palito",
          "Operador, insumos, montaje y desarme"
    ],
    parrafos: [
          "Hay un aroma que cambia el ambiente de un evento: el del waffle reci\u00e9n hecho. El servicio de waffles lo trae a tu celebraci\u00f3n, y los invitados ven c\u00f3mo se prepara cada uno justo antes de recibirlo.",
          "Cada porci\u00f3n es un waffle, servido en una bandeja de cart\u00f3n con papel antigrasa y un palito para comerlo con comodidad. Lleva salsa, topping, mostacilla y fruta: pl\u00e1tano, frutilla, frambuesa o ar\u00e1ndanos. Los toppings son a elecci\u00f3n.",
          "Es ideal para cumplea\u00f1os, sobre todo cuando hay ni\u00f1os, porque se come f\u00e1cil y sin cubiertos. Tambi\u00e9n se disfruta en baby showers, en matrimonios como estaci\u00f3n de postre y en actividades de empresa, desde un aniversario hasta una jornada con el equipo.",
    ],
    desc: 'Waffles crocantes hechos en el momento, servidos calientes con la barra de toppings abierta.',
    tags: []
  },
  hotcakes: {
    nombre: 'Hotcakes', ico: '🥞', tipo: null, slug: 'hotcakes',
    precios: TARIFAS_SERVICIO.dulces, admiteExtras: true,
    foto: 'img/dulce-estacion-mini-pancakes-toppings.webp', fw: 736, fh: 920,
    fotoAlt: 'Bandejas de mini pancakes con confites de colores, frutillas y maní con chocolate',
    fotos: [
      { src: 'img/dulce-estacion-mini-pancakes-toppings.webp', alt: 'Bandejas de mini pancakes con confites de colores, frutillas y maní con chocolate' },
      { src: 'img/dulce-estacion-mini-pancakes-carrito-evento.webp', alt: 'Servicio de mini pancakes preparado para un evento' }
    ],
    incluye: [
          "6 mini hotcakes por porci\u00f3n, hechos en el momento",
          "Salsa, topping a elecci\u00f3n, mostacilla y fruta",
          "Bandeja de cart\u00f3n y operador durante todo el servicio",
          "Insumos incluidos, montaje y desarme"
    ],
    parrafos: [
          "Los hotcakes tienen algo que le gusta a casi todos: son simples y se comen con ganas. En nuestro servicio se preparan en versi\u00f3n mini, y verlos prepararse frente a los invitados ya es parte del espect\u00e1culo.",
          "Cada porci\u00f3n trae 6 mini hotcakes en una bandeja de cart\u00f3n. Se acompa\u00f1an con salsa, topping, mostacilla y fruta, ya sea pl\u00e1tano, frutilla, frambuesa o ar\u00e1ndanos. Los toppings son a elecci\u00f3n, y el tama\u00f1o peque\u00f1o hace que cada bocado se pueda disfrutar con calma.",
          "Funciona muy bien en cumplea\u00f1os infantiles y familiares, y tambi\u00e9n en baby showers, donde se agradece un postre f\u00e1cil de compartir. En eventos de empresa, es una buena opci\u00f3n para un desayuno especial, una jornada o una celebraci\u00f3n de fin de a\u00f1o.",
    ],
    desc: 'Torres de hotcakes esponjosos recién hechos. El favorito de los niños y de los que no lo son tanto.',
    tags: []
  },
  helados: {
    nombre: 'Helado soft', ico: '🍨', tipo: null, slug: 'helados',
    precios: TARIFAS_SERVICIO.helado, admiteExtras: true,
    foto: 'img/dulce-estacion-helado-soft-cono.webp', fw: 1000, fh: 1500,
    fotoAlt: 'Cono de helado soft servido directamente desde la máquina',
    fotos: [{ src: 'img/dulce-estacion-helado-soft-cono.webp', alt: 'Cono de helado soft servido directamente desde la máquina' }],
    incluye: [
          "Helado soft en cono de barquillo, sabores chocolate y vainilla",
          "Salsa y mostacilla de colores o de chocolate",
          "Operador atendiendo durante todo el servicio",
          "Insumos incluidos, montaje y desarme"
    ],
    parrafos: [
          "El helado soft tiene un efecto casi inmediato: al verlo servir, los invitados se acercan solos. En tu evento, cada helado se sirve frente a ellos, listo para comerlo apenas llega a sus manos.",
          "Se entrega en cono de barquillo, en sabor chocolate o vainilla, con salsa y mostacilla, ya sea de colores o de chocolate. Es una opci\u00f3n simple de elegir y f\u00e1cil de disfrutar, para ni\u00f1os y para adultos.",
          "Es especialmente buena en cumplea\u00f1os, en matrimonios que se celebran en temporada de calor y en baby showers al aire libre. En empresas, sirve como un detalle para el equipo o para una actividad con clientes y familias.",
    ],
    desc: 'Helado servido al momento, con salsas y toppings a elección de cada invitado.',
    tags: []
  },
  palomitas: {
    nombre: 'Palomitas', ico: '🍿', tipo: 'Consumo ilimitado', slug: 'palomitas',
    precios: TARIFAS_SERVICIO.ilimitados, admiteExtras: false,
    foto: 'img/dulce-estacion-palomitas-bolsa.webp', fw: 600, fh: 906,
    fotoAlt: 'Bolsa de papel llena de palomitas de maíz recién reventadas',
    fotos: [{ src: 'img/dulce-estacion-palomitas-bolsa.webp', alt: 'Bolsa de papel llena de palomitas de maíz recién reventadas' }],
    incluye: [
          "Palomitas dulces reventadas en la m\u00e1quina, frente a los invitados",
          "Consumo sin l\u00edmite durante el servicio",
          "Bolsa de papel para cada invitado",
          "Operador, insumos, montaje y desarme"
    ],
    parrafos: [
          "Las palomitas se huelen antes de verse. Cuando la m\u00e1quina empieza a reventar el ma\u00edz frente a los invitados, el servicio se transforma en el punto del evento al que todos pasan a buscar algo para llevar en la mano.",
          "Se preparan dulces, en el momento, y se entregan en una bolsa de papel. Durante el servicio no hay l\u00edmite: cada invitado puede volver las veces que quiera mientras estemos atendiendo.",
          "Es un servicio muy c\u00f3modo para eventos largos o con mucho movimiento, como cumplea\u00f1os infantiles, matrimonios con pista de baile o baby showers. En empresas funciona bien en ferias internas, lanzamientos o celebraciones de fin de a\u00f1o, donde la gente circula y conversa.",
    ],
    desc: 'Servicio de palomitas reventadas al momento. Se sirven sin límite durante todo el servicio.',
    tags: []
  },
  algodon: {
    nombre: 'Algodón de azúcar', ico: '🍭', tipo: 'Consumo ilimitado', slug: 'algodon',
    precios: TARIFAS_SERVICIO.ilimitados, admiteExtras: false,
    fotos: [],
    incluye: [
          "Algod\u00f3n de az\u00facar hilado al instante, frente a los invitados",
          "Consumo sin l\u00edmite durante el servicio",
          "Palito de papel para cada algod\u00f3n",
          "Operador, insumos, montaje y desarme"
    ],
    parrafos: [
          "El algod\u00f3n de az\u00facar es pura sorpresa: de la m\u00e1quina salen hilos de az\u00facar que, en segundos, se transforman en una nube que los invitados miran con atenci\u00f3n. Es de esos momentos que se recuerdan y que muchos quieren fotografiar.",
          "Cada algod\u00f3n se hila al instante en la m\u00e1quina y se entrega en un palito de papel. Durante el servicio no hay l\u00edmite, as\u00ed que cada persona puede pedir otro cuando quiera.",
          "Es un cl\u00e1sico en cumplea\u00f1os infantiles y se luce en baby showers, por sus colores. En matrimonios aporta un gesto l\u00fadico para invitados de todas las edades, y en eventos de empresa es un buen detalle para actividades familiares o de integraci\u00f3n.",
    ],
    desc: 'Nubes de algodón hiladas al instante en la máquina. Se sirven sin límite durante todo el servicio.',
    tags: []
  }
};
const IDS_MAQUINAS = Object.keys(MAQUINAS);

/* Fotos de referencia SOLO para la vista local. Poner false retira todas de una vez.
   No incluir img/prueba/ en paquetes de publicacion; ver img/prueba/CREDITOS.md. */
const MOSTRAR_FOTOS_PRUEBA = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  && new URLSearchParams(window.location.search).get('fotosPrueba') !== '0';
const FOTOS_PRUEBA = {
  "crepes": [
    {
      "src": "img/prueba/crepes-01.webp",
      "alt": "Detalle de capas de crepes dorados",
      "width": 800,
      "height": 1200,
      "autor": "Maria Borisenko",
      "url": "https://www.pexels.com/photo/a-close-up-on-pancakes-10248807/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/crepes-02.webp",
      "alt": "Crepes doblados con frutos rojos sobre un plato",
      "width": 1200,
      "height": 800,
      "autor": "Sergej *****",
      "url": "https://www.pexels.com/photo/delicious-crepes-with-berries-on-a-decorative-plate-36179591/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/crepes-03.webp",
      "alt": "Crepes espolvoreados con az\u00facar flor",
      "width": 800,
      "height": 1200,
      "autor": "Darya Grey_Owl",
      "url": "https://www.pexels.com/photo/delicious-stack-of-homemade-crepes-close-up-36327087/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/crepes-04.webp",
      "alt": "Crepes con salsa de chocolate sobre plato rectangular",
      "width": 900,
      "height": 1200,
      "autor": "FurtherMore Studio",
      "url": "https://www.pexels.com/photo/delicious-crepes-with-chocolate-drizzle-36048400/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    }
  ],
  "waffles": [
    {
      "src": "img/prueba/waffles-01.webp",
      "alt": "Waffle con frutillas y az\u00facar flor",
      "width": 800,
      "height": 1200,
      "autor": "Valeria Boltneva",
      "url": "https://www.pexels.com/photo/close-up-of-waffles-and-fruits-15953048/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/waffles-02.webp",
      "alt": "Waffles con frutillas, higos y salsa de chocolate",
      "width": 1200,
      "height": 800,
      "autor": "Diva Plavalaguna",
      "url": "https://www.pexels.com/photo/waffles-and-strawberries-5711392/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/waffles-03.webp",
      "alt": "Waffles dorados con salsa sobre plato blanco",
      "width": 1200,
      "height": 800,
      "autor": "Rob Sarte",
      "url": "https://www.pexels.com/photo/close-up-photo-of-golden-waffles-14636232/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/waffles-04.webp",
      "alt": "Waffles con crema y ar\u00e1ndanos",
      "width": 798,
      "height": 1200,
      "autor": "Dilara",
      "url": "https://www.pexels.com/photo/waffles-on-a-plate-27008474/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    }
  ],
  "hotcakes": [
    {
      "src": "img/prueba/hotcakes-01.webp",
      "alt": "Mini hotcakes con frutillas, frambuesas y ar\u00e1ndanos",
      "width": 900,
      "height": 1200,
      "autor": "Nadin Sh",
      "url": "https://www.pexels.com/photo/mini-pancakes-with-strawberries-and-blueberries-17323498/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/hotcakes-02.webp",
      "alt": "Mini hotcakes sobre un plato junto a un vaso de leche",
      "width": 800,
      "height": 1200,
      "autor": "Daria Ponomareva",
      "url": "https://www.pexels.com/photo/a-plate-of-mini-pancakes-8694469/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/hotcakes-03.webp",
      "alt": "Mini hotcakes con ar\u00e1ndanos y salsa",
      "width": 800,
      "height": 1200,
      "autor": "Valeria Boltneva",
      "url": "https://www.pexels.com/photo/pancakes-with-blackberries-and-syrup-17751912/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/hotcakes-04.webp",
      "alt": "Detalle de mini hotcakes dorados con salsa y ar\u00e1ndanos",
      "width": 800,
      "height": 1200,
      "autor": "Valeria Boltneva",
      "url": "https://www.pexels.com/photo/mini-pancakes-with-blueberries-17751909/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    }
  ],
  "helados": [
    {
      "src": "img/prueba/helados-01.webp",
      "alt": "Helado soft de vainilla en cono sobre fondo oscuro",
      "width": 800,
      "height": 1200,
      "autor": "Gordon KY",
      "url": "https://www.pexels.com/photo/close-up-of-hand-holding-ice-cream-cone-35228008/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/helados-02.webp",
      "alt": "Cono de helado soft sostenido frente a una calle desenfocada",
      "width": 1200,
      "height": 800,
      "autor": "Paolo Bici",
      "url": "https://www.pexels.com/photo/soft-serve-ice-cream-cone-on-milan-street-37280764/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/helados-03.webp",
      "alt": "Cono de helado soft con chocolate sostenido por una mano",
      "width": 900,
      "height": 1200,
      "autor": "Mark Neal",
      "url": "https://www.pexels.com/photo/person-holding-soft-serve-ice-cream-2261212/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/helados-04.webp",
      "alt": "Cono de helado soft de vainilla sobre fondo crema",
      "width": 1200,
      "height": 900,
      "autor": "Somben Chea",
      "url": "https://www.pexels.com/photo/cream-ice-cream-in-cone-1294943/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    }
  ],
  "palomitas": [
    {
      "src": "img/prueba/palomitas-01.webp",
      "alt": "Palomitas en un bowl blanco sobre mesa de madera",
      "width": 1200,
      "height": 800,
      "autor": "ROMAN ODINTSOV",
      "url": "https://www.pexels.com/photo/close-up-photo-of-a-bowl-of-popcorn-6422042/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/palomitas-02.webp",
      "alt": "Bowl de palomitas junto a hojas verdes",
      "width": 960,
      "height": 1200,
      "autor": "ines bahr",
      "url": "https://www.pexels.com/photo/a-close-up-shot-of-a-bowl-of-popcorn-6965471/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/palomitas-03.webp",
      "alt": "Mano sosteniendo un bowl de palomitas",
      "width": 1200,
      "height": 989,
      "autor": "Lisa Fotios",
      "url": "https://www.pexels.com/photo/popcorn-on-clear-glass-bowl-1870724/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/palomitas-04.webp",
      "alt": "Primer plano de palomitas en un bowl rojo",
      "width": 1200,
      "height": 800,
      "autor": "Kam Photos",
      "url": "https://www.pexels.com/photo/selective-focus-photography-of-popcorns-on-bowl-802055/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    }
  ],
  "algodon": [
    {
      "src": "img/prueba/algodon-04.webp",
      "alt": "Algod\u00f3n de az\u00facar rosado en palito, en primer plano",
      "width": 800,
      "height": 1200,
      "autor": "Poppy  Thomas-Hill from United States",
      "url": "https://commons.wikimedia.org/wiki/File:Pink_Cotton_Candy.jpg",
      "licencia": "CC BY 2.0",
      "licenciaUrl": "https://creativecommons.org/licenses/by/2.0",
      "prueba": true
    },
    {
      "src": "img/prueba/algodon-03.webp",
      "alt": "Algod\u00f3n de az\u00facar rosado sostenido por una mano",
      "width": 800,
      "height": 1200,
      "autor": "Garv Chaplot",
      "url": "https://www.pexels.com/photo/pink-candy-floss-18048864/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/algodon-01.webp",
      "alt": "Algod\u00f3n de az\u00facar rosado apoyado sobre una copa",
      "width": 800,
      "height": 1200,
      "autor": "Nataliya Vaitkevich",
      "url": "https://www.pexels.com/photo/cotton-candy-on-a-wine-glass-with-gold-rim-10477170/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    },
    {
      "src": "img/prueba/algodon-02.webp",
      "alt": "Algod\u00f3n de az\u00facar rosado en una copa sobre fondo brillante",
      "width": 800,
      "height": 1200,
      "autor": "Nataliya Vaitkevich",
      "url": "https://www.pexels.com/photo/a-cotton-candy-on-cocktail-glass-10477108/",
      "licencia": "Pexels License",
      "licenciaUrl": "https://www.pexels.com/license/",
      "prueba": true
    }
  ]
};
// Conservar primero las fotos actuales; no cambiar m.foto ni la portada del sitio.
if (MOSTRAR_FOTOS_PRUEBA) {
  IDS_MAQUINAS.forEach(id => {
    MAQUINAS[id].fotos.push(...FOTOS_PRUEBA[id]);
  });
}
