# Tabla de nucleidos — versión 9

Visor web estático de nucleidos en HTML, CSS y JavaScript.

## Cambios de la versión 9

- Eliminado el menú hamburguesa lateral.
- Añadido botón superior de **Datos**, situado entre búsqueda y modo claro/oscuro.
- Datos externos y estructura CSV se muestran ahora en una ventana emergente compacta.
- Eliminado el resaltado de borde de los nucleidos con abundancia natural.
- La barra superior queda ordenada así: búsqueda, datos, modo claro/oscuro, capas y zoom.
- Se mantienen `nuclides.csv` como fuente principal y `nuclides-data.js` como respaldo integrado.

## Uso

Abre `index.html` en un navegador moderno. Para una carga más fiable del CSV local, abre la carpeta con un servidor local:

```bash
python -m http.server 8000
```

Después entra en `http://localhost:8000`.
