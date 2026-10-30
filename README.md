# MyWebSite

Portafolio personal de Juan Lopez, construido con HTML, CSS y JavaScript.

## Versiones

- `master`: V1 original, conservada como recuerdo.
- `v2`: rama para desarrollar y publicar la segunda version. Parte de la V1.

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
