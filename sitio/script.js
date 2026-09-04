/* ============================================================
   DULCE ESTACIÓN · lógica de la página
   Todo lo editable está en el bloque CONFIG de aquí abajo.
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

const COLOR_ZONA = { A: 0.30, B: 0.22, C: 0.14, D: 0.08 };   // intensidad del relleno

/* ------------------------------------------------------------
   Combos — precios reales de la empresa, en CLP.
   Cada "parte" es una línea del combo:
     n  = cuántas estaciones de esa línea entran
     de = opciones entre las que el cliente elige (si hay más de una, es "o")
   Las partes entre sí siempre son "y": todas van en el combo.
   Están ordenados por cantidad de estaciones y luego por precio.
------------------------------------------------------------ */
/* Las máquinas. "unitario" es el precio por persona adicional; las que
   van sin precio (palomitas y algodón) son ilimitadas y no se amplían. */
const MAQUINAS = {
  crepes:    { nombre: 'Crepes',            ico: '🥐', tipo: 'Máquina grande',  unitario: 3500 },
  waffles:   { nombre: 'Waffles',           ico: '🧇', tipo: 'Máquina mediana', unitario: 2500 },
  hotcakes:  { nombre: 'Hotcakes',          ico: '🥞', tipo: 'Máquina mediana', unitario: 2500 },
  helados:   { nombre: 'Helados',           ico: '🍨', tipo: 'Máquina mediana', unitario: 2500 },
  palomitas: { nombre: 'Palomitas',         ico: '🍿', tipo: 'Ilimitadas',      unitario: null },
  algodon:   { nombre: 'Algodón de azúcar', ico: '🍭', tipo: 'Ilimitado',       unitario: null }
};

/* Cada "parte" es una línea del combo. n = cuántas máquinas entran de esa línea;
   si n es 2, el cliente elige DOS máquinas distintas del mismo paréntesis. */
const PROMOS = [
  { nombre: 'Dúo Esencial', p40: 100000, p60: 140000, partes: [
      { n: 1, de: ['waffles', 'hotcakes', 'helados'] },
      { n: 1, de: ['palomitas', 'algodon'] } ] },

  { nombre: 'Dúo Crepes', p40: 140000, p60: 195000, partes: [
      { n: 1, de: ['crepes'] },
      { n: 1, de: ['palomitas', 'algodon'] } ] },

  { nombre: 'Dúo Premium', p40: 200000, p60: 275000, partes: [
      { n: 1, de: ['crepes'] },
      { n: 1, de: ['waffles', 'hotcakes', 'helados'] } ] },

  { nombre: 'Trío Dulce', p40: 120000, p60: 165000, partes: [
      { n: 1, de: ['waffles', 'hotcakes', 'helados'] },
      { n: 1, de: ['palomitas'] },
      { n: 1, de: ['algodon'] } ] },

  { nombre: 'Trío Crepes', p40: 160000, p60: 225000, partes: [
      { n: 1, de: ['crepes'] },
      { n: 1, de: ['palomitas'] },
      { n: 1, de: ['algodon'] } ] },

  { nombre: 'Trío Goloso', p40: 180000, p60: 245000, partes: [
      { n: 2, de: ['waffles', 'hotcakes', 'helados'] },
      { n: 1, de: ['palomitas', 'algodon'] } ] },

  { nombre: 'Trío Completo', p40: 220000, p60: 300000, partes: [
      { n: 1, de: ['crepes'] },
      { n: 1, de: ['waffles', 'hotcakes', 'helados'] },
      { n: 1, de: ['palomitas', 'algodon'] } ] }
];

