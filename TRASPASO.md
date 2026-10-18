# Traspaso: la web a la cuenta de Monica

Monica ya tiene su copia, `mokakopa/web`, que publica `mokakopa.com` con GitHub
Pages (*legacy*: sirve los ficheros de `main` tal cual), y **la edita ella**:
87 commits suyos hasta abril de 2026. Es la versión de antes (un `data.json`, sin
build): Google ve la página casi vacía, porque los proyectos los pinta el JS.
La nueva la publica su Cloudflare con Workers Builds; el DNS de `mokakopa.com`
ya está en Cloudflare.

**Su contenido viene de su copia** (traído el 2026-10-18: 14 proyectos, su CV y
su correo). Lo que haya cambiado desde entonces hay que traerlo antes.

Todo viaja dentro del repositorio: el código, los JSON, las fotos y cómo se
publica (`wrangler.jsonc`). En su copia la Action no corre (lleva
`if: github.repository_owner == 'meowrhino'`) y el build, al no estar en
GitHub, publica en la raíz con el `url` de `site.json`.

Tiempo: unos 30 minutos, más lo que tarden los DNS, y un rato con ella: **cambia
cómo edita** (de un `data.json` a una carpeta por proyecto). Hablarlo antes.

## Antes

- [ ] `main` de meowrhino al día y sin cambios a medias (`git status` limpio).
- [ ] ¿Ha tocado algo Monica en su copia desde el 2026-10-18 (cuando se trajo su contenido; su último commit era del 2026-04-20)?
      `gh api repos/mokakopa/web/commits --jq '.[0:3][].commit.message'`. Si sí, pasar
      sus cambios aquí antes de seguir (`data.json` → `projects/<nombre>/project.json` y `data/about.json`; el script de entonces: JAMstack, `patrones.md` §3b).
- [ ] Que nos deje escribir en `mokakopa/web`: Settings → Collaborators → `meowrhino`,
      con **Write** (hoy no podemos).
- [ ] El DNS de `mokakopa.com` está en Cloudflare (`*.ns.cloudflare.com`). Mirar **en
      qué cuenta**: tiene que ser la de Monica.

## 1. La versión nueva, en una rama de su copia

Las dos copias no comparten historia. Se sube a una rama aparte para que su web
siga igual mientras se prepara Cloudflare:

- [ ] `git push https://github.com/mokakopa/web.git main:receta`

## 2. Cloudflare (con Monica, en su cuenta)

- [ ] **Workers & Pages → Create → Import a repository** → `mokakopa/web`, rama de
      producción **`receta`**. Lo demás lo lee de `wrangler.jsonc` (instala sharp con
      `npm install`, build `node build/build.mjs`, sale `dist/`).
- [ ] Mirar la web en su `*.workers.dev`: la portada, un proyecto (el scroll de sus fotos), el
      about con el CV, y `/en/` y `/ca/`.
- [ ] **Settings → Domains & Routes → Add → Custom domain**: `mokakopa.com` (y `www`).
      Cloudflare cambia los registros que apuntaban a GitHub Pages.

## 3. `main` pasa a ser la versión nueva

- [ ] Guardar la de antes: `git push https://github.com/mokakopa/web.git <sha-de-su-main>:refs/heads/antes`.
- [ ] `git push --force-with-lease=main:<sha-de-su-main> https://github.com/mokakopa/web.git main`
      (desde nuestra `main`).
- [ ] En Cloudflare, rama de producción → **`main`**. Borrar la rama `receta`.
- [ ] Monica, en su repo: Settings → Pages → **Unpublish site** (ya no sirve nada).

## 4. Que nos deje entrar en Cloudflare

- [ ] Manage account → Members → nos invita. Ahí se ve el error entero de un build que falla.

## 5. Comprobar en su dominio

- [ ] La portada, `/en/` y `/ca/`: los proyectos y sus textos en cada idioma.
- [ ] `view-source:` de la portada: los textos de los proyectos están en el HTML (antes, vacío).
- [ ] `view-source:`: `canonical` y `og:url` con `mokakopa.com`, y **sin**
      `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` dice `Allow` y `/sitemap.xml` tiene las direcciones de su dominio.
- [ ] Compartir la web por WhatsApp: sale la foto (la og).

## 6. Search Console, con su cuenta de Google

- [ ] Dar de alta el dominio (el registro TXT, en el DNS de Cloudflare) y enviar `sitemap.xml`.

## 7. Monica en su ordenador

Con él delante, siguiendo [GUIA.md](GUIA.md) ("La primera vegada"):

- [ ] Clona **su** repositorio, no el de meowrhino (si ya lo tenía, **Sincronizar**: la
      estructura cambia entera).
- [ ] Live Server: **Go Live** y ve la vista previa.
- [ ] Un cambio pequeño (una coma en el about), Confirmar → Sincronizar, y la bolita verde.

## 8. Al acabar

- [ ] Fila de mokakopa en `JAMstack/inventario.md` con las dos direcciones (github.io y su dominio).
- [ ] La copia de meowrhino sigue en github.io con `noindex`: no compite en Google.
