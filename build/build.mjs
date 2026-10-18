/* ============================================================
   build.mjs — data/ + projects/ + index.html (la plantilla) → dist/,
   la web tal cual se publica.       node build/build.mjs

   Una página por idioma: /, /en/ y /ca/, cada una con todo el contenido
   ya escrito (los proyectos, el menú y el about) y su title, description,
   og:image, canonical y hreflang. Así Google y WhatsApp la leen sin JS.
   Al cargar, js/main.js vuelve a pintar lo mismo y la web funciona como
   siempre: el scroll, el menú y el cambio de idioma no cambian de página.

   Si algo está mal (una coma, un campo mal escrito, una foto que no está)
   para y dice qué, y no se publica nada: la web se queda como estaba.

   Lo mismo en las dos webs gemelas (mokakopa y twinMokakopa): todo lo que
   cambia está en data/, projects/ e index.html.
   ============================================================ */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugsOf, toOld } from '../js/house.js';
import { leerJSON, validar } from '../js/validar.js';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'dist');
const at = (...p) => join(ROOT, ...p);
const fail = (msg) => { console.error(`\n✗ ${msg}\n\nNo se ha publicado nada: la web sigue como estaba.\n`); process.exit(1); };

/* ---------- leer y revisar ---------- */

const read = (rel) => {
  if (!existsSync(at(rel))) fail(`no encuentro ${rel}`);
  try { return leerJSON(readFileSync(at(rel), 'utf8'), rel); } catch (e) { fail(e.message); }
};
// cada JSON con su esquema (schema/): lo mismo que VS Code subraya en rojo
const schema = (t) => JSON.parse(readFileSync(at('schema', `${t}.json`), 'utf8'));
const site = read('data/site.json');
const about = read('data/about.json');
const errors = [...validar(site, schema('site'), 'data/site.json'), ...validar(about, schema('about'), 'data/about.json')];
const slugs = errors.length ? [] : slugsOf(site);
const projects = {};
for (const slug of slugs) {
  const rel = `projects/${slug}/project.json`;
  if (projects[slug]) { errors.push(`data/site.json: "${slug}" está dos veces en "lists"`); continue; }
  if (!existsSync(at(rel))) { errors.push(`data/site.json: "lists" dice "${slug}", y no hay ningún ${rel}`); continue; }
  const p = projects[slug] = read(rel);
  errors.push(...validar(p, schema('project'), rel));
  for (const n of Array.isArray(p.photos) ? p.photos : []) {
    if (!existsSync(at('projects', slug, 'img', `${n}.webp`))) errors.push(`${rel}: "photos" dice "${n}", y no hay ningún img/${n}.webp (pásala por imgToWeb)`);
  }
}
if (errors.length) fail(errors.join('\n✗ '));
const data = toOld(site, about, projects);

/* Dónde se publica, según dónde se construye (JAMstack, patrones §5): en la
   Action de GitHub (nuestra copia), meowrhino.github.io/<repo>/ y sin
   indexar; en cualquier otro sitio (Cloudflare, en la copia de la clienta),
   la raíz y el dominio de site.json → "url", y se indexa si lo hay. */
const github = process.env.GITHUB_ACTIONS === 'true';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/');
const BASE = github ? `/${repo}` : '';
const SITE = github ? `https://${owner}.github.io${BASE}` : String(site.url || '').replace(/\/+$/, '');
const INDEX = !github && !!site.url;

const LANGS = { es: { prefix: '', locale: 'es_ES', key: 'ES' }, en: { prefix: '/en', locale: 'en_US', key: 'EN' }, ca: { prefix: '/ca', locale: 'ca_ES', key: 'CAT' } };
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const texts = (o, lang) => o['textos' + LANGS[lang].key] || o.textosES || [];
const plain = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s) => (s.length <= 155 ? s : s.slice(0, 152).trimEnd() + '…');

/* ---------- la imagen al compartir, con sharp ---------- */

/* 1200×630 en JPG, la primera foto del primer proyecto entera sobre el color
   de fondo, con aire. En .cache/ (fuera de git); solo se rehace si cambia la
   foto. Sin sharp, se comparte la foto tal cual y se avisa. */
const cover = data.proyectos.find(([, p]) => p.photos.length)?.[1].photos[0];
let ogFile = null;   // la og hecha, en .cache/og/
if (cover) {
  const cached = at('.cache', 'og', cover.replace(/\//g, '_').replace(/\.webp$/, '.jpg'));
  try {
    if (!(existsSync(cached) && statSync(cached).mtimeMs >= statSync(at(cover)).mtimeMs)) {
      const sharp = (await import('sharp')).default;
      mkdirSync(dirname(cached), { recursive: true });
      await sharp(at(cover)).resize(1104, 534, { fit: 'contain', background: '#ffffff' })
        .extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#ffffff' })
        .flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }).toFile(cached);
    }
    ogFile = cached;
  } catch (e) {
    console.warn(`⚠ sin sharp (${e.code || e.message}): al compartir sale la foto tal cual. Se arregla con: npm ci`);
  }
}
const ogPath = ogFile ? 'og.jpg' : cover;

/* ---------- la página: lo que pintan main.js (renderProjects, initMenu, about) ---------- */

