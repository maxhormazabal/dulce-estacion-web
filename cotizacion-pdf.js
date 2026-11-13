/* ============================================================
   DULCE ESTACIÓN · PDF de la cotización
   Se carga solo cuando el cliente toca "Descargar cotización (PDF)",
   junto con la librería jsPDF. Usa los datos y funciones de script.js
   (cotizacion, desgloseServicio, estadoTraslado, clp, CONFIG...).
   ============================================================ */

/* Colores de la marca (los mismos de estilos.css) */
const PDF_COLOR = {
  rojo: [225, 70, 44], rojoClaro: [252, 233, 228], tinta: [36, 31, 28], gris: [110, 102, 96],
  crema: [247, 243, 231], cremaSuave: [251, 249, 242], linea: [235, 229, 215], blanco: [255, 255, 255], salmon: [255, 148, 120]
};

/* jsPDF con sus fuentes base no dibuja emojis ni el signo menos tipográfico */
const textoPdf = s => String(s == null ? '' : s)
  .replace(/−/g, '-')
  .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

/* Dibuja texto con las fuentes de la página (Fredoka, Playfair) en una imagen nítida */
async function imagenDeTexto(lineas, color) {
  await Promise.all(lineas.map(l => document.fonts.load(l.fuente, l.texto).catch(() => {})));
  const lienzo = document.createElement('canvas');
  const ctx = lienzo.getContext('2d');
  const anchos = lineas.map(l => { ctx.font = l.fuente; return ctx.measureText(l.texto).width; });
  const alto = lineas.reduce((t, l) => t + l.alto, 0);
  lienzo.width = Math.ceil(Math.max(...anchos)) + 8;
  lienzo.height = Math.ceil(alto) + 8;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  let y = 4;
  lineas.forEach(l => { y += l.alto; ctx.font = l.fuente; ctx.fillText(l.texto, 4, y - l.alto * 0.2); });
  return { url: lienzo.toDataURL('image/png'), proporcion: lienzo.width / lienzo.height };
}

const fechaLarga = d => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

/* Texto de la ubicación para el PDF: dirección y categoría, sin emojis */
function ubicacionPdf() {
  const t = estadoTraslado;
  const lugar = t.direccion || (t.textoEscrito ? `${t.textoEscrito} (no encontrada en el mapa)` : '');
  let categoria;
  if (t.modo === 'zona') categoria = `En zona ${t.zona} · traslado ${clp(t.costo)}`;
  else if (t.modo === 'cercana') categoria = `Cerca de la zona ${t.zona} (a ${textoKm(t.distanciaKm)}) · traslado ${clp(t.costo)} + extra por distancia por confirmar`;
  else if (t.modo === 'fuera') categoria = t.zona ? `Fuera de zona, a ${textoKm(t.distanciaKm)} de ${t.zona} · traslado por cotizar` : 'Fuera de zona · traslado por cotizar';
  else categoria = 'Ubicación por confirmar · traslado por confirmar';
  return { lugar: lugar || (t.modo === 'zona' ? `Sector ${t.zona}` : ''), categoria };
}

