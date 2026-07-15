# Tabla de nucleidos — versión 27

Visor interactivo de nucleidos en HTML, CSS y JavaScript. Representa estados fundamentales evaluados y una extensión teórica opcional sobre una carta N–Z renderizada en Canvas 2D.

## Funciones principales

- Carta de nucleidos con eje horizontal `N` (neutrones) y eje vertical `Z` (protones).
- Carga principal desde `nuclides.csv` y respaldo integrado mediante `nuclides-data.js`.
- Mapas por desintegración, estabilidad, vida media, calidad del dato, abundancia, energía de enlace, Qα y Qβ−.
- Mapas ampliados: vida media logarítmica, exceso de masa, radio de carga, QEC, S₂n, S₂p, exceso neutrónico y año de descubrimiento.
- Capas opcionales de nucleidos no observados, isómeros, cuadrícula, números mágicos, frontera nuclear, marco evaluado y minimapa.
- El minimapa permanece desactivado al iniciar y puede activarse desde Capas.
- Zoom, desplazamiento, búsqueda, comparación y ficha detallada de cada nucleido.
- Modelo atómico 3D esquemático en Canvas.

## Correcciones v27

### Minimapa

El minimapa se redimensiona después de hacerse visible. La versión anterior inicializaba su bitmap cuando el panel todavía tenía `display: none`, por lo que quedaba con un lienzo interno mínimo y parecía vacío.

La nueva versión añade:

- reconstrucción automática del bitmap al activar la capa;
- caché de fondo para evitar redibujar miles de celdas en cada movimiento;
- rectángulo de la vista actual;
- navegación mediante clic o arrastre sobre el minimapa;
- actualización al cambiar mapa, tema, dataset o filtro avanzado.

### Carga IAEA

La aplicación utiliza la API v1 oficial de LiveChart:

```text
https://www-nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all
```

El botón **Actualizar IAEA** aplica una estrategia escalonada:

1. intenta descargar directamente desde los dominios oficiales de IAEA;
2. valida cabecera, campos y número mínimo de registros;
3. si el navegador bloquea CORS o la respuesta 403, carga el snapshot oficial guardado en `nuclides.csv`;
4. conserva el dataset anterior si ambas rutas fallan.

GitHub Pages no puede establecer el encabezado `User-Agent`, que la documentación de IAEA recomienda como solución para determinados errores 403. Para resolverlo se añade el workflow `.github/workflows/sync-iaea.yml`, que descarga el CSV con `curl`, lo valida y actualiza el snapshot dos veces por semana o mediante ejecución manual.

Los metadatos de sincronización se guardan en `data/iaea-sync.json`.

### Menú móvil

- El botón hamburguesa se fuerza a permanecer oculto en escritorio.
- Solo aparece en pantallas de hasta 700 px.
- El menú móvil conserva acceso a Guía, Datos, Tema, Capas, Análisis, búsqueda y restablecimiento.
- Existe un controlador de respaldo si el cargador comprimido de la interfaz avanzada no llega a ejecutarse.

## Laboratorio analítico

El nuevo botón de gráfico abre una ventana flotante inspirada en las capacidades analíticas de NuDat 3, sin copiar su interfaz.

### Perfiles por Z y N

- Variable seleccionable.
- Mediana, media, mínimo o máximo por Z/N.
- Puntos de todos los nucleidos visibles.
- Banda intercuartílica.
- Escala lineal o logarítmica.
- Sincronización con la región visible de la carta.
- Selección de un nucleido desde el gráfico.

### Cruce de variables

- Dispersión X/Y entre propiedades nucleares.
- Color por desintegración, calidad del dato, estabilidad o apareamiento.
- Escalas logarítmicas independientes.
- Correlación lineal orientativa.
- Muestreo determinista en dispositivos con pocos recursos.

### Distribución

- Histogramas de cualquier variable numérica disponible.
- Número de intervalos configurable.
- Frecuencia lineal o logarítmica.
- Estadísticas de mínimo, mediana, media y máximo.

### Filtros avanzados

Se pueden combinar:

- rangos de Z, N y A;
- paridad par/impar de Z y N;
- clase evaluada, isómera, teórica u otra;
- modo principal de desintegración;
- rango numérico de una propiedad seleccionada.

