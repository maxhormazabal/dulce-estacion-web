# Plan de mejoras · Dulce Estación

Análisis del sitio y plan de trabajo priorizado.
Fecha del análisis: **4 de septiembre de 2026** · commit base: `8a323a7`

---

## 0. Resumen

Sitio estático de una página (HTML + CSS + JS, sin build ni backend) para un negocio
de carritos de dulces en Concepción. Tres archivos en `sitio/`, más documentación y
el KML de zonas en `datos/`.

**Estado: no publicable todavía.** Las razones principales no son de código sino de
contenido (reseñas inventadas, cero fotos reales) y de captación (no queda registro
de ningún lead).

**Lo que está bien hecho y no hay que tocar:**

- El modelo de datos de los combos (`PROMOS`, con `partes: [{n, de}]`) es una buena
  abstracción: codifica "y" / "o" de forma declarativa y toda la UI se deriva de ahí.
  Agregar un combo no requiere tocar nada más.
- Cobrar el traslado por **punto-en-polígono** contra las zonas reales del mapa
  "Candybar" del negocio, en vez de estimar por kilómetros. Coincide con cómo cobra
  la empresa de verdad.
- La documentación (`README.md`, `DATOS-DEL-NEGOCIO.md`) es inusualmente completa.
- No hay XSS: nada de lo que escribe el usuario entra por `innerHTML`. El resultado
  del geocodificador se inserta con `textContent`.

---

## 1. Verificaciones hechas (no repetir)

| Qué se verificó | Resultado |
|---|---|
| Los 11 polígonos de `ZONAS_TRASLADO` contra `datos/zonas-traslado.kml` | **Correctos.** Todos los puntos coinciden, la inversión `lng,lat` → `[lat,lng]` está bien hecha y el orden se conserva. La única diferencia es que el JS conserva el punto de cierre duplicado del KML, lo que es inocuo para el algoritmo del rayo. |
| `soportaGestos` (`script.js:437`) | **`true`.** El bundle UMD 1.2.2 sí expone `window.leafletGestureHandling.GestureHandling`. El mapa **no** queda congelado en móvil. |
| Sintaxis de `script.js` | `node --check` OK |
| Disponibilidad de CDNs (Leaflet js/css, gesture-handling css, tiles CARTO) | Todos 200 |

---

## 2. Hallazgos

### 2.1 Bloqueantes — confianza y legalidad

| # | Hallazgo | Dónde |
|---|---|---|
| B1 | **Las 10 reseñas son inventadas**, con nombres de clientes chilenos que no existen. | `script.js:102-113` |
| B2 | **`★★★★★ 4.9 de 5 · 124 eventos atendidos`** está escrito a mano y presentado como dato real. Ningún documento lo advierte. En Chile esto cae de lleno en la Ley 19.496 (publicidad engañosa); el SERNAC ha sancionado exactamente esto. **Es el ítem de mayor riesgo del sitio.** | `index.html:318` |
| B3 | **Producto fantasma: "Estación Total".** Se menciona en una reseña y en un pie de foto de la galería, pero no existe en `PROMOS`. Resto de una versión anterior. | `script.js:108`, `index.html:263` |
| B4 | **Descalce en el número de estaciones.** El hero dice `5 estaciones dulces` y el paso 01 dice `las cinco estaciones`, pero `MAQUINAS` tiene seis (crepes, waffles, hotcakes, helados, palomitas, algodón). | `index.html:59`, `index.html:83` |
| B5 | **Cero imágenes reales.** `img/` está vacía: la galería son 6 cuadrados con emoji y el feed de Instagram otros 6. Para un negocio de comida, es no mostrar el producto. | `index.html:257-264`, `289-296` |
| B6 | **No hay política de privacidad ni términos.** | — |

### 2.2 Errores reales de código

**E1 · Una falla de CDN se lleva todo el embudo de venta.**
`L.map()` en `script.js:439` es código de nivel superior sin protección. Si Leaflet no
carga, lanza excepción y **nada de lo que viene después se ejecuta**: `calcular()`
(710), la asignación de los enlaces de WhatsApp (704), los enlaces de redes (708) y el
handler de `#btnWhats` (682).

