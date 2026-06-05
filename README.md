# Tabla de nucleidos · filtros ZPeriod fusionados (v19)

Esta versión corrige el enfoque de la v18: la tabla principal vuelve a ser la tabla de **nucleidos/isótopos**, no una tabla periódica reducida.

## Idea de fusión

- `nuclides.csv` sigue siendo la fuente principal.
- `PeriodicTableJSON.json` y `periodic-elements-data.js` funcionan como tabla auxiliar de elementos.
- Cada nucleido se cruza por `Z` con el elemento químico correspondiente.
- Todos los isótopos de un elemento heredan sus propiedades químicas comunes: categoría, bloque, fase, densidad, punto de fusión, punto de ebullición, electronegatividad, primera ionización, afinidad electrónica, calor molar, configuración electrónica, etc.
- Los datos nucleares siguen siendo propios de cada isótopo: `N`, `A`, vida media, decaimiento, abundancia isotópica, Qα, Qβ−, spin/paridad, etc.

## Uso correcto

Coloca tu `nuclides.csv` oficial en la misma carpeta que `index.html` o impórtalo desde el panel **Datos**.

Si `nuclides.csv` no está presente, la aplicación ya no muestra una falsa tabla periódica de respaldo. En su lugar avisa de que falta el CSV de nucleidos.

## Nuevas funciones

- Filtros nucleares anteriores conservados.
- Filtros químicos estilo ZPeriod añadidos sin sustituir los nucleidos.
- Rango superior para propiedades numéricas químicas.
- Búsqueda avanzada ampliada con campos químicos.
- Botón para exportar un CSV fusionado: `nuclides_enriched_with_periodic_table.csv`.
- Botón IAEA online como intento de carga directa desde LiveChart si el navegador lo permite.

## Archivos incluidos

- `index.html`
- `styles.css`
- `app.js`
- `periodic-elements-data.js`
- `PeriodicTableJSON.json`
- `PeriodicTableCSV.csv`

El CSV oficial de nucleidos no está incluido en este paquete porque no se ha adjuntado en esta iteración. Debe añadirse como `nuclides.csv`.
