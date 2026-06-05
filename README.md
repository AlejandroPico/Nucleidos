# Tabla de nucleidos fusionada con datos ZPeriod — v20

Esta versión corrige la integración de datos químicos sobre la tabla de nucleidos:

- La tabla principal vuelve a ser la carta de nucleidos/isótopos.
- Los datos periódicos se fusionan por `Z` como capa auxiliar, no sustituyen los nucleidos.
- El panel de filtros se divide en dos columnas: Nuclear y Elemento químico.
- Se restauran iconos visuales anteriores: búsqueda, base de datos, modo claro/oscuro y capas.
- El minimapa vuelve a la zona superior izquierda y vuelve a dibujar una vista real de la distribución de nucleidos.
- Los filtros nucleares recuperan prioridad: desintegración, estabilidad, vida media, calidad, abundancia, Qα y Qβ−.
- Los filtros químicos estilo ZPeriod permanecen disponibles en la columna derecha.
- Si `nuclides.csv` no está en la carpeta, la app intenta cargar IAEA LiveChart automáticamente. Si el navegador bloquea la descarga, se puede importar manualmente desde Datos → CSV local.

## Archivos incluidos

- `index.html`
- `styles.css`
- `app.js`
- `PeriodicTableJSON.json`
- `PeriodicTableCSV.csv`
- `periodic-elements-data.js`
- `nuclides-data.js` como punto de integración para un CSV embebido si se quiere añadir más adelante.

## Uso recomendado

Coloca `nuclides.csv` en la misma carpeta que `index.html` para tener carga inmediata offline, o abre la aplicación desde un servidor local.

```bash
python -m http.server 8000
```

Después entra en:

```text
http://localhost:8000
```