/* Reseñas del carrusel — edita, agrega o quita elementos de esta lista */
const RESENAS = [
  { estrellas: 5, texto: 'Contratamos waffles y algodón para el cumple de mi hija y fue el hit de la tarde. La chica que atendió fue súper paciente con los niños. Llegaron antes de la hora, todo impecable.', autor: 'Javiera Contreras', evento: 'Cumpleaños infantil · Chiguayante' },
  { estrellas: 5, texto: 'Los usamos para una actividad de fin de año de la empresa. La fila no paró en las 2 horas y siempre hubo alguien atendiendo el carrito. Muy ordenados con la factura.', autor: 'Matías Fuentes', evento: 'Evento de empresa · Talcahuano' },
  { estrellas: 5, texto: 'El detalle de los crepes hechos al momento enamoró a todos. Mis invitados seguían hablando del carrito una semana después del matrimonio. Vale cada peso.', autor: 'Camila y Rodrigo', evento: 'Matrimonio · Hualpén' },
  { estrellas: 4, texto: 'Muy ricos los mini hotcakes y las palomitas. Éramos más invitados de lo previsto, pero lo solucionaron altiro. Los volvería a contratar sin dudar.', autor: 'Constanza Sepúlveda', evento: 'Baby shower · San Pedro de la Paz' },
  { estrellas: 5, texto: 'Llegaron a Penco sin problema y montaron todo en menos de media hora. Solo pidieron un enchufe y listo. Los niños no se despegaron del algodón de azúcar.', autor: 'Felipe Riquelme', evento: 'Cumpleaños familiar · Penco' },
  { estrellas: 5, texto: 'Pedimos la Estación Total para la licenciatura del colegio. Cinco carritos funcionando a la vez y ni un solo momento sin atención. Los apoderados quedaron impresionados.', autor: 'Daniela Vergara', evento: 'Licenciatura · Concepción' },
  { estrellas: 5, texto: 'Cotizé por la página, me llegó todo el detalle al WhatsApp y confirmaron en menos de una hora. Cero vueltas. El servicio fue tal cual lo cotizado.', autor: 'Ignacio Sanhueza', evento: 'Aniversario · Coronel' },
  { estrellas: 5, texto: 'Las palomitas no pararon en toda la noche, literalmente ilimitadas. Buen sabor, buen olor, y el carrito se ve precioso en las fotos.', autor: 'Antonia Muñoz', evento: 'Matrimonio · Santa Juana' },
  { estrellas: 4, texto: 'Buenísimo el servicio de waffles. Lo único, llegar al lugar les tomó un poco más por el tema del tráfico, pero avisaron por WhatsApp en todo momento.', autor: 'Sebastián Torres', evento: 'Cumpleaños 40 · Concepción' },
  { estrellas: 5, texto: 'Somos un jardín infantil y los contratamos para el día del niño. Súper cuidadosos con los más chicos y con la higiene. Ya los reservamos para el próximo año.', autor: 'Paulina Herrera', evento: 'Actividad de colegio · Lomas Coloradas' }
];

/* ------------------------------------------------------------
   Utilidades
------------------------------------------------------------ */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clp = n => '$' + Math.round(n).toLocaleString('es-CL');
const waLink = texto => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

/* ------------------------------------------------------------
   Navegación + animaciones de entrada
------------------------------------------------------------ */
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('is-stuck', scrollY > 12), { passive: true });

const links = $('.nav__links');
const burger = $('#burger');

function menu(abrir) {
  links.classList.toggle('is-open', abrir);
  burger.classList.toggle('is-x', abrir);
  document.body.classList.toggle('menu-abierto', abrir);
  burger.setAttribute('aria-expanded', abrir);
}
burger.addEventListener('click', e => { e.stopPropagation(); menu(!links.classList.contains('is-open')); });
$$('.nav__links a').forEach(a => a.addEventListener('click', () => menu(false)));
// Cerrar al tocar fuera del menú o al girar el teléfono
document.addEventListener('click', e => {
  if (links.classList.contains('is-open') && !links.contains(e.target)) menu(false);
});
addEventListener('resize', () => { if (innerWidth > 720) menu(false); });

const io = new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

/* ------------------------------------------------------------
   Combos
------------------------------------------------------------ */
const totalEstaciones = p => p.partes.reduce((t, x) => t + x.n, 0);

$('#combos').innerHTML = PROMOS.map(p => {
  const n = totalEstaciones(p);
  const partes = p.partes.map(x => `
    <li>
      <span class="combo__cant">${x.n}</span>
      <span class="combo__ops">${x.de.map(id => MAQUINAS[id].nombre).join('<em> o </em>')}</span>
    </li>`).join('<li class="combo__y" aria-hidden="true">y</li>');

  return `
    <article class="combo reveal">
      <span class="combo__n">${n} estaciones</span>
      <h3>${p.nombre}</h3>
      <ul class="combo__partes">${partes}</ul>
      <div class="combo__precio">
        <span class="combo__para">40 personas</span>
        <b data-p40="${p.p40}" data-p60="${p.p60}">${clp(p.p40)}</b>
      </div>
      <a href="#contacto" class="btn btn--ghost btn--full">Reservar este combo</a>
    </article>`;
}).join('');

