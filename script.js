/* ============================================================
   DULCE ESTACIÓN · lógica de la página
   Los datos editables (CONFIG, tarifas, MAQUINAS) están en datos.js.
   ============================================================ */

/* Los datos compartidos (CONFIG, ZONAS_TRASLADO, tarifas, MAQUINAS) están en datos.js, que se carga antes. */


/* ------------------------------------------------------------
   COMBOS MÁS PEDIDOS (según Maus)

   Tres tarjetas con el precio para 40 personas calculado con las
   mismas funciones del cotizador (precioCombinacion), nunca escrito
   a mano. `destacar: true` pinta la tarjeta del medio en tono oscuro.
------------------------------------------------------------ */
const DESTACADOS = [
  { ids: ['waffles', 'hotcakes'], cap: 40 },
  { ids: ['algodon', 'waffles', 'hotcakes'], cap: 40, destacar: true },
  { ids: ['palomitas', 'waffles', 'hotcakes', 'crepes'], cap: 40 }
];

/* No se interpolan personas ni se aceptan tramos libres. */
const precioPorPersona = (id, personas) => {
  const indice = CAPACIDADES.indexOf(personas);
  if (indice < 0 || !MAQUINAS[id]) throw new RangeError('Tramo o servicio no válido');
  return MAQUINAS[id].precios[indice];
};
const precioMaquina = (id, personas) => personas * precioPorPersona(id, personas);
// Los extras siempre usan la tarifa base de 20 personas, sin descuento por tramo.
const precioExtra = id => MAQUINAS[id].admiteExtras ? precioPorPersona(id, CAPACIDADES[0]) : 0;

/* ------------------------------------------------------------
   Excepciones de precio por combinación exacta

   El Excel fija algunas combinaciones en un precio cerrado que no
   sigue la fórmula. Se define como un mínimo comercial: no se
   arma el evento por menos de eso aunque la suma dé menos.

   La clave son los ids ordenados alfabéticamente y unidos por "+".
   Solo aplica si el cliente eligió EXACTAMENTE esos servicios.
------------------------------------------------------------ */
const COMBOS_FIJOS = TARIFAS_SERVICIO.combosFijos;

const clave = ids => [...ids].sort().join('+');

/* Precio del conjunto elegido: respeta la excepción si la hay */
const precioCombinacion = (ids, cap) => {
  if (!CAPACIDADES.includes(cap)) throw new RangeError('Tramo no válido');
  const fijo = COMBOS_FIJOS[clave(ids)];
  if (fijo != null) return fijo;
  return ids.reduce((t, id) => t + precioMaquina(id, cap), 0);
};

/* Reseñas del carrusel — edita, agrega o quita elementos de esta lista */
const RESENAS = [];

/* Interruptor de reseñas: en false la sección queda oculta (se quitaron las
   reseñas de ejemplo antes de publicar). Ponlo en true cuando haya reseñas reales. */
const MOSTRAR_RESENAS = false;


/* ------------------------------------------------------------
   Utilidades
------------------------------------------------------------ */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clp = n => '$' + Math.round(n).toLocaleString('es-CL');
const fechaLegible = (val, hora) => {
  let base = val || '';
  if (val) {
    const d = new Date(val + 'T12:00:00');
    if (!isNaN(d)) {
      const semana = d.toLocaleDateString('es-CL', { weekday: 'long' });
      const dia = d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
      base = `${semana} ${dia} de ${d.getFullYear()}`;
    }
  }
  return hora ? `${base}, ${hora}` : base;
};

// FAQ visible y datos estructurados comparten el precio fijo configurado arriba.
const respuestaCapacidad = `Se contrata desde ${CAPACIDADES[0]} personas, en tramos de ${CAPACIDADES.join(', ')} personas. El precio por persona depende del tramo y los servicios elegidos. Palomitas y algodón solos tienen un precio fijo de ${clp(COMBOS_FIJOS['algodon+palomitas'])} para cualquier tramo; el traslado se suma aparte. Para más de 100 personas, escríbenos por WhatsApp. Si eliges los servicios de palomitas o algodón de azúcar, su consumo es ilimitado durante el servicio.`;
$('#faqCapacidad').textContent = respuestaCapacidad;
const schemaPrecios = $('script[type="application/ld+json"]');
const datosSchema = JSON.parse(schemaPrecios.textContent);
datosSchema['@graph'].find(n => n['@type'] === 'FAQPage').mainEntity
  .find(n => n.name === '¿Para cuántas personas alcanza?').acceptedAnswer.text = respuestaCapacidad;
schemaPrecios.textContent = JSON.stringify(datosSchema);
const waLink = texto => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

/* ------------------------------------------------------------
   Navegación + animaciones de entrada
   (el menú móvil y la sombra de la barra están en nav.js, compartido)
------------------------------------------------------------ */

const io = new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

/* ------------------------------------------------------------
   Combos
------------------------------------------------------------ */
const totalEstaciones = p => p.partes.reduce((t, x) => t + x.n, 0);

/* Vitrina de servicios. Sin precio por máquina: el valor se ve al armar
   la combinación en el cotizador. */