async function generarPdfCotizacion() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const c = cotizacion();
  const numero = numeroCotizacion();
  const W = 210, H = 297, M = 18, R = W - M;
  const C = PDF_COLOR;
  let y = 0;

  const fuente = (estilo, tam, color) => { doc.setFont('helvetica', estilo); doc.setFontSize(tam); doc.setTextColor(...color); };
  const pie = () => {
    doc.setDrawColor(...C.linea); doc.setLineWidth(0.3); doc.line(M, H - 22, R, H - 22);
    fuente('normal', 7.8, C.gris);
    doc.text('Cotización referencial. Un asesor confirma disponibilidad de fecha y el precio final.', M, H - 16.5);
    const ig = (CONFIG.redes.instagram.match(/instagram\.com\/([^/?#]+)/) || [])[1];
    const contacto = [
      'WhatsApp +' + CONFIG.whatsapp.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4'),
      ig ? 'Instagram @' + ig : '',
      CONFIG.web || '', CONFIG.correo || ''
    ].filter(Boolean).join('   ·   ');
    doc.text(contacto, M, H - 11.5);
  };
  // Salto de página si el bloque siguiente no cabe
  const asegurar = alto => { if (y + alto > H - 30) { pie(); doc.addPage(); y = M; } };

  /* ---------- Encabezado ---------- */
  doc.setFillColor(...C.crema); doc.rect(0, 0, W, 48, 'F');
  try {
    const logo = await imagenDeTexto([
      { texto: 'dulce', fuente: '700 140px Fredoka', alto: 122 },
      { texto: 'estacion', fuente: '700 78px Fredoka', alto: 70 }
    ], 'rgb(225,70,44)');
    const alto = 24; doc.addImage(logo.url, 'PNG', M, 12, alto * logo.proporcion, alto);
  } catch (e) {
    fuente('bold', 24, C.rojo); doc.text('dulce estacion', M, 28);
  }
  try {
    const titulo = await imagenDeTexto([{ texto: 'Cotización', fuente: '700 120px "Playfair Display"', alto: 140 }], 'rgb(36,31,28)');
    const alto = 12; doc.addImage(titulo.url, 'PNG', R - alto * titulo.proporcion, 10, alto * titulo.proporcion, alto);
  } catch (e) {
    fuente('bold', 22, C.tinta); doc.text('Cotización', R, 20, { align: 'right' });
  }
  const hoy = new Date();
  const vence = new Date(hoy.getTime() + (CONFIG.validezCotizacionDias || 15) * 864e5);
  fuente('bold', 10, C.rojo); doc.text(`N° ${numero}`, R, 28, { align: 'right' });
  fuente('normal', 8.8, C.gris);
  doc.text(`Emitida el ${fechaLarga(hoy)}`, R, 34, { align: 'right' });
  doc.text(`Válida hasta el ${fechaLarga(vence)}`, R, 39, { align: 'right' });
  y = 62;

  const tituloSeccion = texto => {
    asegurar(16);
    fuente('bold', 9, C.rojo); doc.text(texto.toUpperCase(), M, y, { charSpace: 0.4 });
    doc.setDrawColor(...C.linea); doc.setLineWidth(0.3); doc.line(M, y + 2.5, R, y + 2.5);
    y += 9;
  };

  /* ---------- Datos del evento ---------- */
  tituloSeccion('Datos del evento');
  const valor = sel => textoPdf($(sel).value) || '—';
  const fecha = $('#sinFecha').checked ? 'Aún sin fecha' : ($('#fecha').value ? textoPdf(fechaLegible($('#fecha').value)) : '—');
  const pares = [
    ['Reserva', valor('#nombre'), 'Festejado/a', valor('#festejado')],
    ['Tipo de evento', valor('#tipo'), 'Personas', c.tamano === null ? 'Más de 100' : String(c.tamano)],
    ['Fecha', fecha, 'Hora', $('#hora').value ? `${$('#hora').value} h` : '—']
  ];
  const colB = M + (R - M) / 2 + 4;
  pares.forEach(([l1, v1, l2, v2]) => {
    asegurar(12);
    fuente('normal', 7.8, C.gris); doc.text(l1, M, y); doc.text(l2, colB, y);
    fuente('bold', 10.5, C.tinta);
    doc.text(doc.splitTextToSize(v1, colB - M - 6)[0], M, y + 5);
    doc.text(doc.splitTextToSize(v2, R - colB)[0], colB, y + 5);
    y += 11.5;
  });
  const ub = ubicacionPdf();
  asegurar(20);
  fuente('normal', 7.8, C.gris); doc.text('Ubicación', M, y);
  fuente('bold', 10.5, C.tinta);
  const lineasLugar = doc.splitTextToSize(textoPdf(ub.lugar) || 'Por confirmar', R - M);
  doc.text(lineasLugar, M, y + 5);
  y += 5 + lineasLugar.length * 4.6;
  fuente('normal', 9, C.gris);
  const lineasCat = doc.splitTextToSize(textoPdf(ub.categoria), R - M);
  doc.text(lineasCat, M, y + 0.5);
  y += lineasCat.length * 4.2 + 8;

  /* ---------- Detalle ---------- */
  tituloSeccion('Detalle del servicio');
  doc.setFillColor(...C.cremaSuave); doc.rect(M, y - 4.5, R - M, 8, 'F');
  fuente('bold', 8.5, C.gris); doc.text('Descripción', M + 3, y + 0.8); doc.text('Importe', R - 3, y + 0.8, { align: 'right' });
  y += 9;
  const filas = [...desgloseServicio(c), ...desgloseAdicionales(c)];
  filas.forEach(f => {
    asegurar(9);
    const descuento = f.importe != null && f.importe < 0;
    fuente('normal', 10, C.tinta);
    doc.text(doc.splitTextToSize(textoPdf(f.texto), R - M - 45)[0], M + 3, y);
    fuente('bold', 10, descuento ? C.rojo : C.tinta);
    doc.text(textoPdf(importeDesglose(f, c)), R - 3, y, { align: 'right' });
    doc.setDrawColor(...C.linea); doc.setLineWidth(0.2); doc.line(M, y + 3.3, R, y + 3.3);
    y += 8.2;
  });

  /* Subtotales y total, con "¿Cómo reservar?" a la izquierda */
  asegurar(50);
  y += 3;
  const xEtiqueta = 112;
  const yBloque = y - 4;
  const anchoCaja = xEtiqueta - 10 - M;
  fuente('normal', 8.8, C.tinta);
  const pasos = doc.splitTextToSize(`Escríbenos por WhatsApp indicando el N° ${numero}. Confirmamos la disponibilidad de la fecha, la ubicación y el precio final.`, anchoCaja - 12);
  const altoCaja = 15 + pasos.length * 4.2;
  doc.setFillColor(...C.rojoClaro); doc.roundedRect(M, yBloque, anchoCaja, altoCaja, 3, 3, 'F');
  fuente('bold', 10, C.rojo); doc.text('¿Cómo reservar?', M + 6, yBloque + 8.5);
  fuente('normal', 8.8, C.tinta); doc.text(pasos, M + 6, yBloque + 14.5);
  const finCaja = yBloque + altoCaja;
  const conExtra = estadoTraslado.modo === 'cercana';
  const pendiente = !estadoTraslado.definido || estadoTraslado.fueraRango;
  const traslado = !c.completo ? '—'
    : (estadoTraslado.fueraRango ? 'Por cotizar' : (estadoTraslado.definido ? clp(c.traslado) + (conExtra ? ' + extra' : '') : 'Por confirmar'));
  [
    [c.tamano === null ? 'Servicio · más de 100 personas' : `Servicio · ${c.tamano} personas`, c.tamano === null ? 'A cotizar' : clp(c.base)],
    ['Porciones adicionales', clp(c.costoExtras)],
    ['Traslado', traslado]
  ].forEach(([etq, imp]) => {
    fuente('normal', 9.5, C.gris); doc.text(etq, xEtiqueta, y);
    fuente('normal', 9.5, C.tinta); doc.text(textoPdf(imp), R - 3, y, { align: 'right' });
    y += 6.5;
  });
  y += 1;
  doc.setFillColor(...C.tinta); doc.roundedRect(xEtiqueta - 4, y - 2, R - xEtiqueta + 4, 17, 3, 3, 'F');
  fuente('bold', 10.5, C.blanco); doc.text('Total estimado', xEtiqueta + 1, y + 8.4);
  fuente('bold', 17, C.salmon); doc.text(c.tamano === null ? 'A cotizar' : clp(c.total), R - 4, y + 9, { align: 'right' });
  y += 20;
  if (c.tamano !== null && (pendiente || conExtra)) {
    fuente('italic', 8.5, C.gris);
    doc.text(conExtra ? '+ extra por distancia por confirmar' : '+ traslado por confirmar', R - 3, y + 1, { align: 'right' });
    y += 6;
  }
  y = Math.max(y, finCaja + 4);

  /* ---------- Comentario ---------- */
  const nota = textoPdf($('#nota').value);
  if (nota) {
    y += 4;
    tituloSeccion('Comentario');
    fuente('normal', 9.5, C.tinta);
    const lineas = doc.splitTextToSize(nota, R - M);
    asegurar(lineas.length * 4.6);
    doc.text(lineas, M, y);
    y += lineas.length * 4.6 + 4;
  }

  pie();
  doc.setProperties({ title: `Cotización ${numero} · Dulce Estación`, author: 'Dulce Estación' });
  return { doc, nombre: `Cotizacion-Dulce-Estacion-${numero}.pdf` };
}