/* Selector 40 / 60 personas: cambia el precio grande de todas las tarjetas */
$('#selectorPersonas').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const personas = btn.dataset.personas;

  $$('#selectorPersonas button').forEach(b => b.classList.toggle('is-on', b === btn));
  $$('.combo__para').forEach(s => s.textContent = `${personas} personas`);
  $$('.combo__precio b').forEach(b => b.textContent = clp(b.dataset[`p${personas}`]));
});

/* ------------------------------------------------------------
   Cotizador · paso 1: promoción e invitados
------------------------------------------------------------ */
/* Descripción del combo: los grupos con elección van entre paréntesis,
   para que se vea dónde termina uno y empieza el siguiente. */
const resumenPartes = p => p.partes.map(x => {
  const nombres = x.de.map(id => MAQUINAS[id].nombre);
  const grupo = nombres.length > 1
    ? `<span class="par">(</span>${nombres.join('<em class="o"> o </em>')}<span class="par">)</span>`
    : nombres[0];
  return (x.n > 1 ? `<b class="mult">${x.n} ×</b> ` : '') + grupo;
}).join('<em class="y"> y </em>');

let tamano = 40;                     // 40 o 60 invitados, sin valores intermedios
const precioPromo = p => (tamano === 60 ? p.p60 : p.p40);

/* ---- Paso 1: tamaño del evento y promociones (se puede elegir más de una) ---- */
$('#tamanoEvento').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  tamano = +btn.dataset.tamano;
  $$('#tamanoEvento button').forEach(b => b.classList.toggle('is-on', b === btn));
  calcular();
});

$('#promoPicker').innerHTML = PROMOS.map((p, i) => `
  <div class="promopick" data-i="${i}">
    <label class="promopick__head">
      <input type="checkbox" value="${i}">
      <span class="promopick__check">✓</span>
      <b class="promopick__nombre">${p.nombre}</b>
      <span class="promopick__precio" data-precio="${i}">${clp(p.p40)}</span>
      <span class="promopick__desc"><i>${totalEstaciones(p)} estaciones</i> ${resumenPartes(p)}</span>
    </label>
    <div class="promopick__ops" hidden></div>
  </div>`).join('');

/* Dentro de cada promoción elegida aparecen los desplegables de las líneas con "o".
   Si la línea pide 2 máquinas, se muestran 2 desplegables y no permiten repetir. */
function pintarOpciones(caja, promo) {
  const filas = [];
  promo.partes.forEach((parte, iParte) => {
    if (parte.de.length < 2) return;                 // sin elección que hacer
    for (let k = 0; k < parte.n; k++) {
      filas.push(`
        <label class="field">
          <span>${parte.n > 1 ? `Máquina ${k + 1} de ${parte.n}` : 'Elige tu máquina'}</span>
          <select data-parte="${iParte}" data-k="${k}">
            ${parte.de.map((id, j) =>
              `<option value="${id}"${j === k ? ' selected' : ''}>${MAQUINAS[id].nombre}</option>`).join('')}
          </select>
        </label>`);
    }
  });

  caja.hidden = !filas.length;
  caja.innerHTML = filas.length
    ? `<p class="opciones__titulo">¿Qué máquinas quieres en este combo?</p>${filas.join('')}`
    : '';

  $$('select', caja).forEach(s => s.addEventListener('change', () => {
    evitarRepetidas(caja);
    pintarExtras();          // el paso 2 sigue a la máquina que acaba de elegir
    calcular();
  }));
  evitarRepetidas(caja);
}

/* En una línea que pide 2 máquinas, deshabilita en cada desplegable lo ya tomado
   por su hermano, para que nunca se elija dos veces la misma. */
function evitarRepetidas(caja) {
  const porParte = {};
  $$('select', caja).forEach(s => (porParte[s.dataset.parte] ??= []).push(s));

  Object.values(porParte).forEach(grupo => {
    if (grupo.length < 2) return;
    const tomadas = grupo.map(s => s.value);
    grupo.forEach((s, i) => {
      [...s.options].forEach(o => o.disabled = o.value !== s.value && tomadas.includes(o.value));
      if (tomadas.filter(v => v === s.value).length > 1 && i > 0) {
        const libre = [...s.options].find(o => !tomadas.includes(o.value));
        if (libre) { s.value = libre.value; tomadas[i] = libre.value; }
      }
    });
  });
}