Peor aún: `#waFooter` y todos los `[data-red]` **no tienen `href` en el HTML**, así que
no degradan a un enlace equivocado — dejan de ser enlaces: no se pueden pinchar ni
enfocar con el teclado. `#fab` y `#waDirecto` caen a `href="#"` y saltan al inicio.

> El `README.md` §3 afirma lo contrario: *"Si algún CDN falla, el sitio no se rompe"*.

*Arreglo:* envolver el bloque del mapa en `try/catch` y poner `href` reales en el HTML,
dejando que el JS solo los sobrescriba.

**E2 · Las porciones adicionales desaparecen del total en silencio.**
`pintarExtras()` borra toda entrada de `cantidadesExtra` cuya máquina ya no esté
seleccionada. En concreto: elegir waffles → agregar +20 porciones ($50.000) → cambiar
el desplegable a hotcakes. Los $50.000 se van del total sin ningún aviso. Es la
cotización quedando mal dentro de un cotizador.
`script.js:309`

**E3 · Dos controles sin sincronizar para la misma variable.**
`#selectorPersonas` (grilla de promos) y `#tamanoEvento` (cotizador) significan lo
mismo — 40 o 60 invitados — pero solo el segundo escribe `tamano`. Quien elige 60 en
las tarjetas baja a un cotizador que sigue calculando 40.
`script.js:178-186` vs `script.js:205-211`

**E4 · El geocodificador acepta el primer resultado en silencio, y ese resultado fija el precio.**
`limit=1`, sin paso de confirmación. Una calle que existe en Concepción y en
Chiguayante puede cotizar Zona A para un evento de Zona C, sin nada que le permita al
cliente detectarlo. Como el traslado es dinero real, debería mostrar la dirección
resuelta y pedir confirmación.
`script.js:567`

**E5 · El foco del teclado es invisible en el carrusel de reseñas.**
`outline:none` sobre `.resenas`, que tiene `tabindex="0"`. A diferencia de los campos
del formulario (`estilos.css:222-223`), aquí nada lo reemplaza.
`estilos.css:439`

**E6 · `prefers-reduced-motion` se respeta solo a medias.**
El JS protege la cinta de reseñas (`script.js:388`), pero el CSS no tiene ningún bloque
de reduced-motion: el cintillo del hero (`animation: slide 38s linear infinite`), las
transiciones `.reveal` y `scroll-behavior: smooth` corren igual.
`estilos.css:116`, `511-512`, `31`

**E7 · Menores.**
- `#burger` no tiene `aria-expanded` ni `aria-controls` iniciales (`index.html:35`).
- No hay `<noscript>`: sin JS, los combos, el selector de promos, la tabla de tarifas
  y el carrusel quedan como `div` vacíos.
- Los formularios no validan nada: se puede enviar una cotización sin nombre, sin fecha
  y sin lugar.
- El `README.md` §3 dice que sin el plugin de gestos "el mapa vuelve a arrastre normal".
  Es al revés: `script.js:549` **deshabilita** el arrastre en táctil en ese caso.
- `© 2026` está escrito a mano en el footer (`index.html:383`).

### 2.3 Brechas de negocio

**N1 · Cero captación de leads.** Los dos formularios arman un texto y abren `wa.me`.
Si el cliente no aprieta enviar dentro de WhatsApp, no queda registro de nada: ni
nombre, ni fecha, ni la cotización que armó. El `README.md` §6 lo reconoce. **Es la
oportunidad perdida más grande del proyecto**, y es barata de cerrar (Formspree, o un
endpoint de Google Apps Script) disparando el guardado *antes* de redirigir.

**N2 · Cero analítica.** No hay forma de saber si alguien llega al cotizador ni dónde
abandona.

