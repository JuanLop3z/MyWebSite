# Guía de estructura

El proyecto es un sitio estático: el navegador carga `index.html` y sus recursos
directamente. La organización separa la página, los archivos que usa el navegador,
las herramientas de mantenimiento y la documentación.

## Dónde hacer cada cambio

| Quiero cambiar | Archivo o carpeta |
| --- | --- |
| Presentación, experiencia, formación, proyectos o contacto | [`index.html`](../index.html) |
| Colores, tipografía, temas y tamaños de pantalla | [`assets/css/styles.css`](../assets/css/styles.css) |
| Menú móvil, filtros, tema y animaciones al desplazarse | [`assets/js/main.js`](../assets/js/main.js) |
| Imágenes y otros recursos gráficos actuales | `assets/images/` |
| Versiones de las URLs del CSS, JavaScript y favicon | [`scripts/version_assets.py`](../scripts/version_assets.py) |
| Instrucciones para ejecutar y publicar | [`README.md`](../README.md) |
| Contexto de trabajo del asistente | `AGENTS.md`, local e ignorado por Git |

## Página y recursos actuales

- `index.html` permanece en la raíz: es la entrada que espera GitHub Pages.
- `assets/css/` contiene los estilos que se aplican a la página.
- `assets/js/` contiene el código JavaScript que ejecuta el navegador.
- `assets/images/` contiene las imágenes actuales, empezando por `favicon.svg`.

Las ilustraciones de los proyectos se construyen con HTML y CSS dentro de la
página; no son archivos de imagen ni capturas reales.

## Herramientas y documentación

- `scripts/` contiene herramientas para mantener el proyecto. Su código no se
  ejecuta en el navegador y no necesita servirse para que la web funcione.
- `docs/` contiene guías para desarrollar y mantener el sitio.
- `README.md` es el punto de entrada para entender y ejecutar el proyecto.
- `.nojekyll` se mantiene en la raíz para la publicación estática de Pages.
- `.gitignore` excluye los archivos locales. `AGENTS.md` está incluido en esa
  exclusión y no debe añadirse al repositorio.

La versión original completa del sitio y sus imágenes continúan en la rama
`master`. La V2 contiene únicamente los recursos que utiliza.

## Rutas y cambios de recursos

Las rutas son relativas y respetan mayúsculas y minúsculas. Desde `index.html`,
los recursos empiezan por `assets/`. Desde `assets/css/styles.css`, una imagen
local se referencia como `../images/nombre-del-archivo.svg`.

Usar nombres nuevos en minúsculas y separados por guiones.

Después de cambiar CSS, JavaScript o el favicon, ejecutar desde la raíz:

```sh
python scripts/version_assets.py
```

El script actualiza las huellas de contenido en `index.html`. Incluir los archivos
modificados y ese HTML en el mismo commit cuando se solicite publicar. Así se
evita que el navegador mezcle archivos nuevos con una versión anterior en caché.

Para revisar el sitio localmente:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8000/. No hay instalación de dependencias ni compilación.
