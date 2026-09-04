# Dulce Estación — sitio web

Carritos de dulces para eventos en Concepción, Chile. Sitio de una sola página con cotizador y cálculo de traslado por zonas.

---

## 1. Cómo levantarlo

No hay build, ni npm, ni framework. Son tres archivos estáticos.

```bash
cd sitio
python -m http.server 8777
```

Y abrir `http://localhost:8777`.

Sirve cualquier servidor estático. **No funciona bien abriendo `index.html` con doble clic** (`file://`): el geocodificador de direcciones falla por CORS.

Para publicar basta subir el contenido de `sitio/` a cualquier hosting estático (Netlify, Cloudflare Pages, Hostinger, S3). No requiere backend.

---

## 2. Estructura

```
sitio/
├── index.html     estructura y todos los textos
├── estilos.css    diseño completo
├── script.js      datos de negocio + toda la lógica
└── img/           (vacía — ver sección 7)
datos/
└── zonas-traslado.kml   fuente original de las zonas de traslado
```

`script.js` está ordenado así:

| Bloque | Qué contiene |
|---|---|
| `CONFIG` | WhatsApp, redes, coordenadas de la base, código de país |
| `ZONAS_TRASLADO` | 11 polígonos con su zona (A–D) y precio |
| `MAQUINAS` | las 6 máquinas, con precio unitario por persona |
| `PROMOS` | los 7 combos con precio para 40 y 60 personas |
| `RESENAS` | contenido del carrusel |
| resto | render, mapa, cotizador, mensajes de WhatsApp |

---

## 3. Dependencias externas

Todas por CDN, sin API keys ni cuentas.

| Qué | Versión | Uso |
|---|---|---|
| Google Fonts (Fredoka + DM Sans) | — | tipografías |
| Leaflet | 1.9.4 | mapa |
| leaflet-gesture-handling | 1.2.2 | mover el mapa con dos dedos |
| CARTO basemaps (`light_all`) | — | tiles del mapa |
| Nominatim (OpenStreetMap) | — | buscar direcciones |

**Nominatim tiene límite de 1 petición por segundo** y su política pide identificar la aplicación. Con el tráfico esperado no es problema, pero si el sitio crece conviene cambiar a un geocodificador con contrato (Google, Mapbox) o montar un proxy con caché.

Si algún CDN falla, el sitio no se rompe: sin `leaflet-gesture-handling` el mapa vuelve a arrastre normal (y se desactiva en táctil para no atrapar el scroll).

---

## 4. Reglas de negocio

Esto es lo que hay que respetar sí o sí al modificar el cotizador.

**Tamaño del evento: solo 40 o 60 personas.** No hay valores intermedios ni interpolación. Cada combo tiene dos precios fijos (`p40`, `p60`) y se muestra uno u otro.

**Estructura de un combo.** Cada combo es una lista de `partes`. Cada parte tiene `n` (cuántas máquinas entran) y `de` (entre qué máquinas elige el cliente):

```js
{ nombre: 'Trío Goloso', p40: 180000, p60: 245000, partes: [
    { n: 2, de: ['waffles', 'hotcakes', 'helados'] },   // elige DOS, distintas
    { n: 1, de: ['palomitas', 'algodon'] } ] }          // elige UNA
```

- Las partes entre sí se muestran unidas con **y** (todas entran).
- Las opciones dentro de una parte se unen con **o** (elige una).
- **Si `n` es 2, tienen que ser dos máquinas distintas.** No se puede elegir waffles dos veces. Lo garantiza `evitarRepetidas()`, que deshabilita en cada desplegable lo que ya tomó su hermano.

**Porciones adicionales (paso 2 del cotizador).** Solo aparecen las máquinas que el cliente eligió efectivamente en el paso 1, deduplicadas. Palomitas y algodón nunca aparecen: son ilimitados y tienen `unitario: null`. La cantidad sube y baja **de 5 en 5** y el costo es `cantidad × unitario`.

**Traslado.** Se resuelve por punto-en-polígono (algoritmo del rayo) contra `ZONAS_TRASLADO`. Si el punto no cae en ninguna zona, el traslado queda "a cotizar" y no suma al total. Los polígonos se recorren en orden y gana el primero que coincida; están ordenados de zona A a D, así que si dos se solaparan el cliente paga la más barata.

