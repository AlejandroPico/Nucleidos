# Tabla de nucleidos — versión 32.2

Visor interactivo de nucleidos en HTML, CSS y JavaScript. Representa estados fundamentales evaluados y una extensión teórica opcional sobre una carta N–Z renderizada en Canvas 2D.

## Funciones principales

- Carta de nucleidos con eje horizontal `N` (neutrones) y eje vertical `Z` (protones).
- Carga principal desde `nuclides.csv` y respaldo integrado mediante `nuclides-data.js`.
- Mapas por desintegración, estabilidad, vida media, calidad, abundancia, energía de enlace, Qα y Qβ−.
- Mapas ampliados por vida media logarítmica, exceso de masa, radio de carga, QEC, S₂n, S₂p, exceso neutrónico y año de descubrimiento.
- Capas de evaluados, no observados, isómeros, cuadrícula, números mágicos, frontera nuclear, marco evaluado y minimapa.
- Zoom, desplazamiento, búsqueda, comparación, ficha detallada y modelo atómico 3D esquemático.
- Guía científica progresiva y laboratorio gráfico inspirado en LiveChart y NuDat 3.

## Novedades v32.1

- Cada nucleido se abre en una ficha independiente, movible y redimensionable, con el tamaño amplio de hasta 1160 × 740 px.
- Las fichas y los perfiles por Z/N comparten un único orden de profundidad: la última ventana pulsada pasa al frente.
- Minimizar conserva el estado y envía la ventana a la bandeja inferior; maximizar respeta la barra principal.
- Cada ficha mantiene su propia animación 3D, activa al abrir y pausable mediante clic sobre el modelo.
- El icono de comparación de la cabecera añade el nucleido a un comparador único sin límite artificial.
- El comparador separa Resumen, Todos los datos, Datos oficiales y Gráfica; la pestaña oficial incluye la unión completa de columnas originales de los CSV.
- La gráfica comparativa admite magnitudes normalizadas o columnas oficiales numéricas y escalas lineal o logarítmica.

## Correcciones v32.1.1

- Los perfiles por Z/N se extraen de la capa de dibujo y comparten de verdad el orden global con fichas y comparador.
- Abrir simultáneamente los perfiles por Z y por N ya no crea un ciclo entre observadores de foco ni bloquea la página.

## Novedades v32.2

- Un botón de doble chevrón, situado antes de Comparar, repliega o despliega el panel del modelo 3D.
- La preferencia se aplica a todas las fichas abiertas, a las nuevas fichas y se conserva entre recargas.
- La ficha replegada reduce su anchura y mantiene visibles en la zona de datos el núcleo, las capas electrónicas y el carácter esquemático del modelo.
- La pestaña contextual Modelo 3D permite recuperar directamente el panel visual completo.

## Correcciones v28

### Carga directa de la interfaz

Las correcciones operativas esenciales se cargan desde `nucleidos-v28.js` y `nucleidos-v28.css` como archivos normales. No dependen de `DecompressionStream` ni de reconstruir JavaScript comprimido en el navegador.

Los recursos se incluyen con un identificador de versión en `index.html` para evitar que GitHub Pages o el navegador reutilicen una copia antigua.

### Minimapa

El minimapa permanece desactivado al iniciar. Al activarlo:

- se elimina el estado oculto;
- se espera al siguiente frame para medir su tamaño real;
- se reconstruye el bitmap interno con la densidad de píxeles correcta;
- se redibuja después de redimensionar la ventana o cambiar el dataset;
- permite navegar mediante clic o arrastre.

El fallo anterior se producía porque el `canvas` se dimensionaba mientras su contenedor tenía `display: none`, por lo que conservaba un bitmap interno prácticamente vacío.

### Panel de datos

La ventana de datos muestra:

- número de registros activos;
- fecha de extracción indicada por IAEA;
- fecha de la última sincronización automática;
- fuente operativa;
- actualización desde la API oficial;
- restauración del snapshot almacenado en el repositorio;
- importación de CSV principal y dataset secundario.

El botón **Actualizar IAEA** sigue esta estrategia:

1. intenta consultar los dominios oficiales de LiveChart;
2. valida cabecera y un mínimo de 3.000 registros;
3. si el navegador recibe CORS, 403 u otro bloqueo, recarga `nuclides.csv` desde el propio repositorio;
4. conserva el dataset anterior si ninguna fuente supera la validación.

La actualización realizada desde el navegador solo existe en memoria hasta recargar la página.

### Sincronización permanente

GitHub Pages es un alojamiento estático: el JavaScript de la página no puede modificar el repositorio ni crear commits por sí solo.