const promosElegidas = () => $$('#promoPicker input:checked').map(i => ({ i: +i.value, promo: PROMOS[+i.value] }));

$$('.promopick').forEach(bloque => {
  const input = $('input', bloque);
  input.addEventListener('change', () => {
    bloque.classList.toggle('is-on', input.checked);
    const caja = $('.promopick__ops', bloque);
    if (input.checked) pintarOpciones(caja, PROMOS[+input.value]);
    else { caja.hidden = true; caja.innerHTML = ''; }
    pintarExtras();
    calcular();
  });
});

/* ---- Paso 2: más porciones, solo de las máquinas que el cliente ya eligió ---- */
const cantidadesExtra = {};          // { waffles: 10, crepes: 5, ... }

function maquinasElegidas() {
  const ids = [];
  promosElegidas().forEach(({ i }) => {
    const caja = $(`.promopick[data-i="${i}"] .promopick__ops`);
    PROMOS[i].partes.forEach((parte, iParte) => {
      if (parte.de.length < 2) { for (let k = 0; k < parte.n; k++) ids.push(parte.de[0]); return; }
      $$(`select[data-parte="${iParte}"]`, caja).forEach(s => ids.push(s.value));
    });
  });
  return ids;
}

function pintarExtras() {
  const caja = $('#extras');
  // solo las máquinas con precio unitario: palomitas y algodón son ilimitados
  const ids = [...new Set(maquinasElegidas())].filter(id => MAQUINAS[id].unitario);

  Object.keys(cantidadesExtra).forEach(id => { if (!ids.includes(id)) delete cantidadesExtra[id]; });

  if (!ids.length) {
    caja.innerHTML = '<p class="extras__vacio">Elige una promoción en el paso 1 y aquí aparecerán sus máquinas.</p>';
    return;
  }

  caja.innerHTML = ids.map(id => {
    const m = MAQUINAS[id], cant = cantidadesExtra[id] || 0;
    return `
      <div class="extra" data-id="${id}">
        <span class="extra__ico">${m.ico}</span>
        <div class="extra__txt"><b>${m.nombre}</b><span>${m.tipo} · ${clp(m.unitario)} por persona</span></div>
        <div class="stepper stepper--sm">
          <button type="button" data-paso="-5" aria-label="Quitar 5 porciones de ${m.nombre}">−</button>
          <input type="text" value="+${cant}" readonly>
          <button type="button" data-paso="5" aria-label="Agregar 5 porciones de ${m.nombre}">+</button>
        </div>
        <b class="extra__precio">${clp(cant * m.unitario)}</b>
      </div>`;
  }).join('');

  $$('#extras .stepper button').forEach(b => b.addEventListener('click', () => {
    const id = b.closest('.extra').dataset.id;
    cantidadesExtra[id] = Math.min(200, Math.max(0, (cantidadesExtra[id] || 0) + +b.dataset.paso));
    pintarExtras();
    calcular();
  }));
}
pintarExtras();

