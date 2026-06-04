# Tabla de nucleidos — versión 16

Visor interactivo de nucleidos en HTML, CSS y JavaScript.

## Cambios principales de esta versión

- La tabla principal se renderiza en Canvas 2D para mejorar el rendimiento con miles de nucleidos.
- El renderizado recorre únicamente las celdas visibles, no toda la colección de datos en cada frame.
- La vista inicial se ajusta al rango evaluado del CSV oficial.
- El lienzo queda extendido para permitir una capa teórica/no observada más allá de los datos evaluados.
- La capa **No observados** arranca deshabilitada.
- La capa **Números mágicos** arranca deshabilitada.
- La capa **Frontera nuclear** arranca deshabilitada.
- Se añade un marco sutil para delimitar el área de nucleidos evaluados.
- Se mantiene `nuclides.csv` como fuente principal y `nuclides-data.js` como respaldo embebido.

## Datos

La aplicación carga `nuclides.csv` desde la misma carpeta que `index.html`. Si el navegador bloquea esa lectura local, usa el respaldo embebido en `nuclides-data.js`.

## Capas

En el botón de capas se pueden activar o desactivar:

- Evaluados
- No observados
- Isómeros
- Números mágicos
- Frontera nuclear
- Minimapa
- Modo experto

La capa de no observados es una extensión visual/extrapolada, no un sustituto de datos evaluados.

## Uso

- Rueda del ratón: zoom.
- Arrastrar: mover la tabla.
- Móvil: un dedo mueve, dos dedos hacen zoom.
- Clic sobre un nucleido: abre la ficha.
- Clic fuera: cierra la ficha.
- Doble clic/doble toque sobre un nucleido: centra y acerca.


## Cambios v13

- Extensión teórica limitada hasta Z=130 y N≈320.
- La vista inicial sigue encuadrando solo el rango evaluado del CSV principal.
- Las capas de no observados, números mágicos, frontera nuclear y marco evaluado vienen desactivadas por defecto.
- Los ejes N/Z se dibujan como capa superior para que sus valores no queden tapados por las celdas.


## v14

- Corrige los arcos gigantes provocados por radios excesivos en las etiquetas de eje dibujadas en Canvas.
- Añade la capa Cuadrícula, desactivada por defecto, para dejar la vista inicial limpia.
- Mantiene números mágicos, frontera nuclear y marco evaluado como capas desactivadas por defecto.
- Limita la extensión teórica hasta Z=130 y N≈320, con vista inicial encuadrada en los nucleidos evaluados.


## Versión 15

- Extensión teórica reducida a Z=130 para evitar un mapa excesivamente vacío.
- Eje de neutrones reducido a N≈320, suficiente para la extensión superpesada planteada.
- Los valores de los ejes se muestran como números simples, sin cápsula ni borde redondeado.
- La vista inicial sigue encuadrando únicamente los nucleidos evaluados del CSV.
