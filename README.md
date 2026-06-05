# Tabla de nucleidos fusionada con filtros ZPeriod — v21

Esta versión mantiene `nuclides.csv` como dataset principal y usa `PeriodicTableJSON.json` / `PeriodicTableCSV.csv` como capa química auxiliar por Z.

## Correcciones v21

- El panel de filtros/capas permanece abierto al seleccionar modos, chips, capas o filtros de rango. Solo se cierra con X, clic exterior o Escape.
- Los filtros numéricos tienen margen ampliado en la barra para poder llegar por debajo del mínimo real y por encima del máximo real.
- Se corrige la clasificación de desintegración con expresiones regulares limpias para códigos alfa, beta, EC, SF, IT, protón, neutrón y clúster.
- Se genera una capa teórica/no observada opcional para que el botón “No observados” tenga efecto visual cuando el CSV no aporta esos registros.
- La capa de frontera nuclear se hace más visible cuando se activa.
- El filtro de radio atómico queda operativo con una estimación visual si el dataset periódico no trae un campo real de radio. No debe interpretarse como dato evaluado.
- La ficha añade más datos químicos heredados del elemento: apariencia, tipo general, ionización, afinidad, densidad, fusión/ebullición, radio estimado, configuración, modelo 3D, imagen Bohr, espectro, descubridor y nombrador.
- Se añade visualización 3D con `model-viewer` usando el campo `bohr_model_3d` cuando esté disponible. Si no carga internet o el modelo no existe, queda el canvas Bohr simplificado como respaldo.

## Datos

El ZIP incluye los datos periódicos, pero no incluye el CSV oficial de nucleidos si no está presente como `nuclides.csv` o embebido en `nuclides-data.js`. Coloca `nuclides.csv` junto a `index.html` o usa Datos → CSV local.

## v22

- `nuclides.csv` vuelve a estar incluido dentro del paquete y también embebido en `nuclides-data.js`.
- Corregida clasificación de desintegración para códigos IAEA como `B-`, `EC+B+`, `A`, `SF`, `P`, `N`, `IT`, etc.
- La leyenda de desintegración conserva todas las categorías nucleares principales.
- El selector de rango químico usa doble control robusto: al pulsar la barra se selecciona el extremo más cercano y ya no se arrastra siempre el extremo derecho.
- Los rangos numéricos se inicializan con margen real por debajo y por encima del dataset, de modo que al activar un filtro no se excluyen valores extremos.
- La capa de no observados genera posiciones teóricas también para Z > 118 hasta Z=130 mediante símbolos sistemáticos.
- La frontera nuclear se redibuja como dos curvas delimitadoras más visibles.
- El visor de modelo 3D prioriza `bohr_model_3d`; si no está disponible, usa la imagen Bohr del dataset; si tampoco existe, usa el canvas Bohr simplificado.