// Re-observa las tarjetas creadas por JS
$$('#combos .reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

/* ------------------------------------------------------------
   Reseñas: cinta en movimiento continuo
   Se duplica la lista para que el bucle no tenga corte visible.
   Se detiene al pasar el mouse, al arrastrar y al usar las flechas.
------------------------------------------------------------ */
const VELOCIDAD = 34;                 // píxeles por segundo que avanza la cinta

const pista = $('#resenasTrack');
const carrusel = $('#carrusel');

const marcaResena = (r, copia) => `
  <blockquote class="resena"${copia ? ' aria-hidden="true"' : ''}>
    <div class="stars">${'★'.repeat(r.estrellas)}${'☆'.repeat(5 - r.estrellas)}</div>
    <p>“${r.texto}”</p>
    <footer><b>${r.autor}</b><span>${r.evento}</span></footer>
  </blockquote>`;

pista.innerHTML = RESENAS.map(r => marcaResena(r)).join('')
                + RESENAS.map(r => marcaResena(r, true)).join('');

const tarjetas = $$('.resena', pista);
const pasoCarrusel = () => tarjetas.length < 2
  ? pista.clientWidth
  : tarjetas[1].offsetLeft - tarjetas[0].offsetLeft;      // ancho de tarjeta + gap
const mitad = () => pista.scrollWidth / 2;                // largo de una vuelta completa

let posicion = 0, ultimoT = 0;
let sobreCinta = false, arrastrando = false, empujando = false;
const enPausa = () => sobreCinta || arrastrando || empujando;

function animar(t) {
  const dt = ultimoT ? Math.min((t - ultimoT) / 1000, 0.05) : 0;
  ultimoT = t;

  if (enPausa()) {
    posicion = pista.scrollLeft;          // se mantiene sincronizada mientras está detenida
  } else {
    posicion += VELOCIDAD * dt;
    if (posicion >= mitad()) posicion -= mitad();   // salto invisible al inicio del bucle
    pista.scrollLeft = posicion;
  }
  requestAnimationFrame(animar);
}

// Respeta a quien tenga desactivadas las animaciones en su sistema
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(animar);

/* Pausa al pasar el mouse (o al enfocar con el teclado) */
carrusel.addEventListener('mouseenter', () => sobreCinta = true);
carrusel.addEventListener('mouseleave', () => sobreCinta = false);
carrusel.addEventListener('focusin',  () => sobreCinta = true);
carrusel.addEventListener('focusout', () => sobreCinta = false);

/* Flechas: empujan una tarjeta y devuelven el control a la cinta */
let temporizador;
function mover(dir) {
  if (dir < 0 && pista.scrollLeft < pasoCarrusel()) {
    pista.scrollLeft += mitad();          // salta a la copia para poder retroceder
    posicion = pista.scrollLeft;
  }
  empujando = true;
  pista.scrollBy({ left: pasoCarrusel() * dir, behavior: 'smooth' });
  clearTimeout(temporizador);
  temporizador = setTimeout(() => { empujando = false; }, 700);
}
$('#rPrev').addEventListener('click', () => mover(-1));
$('#rNext').addEventListener('click', () => mover(1));

/* Arrastre con el mouse (en móvil el deslizamiento táctil ya funciona solo) */
let xInicio = 0, scrollInicio = 0;
pista.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') return;
  arrastrando = true; xInicio = e.clientX; scrollInicio = pista.scrollLeft;
  pista.classList.add('is-drag');
});
pista.addEventListener('pointermove', e => {
  if (!arrastrando) return;
  pista.scrollLeft = scrollInicio - (e.clientX - xInicio);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
  pista.addEventListener(ev, () => { arrastrando = false; pista.classList.remove('is-drag'); }));

/* En táctil, la cinta se detiene mientras el dedo está sobre ella */
pista.addEventListener('touchstart', () => sobreCinta = true, { passive: true });
['touchend', 'touchcancel'].forEach(ev =>
  pista.addEventListener(ev, () => setTimeout(() => sobreCinta = false, 1500), { passive: true }));

/* ------------------------------------------------------------
   Mapa y cálculo de traslado
------------------------------------------------------------ */
const estadoTraslado = { lugar: '', km: 0, zona: '', costo: 0, fueraRango: false, definido: false };

/* Con gestureHandling el mapa se mueve con dos dedos (o Ctrl + rueda en el computador),
   así un dedo sigue bajando la página y nadie queda atrapado en el mapa. */
const soportaGestos = !!(window.leafletGestureHandling && window.leafletGestureHandling.GestureHandling);

const mapa = L.map('mapa', {
  scrollWheelZoom: false,
  gestureHandling: soportaGestos,
  gestureHandlingOptions: {
    duration: 1800,
    text: {
      touch: 'Usa dos dedos para mover el mapa',
      scroll: 'Usa Ctrl + rueda para hacer zoom',
      scrollMac: 'Usa ⌘ + rueda para hacer zoom'
    }
  }
}).setView([CONFIG.base.lat, CONFIG.base.lng], 11);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19
}).addTo(mapa);

const iconoBase = L.divIcon({
  className: '', iconSize: [34, 34], iconAnchor: [17, 17],
  html: `<div style="width:34px;height:34px;border-radius:50%;background:#241F1C;color:#fff;display:grid;place-items:center;font-size:15px;box-shadow:0 4px 14px rgba(0,0,0,.3)">🏠</div>`
});
const iconoEvento = L.divIcon({
  className: '', iconSize: [38, 38], iconAnchor: [19, 19],
  html: `<div style="width:38px;height:38px;border-radius:50%;background:#E1462C;color:#fff;display:grid;place-items:center;font-size:17px;box-shadow:0 6px 18px rgba(225,70,44,.5)">📍</div>`
});

