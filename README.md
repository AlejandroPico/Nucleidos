# Nucleidos — visor interactivo

Versión 11.

## Cambios principales

- Render principal migrado de miles de elementos HTML a Canvas 2D.
- Zoom con rueda, botones +/−, doble clic y gesto táctil de pellizco.
- Capa de nucleidos evaluados desde `nuclides.csv`.
- Capa separada de posiciones no observadas/teóricas para visualizar continuidad de la carta.
- Soporte para dataset secundario con isómeros, NUBASE o predicciones.
- Capas de números mágicos, frontera nuclear estimada y minimapa.
- Mapas de color: desintegración, estabilidad, vida media, calidad, abundancia, energía de enlace, Qα y Qβ−.
- Ficha con pestañas: resumen, decaimiento, masas, estructura, usos y datos crudos.
- Cadena de decaimiento estimada y relaciones de ancestros.
- Comparador de nucleidos.
- Exportación de ficha como PNG.
- Modo experto/educativo.

## Datos

La fuente principal esperada es `nuclides.csv`, ubicado en la misma carpeta que `index.html`.

La capa de posiciones no observadas es una extrapolación visual local, no un dataset evaluado. Su objetivo es mostrar continuidad de la carta, no reemplazar datos oficiales.

## Uso

Abre `index.html` en el navegador. Para evitar restricciones de lectura local de algunos navegadores, también se incluye `nuclides-data.js` como respaldo embebido.
