/* Agregar aquí SOLO archivos propios aprobados y su descripción alt.
   Una línea para la foto de historia y tres entradas para la fila previa al cierre. */
const FOTOS_NOSOTROS = {
  historia: { src: '', alt: '' },
  galeria: [
    { src: '', alt: '' },
    { src: '', alt: '' },
    { src: '', alt: '' }
  ]
};

/* Página Nosotros: entrada escalonada y enlaces compartidos. */
(function () {
  'use strict';
  const esProduccion = !['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
    || new URLSearchParams(window.location.search).get('fotosPrueba') === '0';

  /* En producción, sin fotos reales aún: ocultar los marcos vacíos para que la página se vea completa. */
  if (esProduccion) {
    const marcoHistoria = document.querySelector('[data-foto-nosotros="historia"]');
    if (marcoHistoria && !FOTOS_NOSOTROS.historia.src.trim()) {
      marcoHistoria.hidden = true;
      const grid = document.querySelector('.nosotros__historia-grid');
      if (grid) grid.classList.add('sin-marco');
    }
    if (FOTOS_NOSOTROS.galeria.every(f => !f.src.trim())) {
      const fila = document.querySelector('.nosotros__fotos');
      if (fila) fila.hidden = true;
    }
  }

  const destinos = [
    ['historia', FOTOS_NOSOTROS.historia],
    ...FOTOS_NOSOTROS.galeria.map((foto, i) => ['galeria-' + i, foto])
  ];
  destinos.forEach(([clave, foto]) => {
    const marco = document.querySelector('[data-foto-nosotros="' + clave + '"]');
    if (!marco || !foto.src.trim()) return;
    const img = document.createElement('img');
    img.alt = foto.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('load', () => {
      marco.classList.add('tiene-foto');
      marco.removeAttribute('aria-hidden');
    });
    img.addEventListener('error', () => img.remove());
    img.src = foto.src;
    marco.append(img);
  });

  const elementos = [...document.querySelectorAll('.nosotros .reveal')];
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducir.matches || !('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: .12 });
    elementos.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });
  }
  const saludo = '¡Hola *Dulce Estación*! Quisiera información sobre sus servicios de dulces para un evento 🍭';
  const enlace = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(saludo);
  document.querySelectorAll('#fab, #waFooter').forEach(a => a.href = enlace);
  document.querySelectorAll('[data-red]').forEach(a => a.href = CONFIG.redes[a.dataset.red]);
})();
