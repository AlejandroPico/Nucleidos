# Nucleidos

**Versión estable 34.3.0**

Visor científico e interactivo de la carta de nucleidos, desarrollado como proyecto personal, educativo y sin ánimo de lucro. Representa los estados nucleares evaluados sobre coordenadas **N–Z**, incorpora herramientas de análisis y ofrece una enciclopedia integrada para interpretar los datos.

**Aplicación:** [alejandropico.github.io/Nucleidos](https://alejandropico.github.io/Nucleidos/)  
**Autor:** [Alejandro Pico](https://alejandropico.github.io/Portfolio/)

## Estado del proyecto

La versión 34.3.0 constituye la edición estable y visualmente consolidada del proyecto. Incluye el encuadre adaptable definitivo, navegación móvil en vertical y horizontal, información progresiva en las celdas, fichas técnicas multiventana, modelo atómico 3D, análisis gráfico y documentación científica unificada.

## Funciones principales

- Carta de nucleidos renderizada en Canvas 2D con `N` en el eje horizontal superior y `Z` en el eje vertical izquierdo.
- Encuadre completo y centrado al iniciar: la totalidad del conjunto evaluado corresponde al `100 %`.
- Zoom continuo hasta el `1200 %`, con escala física adaptada al tamaño y orientación de cada dispositivo.
- Desplazamiento mediante arrastre, zoom con rueda o pellizco y centrado rápido de un nucleido.
- Información progresiva dentro de las celdas:
  - símbolo en la vista general;
  - `A`, `N`, `Z` y modo de desintegración en las esquinas;
  - nombre del elemento bajo el símbolo;
  - vida media, espín/paridad, masa atómica y clase del dato en los laterales durante la inspección.
- Mapas por desintegración, estabilidad, vida media, calidad, abundancia, energía de enlace, Qα y Qβ−.
- Capas independientes para datos evaluados, isómeros, extensión teórica, cuadrícula, números mágicos, frontera nuclear, marco evaluado y minimapa.
- Búsqueda de nucleidos, comparación múltiple, perfiles por `Z` y `N`, histogramas, dispersión y trayectorias de decaimiento.

## Fichas técnicas

Cada nucleido puede abrirse en una ficha independiente, desplazable y redimensionable. Las fichas comparten un sistema común de foco, profundidad, minimización y maximización.

Las pestañas **Resumen**, **Decaimiento**, **Masas**, **Estructura**, **Usos** y **Datos** reúnen:

- identidad nuclear, estabilidad, abundancia y vida media;
- energías y relaciones de decaimiento;
- masa atómica, exceso de masa y energía de enlace;
- protones, neutrones, electrones, paridad y números mágicos;
- aplicaciones e interés científico;
- registro técnico normalizado y enlaces a Wikipedia y LiveChart.

El modelo visual 3D representa de forma esquemática el núcleo, las órbitas y la población electrónica. La secuencia situada bajo el modelo indica la **distribución de electrones por capas**, desde el nivel más interno al más externo, y dispone de ayuda contextual.

## Enciclopedia científica

La guía y el antiguo módulo de análisis visual forman una única enciclopedia navegable. Incluye contenidos sobre:

- notación nuclear y lectura de la carta;
- interacción fuerte, repulsión de Coulomb, capas y números mágicos;
- masas, defecto de masa, energía de enlace y valores Q;
- estabilidad, vidas medias y canales de desintegración;
- nucleosíntesis, abundancia, líneas de goteo y regiones teóricas;
- fuentes evaluadas, filtros, perfiles, histogramas y comparación.

La documentación enlaza recursos externos y fuentes científicas cuando corresponde.

## Interfaz adaptable

### Escritorio

- Barra de herramientas compacta en la zona superior derecha.
- Ventanas técnicas independientes y organizadas por profundidad.
- Ejes flotantes que permanecen visibles durante el desplazamiento y el zoom.
- Compatibilidad con pantallas de alta resolución, incluidas configuraciones 4K.

### Móvil y tableta

- Menú hamburguesa lateral desde la esquina superior izquierda.
- Cierre mediante el propio botón, toque exterior o gesto de deslizamiento hacia la izquierda.
- Herramientas y subpaneles integrados dentro del menú lateral.
- Modo horizontal específico para pantallas de poca altura, con menú compacto y controles proporcionados.
- Canvas recalculado, vaciado y redibujado al cambiar de tamaño u orientación, sin conservar imágenes residuales ni estiramientos intermedios.
- Fichas adaptadas a la superficie disponible: contenido y modelo 3D se distribuyen en paralelo en horizontal y mantienen desplazamiento interno independiente.
- Minimapa compacto, táctil y desactivado por defecto.

## Temas

La interfaz ofrece cuatro modos persistentes:

- **Automático:** selecciona el tema según la hora solar de la ubicación, con una estimación horaria como alternativa.
- **Mañana:** tema claro.
- **Tarde:** paleta cálida de transición.
- **Noche:** tema oscuro.

## Datos y trazabilidad

La fuente principal es `nuclides.csv`, acompañada de un respaldo integrado en `nuclides-data.js`. La interfaz permite importar conjuntos principales y secundarios sin sobrescribir permanentemente el repositorio desde el navegador.

La sincronización permanente se realiza mediante `.github/workflows/sync-iaea.yml`, que:

1. consulta los endpoints oficiales de IAEA LiveChart;
2. valida cabeceras, volumen y estructura del resultado;
3. conserva el snapshot anterior si la fuente remota no responde correctamente;
4. actualiza `data/iaea-sync.json` y crea un commit únicamente cuando cambian los datos.

Las posiciones teóricas se muestran como una capa diferenciada y no se presentan como evidencia experimental.

## Controles

- **Rueda o pellizco:** ampliar o reducir.
- **Arrastrar:** desplazar la carta.
- **Clic o toque:** abrir la ficha de un nucleido.
- **Doble clic o doble toque:** centrar e inspeccionar un nucleido.
- **Indicador `100 %`:** recuperar el encuadre completo.
- **Minimapa:** tocar o arrastrar para navegar cuando la capa está activa.
- **Modelo 3D:** tocar para pausar o reanudar la animación.
- **Escape:** cerrar la capa o ventana activa cuando corresponda.

## Ejecución local

El proyecto no requiere compilación. Debido a la carga de CSV y recursos mediante `fetch`, debe servirse por HTTP:

```bash
git clone https://github.com/AlejandroPico/Nucleidos.git
cd Nucleidos
python -m http.server 8000
```

Después puede abrirse `http://localhost:8000` en el navegador.

## Estructura principal

- `index.html`: estructura general y carga versionada de recursos.
- `styles.css`: estilos base.
- `app.js`: datos, cámara, Canvas 2D, zoom, capas y modelo 3D.
- `nucleidos-v33.css` y `nucleidos-v33.js`: interfaz consolidada, temas, enciclopedia y adaptación responsive.
- `nucleidos-v28.css` y `nucleidos-v28.js`: compatibilidad y correcciones operativas heredadas.
- `nucleidos-ui-loader.js`: carga de los módulos avanzados de ventanas y análisis.
- `nuclides.csv`: snapshot evaluado principal.
- `nuclides-data.js`: respaldo local integrado.
- `data/iaea-sync.json`: metadatos de sincronización.
- `.github/workflows/sync-iaea.yml`: actualización automatizada de la fuente oficial.
- `favicon.svg`: identidad gráfica del proyecto.

## Alcance científico

Nucleidos es una herramienta de exploración y divulgación. El modelo 3D es esquemático y no representa escalas físicas reales. Para investigación, publicación o toma de decisiones técnicas, los valores deben comprobarse en las fuentes evaluadas originales, como IAEA LiveChart, ENSDF, NUBASE o AME.

---

Proyecto personal de [Alejandro Pico](https://alejandropico.github.io/Portfolio/). Código y documentación disponibles en [GitHub](https://github.com/AlejandroPico/Nucleidos).