L.marker([CONFIG.base.lat, CONFIG.base.lng], { icon: iconoBase })
  .addTo(mapa).bindPopup('<b>Dulce Estación</b><br>Base de operaciones');

/* Dibuja las zonas reales sobre el mapa: mientras más cerca, más intenso el color */
ZONAS_TRASLADO.forEach(z => {
  z.capa = L.polygon(z.poligono, {
    color: '#E1462C', weight: 1.5, opacity: .55,
    fillColor: '#E1462C', fillOpacity: COLOR_ZONA[z.zona]
  }).addTo(mapa).bindPopup(`<b>${z.nombre}</b><br>Zona ${z.zona} · traslado ${clp(z.precio)}`);
  z.capa.on('click', e => marcarEvento(e.latlng.lat, e.latlng.lng, z.nombre));
});

/* Punto dentro de polígono (algoritmo del rayo) */
function dentroDelPoligono(lat, lng, poligono) {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [yi, xi] = poligono[i], [yj, xj] = poligono[j];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
const zonaDe = (lat, lng) => ZONAS_TRASLADO.find(z => dentroDelPoligono(lat, lng, z.poligono)) || null;

/* Tabla de tarifas del panel, agrupada por zona */
$('#tarifas').innerHTML = ['A', 'B', 'C', 'D'].map(letra => {
  const zs = ZONAS_TRASLADO.filter(z => z.zona === letra);
  if (!zs.length) return '';
  const comunas = [...new Set(zs.map(z => z.nombre.split(' · ')[0]))].join(', ');
  return `<li><b>Zona ${letra}</b><span>${comunas} · ${clp(zs[0].precio)}</span></li>`;
}).join('');

let marcadorEvento = null, linea = null, zonaResaltada = null;

function distanciaKm(a, b) {                       // Haversine + factor de ruta real
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h)) * 1.35;
}

function marcarEvento(lat, lng, nombre) {
  const destino = { lat, lng };
  if (marcadorEvento) mapa.removeLayer(marcadorEvento);
  if (linea) mapa.removeLayer(linea);

  marcadorEvento = L.marker([lat, lng], { icon: iconoEvento }).addTo(mapa);
  linea = L.polyline([[CONFIG.base.lat, CONFIG.base.lng], [lat, lng]], {
    color: '#E1462C', weight: 2.5, dashArray: '7 9', opacity: .8
  }).addTo(mapa);
  mapa.fitBounds(linea.getBounds(), { padding: [60, 60], maxZoom: 14 });

  const km = distanciaKm(CONFIG.base, destino);
  const minutos = Math.max(10, Math.round(km / 30 * 60));
  const zona = zonaDe(lat, lng);
  const costo = zona ? zona.precio : null;

  // Destaca en el mapa la zona que le tocó
  if (zonaResaltada) zonaResaltada.setStyle({ weight: 1.5, opacity: .55 });
  if (zona) { zona.capa.setStyle({ weight: 3.5, opacity: 1 }); zonaResaltada = zona.capa; }
  else zonaResaltada = null;

  Object.assign(estadoTraslado, {
    lugar: nombre || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    km, zona: zona ? `Zona ${zona.zona} · ${zona.nombre}` : 'Fuera de las zonas del mapa',
    costo: costo ?? 0, fueraRango: costo === null, definido: true
  });

  $('#resLugar').textContent  = estadoTraslado.lugar.length > 46
    ? estadoTraslado.lugar.slice(0, 46) + '…' : estadoTraslado.lugar;
  $('#resZona').textContent   = estadoTraslado.zona;
  $('#resKm').textContent     = km.toFixed(1) + ' km';
  $('#resTiempo').textContent = minutos + ' min aprox.';
  $('#resCosto').textContent  = costo === null ? 'A cotizar' : clp(costo);
  $('#hintMapa').textContent  = costo === null
    ? 'Ese punto queda fuera de las zonas marcadas: escríbenos y te damos una tarifa especial.'
    : 'Puedes mover el punto haciendo clic en otra parte del mapa.';

  calcular();
}

