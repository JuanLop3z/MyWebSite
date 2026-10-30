# Guía de estructura

El proyecto es un sitio estático: el navegador carga `index.html` y sus recursos
directamente. La organización separa la página, los archivos que usa el navegador,
las herramientas de mantenimiento y la documentación.

## Dónde hacer cada cambio

| Quiero cambiar                                                      | Archivo o carpeta                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Presentación, experiencia, formación, proyectos o contacto          | [`index.html`](../index.html)                               |
| Colores, tipografía, temas y tamaños de pantalla                    | [`assets/css/styles.css`](../assets/css/styles.css)         |
| Menú móvil, filtros, tema y animaciones al desplazarse              | [`assets/js/main.js`](../assets/js/main.js)                 |
| Luces ambientales, reflejos, profundidad y transiciones decorativas | [`assets/css/effects.css`](../assets/css/effects.css)       |
| Partículas, movimiento con el cursor y pausa de animaciones         | [`assets/js/effects.js`](../assets/js/effects.js)           |
| Imágenes y otros recursos gráficos actuales                         | `assets/images/`                                            |
| Versiones de las URLs del CSS, JavaScript y favicon                 | [`scripts/version_assets.py`](../scripts/version_assets.py) |
| Instrucciones para ejecutar y publicar                              | [`README.md`](../README.md)                                 |
| Contexto de trabajo del asistente                                   | `AGENTS.md`, local e ignorado por Git                       |

## Página y recursos actuales

- `index.html` permanece en la raíz: es la entrada que espera GitHub Pages.
- `assets/css/` contiene los estilos que se aplican a la página.
- `assets/js/` contiene el código JavaScript que ejecuta el navegador.
- `assets/images/` contiene las imágenes actuales, empezando por `favicon.svg`.

Las ilustraciones de los proyectos se construyen con HTML y CSS dentro de la
página; no son archivos de imagen ni capturas reales.

## Efectos e interacción

Los efectos están separados de la navegación y el contenido: `effects.css` y
`effects.js` se cargan después de los archivos principales, sin librerías externas.

- El canvas decorativo utiliza 26 partículas en escritorio y 13 en móvil,
  con una frecuencia máxima de 25 cuadros por segundo.
- La escena se detiene cuando la presentación sale de pantalla, se oculta la
  pestaña o se pausan las animaciones.
- La profundidad y los reflejos siguen el cursor únicamente con un puntero fino;
  los dispositivos táctiles mantienen una presentación sin ese movimiento.
- El botón de pausa en la cabecera recuerda la preferencia del visitante.
  La preferencia de movimiento reducido del sistema tiene prioridad.
- Sin JavaScript, el contenido y la navegación siguen disponibles, con un fondo
  ambiental estático. El botón de pausa permanece oculto.

`effects.js` avisa a `main.js` mediante el evento `portfolio:motionchange` cuando
se pausa el movimiento. Así se muestra el contenido pendiente de revelar y no
quedan secciones invisibles.

## Prototipo móvil: agitar y reconstruir

[`shake.js`](../assets/js/shake.js) se carga después de las interacciones
principales y [`shake.css`](../assets/css/shake.css) controla la presentación.
El laboratorio aparece en pantallas de hasta 1024 px con puntero táctil.
En escritorio y sin JavaScript permanece oculto.

- El sensor empieza apagado. Se habilita desde un botón; si existe
  `DeviceMotionEvent.requestPermission()`, se llama dentro de ese gesto.
- El sensor requiere un contexto seguro y un navegador compatible. La web de
  GitHub Pages usa HTTPS. Si el permiso se deniega o no hay sensor, **Probar
  efecto** permite probar la animación igualmente.
- La detección compara muestras separadas al menos 60 ms: requiere tres cambios
  de aceleración de 14 m/s² dentro de 900 ms, separados al menos 110 ms.
  Hay ocho segundos de espera entre activaciones por movimiento.
- Se animan hasta 22 bloques visibles con Web Animations; permanecen en sus
  lugares originales del DOM. No se mueven enlaces ni se reemplaza el contenido.
- El contenido queda temporalmente inerte. El botón **Restaurar ahora** y Escape
  cancelan las animaciones y recuperan foco, desplazamiento e interacción.
- También se restaura al cambiar tamaño, ocultar la pestaña, pausar movimiento
  o salir de la página. Un temporizador de 7,5 segundos asegura la recuperación.
- `portfolio:shakechange` suspende la escena de partículas durante el efecto.
  La preferencia de movimiento reducido y la pausa general deshabilitan el juego.
- Las lecturas del sensor se procesan en memoria; no se guardan ni se envían.

La sensibilidad es un valor inicial del prototipo. Debe comprobarse con un
teléfono real; la simulación de eventos permite validar el flujo y los permisos,
pero no sustituye la prueba del sensor físico.

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
