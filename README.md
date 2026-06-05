# Tabla de nucleidos · filtros estilo ZPeriod

Versión 18 experimental.

## Qué incluye

- Visor de nucleidos en Canvas 2D.
- Carga automática de `nuclides.csv` si existe junto a `index.html`.
- Respaldo mínimo generado desde `PeriodicTableJSON.json` si no se encuentra `nuclides.csv`.
- Datos químicos integrados desde `PeriodicTableJSON.json` y `PeriodicTableCSV.csv`.
- Filtros químicos inspirados en ZPeriod:
  - categoría,
  - bloque,
  - fase,
  - grupo,
  - periodo,
  - tipo general,
  - punto de fusión,
  - punto de ebullición,
  - densidad,
  - electronegatividad,
  - primera ionización,
  - afinidad electrónica,
  - radio atómico,
  - calor específico / molar,
  - masa atómica.
- Barra superior central de rango para filtros numéricos.
- Búsqueda avanzada por sintaxis.
- Ficha de nucleido con datos nucleares y químicos del elemento.

## Archivos principales

- `index.html`
- `styles.css`
- `app.js`
- `periodic-elements-data.js`
- `PeriodicTableJSON.json`
- `PeriodicTableCSV.csv`

## CSV nuclear

Coloca el archivo oficial `nuclides.csv` en la misma carpeta que `index.html`.
La aplicación intenta reconocer columnas como `Z`, `N`, `A`, `symbol`, `half_life`, `decay`, `abundance`, `qalpha`, `qbeta`, `mass` y variantes equivalentes.

## Nota sobre radio atómico

El filtro de radio atómico queda preparado. Si el JSON/CSV no contiene una columna `atomic_radius`, la opción aparecerá sin datos disponibles.