$('#gridServicios').innerHTML = IDS_MAQUINAS.map(id => {
  const m = MAQUINAS[id];
  // Con foto real cuando existe; si no, el ícono de siempre
  const visual = m.foto
    ? `<img class="servicio__foto" src="${m.foto}" width="${m.fw}" height="${m.fh}"
            loading="lazy" decoding="async" alt="${m.fotoAlt}">`
    : `<div class="servicio__ico" aria-hidden="true">${m.ico}</div>`;

  return `
    <a class="servicio reveal" href="${m.slug}.html">
      ${visual}
      <div class="servicio__cuerpo">
        <h3>${m.nombre}</h3>
        <p class="servicio__desc">${m.desc}</p>
        ${m.tags.length ? `<ul class="servicio__tags">${m.tags.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      </div>
    </a>`;
}).join('');

/* ------------------------------------------------------------
   Cotizador · paso 1: capacidad contratada y servicios
------------------------------------------------------------ */
let tamano = 40;                     // capacidad contratada en el cotizador

/* Selector cerrado: ocho tramos y consulta especial para más de 100. */
const selectorPersonas = $('#tamanoEvento');
selectorPersonas.innerHTML = CAPACIDADES.map(n => `<option value="${n}">${n} personas</option>`).join('') +
  '<option value="mas">Más de 100 personas · Escríbenos por WhatsApp</option>';
const fijarCapacidad = valor => { selectorPersonas.value = String(valor); };
fijarCapacidad(tamano);
selectorPersonas.addEventListener('change', () => {
  tamano = selectorPersonas.value === 'mas' ? null : Number(selectorPersonas.value);
  pintarExtras();
  calcular();
});

$('#promoPicker').innerHTML = IDS_MAQUINAS.map(id => {
  const m = MAQUINAS[id];
  return `
  <label class="promopick" data-id="${id}">
    <span class="promopick__head">
      <input type="checkbox" value="${id}">
      <span class="promopick__check">✓</span>
      <b class="promopick__nombre">${m.ico} ${m.nombre}</b>
      ${m.tipo ? `<span class="promopick__desc">${m.tipo}</span>` : ''}
    </span>
  </label>`;
}).join('');

const maquinasSeleccionadas = () => $$('#promoPicker input:checked').map(i => i.value);

$$('#promoPicker .promopick').forEach(bloque => {
  const input = $('input', bloque);
  input.addEventListener('change', () => {
    bloque.classList.toggle('is-on', input.checked);
    pintarExtras();
    calcular();
  });
});

/* ------------------------------------------------------------
   Las 3 combinaciones más pedidas
------------------------------------------------------------ */
$('#gridDestacados').innerHTML = DESTACADOS.map((d, i) => `
  <article class="destacado reveal${d.destacar ? ' destacado--star' : ''}" data-i="${i}">
    <ul class="destacado__lista">
      ${d.ids.map(id => `<li><span>${MAQUINAS[id].ico}</span>${MAQUINAS[id].nombre}</li>`).join('')}
    </ul>
    <div class="destacado__precio">
      <span>${d.cap} personas · traslado aparte</span>
      <b>${clp(precioCombinacion(d.ids, d.cap))}</b>
    </div>
    <button type="button" class="btn btn--full">Cotizar este combo</button>
  </article>`).join('');

/* Al tocar una, queda cargada en el cotizador y la página baja hasta él */
$$('#gridDestacados .destacado').forEach(tarjeta => {
  $('button', tarjeta).addEventListener('click', () => {
    const d = DESTACADOS[+tarjeta.dataset.i];

    tamano = d.cap;
    fijarCapacidad(d.cap);
    $$('#promoPicker input').forEach(input => {
      input.checked = d.ids.includes(input.value);
      input.closest('.promopick').classList.toggle('is-on', input.checked);
    });

    pintarExtras();
    calcular();
    $('#cotizador').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---- Paso 2: más porciones, solo de los servicios que el cliente ya eligió ---- */
const cantidadesExtra = {};          // { waffles: 10, crepes: 5, ... }
const maquinasElegidas = () => maquinasSeleccionadas();

function pintarExtras() {
  const caja = $('#extras');
  // solo los servicios que se cobran por porción: palomitas y algodón son ilimitados
  const ids = [...new Set(maquinasElegidas())].filter(id => MAQUINAS[id].admiteExtras);

  Object.keys(cantidadesExtra).forEach(id => { if (!ids.includes(id)) delete cantidadesExtra[id]; });

  if (tamano === null) {
    caja.innerHTML = '<p class="extras__vacio">Para más de 100 personas, cotizamos el servicio y las porciones extra por WhatsApp.</p>';
    return;
  }

  if (!ids.length) {
    caja.innerHTML = '<p class="extras__vacio">Elige Crepes, Waffles, Hotcakes o Helado soft para sumar porciones extra. Palomitas y algodón son ilimitados y no llevan extras.</p>';
    return;
  }

  caja.innerHTML = ids.map(id => {
    const m = MAQUINAS[id], cant = cantidadesExtra[id] || 0;
    const unitarioExtra = precioExtra(id);
    return `
      <div class="extra" data-id="${id}">
        <span class="extra__ico">${m.ico}</span>
        <div class="extra__txt"><b>${m.nombre} · ${clp(unitarioExtra)}</b><span> por porción adicional</span></div>
        <div class="stepper stepper--sm">
          <button type="button" data-paso="-5" aria-label="Quitar 5 porciones de ${m.nombre}">&minus;</button>
          <input type="text" value="+${cant}" readonly>
          <button type="button" data-paso="5" aria-label="Agregar 5 porciones de ${m.nombre}">+</button>
        </div>
        <b class="extra__precio">${clp(cant * unitarioExtra)}</b>
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

/* Vuelve a barrer TODO lo que tenga .reveal, porque las tarjetas que se crean
   con JS no existían cuando se registró el observador y se quedarían invisibles.
   Observar dos veces el mismo elemento no hace nada, así que es seguro. */
$$('.reveal').forEach((el, i) => {
  if (!el.style.transitionDelay) el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

/* ------------------------------------------------------------
   Reseñas: cinta en movimiento continuo
   Se duplica la lista para que el bucle no tenga corte visible.
   Se detiene al pasar el mouse, al arrastrar y al usar las flechas.
------------------------------------------------------------ */
if (MOSTRAR_RESENAS) {
  document.getElementById('resenas').hidden = false;
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
}

/* ------------------------------------------------------------
   Mapa y cálculo de traslado
------------------------------------------------------------ */
/* modo: 'pendiente' | 'zona' (dentro de un sector) | 'cercana' (fuera, a pocos km: tarifa + extra)
   | 'fuera' (lejos: por cotizar). textoEscrito: dirección que el buscador no encontró. */
const TRASLADO_VACIO = { lugar: '', zona: '', costo: 0, fueraRango: false, definido: false, modo: 'pendiente', indice: -1,
  direccion: '', punto: null, distanciaKm: null, textoEscrito: '' };
const estadoTraslado = { ...TRASLADO_VACIO };
const entradaTactil = matchMedia('(pointer: coarse)');
let mapa = null, mapaListo = false, marcador = null;

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

/* Distancia en km desde un punto al borde de un sector (proyección plana local, sobra para pocos km) */
function distanciaAlSector(lat, lng, poligono) {
  const kx = 111.32 * Math.cos(lat * Math.PI / 180), ky = 110.574;
  let minimo = Infinity;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const ax = (poligono[j][1] - lng) * kx, ay = (poligono[j][0] - lat) * ky;
    const bx = (poligono[i][1] - lng) * kx, by = (poligono[i][0] - lat) * ky;
    const dx = bx - ax, dy = by - ay, largo = dx * dx + dy * dy;
    const t = largo ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / largo)) : 0;
    minimo = Math.min(minimo, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return minimo;
}
function zonaMasCercana(lat, lng) {
  return ZONAS_TRASLADO.reduce((mejor, z) => {
    const km = distanciaAlSector(lat, lng, z.poligono);
    // a igual distancia, la más barata
    return !mejor || km < mejor.km - 0.05 || (Math.abs(km - mejor.km) <= 0.05 && z.precio < mejor.zona.precio) ? { zona: z, km } : mejor;
  }, null);
}
const textoKm = km => km < 1 ? `${Math.max(100, Math.round(km * 10) * 100)} m` : `${km.toLocaleString('es-CL', { maximumFractionDigits: 1 })} km`;
/* Reinicia el traslado conservando la dirección escrita que no se encontró */
const reiniciarTraslado = cambios => Object.assign(estadoTraslado, TRASLADO_VACIO, { textoEscrito: estadoTraslado.textoEscrito }, cambios);
const limpiarCampoDireccion = () => { if (!estadoTraslado.textoEscrito) $('#direccion').value = ''; };

let zonaResaltada = null;
function resaltarZona(zona) {
  if (!mapaListo) return;
  ZONAS_TRASLADO.forEach(z => {
    z.capa.setStyle(estiloSector(z, false));
    z.capa.getElement().setAttribute('aria-pressed', String(z === zona));
  });
  zonaResaltada = zona ? zona.capa : null;
  if (zonaResaltada) { zonaResaltada.setStyle(estiloSector(zona, true)); zonaResaltada.bringToFront(); }
}
function seleccionarZona(indice, ubicacion) {
  const zona = ZONAS_TRASLADO[indice];
  if (!zona) return;
  if (mapaListo) resaltarZona(zona);
  const direccion = ubicacion ? ubicacion.direccion || '' : '';
  const punto = ubicacion ? ubicacion.punto || null : null;
  reiniciarTraslado({ lugar: direccion || zona.nombre, zona: zona.nombre, costo: zona.precio, definido: true, modo: 'zona', indice, direccion, punto });
  ponerMarcador(punto);
  if (!direccion) limpiarCampoDireccion();
  $('#lugar').value = direccion || zona.nombre;
  avisar('');
  $('#resCosto').textContent = clp(zona.precio);
  $('#resLugar').textContent = zona.nombre;
  $('#hintMapa').textContent = direccion
    ? 'Encontramos tu sector. Confirmaremos la dirección exacta por WhatsApp.'
    : 'Sector seleccionado. Confirmaremos la ubicación exacta por WhatsApp.';
  calcular();
}
function coordinarUbicacion() {
  if (mapaListo) { resaltarZona(null); mapa.closePopup(); }
  Object.assign(estadoTraslado, TRASLADO_VACIO);
  ponerMarcador(null);
  $('#direccion').value = '';
  avisar('');
  $('#lugar').value = '';
  $('#resCosto').textContent = 'Por confirmar'; $('#resLugar').textContent = 'Ubicación por confirmar';
  $('#hintMapa').textContent = 'Podemos coordinar la ubicación y la tarifa por WhatsApp.';
  calcular();
}
/* Punto fuera de los sectores (tocado en el mapa o encontrado por dirección).
   Cerca de una zona: su tarifa + extra por confirmar. Lejos: por cotizar, indicando la más cercana. */
function marcarFueraDeZona(ubicacion) {
  if (mapaListo) { resaltarZona(null); mapa.closePopup(); }
  const direccion = ubicacion && ubicacion.direccion || '';
  const punto = ubicacion && ubicacion.punto || null;
  const cercana = punto ? zonaMasCercana(...punto) : null;
  const esCercana = cercana && cercana.km <= CONFIG.kmZonaCercana;
  if (esCercana) {
    const z = cercana.zona;
    reiniciarTraslado({ modo: 'cercana', definido: true, zona: z.nombre, costo: z.precio, indice: ZONAS_TRASLADO.indexOf(z),
      distanciaKm: cercana.km, direccion, punto, lugar: direccion || `Cerca de ${z.nombre}` });
    if (mapaListo) resaltarZona(z);
    $('#resCosto').innerHTML = `${clp(z.precio)} <small>+ extra</small>`;
    $('#resLugar').textContent = `Cerca de ${z.nombre} · a ${textoKm(cercana.km)} de la zona`;
    $('#hintMapa').textContent = `Estás a ${textoKm(cercana.km)} de nuestra zona ${z.nombre}. Usamos su tarifa y te confirmaremos por WhatsApp un pequeño extra por distancia.`;
  } else {
    reiniciarTraslado({ modo: 'fuera', fueraRango: true, direccion, punto, lugar: direccion,
      zona: cercana ? cercana.zona.nombre : '', distanciaKm: cercana ? cercana.km : null });
    $('#resCosto').textContent = 'Por cotizar';
    $('#resLugar').textContent = cercana ? `Fuera de nuestras zonas · a ${textoKm(cercana.km)} de ${cercana.zona.nombre}` : 'Fuera de nuestras zonas';
    $('#hintMapa').textContent = 'Fuera de nuestras zonas: igual puedes enviarnos tu cotización y te damos la tarifa de traslado por WhatsApp.';
  }
  ponerMarcador(punto, !esCercana);
  if (!direccion) limpiarCampoDireccion();
  $('#lugar').value = direccion || estadoTraslado.lugar;
  avisar('');
  calcular();
}
function ponerMarcador(punto, fuera) {
  if (!mapaListo) return;
  if (marcador) { marcador.remove(); marcador = null; }
  if (!punto) return;
  marcador = L.marker(punto, {
    icon: L.divIcon({ className: 'pin-evento' + (fuera ? ' pin-evento--fuera' : ''), html: '<span></span>', iconSize: [30, 40], iconAnchor: [15, 38] }),
    keyboard: false, interactive: false
  }).addTo(mapa);
}
$('#btnCoordinarUbicacion').addEventListener('click', coordinarUbicacion);

/* Carga diferida del mapa (Leaflet + gestos + tiles): solo al acercarse a Traslado. */
const soportaGestos = () => !!(window.leafletGestureHandling && window.leafletGestureHandling.GestureHandling);
function cargarScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
let mapaPromesa = null;
function cargarMapa() {
  if (mapaPromesa) return mapaPromesa;
  mapaPromesa = (async () => {
    if (!document.querySelector('link[data-leaflet-css]')) {
      [ 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        'https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.css'
      ].forEach(href => {
        const l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-leaflet-css', '1');
        document.head.appendChild(l);
      });
    }
    if (!window.L) await cargarScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    if (!soportaGestos()) await cargarScript('https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.js');
    initMapa();
  })();
  return mapaPromesa;
}
function initMapa() {
  if (mapaListo) return;
  mapa = L.map('mapa', {
    zoomSnap: 0.5,   // permite encuadrar todas las zonas sin que queden demasiado chicas
    scrollWheelZoom: !entradaTactil.matches,
    gestureHandling: entradaTactil.matches && soportaGestos(),
    gestureHandlingOptions: {
      duration: 1800,
      text: {
        touch: 'Usa dos dedos para mover el mapa',
        scroll: 'Usa Ctrl + rueda para hacer zoom',
        scrollMac: 'Usa ⌘ + rueda para hacer zoom'
      }
    }
  }).fitBounds(L.latLngBounds(ZONAS_TRASLADO.flatMap(z => z.poligono)), { padding: [6, 6] });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
    className: 'mapa-fondo'
  }).addTo(mapa);

  const observarMapa = new ResizeObserver(() => mapa.invalidateSize({ pan: false }));
  observarMapa.observe(document.getElementById('mapa'));

  ZONAS_TRASLADO.forEach(z => {
    z.capa = L.polygon(z.poligono, {
      ...estiloSector(z, false), bubblingMouseEvents: false, className: 'sector-traslado'
    }).addTo(mapa).bindPopup(`<b>${z.nombre}</b><br>Traslado ${clp(z.precio)}`);
    z.capa.bindTooltip(`${z.nombre} · traslado ${clp(z.precio)}`, { sticky: true });
    z.capa.on('click', e => seleccionarZona(ZONAS_TRASLADO.indexOf(z), { punto: [e.latlng.lat, e.latlng.lng] }));
    const elemento = z.capa.getElement();
    elemento.setAttribute('role', 'button'); elemento.setAttribute('tabindex', '0');
    elemento.setAttribute('aria-label', `${z.nombre} · traslado ${clp(z.precio)}`);
    elemento.setAttribute('aria-pressed', 'false');
    elemento.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seleccionarZona(ZONAS_TRASLADO.indexOf(z)); z.capa.openPopup(); }
    });
  });

  mapa.on('click', e => {
    const punto = [e.latlng.lat, e.latlng.lng];
    const zona = zonaDe(...punto);
    if (zona) { seleccionarZona(ZONAS_TRASLADO.indexOf(zona), { punto }); return; }
    marcarFueraDeZona({ punto });
  });

  agregarLeyenda();
  actualizarGestosMapa();
  mapaListo = true;
  if (estadoTraslado.indice >= 0) resaltarZona(ZONAS_TRASLADO[estadoTraslado.indice]);
  if (estadoTraslado.punto) {
    ponerMarcador(estadoTraslado.punto, estadoTraslado.fueraRango);
    mapa.setView(estadoTraslado.punto, 14);
  }
}

