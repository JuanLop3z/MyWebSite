# MyWebSite

Portafolio personal de Juan Lopez, construido con HTML, CSS y JavaScript.

## Versiones

- `master`: V1 original, conservada como recuerdo.
- `v2`: rama para desarrollar y publicar la segunda version. Parte de la V1.

## V2

Portafolio adaptable a movil, tablet y escritorio, con tema claro y oscuro,
filtros de proyectos, navegacion movil y animaciones progresivas. Respeta
las preferencias de color y movimiento reducido del sistema. El tema elegido
se guarda en el navegador cuando el almacenamiento esta disponible.

El sitio usa HTML, CSS y JavaScript sin dependencias ni recursos externos
necesarios para renderizarlo. Los enlaces de contacto y repositorios requieren
conexion a internet. Las ilustraciones de proyectos son conceptuales.

- `index.html`: contenido, enlaces y estructura semantica.
- `css/styles.css`: paleta, temas, componentes, animaciones y puntos de quiebre.
- `js/Main.js`: menu, tema, filtros y efectos al entrar en pantalla.
- `Img/favicon.svg`: icono de marca.

Para personalizar el perfil, editar el texto y los enlaces en `index.html`.
Las variables al inicio de `css/styles.css` controlan la identidad visual.
El contenido sigue disponible si JavaScript esta desactivado.

Antes de crear un commit que cambie CSS, JavaScript o el favicon, actualizar
las versiones de sus enlaces:

```sh
python scripts/version_assets.py
```

El script calcula una huella del contenido y la agrega a la URL de cada recurso.
Asi, el navegador descarga la version nueva y evita mezclar el HTML de una
publicacion con estilos o scripts anteriores guardados en cache. Incluir el
`index.html` actualizado en el mismo commit. No es un paso de compilacion.

## Contenido profesional

El perfil incluye experiencia profesional, indicadores del alcance del rol en
INSEPET, formacion y una seleccion de seis proyectos publicos de GitHub.
Las fechas y cifras profesionales corresponden al CV compartido; no representan
un cargo actual. Los proyectos en desarrollo se identifican como tales.

La seccion de experiencia se edita en `#experiencia`. Cada proyecto es un
`article.project-card` con su enlace, descripcion, tecnologias y `data-category`
para los filtros. El stack combina habilidades del CV y herramientas verificadas
en los repositorios seleccionados.

`AGENTS.md` guarda contexto de trabajo solo en esta copia local y esta ignorado
por Git. No forma parte del contenido publicado.

## Sitio publicado

https://juanlop3z.github.io/MyWebSite/

## Despliegue en GitHub Pages

Para publicar la V2 desde la raiz de la rama `v2`, en el repositorio,
la configuracion de **Settings > Pages > Build and deployment** debe ser:

- **Source:** Deploy from a branch.
- **Branch:** `v2`.
- **Folder:** `/ (root)`.

Una vez seleccionada esa rama en Pages, los cambios que se suben a `v2`
se publican automaticamente. No se
necesitan dependencias ni un paso de compilacion. El archivo `.nojekyll`
permite servir los archivos estaticos sin procesarlos con Jekyll.

El punto de entrada debe llamarse `index.html`, en minusculas. Las rutas
de CSS, JavaScript e imagenes son relativas para funcionar bajo `/MyWebSite/`.
GitHub Pages distingue entre mayusculas y minusculas en los nombres.

## Vista local

Desde la carpeta del proyecto:

```sh
python -m http.server 8000
```

Abrir http://localhost:8000/.
