# Tabla interactiva de nucleidos — v7

Visor web estático en HTML, CSS y JavaScript para explorar una tabla de nucleidos a pantalla completa.

## Archivos

- `index.html`: interfaz principal.
- `styles.css`: estilos visuales.
- `app.js`: lógica de navegación, zoom, filtros, búsqueda y ficha de detalle.
- `nuclides.csv`: fuente primaria de datos.
- `nuclides-data.js`: copia integrada de respaldo generada desde `nuclides.csv`.

## Uso

Abre `index.html` directamente o sirve la carpeta con un servidor local.

Recomendado para que el navegador pueda leer `nuclides.csv` como fichero externo:

```bash
python -m http.server 8000
```

Después abre:

```text
http://localhost:8000
```

Si abres el proyecto directamente como `file://`, algunos navegadores pueden bloquear `fetch('nuclides.csv')`. En ese caso la aplicación usa automáticamente `nuclides-data.js`, que contiene una copia integrada del CSV oficial incluido en esta versión.

## Controles

- Rueda del ratón: zoom centrado en el cursor.
- Arrastrar: mover la tabla.
- Clic en un nucleido: abrir ficha de detalle.
- Clic en zona vacía: cerrar ficha.
- Lupa superior: búsqueda rápida.
- Sol/luna: modo claro/oscuro.
- Capas: modo de color y filtros visibles.
- Menú hamburguesa: ajustes generales y carga de datos externos.

## Datos

La versión v7 está preparada para columnas de IAEA/LiveChart como:

- `z`, `n`, `symbol`
- `abundance`
- `jp`
- `half_life`, `operator_hl`, `unit_hl`, `half_life_sec`
- `decay_1`, `decay_1_%`, `decay_2`, `decay_2_%`, `decay_3`, `decay_3_%`
- `qa`, `qec`, `qbm`, `sn`, `sp`
- `binding`, `atomic_mass`, `massexcess`
- `discovery`