/* Apariencia de los sectores: color por zona, borde marcado al seleccionar. */
function estiloSector(zona, activo) {
  const color = COLOR_ZONA[zona.zona];
  return activo
    ? { color, fillColor: color, weight: 3, opacity: 1, fillOpacity: .32 }
    : { color, fillColor: color, weight: 1.2, opacity: .8, fillOpacity: .22 };
}
/* Leyenda de tarifas: una fila por precio, con los sectores de esa zona. */
function agregarLeyenda() {
  const leyenda = L.control({ position: 'bottomleft' });
  leyenda.onAdd = () => {
    const caja = L.DomUtil.create('div', 'mapa-leyenda');
    const zonas = [...new Set(ZONAS_TRASLADO.map(z => z.zona))];
    caja.innerHTML = '<b>Traslado</b>' + zonas.map(letra => {
      const z = ZONAS_TRASLADO.find(x => x.zona === letra);
      return `<span><i style="background:${COLOR_ZONA[letra]}"></i>${clp(z.precio)}</span>`;
    }).join('');
    L.DomEvent.disableClickPropagation(caja);
    return caja;
  };
  leyenda.addTo(mapa);
}

/* ------------------------------------------------------------
   Buscador de dirección (Photon, sobre datos de OpenStreetMap)
   Convierte la dirección en coordenadas y elige el sector solo.
------------------------------------------------------------ */
const BUSCADOR = {
  url: 'https://photon.komoot.io/api/',
  // Área de búsqueda: los sectores más un margen, para poder avisar "fuera de zona"
  bbox: (() => {
    const lat = ZONAS_TRASLADO.flatMap(z => z.poligono.map(p => p[0]));
    const lng = ZONAS_TRASLADO.flatMap(z => z.poligono.map(p => p[1]));
    const m = 0.15;
    return [Math.min(...lng) - m, Math.min(...lat) - m, Math.max(...lng) + m, Math.max(...lat) + m].map(n => n.toFixed(4)).join(',');
  })(),
  minimo: 3, espera: 350, maximo: 6
};
const entradaDireccion = $('#direccion');
const listaSugerencias = $('#sugerencias');
const avisoBuscador = $('#avisoBuscador');
let sugerencias = [], sugerenciaActiva = -1, temporizadorBusqueda = null, busquedaEnCurso = null;
const cacheBusquedas = new Map();

