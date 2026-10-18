# mokakopa

Portfolio de Monica Kopatschek ([mokakopa.com](https://www.mokakopa.com)), por
[meowrhino.studio](https://meowrhino.studio). Sigue la receta de
[meowrhino/JAMstack](https://github.com/meowrhino/JAMstack), en su forma de
**una sola página** (receta, "si el diseño es un lienzo"). Gemela de
`twinMokakopa` (Ana López, analopezserrano.com): mismo código, otro contenido y
otro lado (`data-lado` en `<body>`).

**Para actualizar la web (la clienta): [GUIA.md](GUIA.md).** Traspaso: [TRASPASO.md](TRASPASO.md).
Si el build falla: [CLAUDE.md](CLAUDE.md).

## Estructura

```
data/site.json         el nombre, el dominio, el color, el contacto; "lists": qué proyectos salen, en orden
data/about.json        el about: nombre, subtítulo, statement (es/en/ca) y CV
projects/<nombre>/     un proyecto: project.json (title, text, photos) + img/1.webp… (imgToWeb)
schema/                qué campos lleva cada JSON (VS Code, el build y la vista previa)
index.html             la plantilla de las tres páginas, y la vista previa con Live Server
build/build.mjs        → dist/: una página por idioma (/, /en/, /ca/) con todo dentro
js/main.js             la web de siempre: galerías, menú, about, idiomas
js/house.js            la forma de la casa → la del data.json de antes (la usan main.js y el build)
js/validar.js          el JSON Schema sin dependencias (de JAMstack)
css/style.css
wrangler.jsonc         la copia de la clienta, en Workers Builds
```

## Cómo funciona

- **Una página por idioma, con el contenido dentro**: el build escribe `/`, `/en/` y `/ca/` con
  los proyectos, el menú y el about ya en el HTML, y su title, description, og:image, canonical
  y `hreflang`. Al cargar, `main.js` vuelve a pintar lo mismo (y el idioma de partida es el de la
  página). Los proyectos no tienen dirección propia: son secciones del scroll, con su `#nombre`.
- **El contenido, a la manera de la casa**; `js/house.js` lo pasa a la forma del `data.json` de
  antes, así que `main.js` casi no cambia (solo lee `photos` en vez de probar 1, 2, 3…).
- **Vista previa**: Live Server sobre la carpeta. Sin `data-built` en `<html>`, `main.js` revisa
  los JSON con `schema/` y enseña en pantalla lo que pararía el build.
- **Publicar, una en cada copia**: la nuestra, `.github/workflows/deploy.yml` a GitHub Pages
  (solo corre en `meowrhino`; si falla, un issue). La de la clienta, Workers Builds. El build mira
  dónde está: con `GITHUB_ACTIONS`, base `/mokakopa` y `noindex`; si no, la raíz y el `url` de
  `site.json`. La og:image (1200×630) la hace **sharp** (`npm ci`), en `.cache/`.
- **Sin transición ni ocultos**: no recarga entre proyectos, y la lista es la web entera.

```bash
npm ci
node build/build.mjs
```
