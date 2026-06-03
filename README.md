# Tabla de nucleídos — visor web fullscreen

Versión 2 del prototipo: una página web estática en HTML, CSS y JavaScript para representar una tabla de nucleídos como un escenario navegable a pantalla completa.

## Objetivo visual de esta versión

- La cuadrícula ocupa el 100% de la ventana.
- La página no tiene scroll vertical.
- La rueda del ratón se usa únicamente para hacer zoom hacia la posición del cursor.
- El desplazamiento por el escenario se hace arrastrando el fondo con el ratón.
- Todas las funciones secundarias están dentro del menú hamburguesa.
- Al hacer clic en un nucleído aparece una ficha flotante en la esquina inferior derecha.
- La ficha se cierra con su botón `×`, con `Esc` o haciendo clic en una zona vacía de la tabla.

## Archivos

- `index.html`: estructura principal.
- `styles.css`: interfaz fullscreen, menú lateral, cuadrícula, popup y animaciones.
- `app.js`: lógica de zoom, desplazamiento, carga CSV, renderizado y panel de detalle.
- `sample_nuclides.csv`: muestra de datos incluida para pruebas.

## Uso básico

Abre `index.html` directamente en el navegador.

Controles:

- Rueda del ratón: zoom.
- Arrastrar fondo: mover la tabla.
- Clic en un nucleído: abrir ficha.
- Clic en zona vacía: cerrar ficha.
- Botón hamburguesa: abrir menú.
- `Esc`: cerrar menú y ficha.

## Datos completos

Este prototipo incluye una muestra interna para que funcione sin instalación. Para una tabla de nucleídos completa, importa un CSV con datos reales.

Campos recomendados:

```csv
z,n,a,symbol,name,nuclide,mass_u,atomic_weight,half_life,half_life_seconds,decay_mode,abundance,spin_parity,binding_energy_per_nucleon_kev,mass_excess_kev,q_alpha_kev,neutron_capture_cross_section_barns,notes,wikipedia_url
```

También se aceptan nombres de columna alternativos como `Z`, `N`, `mass_number`, `element`, `halflife`, `decay_1`, etc.

## Fuentes recomendadas para completar la tabla

- IAEA LiveChart of Nuclides: permite descargar datos nucleares en CSV.
- NNDC NuDat / ENSDF: base evaluada de datos nucleares.

La opción “Cargar datos IAEA” está dentro del menú. Si el navegador bloquea la petición remota por CORS, abre la URL, guarda el CSV y luego impórtalo desde “Importar CSV local”.

## Siguiente evolución lógica

La siguiente versión debería incorporar:

1. Dataset nuclear completo preprocesado.
2. Renderizado optimizado por Canvas/WebGL para miles de nucleídos con mejor rendimiento.
3. Zoom semántico: mostrar más texto dentro de la celda cuando el zoom sea alto.
4. Capas visuales: estabilidad, cadenas de desintegración, números mágicos, isóbaros, isótonos e isótopos.
5. Panel lateral avanzado con gráficos de desintegración, productos hijo y branching ratios.