function textoSugerencia(p) {
  const calle = p.street ? `${p.street}${p.housenumber ? ' ' + p.housenumber : ''}` : '';
  const principal = p.name && p.name !== p.street ? p.name : (calle || p.name || '');
  const detalle = [p.name && calle && p.name !== calle ? calle : '', p.district || p.locality, p.city || p.county]
    .filter((v, i, a) => v && v !== principal && a.indexOf(v) === i);
  return { principal, detalle: detalle.join(', ') };
}
function avisar(texto) {
  avisoBuscador.textContent = texto || '';
  avisoBuscador.hidden = !texto;
}
function cerrarSugerencias() {
  listaSugerencias.hidden = true;
  listaSugerencias.innerHTML = '';
  entradaDireccion.setAttribute('aria-expanded', 'false');
  entradaDireccion.removeAttribute('aria-activedescendant');
  sugerenciaActiva = -1;
}
function mostrarSugerencias(lista) {
  sugerencias = lista;
  sugerenciaActiva = -1;
  if (!lista.length) { cerrarSugerencias(); return; }
  listaSugerencias.innerHTML = lista.map((s, i) =>
    `<li id="sug-${i}" role="option" aria-selected="false" data-i="${i}"><b>${escaparHTML(s.principal)}</b>${s.detalle ? `<span>${escaparHTML(s.detalle)}</span>` : ''}</li>`).join('');
  listaSugerencias.hidden = false;
  entradaDireccion.setAttribute('aria-expanded', 'true');
}
function marcarSugerencia(i) {
  const items = $$('li', listaSugerencias);
  if (!items.length) return;
  sugerenciaActiva = (i + items.length) % items.length;
  items.forEach((li, j) => li.setAttribute('aria-selected', String(j === sugerenciaActiva)));
  entradaDireccion.setAttribute('aria-activedescendant', items[sugerenciaActiva].id);
  items[sugerenciaActiva].scrollIntoView({ block: 'nearest' });
}
const escaparHTML = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function buscarDireccion(texto) {
  const clave = texto.toLowerCase();
  if (cacheBusquedas.has(clave)) return cacheBusquedas.get(clave);
  if (busquedaEnCurso) busquedaEnCurso.abort();
  busquedaEnCurso = new AbortController();
  const params = new URLSearchParams({
    q: texto, limit: String(BUSCADOR.maximo), bbox: BUSCADOR.bbox,
    lat: String(CONFIG.base.lat), lon: String(CONFIG.base.lng)
  });
  const respuesta = await fetch(`${BUSCADOR.url}?${params}`, { signal: busquedaEnCurso.signal });
  if (!respuesta.ok) throw new Error('Photon ' + respuesta.status);
  const datos = await respuesta.json();
  const vistos = new Set();
  const lista = (datos.features || []).map(f => {
    const [lng, lat] = f.geometry.coordinates;
    return { ...textoSugerencia(f.properties || {}), punto: [lat, lng] };
  }).filter(s => {
    const k = s.principal + '|' + s.detalle;
    if (!s.principal || vistos.has(k)) return false;
    vistos.add(k); return true;
  });
  cacheBusquedas.set(clave, lista);
  return lista;
}

/* Botón X: vacía el buscador y quita la ubicación elegida */
function actualizarBorrar() {
  const boton = $('#btnBorrarDireccion'), campo = $('#direccion');
  if (boton && campo) boton.hidden = !campo.value;
}
function borrarDireccion() {
  clearTimeout(temporizadorBusqueda);
  if (busquedaEnCurso) busquedaEnCurso.abort();
  cerrarSugerencias();
  avisar('');
  if (mapaListo) { resaltarZona(null); mapa.closePopup(); }
  Object.assign(estadoTraslado, TRASLADO_VACIO);
  ponerMarcador(null);
  entradaDireccion.value = '';
  $('#lugar').value = '';
  $('#resCosto').textContent = '—';
  $('#resLugar').textContent = 'Ubicación por confirmar';
  $('#hintMapa').textContent = '';
  calcular();
  entradaDireccion.focus();
}
$('#btnBorrarDireccion').addEventListener('click', borrarDireccion);

entradaDireccion.addEventListener('input', () => {
  actualizarBorrar();
  clearTimeout(temporizadorBusqueda);
  const texto = entradaDireccion.value.trim();
  avisar('');
  if (!texto && estadoTraslado.textoEscrito) { estadoTraslado.textoEscrito = ''; calcular(); }
  if (texto.length < BUSCADOR.minimo) { cerrarSugerencias(); return; }
  temporizadorBusqueda = setTimeout(async () => {
    entradaDireccion.closest('.buscador').classList.add('is-buscando');
    try {
      const lista = await buscarDireccion(texto);
      if (entradaDireccion.value.trim() !== texto) return;   // el usuario siguió escribiendo
      mostrarSugerencias(lista);
      if (!lista.length) direccionNoEncontrada(texto, 'No encontramos esa dirección. Prueba con calle, número y comuna, o toca en el mapa el punto aproximado: te enviaremos lo que escribiste para revisarlo.');
    } catch (e) {
      if (e.name === 'AbortError') return;
      cerrarSugerencias();
      direccionNoEncontrada(texto, 'No pudimos buscar la dirección en este momento. Toca en el mapa el punto aproximado o coordina por WhatsApp: enviaremos lo que escribiste.');
    } finally {
      entradaDireccion.closest('.buscador').classList.remove('is-buscando');
    }
  }, BUSCADOR.espera);
});
entradaDireccion.addEventListener('keydown', e => {
  if (listaSugerencias.hidden) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); marcarSugerencia(sugerenciaActiva + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); marcarSugerencia(sugerenciaActiva - 1); }
  else if (e.key === 'Enter') { e.preventDefault(); elegirSugerencia(sugerenciaActiva >= 0 ? sugerenciaActiva : 0); }
  else if (e.key === 'Escape') cerrarSugerencias();
});
// pointerdown (no click) para que el blur del campo no cierre la lista antes
listaSugerencias.addEventListener('pointerdown', e => {
  const li = e.target.closest('li[data-i]');
  if (!li) return;
  e.preventDefault();
  elegirSugerencia(+li.dataset.i);
});
entradaDireccion.addEventListener('blur', () => setTimeout(cerrarSugerencias, 150));