mapa.on('click', e => marcarEvento(e.latlng.lat, e.latlng.lng, 'Punto marcado en el mapa'));

/* En pantallas táctiles el mapa arranca bloqueado: si no, al deslizar el dedo
   sobre él la página deja de bajar y el usuario queda atrapado. */
// Si el navegador no trae el complemento de gestos, al menos que un dedo no quede atrapado
if (matchMedia('(pointer: coarse)').matches && !soportaGestos) mapa.dragging.disable();

// Arma "Barros Arana 550, Concepción" en vez del display_name crudo de Nominatim
function etiquetaLugar(res) {
  const a = res.address || {};
  const calle = [a.road, a.house_number].filter(Boolean).join(' ');
  const zona = a.suburb || a.city_district || a.town || a.village || a.county;
  const ciudad = a.city || a.state;
  const partes = [calle, zona, zona === ciudad ? null : ciudad].filter(Boolean);
  return partes.length ? partes.join(', ') : res.display_name.split(',').slice(0, 3).join(', ');
}

async function buscarDireccion() {
  const q = $('#buscarDir').value.trim();
  if (!q) return;
  const btn = $('#btnBuscar');
  btn.textContent = '...'; btn.disabled = true;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&countrycodes=${CONFIG.pais}&q=` + encodeURIComponent(q);
    const r = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const d = await r.json();
    if (!d.length) { $('#hintMapa').textContent = 'No encontramos esa dirección. Prueba con la comuna o marca el punto en el mapa.'; return; }
    marcarEvento(parseFloat(d[0].lat), parseFloat(d[0].lon), etiquetaLugar(d[0]));
  } catch {
    $('#hintMapa').textContent = 'No se pudo buscar (revisa tu conexión). Marca el punto directamente en el mapa.';
  } finally {
    btn.textContent = 'Buscar'; btn.disabled = false;
  }
}
$('#btnBuscar').addEventListener('click', buscarDireccion);
$('#buscarDir').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarDireccion(); } });

$('#btnUsarTraslado').addEventListener('click', () => {
  if (estadoTraslado.definido) $('#lugar').value = estadoTraslado.lugar;
  calcular();
});

/* ------------------------------------------------------------
   Cotizador
------------------------------------------------------------ */
const campos = ['#fecha', '#tipo', '#lugar', '#nombre', '#festejado', '#nota'];
campos.forEach(sel => $(sel).addEventListener('input', calcular));

function cotizacion() {
  const elegidas = promosElegidas().map(({ i, promo }) => {
    const caja = $(`.promopick[data-i="${i}"] .promopick__ops`);
    const maquinas = [];
    promo.partes.forEach((parte, iParte) => {
      if (parte.de.length < 2) { for (let k = 0; k < parte.n; k++) maquinas.push(parte.de[0]); return; }
      $$(`select[data-parte="${iParte}"]`, caja).forEach(s => maquinas.push(s.value));
    });
    return { promo, maquinas, precio: precioPromo(promo) };
  });

  const base = elegidas.reduce((t, e) => t + e.precio, 0);
  const extras = Object.entries(cantidadesExtra)
    .filter(([, c]) => c > 0)
    .map(([id, cant]) => ({ id, cant, precio: cant * MAQUINAS[id].unitario }));
  const costoExtras = extras.reduce((t, e) => t + e.precio, 0);
  const traslado = elegidas.length ? estadoTraslado.costo : 0;

  return { elegidas, tamano, base, extras, costoExtras, traslado,
           total: base + costoExtras + traslado };
}

function calcular() {
  const c = cotizacion();

  // Los precios del paso 1 siguen al tamaño elegido
  $$('.promopick__precio').forEach(el => el.textContent = clp(precioPromo(PROMOS[+el.dataset.precio])));

  $('#resumenItems').innerHTML = c.elegidas.length
    ? c.elegidas.map(e =>
        `<div class="resumen__item"><span>🍭 ${e.promo.nombre}</span><b>${clp(e.precio)}</b></div>` +
        `<div class="resumen__sub">${e.maquinas.map(id => MAQUINAS[id].nombre).join(' · ')}</div>`).join('') +
      c.extras.map(e =>
        `<div class="resumen__item"><span>${MAQUINAS[e.id].ico} ${MAQUINAS[e.id].nombre} · +${e.cant} personas</span><b>${clp(e.precio)}</b></div>`).join('')
    : '<p class="vacio">Elige una promoción para empezar 🍭</p>';

  $('#cPromoLabel').textContent = c.elegidas.length
    ? `${c.elegidas.length === 1 ? 'Promoción' : c.elegidas.length + ' promociones'} · ${c.tamano} personas`
    : 'Promoción';
  $('#cSub').textContent   = clp(c.base);
  $('#cExtra').textContent = clp(c.costoExtras);
  $('#cTraslado').textContent = !c.elegidas.length ? clp(0)
    : (estadoTraslado.fueraRango ? 'A cotizar'
      : (estadoTraslado.definido ? `${clp(c.traslado)} (${estadoTraslado.zona.split(' · ')[0]})` : 'Por definir'));
  $('#cTotal').textContent = clp(c.total);
}

/* ------------------------------------------------------------
   Mensajes de WhatsApp
------------------------------------------------------------ */
function mensajeCotizacion() {
  const c = cotizacion();
  const lugar = $('#lugar').value.trim() || estadoTraslado.lugar || 'Por confirmar';
  const L = [];

  L.push('¡Hola *Dulce Estación*! 👋 Quiero cotizar mi evento:', '');
  if ($('#nombre').value.trim())    L.push(`*Reserva:* ${$('#nombre').value.trim()}`);
  if ($('#festejado').value.trim()) L.push(`*Festejado/a:* ${$('#festejado').value.trim()}`);
  L.push(`*Tipo de evento:* ${$('#tipo').value}`);
  if ($('#fecha').value) L.push(`*Fecha:* ${$('#fecha').value}`);
  L.push(`*Lugar:* ${lugar}`, `*Invitados:* ${c.tamano} personas`, '');

  if (c.elegidas.length) {
    L.push(c.elegidas.length > 1 ? '*Promociones:*' : '*Promoción:*');
    c.elegidas.forEach(e => {
      L.push(`• ${e.promo.nombre} — ${clp(e.precio)}`);
      L.push(`   ${e.maquinas.map(id => MAQUINAS[id].nombre).join(' · ')}`);
    });
  } else {
    L.push('*Promoción:* (aún por definir)');
  }

  if (c.extras.length) {
    L.push('', '*Porciones adicionales:*');
    c.extras.forEach(e => L.push(`• ${MAQUINAS[e.id].nombre} para ${e.cant} personas más — ${clp(e.precio)}`));
  }

  L.push('');
  if (estadoTraslado.definido) {
    L.push(estadoTraslado.fueraRango
      ? 'Traslado: a cotizar (fuera de las zonas del mapa)'
      : `Traslado ${estadoTraslado.zona}: ${clp(c.traslado)}`);
  }
  L.push(`*TOTAL ESTIMADO: ${clp(c.total)}*`);

  if ($('#nota').value.trim()) L.push('', `_Comentario:_ ${$('#nota').value.trim()}`);
  L.push('', '¿Tienen disponible esa fecha?');
  return L.join('\n');
}

$('#btnWhats').addEventListener('click', () => {
  if (!promosElegidas().length) {              // sin promoción no hay nada que cotizar
    $('#promoPicker').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $$('.promopick').forEach(p => p.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
      { duration: 320 }));
    return;
  }
  open(waLink(mensajeCotizacion()), '_blank');
});

$('#btnContacto').addEventListener('click', () => {
  const t = [
    '¡Hola *Dulce Estación*! 👋',
    $('#cName').value.trim() ? `Soy ${$('#cName').value.trim()}.` : '',
    $('#cTel').value.trim() ? `Mi teléfono: ${$('#cTel').value.trim()}` : '',
    $('#cMsg').value.trim() || 'Quisiera más información sobre sus carritos de dulces.'
  ].filter(Boolean).join('\n');
  open(waLink(t), '_blank');
});

const saludo = '¡Hola *Dulce Estación*! Quisiera información sobre sus carritos de dulces para un evento 🍭';
['#fab', '#waDirecto', '#waFooter'].forEach(sel => $(sel).href = waLink(saludo));
$('#waDirecto').textContent = '+' + CONFIG.whatsapp.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4');

// Un solo lugar para las redes: todos los enlaces con data-red toman su dirección de CONFIG
$$('[data-red]').forEach(a => a.href = CONFIG.redes[a.dataset.red]);

calcular();