**Total** = suma de promociones + porciones adicionales + traslado. No hay descuentos ni recargos.

---

## 5. Actualizar las zonas de traslado

Las zonas y sus precios salen del mapa de Google My Maps de la empresa. Para regenerarlas:

```
https://www.google.com/maps/d/kml?mid=1b7oHN4OvMe15QxjDgeXpe4AeX2ARbKM&forcekml=1
```

En `datos/zonas-traslado.kml` está la descarga usada actualmente. Cada `<Placemark>` tiene el nombre con el formato `NOMBRE (TIPO X) PRECIO` y su polígono.

**Ojo:** el KML trae las coordenadas como `longitud,latitud,altura`; en `ZONAS_TRASLADO` van como `[latitud, longitud]`. Hay que invertirlas.

Zonas actuales: **A** Concepción $5.000 · **B** Hualpén, San Pedro 1, Talcahuano 1, Penco $10.000 · **C** San Pedro 2, Chiguayante, Talcahuano 2, Camino a Bulnes $15.000 · **D** Tomé, Coronel $20.000.

---

## 6. Envío de datos

**No hay backend.** Los dos formularios (el cotizador y "Reserva rápida") no guardan nada: arman un texto y abren `wa.me/<número>` con el mensaje prellenado. El cliente todavía tiene que apretar enviar dentro de WhatsApp.

Consecuencia conocida: **si el cliente no envía, no queda registro de nada.** Si el negocio quiere capturar los intentos, hay que agregar un backend o un servicio de formularios y disparar el guardado antes de abrir WhatsApp.

---

## 7. Pendientes de contenido

| Qué | Estado |
|---|---|
| Logo | El wordmark está recreado con CSS en `.logo`. Falta el archivo real → `img/logo.png` y reemplazar el `<span>` (hay un comentario marcando el punto, en el nav y en el footer). |
| Fotos de la galería | 6 marcadores de posición (`figure.foto`, cuadrados con emoji). Reemplazar por `<img>` sin quitar las clases. |
| Feed de Instagram | 6 marcadores de posición que enlazan al perfil. Se pueden reemplazar por fotos fijas o conectar un widget (LightWidget, Behold) que requiere vincular la cuenta. |
| Reseñas | **Las 10 son inventadas.** Hay que reemplazarlas por reseñas reales antes de publicar. |
| Textos legales | No hay política de privacidad ni términos. |

---

## 8. Notas técnicas

**Caché.** El CSS y el JS se cargan con `?v=N` en `index.html`. Al desplegar cambios hay que subir ese número; si no, los navegadores sirven la versión vieja. Si se agrega un pipeline de build, conviene reemplazarlo por hash de contenido.

**Responsive.** Cortes en 1000 px (tablet), 720 px (celular) y 400 px (celular chico). Auditado sin desbordes ni recortes de texto en 320, 360, 375, 414, 753 y 1265 px. Todas las áreas táctiles quedan sobre 38 px bajo 1000 px de ancho.

**Móvil primero en la práctica.** El negocio estima que ~90% de las contrataciones entran por teléfono. Cuidar especialmente el cotizador en pantallas chicas.

**Detalles a no romper:**
- Los `<input>` usan 16 px a propósito: con menos, iOS hace zoom al enfocarlos.
- El mapa usa gestos de dos dedos para que un dedo siga haciendo scroll de la página.
- La cinta de reseñas duplica la lista para el bucle infinito; `requestAnimationFrame` se congela solo cuando la pestaña no está visible.
- El menú móvil bloquea el scroll del fondo con `body.menu-abierto`.
- Se respeta `prefers-reduced-motion` en la cinta de reseñas.

**Accesibilidad.** Está lo básico (`aria-label` en controles de ícono, `aria-hidden` en decorativos, foco visible en campos). No se ha hecho una auditoría formal ni pruebas con lector de pantalla.

**Sin analítica.** No hay Google Analytics, Meta Pixel ni cookies. Tampoco banner de consentimiento, porque no hace falta.