/* Dirección que el buscador no encontró: se guarda tal cual para el mensaje de WhatsApp */
function direccionNoEncontrada(texto, aviso) {
  estadoTraslado.textoEscrito = texto;
  // una ubicación encontrada antes ya no corresponde a lo que se escribió
  if (estadoTraslado.direccion) {
    const { textoEscrito } = estadoTraslado;
    if (mapaListo) { resaltarZona(null); mapa.closePopup(); }
    Object.assign(estadoTraslado, TRASLADO_VACIO, { textoEscrito });
    ponerMarcador(null);
    $('#resCosto').textContent = 'Por confirmar'; $('#resLugar').textContent = 'Ubicación por confirmar';
    $('#hintMapa').textContent = 'Toca en el mapa el punto aproximado de tu evento.';
  }
  $('#lugar').value = texto;
  avisar(aviso);
  calcular();
}

async function elegirSugerencia(i) {
  const s = sugerencias[i];
  if (!s) return;
  const direccion = s.detalle ? `${s.principal}, ${s.detalle}` : s.principal;
  entradaDireccion.value = direccion;
  estadoTraslado.textoEscrito = '';
  cerrarSugerencias();
  avisar('');
  medir('direccion-buscada');
  const zona = zonaDe(...s.punto);
  try { await cargarMapa(); } catch (e) {}
  if (zona) seleccionarZona(ZONAS_TRASLADO.indexOf(zona), { direccion, punto: s.punto });
  else marcarFueraDeZona({ direccion, punto: s.punto });
  if (mapaListo) mapa.setView(s.punto, 14, { animate: true });
}

/* Ubicación actual (GPS del teléfono o del navegador).
   Se busca el nombre de la calle con Photon; si falla, se usa solo el punto. */