La actualización permanente se realiza mediante `.github/workflows/sync-iaea.yml`. El workflow:

- prueba `nds.iaea.org` y `www-nds.iaea.org`;
- utiliza agentes de usuario reales de navegador;
- abre primero LiveChart para obtener las cookies que pueda requerir el servidor;
- usa HTTP/1.1, `Referer`, `Accept-Language` y compresión;
- valida tamaño, cabecera y número de filas antes de reemplazar el snapshot;
- calcula SHA-256 y escribe `data/iaea-sync.json`;
- crea un commit solo cuando el dataset cambia;
- si IAEA vuelve a bloquear el runner, conserva los datos existentes y termina con una advertencia en lugar de destruir la ejecución.

El snapshot sincronizado actualmente contiene 3.386 registros.

### Menú móvil

- El botón hamburguesa permanece oculto en escritorio.
- Solo aparece hasta 700 px de anchura.
- El controlador v28 funciona aunque falle alguno de los módulos comprimidos anteriores.
- El menú móvil conserva acceso a Guía, Datos, Tema, Capas, Análisis, búsqueda y restablecimiento.

### Laboratorio de respaldo

Si el laboratorio avanzado v27 no llega a inicializarse, v28 incorpora un laboratorio directo con:

- perfil mediano por Z;
- puntos individuales;
- histogramas;
- resumen de mínimo, cuartiles, mediana, media y máximo;
- propiedades como vida media, enlace, exceso de masa, Qα, Qβ−, QEC, abundancia, radio, N−Z y N/Z.

## Guía científica

El botón de información abre una guía de 52 capítulos que cubre:

- vocabulario, notación y lectura de la carta;
- interacción fuerte, Coulomb, radio, capas, magia, espín y apareamiento;
- masa, defecto de masa, enlace, fórmula semiempírica, separaciones y valores Q;
- estabilidad, ley exponencial y canales de desintegración;
- niveles, gammas y radiaciones de decaimiento;
- abundancia, nucleosíntesis, líneas de goteo y predicciones;
- ENSDF, NUBASE, AME y grupos de la API IAEA;
- perfiles, dispersión, histogramas, filtros e incertidumbres;
- aplicaciones y flujo profesional de comprobación y cita.

## Tema visual

La interfaz dispone de tres modos persistentes:

- **Automático:** círculo dividido; sigue la preferencia del sistema y una corrección horaria.
- **Claro:** sol.
- **Oscuro:** luna.

## Controles

- Rueda o pellizco: zoom.
- Arrastrar con ratón o un dedo: mover la carta.
- Clic o toque en un nucleido: abrir la ficha.
- Doble clic o doble toque: centrar el nucleido.
- Indicador de zoom / opción `100%`: restablecer el encuadre.
- Clic o arrastre en minimapa: navegar.
- Toque sobre el modelo 3D: pausar o reanudar.
- Escape o navegación Atrás: cerrar la capa activa cuando corresponda.

## Archivos principales

- `index.html`: estructura e inclusión versionada de recursos.
- `styles.css`: estilos base.
- `app.js`: motor científico y render Canvas estable.
- `nucleidos-ui-loader.js`: interfaz educativa v26.
- `nucleidos-v27.css`: estilos heredados del laboratorio y la guía avanzada.
- `nucleidos-v28.css` y `nucleidos-v28.js`: integración directa y correcciones operativas.
- `nucleidos-v32-core.js`: gestión común de foco, profundidad, arrastre, tamaño y bandeja.
- `nucleidos-v32-cards.js`: fichas múltiples y animaciones 3D independientes.
- `nucleidos-v32-compare.js`: comparador tabular y gráfico sin límite de nucleidos.
- `nucleidos-v32.css`: estilos de ventanas y del comparador.
- `nuclides.csv`: snapshot principal sincronizado desde IAEA.
- `nuclides-data.js`: respaldo integrado.
- `data/iaea-sync.json`: metadatos y huella del snapshot.
- `.github/workflows/sync-iaea.yml`: sincronización oficial automatizada.

## Alcance científico

El visor ofrece una capa moderna de exploración y análisis sobre estados fundamentales. Los niveles excitados, transiciones gamma, radiaciones de desintegración, espectros beta, secciones eficaces y rendimientos de fisión pertenecen a conjuntos adicionales de LiveChart, ENSDF, ENDF o EXFOR y deben integrarse con trazabilidad propia.

Los datos evaluados deben citarse mediante sus fuentes originales. Las capas teóricas y las magnitudes calculadas localmente no se presentan como evidencia experimental.
