# Dulce Estación · previsualización web

Abre **index.html** con doble clic (Chrome / Edge). Necesita internet para las fuentes y el mapa.

```
pagina web/
├── index.html    estructura y textos
├── estilos.css   diseño (colores del logo)
├── script.js     precios, reseñas, mapa y WhatsApp  ← aquí se edita casi todo
└── img/          (crea esta carpeta para el logo y las fotos)
```

## Lo que hay que cambiar antes de publicar

Todo está en el bloque `CONFIG` al inicio de `script.js`:

| Qué | Dónde | Valor actual |
|---|---|---|
| Número de WhatsApp | `CONFIG.whatsapp` | `56927535859` ✅ real |
| Instagram y TikTok | `CONFIG.redes` | @dulce_estacionccp en ambas ✅ reales |
| Dirección de la base | `CONFIG.base` | Concepción centro |
| Zonas y precios de traslado | array `ZONAS_TRASLADO` | ✅ reales, sacados de tu mapa |
| Combos y sus precios | array `PROMOS` | ✅ reales, los 7 que pasaste |
| Máquinas y precio unitario | objeto `MAQUINAS` | ✅ reales |
| Reseñas del carrusel | array `RESENAS` | 10 reseñas de ejemplo |

**La página vende solo por combos.** No hay lista de precios por estación suelta: el cliente elige promoción sí o sí. Si algún día quieres publicar precios individuales, hay que crear esa sección de nuevo.

El correo `Dulceestacion.contacto@gmail.com` está en la sección `#contacto` de `index.html`.

**Duración del servicio:** 2 horas, o hasta que se acabe la comida. Ese texto aparece en cuatro lugares de `index.html` — la barra de cifras del inicio, el paso 04 de "cómo funciona", el encabezado de los combos y la lista de "todos los combos incluyen".

## Logo y fotos

- **Logo:** en `index.html` reemplaza el `<span class="logo__d">…` por `<img src="img/logo.png" alt="Dulce Estación">` (hay un comentario marcando el punto exacto, en el nav y en el footer).
- **Galería:** cada `<figure class="foto">` es un marcador de posición. Pon la foto dentro sin quitar las clases:
  ```html
  <figure class="foto reveal"><img src="img/evento-1.jpg" alt="..."><figcaption>Texto</figcaption></figure>
  ```

## Combos

Se arman solos desde el array `PROMOS` en `script.js`. Cada combo tiene un nombre, el precio para 40 y para 60 personas, y una lista de `partes`:

```js
{ nombre: 'Dúo Esencial', p40: 100000, p60: 140000, partes: [
    { n: 1, de: ['Waffles', 'Hotcakes', 'Helados'] },     // el cliente elige UNA
    { n: 1, de: ['Palomitas', 'Algodón de azúcar'] } ] }  // y además elige UNA de estas
```

- `n` es cuántas estaciones entran de esa línea.
- `de` son las opciones entre las que elige: si hay más de una se muestran unidas con **o**.
- Las líneas entre sí siempre van unidas con **y**: todas entran en el combo.
- `p40` y `p60` son los precios para 40 y 60 personas. Arriba de las tarjetas hay un selector que cambia cuál de los dos se muestra; no hay que tocar nada al agregar un combo.

Los nombres (Dúo Esencial, Trío Goloso, etc.) los puse yo; cámbialos si tienes otros.

> ⚠️ **Pendiente importante:** los precios por estación individual de la sección "Lista de precios" y todo el cotizador siguen con números inventados por mí, y no calzan con estos combos reales (el cotizador cobra bastante más). Hay que emparejarlos antes de publicar.

## Cotizador "Arma tu evento"

Tres pasos:

1. **Elige tu promoción** — primero 40 o 60 invitados (solo esas dos, sin valores intermedios) y después las promociones. Se puede marcar **más de una**. Dentro de cada promoción marcada aparecen desplegables para las líneas que tienen "o". Si la línea pide 2 máquinas (el `2(...)` de tu tabla), salen dos desplegables y el sistema **no deja repetir**: al elegir waffles en el primero, waffles queda deshabilitado en el segundo.
2. **¿Te faltó comida para más personas?** — muestra únicamente las máquinas que el cliente eligió en el paso 1, y suma porciones de 5 en 5 personas. Palomitas y algodón no aparecen porque son ilimitados y no tienen precio unitario.
3. **Detalle del evento** — quien reserva, festejado/a, fecha, tipo, lugar y comentario.

Precios unitarios de las porciones extra: están en `MAQUINAS` dentro de `script.js` (`unitario`). Crepes $3.500 por persona; waffles, hotcakes y helados $2.500. Las que llevan `unitario: null` no se pueden ampliar.

Todos los precios de promoción son fijos: los de tu tabla para 40 y para 60, sin cálculos intermedios.

## Sección de Instagram

Las seis fotos del feed son **marcadores de posición**: por ahora son cuadrados de color con un emoji y todos llevan al perfil. Hay dos formas de hacerlas reales:

**La simple (manual).** Bajas seis fotos de tus publicaciones, las guardas en `img/` y reemplazas cada cuadrado por la foto, apuntando al post:

