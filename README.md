# Tabla de nucleidos — versión 8

Visor web estático de nucleidos en HTML, CSS y JavaScript.

## Cambios de la versión 8

- `nuclides.csv` es la fuente principal de datos.
- Se filtran del mapa principal las filas con `Z=0`, para no dibujar neutrones aislados en la tabla de elementos.
- Las celdas y su contenido interno quedan centrados vertical y horizontalmente.
- Los nucleidos con abundancia natural positiva se resaltan con borde.
- El nucleido natural principal de cada elemento se resalta con un borde más fuerte.
- El menú lateral queda reducido a datos/importación y estructura CSV.
- Eliminados los controles de ajustar vista, mostrar ejes, animación y notas de uso.
- La animación atómica se pausa o reanuda clicando directamente sobre el modelo.

## Uso

Abre `index.html` en un navegador moderno. Si el navegador permite leer ficheros locales, cargará `nuclides.csv`; si no, usará `nuclides-data.js` como respaldo.

Para una carga más fiable, abre la carpeta con un servidor local, por ejemplo:

```bash
python -m http.server 8000
```

Después entra en `http://localhost:8000`.
