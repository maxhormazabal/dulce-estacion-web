/* ============================================================
   DULCE ESTACIÓN · navegación compartida
   Menú móvil (hamburguesa) y sombra de la barra al hacer scroll.
   Lo cargan index.html y las fichas de servicio.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  const nav = $('#nav');
  const links = $('.nav__links');
  const burger = $('#burger');
  if (!links || !burger) return;

  if (nav) {
    addEventListener('scroll', () => nav.classList.toggle('is-stuck', scrollY > 12), { passive: true });
  }

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
  addEventListener('resize', () => { if (innerWidth > 960) menu(false); });
})();