```html
<a class="ig__post" href="https://www.instagram.com/p/CODIGO-DEL-POST/" target="_blank" rel="noopener">
  <img src="img/ig-1.jpg" alt="">
</a>
```

Hay que repetirlo cada vez que quieras cambiar las fotos.

**La automática (se actualiza sola).** Servicios gratuitos como LightWidget, SnapWidget o Behold te dan un código para pegar que muestra tu feed real y se actualiza solo cuando publicas. Te pedirán conectar la cuenta de Instagram una vez. Se pega reemplazando el bloque `<div class="ig__feed">…</div>` completo.

No usé la segunda opción porque implica crear una cuenta en un servicio externo y conectarle tu Instagram; esa decisión es tuya.

## Zonas de traslado

La calculadora **ya no estima por kilómetros**: usa las zonas reales dibujadas en tu mapa "Candybar" de Google My Maps, con tus precios.

| Zona | Comunas | Precio |
|---|---|---|
| A | Concepción | $5.000 |
| B | Hualpén, San Pedro de la Paz (sector 1), Talcahuano (sector 1), Penco | $10.000 |
| C | San Pedro de la Paz (sector 2), Chiguayante, Talcahuano (sector 2), Camino a Bulnes | $15.000 |
| D | Tomé, Coronel | $20.000 |

Cuando alguien busca su dirección o pincha el mapa, el sitio revisa dentro de qué polígono cayó el punto y muestra esa tarifa. Si cae fuera de todas, dice "a cotizar".

**Para actualizar las zonas:** edítalas en Google My Maps y vuelve a exportar. Descargas el KML abriendo esta dirección en el navegador:

```
https://www.google.com/maps/d/kml?mid=1b7oHN4OvMe15QxjDgeXpe4AeX2ARbKM&forcekml=1
```

Ahí están los nombres, precios y coordenadas de cada zona. Hay que volcarlos al array `ZONAS_TRASLADO` de `script.js` (formato `[latitud, longitud]`, al revés de como vienen en el KML).

En el mapa, las zonas se pintan más intensas mientras más cerca de la base, y la zona que le tocó al cliente se resalta con borde grueso.

Ojo: en tu mapa de Google, la zona "Camino Bulnes" dice `15.OOO` con letra O en vez de ceros. Acá quedó como $15.000, pero conviene corregirlo allá.

## Cinta de reseñas

Se arma sola desde el array `RESENAS` en `script.js`. Agrega o quita objetos y el resto se recalcula solo. Cada reseña lleva `estrellas` (1 a 5), `texto`, `autor` y `evento`.

La cinta avanza sin parar y **se detiene al pasar el mouse por encima**. También se detiene al arrastrar o al tocarla en el celular, y vuelve a andar al soltar. La velocidad está en la constante `VELOCIDAD` (34 píxeles por segundo): súbela o bájala a gusto.

Para que el bucle no tenga un corte visible, la lista se dibuja dos veces automáticamente; por eso en el HTML aparecen el doble de tarjetas de las que escribes.

## Verla en el celular (misma red WiFi)

Levanta el servidor en el computador:

```bash
python -m http.server 8777 -d "C:/Users/munoz/OneDrive/Desktop/Candybar/pagina web"
```

Y en el teléfono abre `http://192.168.6.33:8777` (esa es la IP del PC; si cambias de red, mírala con `ipconfig`). Deja la ventana abierta mientras revisas; se cierra con Ctrl+C.

## Caché del navegador

Los archivos se cargan con `?v=10` al final. Si editas el CSS o el JavaScript y no ves el cambio, **súbele ese número** en `index.html` (van en dos líneas: el `<link>` del CSS y el `<script>` del final) o haz Ctrl+F5.

## Celular

La página está pensada primero para el teléfono. Detalles que conviene no romper al editar:

- **El mapa se mueve con dos dedos.** Con un dedo la página baja normal; con dos, el mapa se desplaza, y aparece el aviso "Usa dos dedos para mover el mapa". En el computador el zoom con la rueda pide Ctrl. Esto lo hace el complemento `leaflet-gesture-handling`, cargado junto a Leaflet en `index.html`. Tocar una vez sigue marcando el lugar del evento.
- **El menú** se abre con el botón de tres líneas, bloquea el scroll del fondo y se cierra al tocar un enlace, al tocar fuera o al girar el teléfono.
- Los campos del formulario usan letra de 16 px a propósito: con menos, el iPhone hace zoom solo al tocarlos.
- Los cortes de diseño están en 1000 px (tablet), 720 px (celular) y 400 px (celular chico), al final de `estilos.css`.

## Notas

- Las **promociones son inventadas** (así lo pediste) y llevan un asterisco de "referenciales". Cámbialas cuando tengas las reales.
- Las **reseñas son de ejemplo**; reemplázalas por reseñas reales antes de publicar.
- El mapa usa OpenStreetMap + Nominatim: gratis y sin API key. La distancia es en línea recta × 1.35 (aproximación de ruta), suficiente para cotizar. Si más adelante quieres distancia real por calles, hay que conectar Google Maps o Mapbox (ambos con cuenta y clave).
- El botón de WhatsApp abre `wa.me` con el resumen ya escrito: el cliente solo pulsa enviar.
