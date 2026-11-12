/* ============================================================
   DULCE ESTACIÓN · ficha de servicio
   Rellena la página desde MAQUINAS[data-servicio] (datos.js).
   ============================================================ */
(function () {
  'use strict';

  const id = document.body.dataset.servicio;
  const m = MAQUINAS && MAQUINAS[id];
  const contenedor = document.getElementById('servicio');
  if (!m || !contenedor) return;

  const escapar = texto => String(texto).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const fotos = m.fotos.filter(f => !f.prueba || MOSTRAR_FOTOS_PRUEBA);
  const primera = m.foto
    ? { src: m.foto, alt: m.fotoAlt, width: m.fw, height: m.fh }
    : fotos[0];
  const hero = primera
    ? `<figure class="ficha__hero"><img src="${escapar(primera.src)}" width="${primera.width}" height="${primera.height}" alt="${escapar(primera.alt)}" decoding="async" fetchpriority="high"></figure>`
    : `<div class="ficha__hero ficha__hero--ico"><span class="ficha__ico" aria-hidden="true">${m.ico}</span></div>`;
  const credito = f => f.prueba
    ? `<figcaption><a href="${escapar(f.url)}" target="_blank" rel="noopener">${escapar(f.autor)}</a> &middot; <a href="${escapar(f.licenciaUrl)}" target="_blank" rel="noopener">${escapar(f.licencia)}</a></figcaption>`
    : '';
  const galeria = fotos.length
    ? `<section class="ficha__galeria" aria-label="Fotos de ${m.nombre}">
        <h2>Galería</h2>
        ${fotos.some(f => f.prueba) ? '<p class="ficha__referencia">Las fotos de referencia se muestran solo para esta prueba de galería.</p>' : ''}
        <div class="ficha__grid">${fotos.map((f, i) => `
          <figure class="ficha__miniatura">
            <button type="button" class="ficha__foto" data-i="${i}" aria-label="Ver foto ${i + 1} de ${m.nombre}">
              <img src="${escapar(f.src)}" alt="${escapar(f.alt)}" ${f.width ? `width="${f.width}" height="${f.height}"` : ''} loading="lazy" decoding="async">
            </button>
            ${credito(f)}
          </figure>`).join('')}
        </div>
      </section>`
    : '';
  // Hasta cinco parrafos y una lista, que se completara con textos aprobados.
  const incluye = m.incluye.length
    ? `<section class="ficha__incluye"><h2>Qué incluye</h2><ul>${m.incluye.map(p => `<li>${escapar(p)}</li>`).join('')}</ul></section>`
    : '';

  /* Combínalo con… · parejas SUGERIDAS (propuesta para confirmar con Maus). */
  const COMBINA_CON = {
    crepes:    ['waffles', 'hotcakes', 'helados'],
    waffles:   ['crepes', 'hotcakes', 'algodon'],
    hotcakes:  ['waffles', 'crepes', 'algodon'],
    helados:   ['crepes', 'waffles', 'hotcakes'],
    palomitas: ['algodon', 'waffles', 'hotcakes'],
    algodon:   ['palomitas', 'waffles', 'hotcakes']
  };
  const CAP_COMBINA = 40;
  const claveCombo = ids2 => [...ids2].sort().join('+');
  const precioComboFicha = ids2 => {
    const fijo = TARIFAS_SERVICIO.combosFijos[claveCombo(ids2)];
    if (fijo != null) return fijo;
    const i = CAPACIDADES.indexOf(CAP_COMBINA);
    return ids2.reduce((t, id2) => t + CAP_COMBINA * MAQUINAS[id2].precios[i], 0);
  };
  const clpFicha = n => '$' + Math.round(n).toLocaleString('es-CL');
  const combina = (COMBINA_CON[id] || []).length
    ? `<section class="ficha__combina">
        <h2>Combínalo con…</h2>
        <p class="ficha__combina__nota">Parejas sugeridas a ${CAP_COMBINA} personas. Traslado aparte.</p>
        <div class="ficha__combina__grid">
          ${COMBINA_CON[id].map(pid => `
            <a class="ficha__combina__item" href="index.html?carritos=${id},${pid}&personas=${CAP_COMBINA}#cotizador">
              <span class="ficha__combina__nombres">${m.nombre} + ${MAQUINAS[pid].nombre}</span>
              <b class="ficha__combina__precio">${clpFicha(precioComboFicha([id, pid]))}</b>
              <span class="ficha__combina__cta">Cotizar este combo →</span>
            </a>`).join('')}
        </div>
      </section>`
    : '';

  contenedor.innerHTML = `
    <p class="ficha__volver"><a href="index.html#servicios">← Nuestros servicios</a></p>
    <header class="ficha__cab">
      <h1>${m.nombre}</h1>
    </header>
    ${hero}
    <div class="ficha__texto">${m.parrafos.map(p => `<p>${escapar(p)}</p>`).join('')}</div>
    ${incluye}
    <p class="ficha__cta"><a class="btn btn--lg" href="index.html?servicio=${encodeURIComponent(id)}#cotizador">Cotizar este servicio</a></p>
    ${combina}
    ${galeria}
  `;

  // Un mismo visor para las fichas y la galeria de portada.
  crearVisorFotos(fotos, contenedor.querySelectorAll('.ficha__foto'));

  // Enlaces de redes y WhatsApp (los mismos que index.html)
  const waLink2 = t => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;
  const saludo2 = '¡Hola *Dulce Estación*! Quisiera información sobre sus servicios de dulces para un evento 🍭';
  const fab = document.getElementById('fab');
  if (fab) fab.href = waLink2(saludo2);
  const waFooter = document.getElementById('waFooter');
  if (waFooter) waFooter.href = waLink2(saludo2);
  document.querySelectorAll('[data-red]').forEach(a => a.href = CONFIG.redes[a.dataset.red]);

  // CTA fija en celular: misma acción que el botón de la ficha, siempre a mano al hacer scroll.
  const ctaFija = document.createElement('div');
  ctaFija.className = 'ficha__cta-fija';
  ctaFija.hidden = true;
  ctaFija.innerHTML = `<a class="btn btn--lg" href="index.html?servicio=${encodeURIComponent(id)}#cotizador">Cotizar este servicio</a>`;
  document.body.appendChild(ctaFija);

  const mediaCta = window.matchMedia('(max-width: 760px)');
  const ctaOriginal = contenedor.querySelector('.ficha__cta');
  let ctaOriginalVisible = false;

  const refrescarCta = () => {
    const mostrar = mediaCta.matches && !ctaOriginalVisible;
    ctaFija.hidden = !mostrar;
    document.body.classList.toggle('tiene-cta-fija', mostrar);
  };

  // Desaparece cuando el botón original de la ficha queda a la vista.
  if (ctaOriginal && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      ctaOriginalVisible = entries[0].isIntersecting;
      refrescarCta();
    }, { threshold: 0.15 }).observe(ctaOriginal);
  }

  if ('addEventListener' in mediaCta) {
    mediaCta.addEventListener('change', refrescarCta);
  } else if (mediaCta.addListener) {
    mediaCta.addListener(refrescarCta);
  }

  refrescarCta();
})();
