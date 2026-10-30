# MyWebSite

Portafolio personal de Juan Lopez, construido con HTML, CSS y JavaScript.

## Sitio publicado

https://juanlop3z.github.io/MyWebSite/

## Despliegue en GitHub Pages

El sitio se publica desde la raiz de la rama `master`. En el repositorio,
la configuracion de **Settings > Pages > Build and deployment** debe ser:

- **Source:** Deploy from a branch.
- **Branch:** `master`.
- **Folder:** `/ (root)`.

Los cambios que se suben a `master` se publican automaticamente. No se
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