**N3 · Sin `og:`, sin favicon, sin canonical, sin JSON-LD.** WhatsApp es el canal
principal del negocio y un enlace compartido se ve como texto pelado, sin tarjeta de
previsualización — justamente el caso donde las meta sociales rinden. Y para un
negocio de servicios local, un bloque `LocalBusiness` de JSON-LD más una ficha de
Google Business Profile valen más que todo lo demás junto para que los encuentren.

### 2.4 Documentación

`MANUAL-PARA-EL-DUENO.md` es el archivo que abre primero una persona no técnica, y
está desactualizado de formas que la van a confundir activamente:

- Dice que las promociones son **inventadas** y advierte que *"todo el cotizador sigue
  con números inventados... no calzan con estos combos reales"* — contradiciendo de
  frente a `DATOS-DEL-NEGOCIO.md` y `README.md`, que dicen que los precios son reales.
- Menciona una sección "Lista de precios" que ya no existe.
- Describe cotización por distancia, reemplazada hace rato por zonas.
- Dice `?v=10`; el archivo va en `?v=12`.
- Incluye una ruta de Windows de otra máquina y una IP de red local muerta.

Es el arreglo más barato con más valor de toda la lista.

---

## 3. Plan de trabajo

### Fase 1 — Antes de publicar (obligatorio)

1. **Reseñas y rating.** Reemplazar `RESENAS` por reseñas reales, o quitar la sección
   completa. Borrar la línea `4.9 de 5 · 124 eventos atendidos` hasta tener el dato.
   *(B1, B2)*
2. **Reescribir `MANUAL-PARA-EL-DUENO.md`** para que coincida con el estado real del
   sitio. *(§2.4)*
3. **Blindar el mapa.** `try/catch` alrededor del bloque de Leaflet + `href` reales en
   el HTML para `#waFooter`, `#fab`, `#waDirecto` y todos los `[data-red]`. *(E1)*
4. **Limpiar contenido inconsistente.** Quitar "Estación Total" y corregir 5 → 6
   estaciones. *(B3, B4)*
5. **`og:` tags, favicon y JSON-LD `LocalBusiness`.** *(N3)*
6. **Fotos reales** en galería y hero. *(B5 — depende del dueño)*

### Fase 2 — Corrección funcional

7. Conservar las porciones adicionales al cambiar de máquina, o avisar explícitamente
   que se van a perder. *(E2)*
8. Sincronizar `#selectorPersonas` con `#tamanoEvento`. *(E3)*
9. Confirmación de dirección tras el geocodificado, antes de fijar el precio. *(E4)*
10. Validación mínima de formularios: nombre, fecha y lugar. *(E7)*

### Fase 3 — Captación y medición

11. Guardar el lead antes de redirigir a WhatsApp. *(N1)*
12. Analítica básica, con eventos en: abrir cotizador, elegir promo, calcular traslado,
    enviar por WhatsApp. *(N2)*
13. Política de privacidad y términos (necesarios una vez que se capturen datos). *(B6)*

### Fase 4 — Accesibilidad y pulido

14. Anillo de foco visible en `.resenas`. *(E5)*
15. Bloque `@media (prefers-reduced-motion: reduce)` en el CSS. *(E6)*
16. `aria-expanded` / `aria-controls` en el burger, `<noscript>`, año del footer
    calculado. *(E7)*

---

## 4. Qué no romper

- Los `<input>` van en 16 px a propósito: con menos, iOS hace zoom al enfocarlos.
- El mapa se mueve con dos dedos para que un dedo siga haciendo scroll de la página.
- La cinta de reseñas duplica la lista para el bucle infinito; por eso hay el doble de
  tarjetas en el DOM de las que hay en `RESENAS`.
- Los polígonos de `ZONAS_TRASLADO` se recorren en orden A→D: si dos se solaparan, gana
  el más barato. Mantener ese orden.
- Al desplegar cambios en CSS o JS hay que subir el `?v=N` de `index.html` (dos líneas).
- Solo existen 40 y 60 invitados. No hay valores intermedios ni interpolación.
