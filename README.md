# Tabla de nucleidos — versión 20

Visor interactivo de nucleidos en HTML, CSS y JavaScript.

## Cambios principales

- Render principal de la tabla en Canvas 2D para mejorar el rendimiento con miles de nucleidos.
- Vista inicial ajustada al rango evaluado del CSV oficial.
- Extensión teórica limitada hasta Z=130 y N≈320 para evitar una zona excesivamente vacía.
- Capas auxiliares desactivadas por defecto: no observados, números mágicos, frontera nuclear, marco evaluado y cuadrícula.
- Barra superior compacta con búsqueda, datos, modo claro/oscuro, capas y zoom.
- Sustituidos los iconos superiores por pictogramas SVG de estilo Material/Android más reconocibles.
- Búsqueda desplegable hacia la izquierda, más ancha y sin quedar recortada.
- El indicador de zoom queda como texto; al clicar vuelve a ajustar la vista al 100%.
- Minimapa recolocado para no tapar los valores principales de los ejes.
- Reposicionado el botón de cierre de la ficha para no tapar el modelo 3D ni la configuración electrónica.
- Añadido botón discreto de cierre dentro de la ficha del nucleido.
- Panel de capas/filtros rediseñado con mensajes contextuales.
- Ficha de nucleido con fondo sólido, sin semitransparencia, y pestañas compactas.
- Valores de ejes N/Z como texto simple en negrita, sin cápsulas.
- Números mágicos resaltados visualmente cuando se activa su capa.
- Modelo atómico cambiado a una representación 3D esquemática en Canvas.
- Añadido favicon propio de la web en SVG, PNG 32x32 y Apple touch icon.

## Datos

La aplicación carga `nuclides.csv` desde la misma carpeta que `index.html`. Si el navegador bloquea esa lectura local, usa el respaldo embebido en `nuclides-data.js`.

## Uso

- Rueda del ratón: zoom.
- Arrastrar: mover la tabla.
- Móvil: un dedo mueve, dos dedos hacen zoom.
- Clic sobre un nucleido: abre la ficha.
- Clic fuera o botón ×: cierra la ficha.
- Doble clic/doble toque sobre un nucleido: centra la vista.
- Clic sobre el modelo atómico 3D: pausa o reanuda la animación.

## Archivos

- `index.html`: estructura de la aplicación.
- `styles.css`: estilos visuales.
- `app.js`: motor de datos, renderizado y lógica interactiva.
- `nuclides.csv`: datos principales.
- `nuclides-data.js`: respaldo embebido.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`: iconos del sitio.

## Cambios v20

- Iconos superiores sustituidos por SVG locales de estilo Material/Android.
- Panel de Mapa/Filtros/Capas compactado: menos cajas, controles en varias columnas y selectores tipo swatch.
- Cierre de ficha movido a la esquina superior izquierda con margen interno para evitar solaparse con el modelo atómico 3D.