const botonGps = $('#btnGps');
async function nombreDelPunto([lat, lng]) {
  try {
    const r = await fetch(`${BUSCADOR.url.replace(/api\/$/, 'reverse')}?lat=${lat}&lon=${lng}&limit=1`);
    if (!r.ok) return '';
    const f = ((await r.json()).features || [])[0];
    if (!f) return '';
    const t = textoSugerencia(f.properties || {});
    return t.detalle ? `${t.principal}, ${t.detalle}` : t.principal;
  } catch (e) { return ''; }
}
function usarUbicacionActual() {
  avisar('');
  botonGps.disabled = true;
  botonGps.classList.add('is-buscando');
  $('span', botonGps).textContent = 'Buscando tu ubicación…';
  const terminar = () => {
    botonGps.disabled = false;
    botonGps.classList.remove('is-buscando');
    $('span', botonGps).textContent = 'Usar mi ubicación actual';
  };
  navigator.geolocation.getCurrentPosition(async pos => {
    const punto = [pos.coords.latitude, pos.coords.longitude];
    const nombre = await nombreDelPunto(punto);
    const direccion = `${nombre || 'Mi ubicación actual'} (GPS)`;
    estadoTraslado.textoEscrito = '';
    entradaDireccion.value = direccion;
    medir('ubicacion-gps');
    try { await cargarMapa(); } catch (e) {}
    const zona = zonaDe(...punto);
    if (zona) seleccionarZona(ZONAS_TRASLADO.indexOf(zona), { direccion, punto });
    else marcarFueraDeZona({ direccion, punto });
    if (mapaListo) mapa.setView(punto, 15, { animate: true });
    terminar();
  }, err => {
    terminar();
    avisar(err.code === err.PERMISSION_DENIED
      ? 'No tenemos permiso para ver tu ubicación. Actívalo en tu navegador o escribe la dirección.'
      : 'No pudimos obtener tu ubicación. Escribe la dirección o toca el punto en el mapa.');
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
}
// Solo en celulares y tablets: en computador la ubicación sale del wifi o la IP y puede errar por kilómetros
if (botonGps && 'geolocation' in navigator && entradaTactil.matches) {
  botonGps.hidden = false;
  botonGps.addEventListener('click', usarUbicacionActual);
}

/* Dispara la carga del mapa cuando el usuario se acerca a Traslado. */
const seccionTraslado = $('#traslado');
if (seccionTraslado && 'IntersectionObserver' in window) {
  new IntersectionObserver((entradas, obs) => {
    if (entradas[0].isIntersecting) { cargarMapa(); obs.disconnect(); }
  }, { rootMargin: '300px' }).observe(seccionTraslado);
}

/* Escritorio: rueda y arrastre libres. Táctil: gestos de dos dedos. */
function actualizarGestosMapa() {
  if (!mapa) return;
  if (mapa.gestureHandling) {
    if (entradaTactil.matches && soportaGestos()) mapa.gestureHandling.enable();
    else mapa.gestureHandling.disable();
  }
  if (entradaTactil.matches) {
    mapa.scrollWheelZoom.disable();
    if (!soportaGestos()) mapa.dragging.disable();
  } else { mapa.dragging.enable(); mapa.scrollWheelZoom.enable(); }
}
entradaTactil.addEventListener('change', actualizarGestosMapa);

/* La ubicación se elige únicamente en el mapa o se coordina por WhatsApp. */

const campos = ['#fecha', '#hora', '#tipo', '#lugar', '#nombre', '#festejado', '#nota'];
campos.forEach(sel => $(sel).addEventListener('input', calcular));

$('#sinFecha').addEventListener('change', () => {
  $('#fecha').disabled = $('#sinFecha').checked;
  if ($('#sinFecha').checked) $('#fecha').value = '';
  calcular();
});

function cotizacion() {
  const ids = maquinasSeleccionadas();
  const elegidas = ids.map(id => ({ id, precio: tamano === null ? null : precioMaquina(id, tamano) }));
  const completo = cotizacionValida(ids, tamano, cantidadesExtra);   // inválido: no se cotiza

  // precioCombinacion respeta las excepciones de COMBOS_FIJOS
  const base = tamano === null ? 0 : precioCombinacion(ids, tamano);
  const extras = tamano === null || !completo ? [] : Object.entries(cantidadesExtra)
    .filter(([id, c]) => c > 0 && ids.includes(id) && MAQUINAS[id].admiteExtras)
    .map(([id, cant]) => ({ id, cant, precio: cant * precioExtra(id) }));
  const costoExtras = extras.reduce((t, e) => t + e.precio, 0);
  const traslado = completo ? estadoTraslado.costo : 0;

  // Cotización inválida: no se muestra ningún valor
  return { elegidas, completo, tamano, base, extras, costoExtras, traslado,
           total: completo && tamano !== null ? base + costoExtras + traslado : 0 };
}

/* El mismo desglose alimenta el resumen y el mensaje de WhatsApp. */
function desgloseServicio(c) {
  if (!c.completo || c.tamano === null) return c.elegidas.map(e => ({ texto: MAQUINAS[e.id].nombre, importe: null }));
  if (COMBOS_FIJOS[clave(c.elegidas.map(e => e.id))] != null) {
    return [{ texto: 'Palomitas + Algodón · precio fijo', importe: c.base }];
  }
  const filas = c.elegidas.map(e => {
    const unitario = precioPorPersona(e.id, CAPACIDADES[0]);
    return { texto: `${c.tamano} ${MAQUINAS[e.id].nombre} × ${clp(unitario)}`, importe: c.tamano * unitario };
  });
  const descuento = descuentoVolumen(c);
  if (descuento) filas.push(descuento);
  return filas;
}
function descuentoVolumen(c) {
  if (!c.completo || c.tamano === null || COMBOS_FIJOS[clave(c.elegidas.map(e => e.id))] != null) return null;
  const porcentaje = TARIFAS_SERVICIO.descuentos[CAPACIDADES.indexOf(c.tamano)];
  if (!porcentaje) return null;
  // La diferencia de tarifas respeta el redondeo del Excel; no aplicar el % al total.
  const monto = c.elegidas.reduce((suma, e) => suma +
    (precioPorPersona(e.id, CAPACIDADES[0]) - precioPorPersona(e.id, c.tamano)) * c.tamano, 0);
  return monto > 0 ? { texto: `Descuento por volumen (${porcentaje}%)`, importe: -monto } : null;
}
function desgloseAdicionales(c) {
  return c.extras.map(e => ({ texto: `${e.cant} ${MAQUINAS[e.id].nombre} × ${clp(precioExtra(e.id))} · adicionales`, importe: e.precio }));
}
function importeDesglose(fila, c) {
  if (fila.importe == null) return c.completo && c.tamano === null ? 'A cotizar' : '—';
  return fila.importe < 0 ? `−${clp(-fila.importe)}` : clp(fila.importe);
}

let medidoDosServicios = false;
function calcular() {
  const c = cotizacion();
  if (!medidoDosServicios && c.elegidas.length >= 2) { medidoDosServicios = true; medir('elige-2-servicios'); }

  const detalle = [...desgloseServicio(c), ...desgloseAdicionales(c)];
  const aviso = c.elegidas.length === 0
    ? '<p class="vacio">Elige tus servicios para empezar 🍭</p>'
    : (!c.completo ? '<p class="resumen__aviso">Agrega otra estación para completar tu evento.</p>' : '');
  $('#resumenItems').innerHTML = detalle.map(f => `<div class="resumen__item"><span>${f.texto}</span><b>${importeDesglose(f, c)}</b></div>`).join('') + aviso;

  $('#cPromoLabel').textContent = c.elegidas.length
    ? (c.tamano === null ? 'Más de 100 personas' : `Servicio · ${c.tamano} personas`)
    : 'Combinación';
  $('#cSub').textContent = !c.completo ? '—' : (c.tamano === null ? 'A cotizar' : clp(c.base));
  $('#cExtra').textContent = !c.completo ? '—' : clp(c.costoExtras);
  const conExtra = estadoTraslado.modo === 'cercana';
  $('#cTraslado').textContent = !c.completo ? '—'
    : (estadoTraslado.fueraRango ? 'Por cotizar'
      : (estadoTraslado.definido ? clp(c.traslado) + (conExtra ? ' + extra' : '') : 'Por confirmar'));
  $('#cTotal').textContent = !c.completo ? '—' : (c.tamano === null ? 'A cotizar' : clp(c.total));
  $('#cTotalPendiente').hidden = !c.completo || (estadoTraslado.definido && !estadoTraslado.fueraRango && !conExtra);
  $('#cTotalPendiente').textContent = conExtra ? '+ extra por distancia por confirmar' : '+ traslado por confirmar';
  $('#cTotalNota').textContent = c.tamano === null ? 'Escríbenos por WhatsApp para cotizar más de 100 personas.'
    : (conExtra ? `Incluye la tarifa de ${estadoTraslado.zona}; el extra por distancia se confirma por WhatsApp.`
      : (!estadoTraslado.definido || estadoTraslado.fueraRango ? 'El subtotal no incluye un traslado confirmado.' : 'Incluye traslado.'));

  $('#btnWhats').classList.toggle('btn--off', !c.completo);
  $('#btnPdf').classList.toggle('btn--off', !c.completo);
  $('#btnWhatsBarra').classList.toggle('btn--off', !c.completo);
  $('#cTotalBarra').textContent = !c.completo ? '—' : (c.tamano === null ? 'A cotizar' : clp(c.total));
  actualizarBorrar();   // la dirección pudo cambiar por GPS, mapa o reinicio
  guardarEstado();
}

/* ------------------------------------------------------------
   Mensajes de WhatsApp
------------------------------------------------------------ */
/* Bloque de ubicación del mensaje: categoría clara para quien cotiza, más un enlace al punto exacto. */
function mensajeUbicacion() {
  const t = estadoTraslado, L = [];
  if (t.direccion) L.push(`📍 *Dirección:* ${t.direccion}`);
  if (t.textoEscrito) L.push(`📝 *Dirección escrita (no encontrada en el mapa):* ${t.textoEscrito}`);
  if (t.modo === 'zona') L.push(`✅ *En zona:* ${t.zona} · Traslado ${clp(t.costo)}`);
  else if (t.modo === 'cercana') L.push(`⚠️ *Cerca de zona:* a ${textoKm(t.distanciaKm)} de ${t.zona} · Traslado ${clp(t.costo)} + extra por distancia`);
  else if (t.modo === 'fuera') L.push(t.zona
    ? `❌ *Fuera de zona:* a ${textoKm(t.distanciaKm)} de ${t.zona} (zona más cercana) · Traslado por cotizar`
    : '❌ *Fuera de zona:* traslado por cotizar');
  else L.push('📍 *Ubicación:* por confirmar · Traslado por confirmar');
  if (t.punto) L.push(`🗺️ ${t.direccion ? 'Ver en el mapa' : 'Punto marcado en el mapa'}: https://maps.google.com/?q=${t.punto[0].toFixed(5)},${t.punto[1].toFixed(5)}`);
  return L.join('\n');
}
function mensajeCotizacion() {
  const c = cotizacion();
  const L = [];

  L.push('¡Hola *Dulce Estación*! 👋 Quiero cotizar mi evento:', '');
  L.push(`*N° de cotización:* ${numeroCotizacion()}`);
  if ($('#nombre').value.trim())    L.push(`*Reserva:* ${$('#nombre').value.trim()}`);
  if ($('#festejado').value.trim()) L.push(`*Festejado/a:* ${$('#festejado').value.trim()}`);
  L.push(`*Tipo de evento:* ${$('#tipo').value}`);
  if ($('#sinFecha').checked) L.push('*Fecha:* aún no tengo fecha');
  else if ($('#fecha').value) L.push(`*Fecha:* ${fechaLegible($('#fecha').value, $('#hora').value)}`);
  L.push(mensajeUbicacion(), `*Personas:* ${c.tamano === null ? 'Más de 100' : c.tamano}`, '');

  const filas = [...desgloseServicio(c), ...desgloseAdicionales(c)];
  if (filas.length) filas.forEach(f => L.push(`• ${f.texto} = ${importeDesglose(f, c)}`));
  else L.push('*Servicios:* (aún por definir)');

  const pendiente = !estadoTraslado.definido || estadoTraslado.fueraRango;
  const conExtra = estadoTraslado.modo === 'cercana';
  L.push('', `*Servicio · ${c.tamano === null ? 'más de 100' : c.tamano} personas:* ${c.tamano === null ? 'A cotizar' : (c.completo ? clp(c.base) : '—')}`);
  L.push(`*Porciones adicionales:* ${clp(c.costoExtras)}`);
  L.push(`*Traslado:* ${pendiente ? 'por confirmar' : clp(c.traslado) + (conExtra ? ' + extra por distancia' : '')}`);
  L.push(`*TOTAL ESTIMADO: ${c.tamano === null ? 'A cotizar' : clp(c.total)}${pendiente ? ' + traslado por confirmar' : (conExtra ? ' + extra por distancia' : '')}*`);

  if ($('#nota').value.trim()) L.push('', `_Comentario:_ ${$('#nota').value.trim()}`);
  L.push('', 'Quedo atento/a para confirmar la ubicación, la tarifa y la fecha.');
  return L.join('\n');
}

/* Cotización incompleta: lleva a los servicios y los sacude para llamar la atención */
function cotizacionIncompleta() {
  if (cotizacionValida(maquinasSeleccionadas(), tamano, cantidadesExtra)) return false;
  $('#promoPicker').scrollIntoView({ behavior: 'smooth', block: 'center' });
  $$('#promoPicker .promopick').forEach(p => p.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
    { duration: 320 }));
  return true;
}
function enviarWhatsapp() {
  if (cotizacionIncompleta()) return;
  if (!$('#sinFecha').checked && !$('#fecha').value) {   // fecha obligatoria
    $('#fecha').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('#fecha').focus();
    return;
  }
  medir('enviar-whatsapp');
  open(waLink(mensajeCotizacion()), '_blank');
}
$('#btnWhats').addEventListener('click', enviarWhatsapp);

/* ------------------------------------------------------------
   N° de cotización: el mismo en el PDF y en el mensaje de WhatsApp,
   para que el pedido se pueda encontrar después. Se renueva al empezar de nuevo.
------------------------------------------------------------ */
const CLAVE_NUMERO = 'dulce-estacion-numero';
let numeroActual = null;
function numeroCotizacion() {
  if (numeroActual) return numeroActual;
  try { numeroActual = localStorage.getItem(CLAVE_NUMERO); } catch (e) {}
  if (!numeroActual) {
    const d = new Date(), dos = n => String(n).padStart(2, '0');
    numeroActual = `DE-${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}-${1000 + Math.floor(Math.random() * 9000)}`;
    try { localStorage.setItem(CLAVE_NUMERO, numeroActual); } catch (e) {}
  }
  return numeroActual;
}

/* PDF: jsPDF y el armado del documento se descargan solo al tocar el botón */
const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
let pdfPromesa = null;
function cargarGeneradorPdf() {
  if (!pdfPromesa) {
    pdfPromesa = (async () => {
      if (!window.jspdf) await cargarScript(JSPDF_URL);
      if (typeof generarPdfCotizacion !== 'function') await cargarScript('cotizacion-pdf.js?v=3');
    })().catch(e => { pdfPromesa = null; throw e; });
  }
  return pdfPromesa;
}
/* El PDF se abre en una pestaña nueva. La pestaña se abre en el mismo toque
   (si se abre después de esperar, el navegador la bloquea) y luego recibe el PDF.
   Si el navegador la bloquea igual, el PDF se descarga. */
const TEXTO_BOTON_PDF = 'Ver cotización en PDF';
async function abrirPdf() {
  if (cotizacionIncompleta()) return;
  const boton = $('#btnPdf'), texto = $('span', boton);
  const pestana = window.open('', '_blank');
  if (pestana) {
    try {
      pestana.document.title = 'Generando tu cotización…';
      pestana.document.body.innerHTML = '<p style="font:16px/1.5 system-ui,sans-serif;color:#6E6660;padding:2rem;text-align:center">Generando tu cotización…</p>';
    } catch (e) {}
  }
  boton.disabled = true; texto.textContent = 'Generando PDF…';
  try {
    await cargarGeneradorPdf();
    const { doc, nombre } = await generarPdfCotizacion();
    if (pestana && !pestana.closed) pestana.location.href = doc.output('bloburl');
    else doc.save(nombre);
    medir('ver-pdf');
    texto.textContent = TEXTO_BOTON_PDF;
  } catch (e) {
    if (pestana && !pestana.closed) pestana.close();
    texto.textContent = 'No se pudo generar. Intenta de nuevo';
    setTimeout(() => { texto.textContent = TEXTO_BOTON_PDF; }, 3500);
  } finally {
    boton.disabled = false;
  }
}
$('#btnPdf').addEventListener('click', abrirPdf);
$('#btnWhatsBarra').addEventListener('click', enviarWhatsapp);

/* Empezar de nuevo: limpia el avance guardado y resetea el cotizador. */
$('#btnReiniciar').addEventListener('click', () => {
  try { localStorage.removeItem(CLAVE_ESTADO); localStorage.removeItem(CLAVE_NUMERO); } catch (e) {}
  numeroActual = null;
  $$('#promoPicker input').forEach(i => { i.checked = false; i.closest('.promopick').classList.remove('is-on'); });
  tamano = 40;
  selectorPersonas.value = '40';
  Object.keys(cantidadesExtra).forEach(k => delete cantidadesExtra[k]);
  Object.assign(estadoTraslado, TRASLADO_VACIO);
  if (mapaListo) { resaltarZona(null); mapa.closePopup(); }
  ponerMarcador(null);
  ['#nombre', '#festejado', '#fecha', '#hora', '#lugar', '#nota', '#direccion'].forEach(sel => $(sel).value = '');
  $('#sinFecha').checked = false; $('#fecha').disabled = false;
  $('#tipo').value = 'Cumpleaños';
  $('#resCosto').textContent = '—'; $('#resLugar').textContent = 'Ubicación por confirmar';
  $('#hintMapa').textContent = '';
  pintarExtras();
  calcular();
});

$('#btnContacto').addEventListener('click', () => {
  const t = [
    '¡Hola *Dulce Estación*! 👋',
    $('#cName').value.trim() ? `Soy ${$('#cName').value.trim()}.` : '',
    $('#cTel').value.trim() ? `Mi teléfono: ${$('#cTel').value.trim()}` : '',
    $('#cMsg').value.trim() || 'Quisiera más información sobre sus servicios de dulces.'
  ].filter(Boolean).join('\n');
  open(waLink(t), '_blank');
});

const saludo = '¡Hola *Dulce Estación*! Quisiera información sobre sus servicios de dulces para un evento 🍭';
['#fab', '#waDirecto', '#waFooter'].forEach(sel => $(sel).href = waLink(saludo));
$('#fab').addEventListener('click', () => medir('fab-whatsapp'));
$('#waDirecto').textContent = '+' + CONFIG.whatsapp.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4');

// Un solo lugar para las redes: todos los enlaces con data-red toman su dirección de CONFIG
$$('[data-red]').forEach(a => a.href = CONFIG.redes[a.dataset.red]);

/* Persistencia local: lo avanzado no se pierde al cerrar la pestaña (sin datos sensibles). */
const CLAVE_ESTADO = 'dulce-estacion-cotizador-v1';
function guardarEstado() {
  try {
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify({
      maquinas: maquinasSeleccionadas(),
      tamano: selectorPersonas.value,
      extras: cantidadesExtra,
      traslado: { ...estadoTraslado },
      nombre: $('#nombre').value, festejado: $('#festejado').value,
      fecha: $('#fecha').value, sinFecha: $('#sinFecha').checked, hora: $('#hora').value,
      tipo: $('#tipo').value, nota: $('#nota').value
    }));
  } catch (e) {}
}
function restaurarEstado() {
  try {
    const e = JSON.parse(localStorage.getItem(CLAVE_ESTADO) || 'null');
    if (!e) return;
    if (Array.isArray(e.maquinas)) {
      $$('#promoPicker input').forEach(input => {
        input.checked = e.maquinas.includes(input.value);
        input.closest('.promopick').classList.toggle('is-on', input.checked);
      });
    }
    if (e.tamano) selectorPersonas.value = e.tamano;
    tamano = selectorPersonas.value === 'mas' ? null : Number(selectorPersonas.value);
    if (e.extras) Object.assign(cantidadesExtra, e.extras);
    if (e.traslado) Object.assign(estadoTraslado, e.traslado);
    if (e.nombre != null) $('#nombre').value = e.nombre;
    if (e.festejado != null) $('#festejado').value = e.festejado;
    if (e.fecha != null) $('#fecha').value = e.fecha;
    if (e.sinFecha) { $('#sinFecha').checked = true; $('#fecha').disabled = true; }
    if (e.hora != null) $('#hora').value = e.hora;
    if (e.tipo != null) $('#tipo').value = e.tipo;
    if (e.nota != null) $('#nota').value = e.nota;
    if (e.traslado && (e.traslado.direccion || e.traslado.textoEscrito)) $('#direccion').value = e.traslado.direccion || e.traslado.textoEscrito;
    if (e.traslado && e.traslado.modo === 'cercana' && ZONAS_TRASLADO[e.traslado.indice]) {
      resaltarZona(ZONAS_TRASLADO[e.traslado.indice]);
      $('#lugar').value = e.traslado.lugar || '';
      $('#resLugar').textContent = `Cerca de ${e.traslado.zona} · a ${textoKm(e.traslado.distanciaKm)} de la zona`;
      $('#resCosto').innerHTML = `${clp(e.traslado.costo)} <small>+ extra</small>`;
    } else if (e.traslado && e.traslado.indice >= 0 && ZONAS_TRASLADO[e.traslado.indice]) {
      resaltarZona(ZONAS_TRASLADO[e.traslado.indice]);
      $('#lugar').value = e.traslado.direccion || e.traslado.lugar || '';
      $('#resLugar').textContent = e.traslado.zona;
      $('#resCosto').textContent = clp(e.traslado.costo);
    } else if (e.traslado && e.traslado.fueraRango) {
      $('#lugar').value = e.traslado.direccion || '';
      $('#resLugar').textContent = e.traslado.zona ? `Fuera de nuestras zonas · a ${textoKm(e.traslado.distanciaKm)} de ${e.traslado.zona}` : 'Fuera de nuestras zonas';
      $('#resCosto').textContent = 'Por cotizar';
    }
  } catch (e) {}
}