const menu = () => data.proyectos.map(([s, p]) => `<a href="#${esc(s)}" data-project="${esc(s)}">${esc(p.titulo || s)}</a>`).join('');

const projectsHTML = (lang) => data.proyectos.map(([slug, p]) => `
        <div class="project" id="${esc(slug)}">
            <div class="gallery">
${p.photos.map((src, i) => `                <div class="gallery-item"><img src="${BASE}/${src}" alt="${esc(slug)} ${i + 1}" loading="lazy" decoding="async"></div>`).join('\n')}
                <div class="gallery-text" data-project="${esc(slug)}"><div class="gallery-text-scroll"><h2>${esc(p.titulo || slug)}</h2>${texts(p, lang).map((t) => `<p>${t}</p>`).join('')}</div></div>
            </div>
        </div>`).join('');

const aboutHTML = (lang) => texts(data.about[0], lang).map((t) => `<p>${t}</p>`).join('');
const contactHTML = () => {
  const c = data.contacto;
  return `<div>${esc(c.nombre)}</div><div><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`
    + `<div><a href="https://www.instagram.com/${esc(c.instagram.replace('@', ''))}" target="_blank" rel="noopener noreferrer">${esc(c.instagram)} (IG)</a></div>`;
};

/* ---------- la plantilla ---------- */

const template = readFileSync(at('index.html'), 'utf8');
// cambia un trozo de la plantilla; si no lo encuentra, para (alguien ha tocado index.html)
function swap(html, find, replace) {
  if (!find.test(html)) fail(`no encuentro ${find} en index.html: el build lo necesita para escribir cada página.`);
  return html.replace(find, replace);
}
const meta = (html, attr, name, value) =>
  swap(html, new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), (_, a, b) => `${a}${esc(value)}${b}`);

function page(lang, { robots } = {}) {
  const L = LANGS[lang];
  const url = `${SITE}${L.prefix}/`;
  const desc = cut(plain(texts(data.about[0], lang)[0] || site.title));
  const image = ogPath ? `${SITE}/${ogPath}` : '';
  let html = template;
  // data-built: main.js sabe que no es la vista previa
  html = swap(html, /<html lang="[^"]*"/, `<html lang="${lang}" data-built`);
  // las rutas, desde la raíz: la página puede estar en /en/
  html = html.replace(/(href|src)="(css|js|data)\//g, `$1="${BASE}/$2/`);
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(site.title)}</title>`);
  html = meta(html, 'name', 'description', desc);
  html = meta(html, 'name', 'robots', robots || (INDEX ? 'index, follow' : 'noindex'));
  html = meta(html, 'property', 'og:url', url);
  html = meta(html, 'property', 'og:description', desc);
  html = meta(html, 'property', 'og:image', image);
  html = meta(html, 'property', 'og:locale', L.locale);
  html = html.replace(/\s*<meta property="og:locale:alternate"[^>]*>/g, '');
  html = meta(html, 'name', 'twitter:url', url);
  html = meta(html, 'name', 'twitter:description', desc);
  html = meta(html, 'name', 'twitter:image', image);
  html = swap(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">\n`
    + Object.entries(LANGS).map(([l, x]) => `    <link rel="alternate" hreflang="${l}" href="${SITE}${x.prefix}/">`).join('\n')
    + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}/">`);
  html = swap(html, /<main id="projects-container"><\/main>/, `<main id="projects-container">${projectsHTML(lang)}\n    </main>`);
  html = swap(html, /<nav id="menu"><\/nav>/, `<nav id="menu">${menu()}</nav>`);
  html = swap(html, /<h2 id="about-title"><\/h2>/, `<h2 id="about-title">${esc(data.about[0].titulo)}</h2>`);
  html = swap(html, /<p class="about-subtitle"><\/p>/, `<p class="about-subtitle">${esc(data.about[0].subtitulo)}</p>`);
  html = swap(html, /<div id="about-text"><\/div>/, `<div id="about-text">${aboutHTML(lang)}</div>`);
  html = swap(html, /<div id="about-contact"><\/div>/, `<div id="about-contact">${contactHTML()}</div>`);
  return html;
}

/* ---------- escribir dist/ ---------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const dir of ['css', 'js', 'data', 'projects']) cpSync(at(dir), join(OUT, dir), { recursive: true, filter: (f) => !f.endsWith('.DS_Store') });
if (ogFile) cpSync(ogFile, join(OUT, 'og.jpg'));
for (const [lang, L] of Object.entries(LANGS)) {
  mkdirSync(join(OUT, L.prefix), { recursive: true });
  writeFileSync(join(OUT, L.prefix, 'index.html'), page(lang));
}
// la que sale en una dirección que no existe (GitHub Pages y Cloudflare la buscan con este nombre)
writeFileSync(join(OUT, '404.html'), page('es', { robots: 'noindex' }));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.values(LANGS).map((L) => `  <url><loc>${SITE}${L.prefix}/</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), INDEX ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');

console.log(`✓ dist/: ${Object.keys(LANGS).length} idiomas · ${slugs.length} proyectos${INDEX ? ` · se indexa (${SITE})` : ' · sin indexar'}`);
