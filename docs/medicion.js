/* ============================================================
   DULCE ESTACIÓN · medición (Cloudflare Web Analytics)
   Preparado y APAGADO: la constante del token está vacía.
   Cuando Maus entregue el token, escribirlo acá y cargar el
   script beacon de Cloudflare. Sin cookies.
   ============================================================ */
const MEDICION_CF_TOKEN = '';   // ← token de Cloudflare (vacío = sin medición)

const medir = nombre => {
  if (!MEDICION_CF_TOKEN || typeof nombre !== 'string' || !nombre) return;
  // Envío de evento a Cloudflare Web Analytics (sin cookies).
  try {
    window.__cfBeacon = window.__cfBeacon || [];
    window.__cfBeacon.push({ token: MEDICION_CF_TOKEN, event: nombre });
  } catch (e) {}
};
