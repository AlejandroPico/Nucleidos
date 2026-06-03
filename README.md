# Tabla interactiva de nucleídos

Web estática en HTML, CSS y JavaScript para visualizar una tabla de nucleídos en una cuadrícula Z/N.

## Archivos

- `index.html`: estructura de la interfaz.
- `styles.css`: diseño visual, layout, hover y responsive.
- `app.js`: renderizado de la tabla, parser CSV, normalización de campos, filtros, búsqueda y panel de detalle.
- `sample_nuclides.csv`: CSV mínimo de ejemplo para probar la importación.

## Uso rápido

Abre `index.html` en un navegador moderno. La web carga una muestra interna para comprobar la interfaz.

## Datos completos

Para una tabla científicamente útil, importa un CSV nuclear evaluado. La web está preparada para el CSV de IAEA LiveChart:

```text
https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all
```

Opciones:

1. Pulsa **Cargar datos IAEA**. Puede fallar si el navegador bloquea la petición por CORS.
2. Descarga el CSV manualmente desde la URL anterior y usa **Importar CSV**.
3. También puedes arrastrar el CSV sobre el área de la tabla.

## Columnas reconocidas

El normalizador acepta, entre otros, estos campos:

- `z`, `n`, `a`, `symbol`, `element`, `nuclide`
- `half_life_sec`, `half_life`, `unit_hl`
- `decay_1`, `decay_1_%`, `decay_2`, `decay_2_%`
- `atomic_mass`, `mass_excess`, `abundance`, `jp`, `energy`, `radius`

Cualquier campo extra se conserva y aparece en el panel de detalle dentro de “Ver todos los campos disponibles del registro”.

## Nota científica

La muestra incluida sirve para validar la interfaz, no para uso científico. Para datos evaluados, usa IAEA LiveChart o NNDC NuDat/ENSDF.