/* ¿Qué celebras?: preselecciona el tipo de evento y baja al cotizador. */
$$('.celebracion__item').forEach(item => item.addEventListener('click', () => {
  const tipo = item.dataset.tipo;
  if (tipo && $('#tipo')) { $('#tipo').value = tipo; calcular(); }
}));

/* Barra fija del cotizador: visible solo mientras el cotizador está en pantalla. */
(function () {
  const barra = $('#barraCotizador');
  const seccion = $('#cotizador');
  if (!barra || !seccion || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(entradas => {
    const visible = entradas[0].isIntersecting;
    barra.hidden = !visible;
    barra.setAttribute('aria-hidden', String(!visible));
    document.body.classList.toggle('tiene-barra-cotizador', visible);
  }, { threshold: 0 }).observe(seccion);
})();

/* Medición: llegada al cotizador (una sola vez). */
(function () {
  const seccion = $('#cotizador');
  if (!seccion || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((entradas, obs) => {
    if (entradas[0].isIntersecting) { medir('cotizador-visto'); obs.disconnect(); }
  }, { threshold: 0.2 }).observe(seccion);
})();

restaurarEstado();
pintarExtras();
calcular();

/* Preselección desde las fichas: index.html?servicio=crepes o index.html?carritos=crepes,waffles&personas=40 */
(function () {
  const params = new URLSearchParams(location.search);
  const carritos = params.get('carritos');
  const ids = (carritos ? carritos.split(',') : []).filter(id => MAQUINAS[id]);
  const solo = params.get('servicio');
  const seleccion = ids.length ? ids : (solo && MAQUINAS[solo] ? [solo] : []);
  if (!seleccion.length) return;
  const personas = Number(params.get('personas'));
  if (CAPACIDADES.includes(personas)) {
    tamano = personas;
    selectorPersonas.value = String(personas);
  }
  $$('#promoPicker input').forEach(input => {
    input.checked = seleccion.includes(input.value);
    input.closest('.promopick').classList.toggle('is-on', input.checked);
  });
  pintarExtras();
  calcular();
  $('#cotizador').scrollIntoView();
})();

/* ------------------------------------------------------------
   Mostacillas flotando en el hero (Maus) · canvas liviano
------------------------------------------------------------ */
(function () {
  var hero = document.getElementById('inicio');
  var canvas = document.querySelector('.hero__mostacillas');
  if (!hero || !canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // Tonos de marca + alegres (rojo, rojo claro, crema, rosado, amarillo, celeste, café)
  var COLORES = ['#E1462C', '#FCE9E4', '#FBF9F2', '#F4B8C4', '#F7E6A8', '#B9D7EC', '#8A6A4F'];
  var mostacillas = [];
  var corriendo = false, visible = true, raf = null;
  var parX = 0, parY = 0, mouseX = 0, mouseY = 0;

  function azar(a, b) { return a + Math.random() * (b - a); }

  function cantidad() {
    var n = window.innerWidth < 700 ? 24 : 52; // 20-30 celular, 40-70 escritorio
    return Math.max(18, Math.min(70, n));
  }

  function crear() {
    mostacillas = [];
    for (var i = 0; i < cantidad(); i++) {
      var prof = azar(0.25, 1);                      // lejanas: chicas y transparentes
      var punto = Math.random() < 0.28;
      var largo = punto ? azar(4, 8) : azar(11, 26) * (0.6 + prof * 0.55);
      var ancho = punto ? largo : azar(3.2, 5.2) * (0.7 + prof * 0.5);
      mostacillas.push({
        tipo: punto ? 'punto' : 'palito',
        color: COLORES[(Math.random() * COLORES.length) | 0],
        x: azar(0, 1), y: azar(0, 1),
        largo: largo, ancho: ancho, prof: prof,
        opacidad: azar(0.22, 0.4) + prof * 0.35,     // opacidad moderada
        rot: azar(0, Math.PI * 2),
        rotV: azar(-0.004, 0.004) * (0.5 + prof),
        caida: azar(0.05, 0.16) * (0.4 + prof),
        vaiven: azar(0.3, 1.1) * (0.5 + prof),
        fase: azar(0, Math.PI * 2)
      });
    }
  }

  function dimensionar() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = hero.offsetWidth, h = hero.offsetHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dibujar(t) {
    var w = hero.offsetWidth, h = hero.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < mostacillas.length; i++) {
      var m = mostacillas[i];
      var x = m.x * w + Math.sin(t * 0.00035 * m.vaiven + m.fase) * 13 * m.prof + parX * m.prof * 26;
      var y = m.y * h + parY * m.prof * 14;
      ctx.save();
      ctx.globalAlpha = m.opacidad;
      ctx.translate(x, y);
      ctx.rotate(m.rot);
      ctx.fillStyle = m.color;
      if (m.tipo === 'punto') {
        ctx.beginPath();
        ctx.arc(0, 0, m.largo / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        var r = m.ancho / 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-m.largo / 2, -m.ancho / 2, m.largo, m.ancho, r);
        else ctx.rect(-m.largo / 2, -m.ancho / 2, m.largo, m.ancho);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function paso(t) {
    if (!corriendo) return;
    for (var i = 0; i < mostacillas.length; i++) {
      var m = mostacillas[i];
      m.y += m.caida * 0.003;        // caída/flote lento
      m.rot += m.rotV;
      if (m.y > 1.08) { m.y = -0.08; m.x = Math.random(); }
    }
    parX += (mouseX - parX) * 0.045; // suavizado del parallax
    parY += (mouseY - parY) * 0.045;
    dibujar(t);
    raf = requestAnimationFrame(paso);
  }

  function arrancar() {
    if (corriendo || !visible) return;
    corriendo = true;
    raf = requestAnimationFrame(paso);
  }
  function parar() {
    corriendo = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  dimensionar();
  crear();
  dibujar(0);

  window.addEventListener('resize', function () {
    dimensionar();
    crear();
    dibujar(performance.now());
  });

  if (!reduce) {
    arrancar();

    if (fino) {
      window.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        mouseX = ((e.clientX - r.left) / (r.width || 1) - 0.5) * 2;
        mouseY = ((e.clientY - r.top) / (r.height || 1) - 0.5) * 2;
      }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        visible = entradas[0].isIntersecting;
        if (visible) arrancar(); else parar();
      }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar();
      else if (visible) arrancar();
    });
  }
})();
