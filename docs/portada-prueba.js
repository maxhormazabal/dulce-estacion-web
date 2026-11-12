/* Fotos SOLO para la prueba local. Al apagar el interruptor no se toca el DOM. */
(async function () {
  'use strict';
  if (!MOSTRAR_FOTOS_PRUEBA) return;
  await import('./visor.js?v=55');
  // Esperar a la cercania del viewport evita que el prefetch nativo sume peso inicial.
  const pendientes = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.src = e.target.dataset.fuentePrueba;
      delete e.target.dataset.fuentePrueba;
      pendientes.unobserve(e.target);
    });
  }, { rootMargin: '200px 0px' });
  const crearImagen = foto => {
    const img = document.createElement('img');
    img.dataset.fuentePrueba = foto.src;
    img.classList.add('portada__imagen-pendiente');
    img.addEventListener('load', () => img.classList.remove('portada__imagen-pendiente'));
    img.alt = foto.alt;
    if (foto.width) img.width = foto.width;
    if (foto.height) img.height = foto.height;
    img.loading = 'lazy';
    img.decoding = 'async';
    pendientes.observe(img);
    return img;
  };
  const propias = id => {
    const m = MAQUINAS[id];
    return { src: m.foto, alt: m.fotoAlt, width: m.fw, height: m.fh };
  };
  const tomarPrueba = (id, archivo) => FOTOS_PRUEBA[id].find(f => f.src.endsWith(archivo));
  const pruebas = [
    tomarPrueba('crepes', 'crepes-02.webp'),
    tomarPrueba('waffles', 'waffles-01.webp'),
    tomarPrueba('hotcakes', 'hotcakes-01.webp'),
    tomarPrueba('helados', 'helados-04.webp'),
    tomarPrueba('palomitas', 'palomitas-01.webp'),
    tomarPrueba('algodon', 'algodon-04.webp')
  ];
  const grid = document.querySelector('#galeria .galeria');
  const fotos = [...grid.querySelectorAll('figure img')].map(img => ({
    src: img.getAttribute('src'), alt: img.alt, width: img.width, height: img.height
  }));
  grid.classList.add('galeria--prueba');
  pruebas.forEach((foto, i) => {
    const figura = document.createElement('figure');
    figura.className = 'foto reveal' + (i === 2 ? ' foto--tall' : '');
    const img = crearImagen(foto);
    const caption = document.createElement('figcaption');
    caption.textContent = 'Referencia · ' + foto.alt;
    figura.append(img, caption);
    grid.append(figura);
    fotos.push(foto);
    figura.style.transitionDelay = (i % 3) * 70 + 'ms';
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      figura.classList.add('is-in');
      figura.style.transition = 'none';
    } else {
      io.observe(figura);
    }
  });
  const botones = [];
  grid.querySelectorAll('figure').forEach((figura, i) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'galeria__abrir';
    boton.dataset.i = i;
    boton.setAttribute('aria-label', 'Ver foto ' + (i + 1) + ' de la galería');
    boton.append(figura.querySelector('img'));
    figura.prepend(boton);
    botones.push(boton);
  });
  crearVisorFotos(fotos, botones);

  // Créditos visibles: estas imágenes no se presentan como eventos propios.
  const creditos = document.createElement('details');
  creditos.className = 'portada__creditos';
  const resumen = document.createElement('summary');
  resumen.textContent = 'Fotografías de referencia · créditos';
  const lista = document.createElement('ul');
  const usadas = [...pruebas, tomarPrueba('algodon', 'algodon-03.webp')];
  usadas.forEach(foto => {
    const li = document.createElement('li');
    const fuente = document.createElement('a');
    fuente.href = foto.url;
    fuente.textContent = foto.autor;
    fuente.target = '_blank';
    fuente.rel = 'noopener';
    const licencia = document.createElement('a');
    licencia.href = foto.licenciaUrl;
    licencia.textContent = foto.licencia;
    licencia.target = '_blank';
    licencia.rel = 'noopener';
    li.append(fuente, ' · ', licencia, ' · imagen adaptada');
    lista.append(li);
  });
  creditos.append(resumen, lista);
  grid.after(creditos);

  const ordenIg = ['waffles', 'algodon', 'hotcakes', 'palomitas', 'crepes', 'helados'];
  document.querySelectorAll('.ig__post').forEach((a, i) => {
    const id = ordenIg[i];
    const foto = id === 'algodon' ? tomarPrueba(id, 'algodon-03.webp') : propias(id);
    a.removeAttribute('data-emoji');
    a.classList.add('ig__post--prueba');
    a.append(crearImagen(foto));
    // La dirección sigue siendo el perfil real; no simula publicaciones propias.
  });
  const notaIg = document.createElement('p');
  notaIg.className = 'portada__referencia';
  notaIg.textContent = 'Fotografías de referencia.';
  document.querySelector('.ig__feed').before(notaIg);

  const iconoAlgodon = document.querySelector('#gridServicios a[href="algodon.html"] .servicio__ico');
  if (iconoAlgodon) {
    const img = crearImagen(tomarPrueba('algodon', 'algodon-04.webp'));
    img.classList.add('servicio__foto');
    iconoAlgodon.replaceWith(img);
  }
})();
