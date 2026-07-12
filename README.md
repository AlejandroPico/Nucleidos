# Tabla de nucleidos — versión 26

Visor interactivo de nucleidos en HTML, CSS y JavaScript. Representa nucleidos evaluados y una extensión teórica opcional sobre una carta N–Z renderizada en Canvas 2D.

## Funciones principales

- Carta de nucleidos con eje horizontal `N` (neutrones) y eje vertical `Z` (protones).
- Carga principal desde `nuclides.csv` y respaldo integrado mediante `nuclides-data.js`.
- Mapas por desintegración, estabilidad, vida media, calidad del dato, abundancia, energía de enlace, Qα y Qβ−.
- Capas opcionales de nucleidos no observados, isómeros, cuadrícula, números mágicos, frontera nuclear, marco evaluado y minimapa.
- El minimapa permanece desactivado al iniciar y puede activarse desde Capas.
- Zoom, desplazamiento, búsqueda, comparación y ficha detallada de cada nucleido.
- Modelo atómico 3D esquemático en Canvas.

## Tema visual

La interfaz dispone de tres modos persistentes:

- **Automático:** icono circular dividido; sigue la preferencia del sistema y aplica una corrección horaria.
- **Claro:** icono de sol.
- **Oscuro:** icono de luna.

El botón recorre los tres estados tanto en escritorio como en el menú móvil.

## Guía científica

El botón de información, situado entre Buscar y Datos, abre una guía progresiva de 30 apartados distribuida en cinco bloques:

1. Fundamentos y lectura de la carta.
2. Estructura, masa y energía nuclear.
3. Radiactividad y canales de desintegración.
4. Capas, fronteras y uso correcto del visor.
5. Aplicaciones, nucleosíntesis y evaluación profesional de datos.

La guía incluye fórmulas, tablas conceptuales, ejemplos, advertencias sobre datos teóricos y enlaces a fuentes como IAEA LiveChart, NuDat/ENSDF, NUBASE/AMDC, NIST e IUPAC.

## Ficha del nucleido

La ficha conserva el diseño compacto y añade lecturas derivadas sin inventar datos experimentales:

- exceso neutrónico `N − Z`;
- razón `N/Z`;
- clase de apareamiento par/impar;
- comprobación de `A = Z + N`;
- indicación explícita de si el registro es evaluado, isomérico o teórico.

## Rendimiento y accesibilidad

- Render principal virtualizado por región visible en Canvas 2D.
- Guía construida de forma diferida y solo se renderiza el apartado activo.
- Recursos de la nueva interfaz comprimidos y cargados de forma modular.
- Animación atómica pausada cuando la ficha está cerrada o la página queda oculta.
- Ajustes automáticos para dispositivos con pocos núcleos, poca memoria o ahorro de datos.
- Compatibilidad con `prefers-reduced-motion`.
- Navegación táctil, menú hamburguesa, paneles adaptables y cierre mediante Atrás en móvil.

## Controles

- Rueda o pellizco: zoom.
- Arrastrar con ratón o un dedo: mover la carta.
- Clic o toque en un nucleido: abrir la ficha.
- Doble clic o doble toque: centrar el nucleido.
- Indicador de zoom / opción `100%`: restablecer el encuadre.
- Toque sobre el modelo 3D: pausar o reanudar la animación.
- Escape o navegación Atrás: cerrar la capa activa cuando corresponda.

## Archivos principales

- `index.html`: estructura accesible de la aplicación.
- `styles.css`: estilos base.
- `app.js`: motor científico, datos, filtros y render Canvas.
- `nucleidos-ui-loader.js`: carga de la interfaz educativa y optimizaciones.
- `nucleidos-ui-*.b64`: recursos comprimidos de la interfaz avanzada.
- `nuclides.csv`: datos evaluados principales.
- `nuclides-data.js`: respaldo integrado.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`: iconos del sitio.

## Criterio científico

Los nucleidos evaluados proceden del conjunto de datos cargado. La capa de no observados es una extensión visual y teórica: no debe interpretarse como evidencia experimental ni como predicción con incertidumbre cuantificada. Para trabajo científico deben consultarse las evaluaciones y publicaciones originales enlazadas desde la aplicación.