El filtro se aplica al mapa, al minimapa y a los gráficos.

## Propiedades disponibles

El endpoint `ground_states` proporciona, según el nucleido:

- vida media, operadores, unidades e incertidumbres;
- hasta tres modos de desintegración y ramificaciones;
- espín y paridad;
- masa atómica y exceso de masa;
- energía de enlace;
- Qβ−, QEC y Qα;
- Sₙ y Sₚ;
- abundancia;
- radio de carga;
- momentos dipolar magnético y cuadrupolar eléctrico;
- isospín;
- año de descubrimiento;
- fecha de corte y autores ENSDF;
- fecha de extracción.

S₂n y S₂p se calculan localmente desde masas atómicas evaluadas y se identifican expresamente como magnitudes derivadas.

## Guía científica

El botón de información abre una guía progresiva de 52 capítulos. Incluye:

- vocabulario y notación nuclear;
- lectura de la carta;
- interacción fuerte, Coulomb, radio, capas, magia, espín y apareamiento;
- masa, defecto de masa, enlace, fórmula semiempírica, separaciones y valores Q;
- estabilidad, ley exponencial y todos los canales principales de desintegración;
- niveles, gammas y radiaciones de decaimiento;
- abundancia, nucleosíntesis, líneas de goteo y predicciones;
- ENSDF, NUBASE, AME y grupos de la API IAEA;
- perfiles, dispersión, histogramas, filtros e incertidumbres;
- aplicaciones y flujo profesional de comprobación y cita.

La guía enlaza a IAEA LiveChart, su API, NuDat 3, ENSDF, NUBASE, AME, ENDF, EXFOR, NSR y NIST.

## Tema visual

La interfaz dispone de tres modos persistentes:

- **Automático:** icono circular dividido; sigue la preferencia del sistema y una corrección horaria.
- **Claro:** icono de sol.
- **Oscuro:** icono de luna.

## Ficha del nucleido

La ficha conserva el diseño compacto e incluye:

- identidad Z, N y A;
- clase del registro;
- vida media, abundancia y espín-paridad;
- modo principal y descendiente probable;
- masa, exceso de masa, enlace y separaciones;
- números mágicos;
- exceso neutrónico `N − Z`;
- razón `N/Z`;
- clase de apareamiento;
- cadena y relaciones estimadas;
- enlaces oficiales y exportación PNG.

## Rendimiento

- Render principal virtualizado por región visible en Canvas 2D.
- Un único `requestAnimationFrame` pendiente para el mapa principal.
- Caché del minimapa.
- Caché de cuantiles para mapas continuos.
- Guía renderizada por capítulo, no de una sola vez.
- Muestreo de dispersión adaptado a memoria, núcleos y ahorro de datos.
- Compatibilidad con `prefers-reduced-motion`.

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

- `index.html`: estructura accesible de la aplicación.
- `styles.css`: estilos base.
- `app.js`: motor científico, datos, filtros y render Canvas estable.
- `nucleidos-ui-loader.js`: carga de la interfaz v26 comprimida.
- `nucleidos-v27.css`: estilos de las correcciones y del laboratorio.
- `nucleidos-v27.js`: cargador del runtime v27 comprimido.
- `nucleidos-v27-runtime-*.b64`: minimapa, IAEA, mapas, gráficos, filtros y guía ampliada.
- `nuclides.csv`: snapshot principal de IAEA.
- `nuclides-data.js`: respaldo integrado.
- `data/iaea-sync.json`: metadatos del snapshot.
- `.github/workflows/sync-iaea.yml`: sincronización oficial automatizada.

## Alcance científico

El visor ofrece una capa moderna de exploración y análisis sobre estados fundamentales. No replica todavía todos los conjuntos de NuDat 3 y LiveChart: niveles excitados, transiciones gamma, radiaciones de desintegración, espectros beta, secciones eficaces y rendimientos de fisión requieren datasets adicionales y, en una web estática, un proxy o backend con caché y trazabilidad.

Los datos evaluados deben citarse mediante sus fuentes originales. Las capas teóricas y las magnitudes calculadas localmente no se presentan como evidencia experimental.
