# Tabla de nucleidos — versión 12

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
