/* Visor compartido de las fichas y la galeria de prueba de portada. */
window.crearVisorFotos = function (fotos, botones) {
  'use strict';
  if (!fotos.length) return;
    const visor = document.createElement('div');
    visor.className = 'visor';
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Visor de fotos');
    visor.innerHTML = `
      <button type="button" class="visor__cerrar" aria-label="Cerrar">×</button>
      <button type="button" class="visor__nav visor__nav--prev" aria-label="Anterior">‹</button>
      <figure class="visor__caja"><img alt=""></figure>
      <button type="button" class="visor__nav visor__nav--next" aria-label="Siguiente">›</button>`;
    document.body.appendChild(visor);

    const img = visor.querySelector('img');
    const cerrar = visor.querySelector('.visor__cerrar');
    const prev = visor.querySelector('.visor__nav--prev');
    const next = visor.querySelector('.visor__nav--next');
    let actual = 0;
    let origenFoco = null;

    function mostrar(i) {
      actual = (i + fotos.length) % fotos.length;
      img.src = fotos[actual].src;
      img.alt = fotos[actual].alt;
    }
    function abrir() { origenFoco = document.activeElement; visor.classList.add('is-open'); document.body.classList.add('visor-abierto'); mostrar(actual); cerrar.focus(); }
    function cerrarVisor() { visor.classList.remove('is-open'); document.body.classList.remove('visor-abierto'); if (origenFoco) origenFoco.focus(); }

    botones.forEach(b => {
      b.addEventListener('click', () => { actual = Number(b.dataset.i); abrir(); });
    });
    cerrar.addEventListener('click', cerrarVisor);
    prev.addEventListener('click', () => { mostrar(actual - 1); img.classList.add('visor__cambio'); setTimeout(() => img.classList.remove('visor__cambio'), 250); });
    next.addEventListener('click', () => { mostrar(actual + 1); img.classList.add('visor__cambio'); setTimeout(() => img.classList.remove('visor__cambio'), 250); });

    document.addEventListener('keydown', e => {
      if (!visor.classList.contains('is-open')) return;
      if (e.key === 'Tab') {
        const botones = [cerrar, prev, next];
        const i = botones.indexOf(document.activeElement);
        e.preventDefault();
        botones[(i + (e.shiftKey ? 2 : 1)) % botones.length].focus();
      }
      if (e.key === 'Escape') cerrarVisor();
      else if (e.key === 'ArrowLeft') prev.click();
      else if (e.key === 'ArrowRight') next.click();
    });

    visor.addEventListener('click', e => { if (e.target === visor) cerrarVisor(); });

    // Deslizar en celular
    {
      let x0 = null;
      visor.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      visor.addEventListener('touchend', e => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) (dx < 0 ? next : prev).click();
        x0 = null;
      }, { passive: true });
    }

};
