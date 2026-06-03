# Tabla de nucleidos — visor interactivo v3

Versión estática en HTML, CSS y JavaScript.

## Cambios de esta versión

- La cuadrícula ocupa el 100% de la pantalla.
- La página no tiene scroll vertical ni horizontal del documento.
- El gráfico tiene anchura/altura internas fijas y se ajusta inicialmente para ver la tabla completa.
- La rueda del ratón hace zoom centrado en el cursor.
- Se puede arrastrar el escenario para desplazarse por la tabla.
- Las casillas son más grandes y muestran A, Z, N, símbolo y modo resumido.
- Al clicar una celda se abre una ficha grande con transición suave.
- La ficha incluye información del nucleido y una simulación atómica esquemática en canvas.
- El menú hamburguesa contiene búsqueda, filtros, colores, importación CSV/IAEA, leyenda, notas y modo oscuro.

## Uso

Abre `index.html` directamente en un navegador moderno.

Controles:

- Rueda del ratón: zoom.
- Arrastrar fondo: mover tabla.
- Clic en una celda: abrir ficha.
- Clic en zona vacía: cerrar ficha.
- Esc: cerrar ficha o menú.

## Sobre los datos

Esta versión incluye una malla interna de demostración para validar la interfaz. No debe tratarse como una base nuclear evaluada completa. Para datos científicos reales, usa la importación CSV o la carga desde IAEA LiveChart si tu navegador permite la petición.

Campos recomendados para CSV:

- `z`, `n`, `a`, `symbol`, `element`
- `half_life`, `decay`, `abundance`, `atomic_mass`
- `spin`, `parity`, `q_value`, `mass_excess`
- `source`, `notes`, `wikipedia`

## Nota visual

La interfaz está inspirada en aplicaciones educativas de tabla periódica con ficha grande y visualización atómica, pero no copia código, imágenes, marcas ni assets externos. La simulación del átomo es una representación educativa tipo Bohr, no una visualización cuántica real.
