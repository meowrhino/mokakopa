// ============================================================================
// HOUSE.JS — el contenido a la manera del estudio (JAMstack) → el de antes
//
// El contenido vive así: data/site.json (qué proyectos salen y en qué orden,
// "lists"; el color, el correo, el instagram), data/about.json (statement y
// CV) y cada proyecto en projects/<slug>/project.json con sus fotos en
// img/1.webp, 2.webp… Campos en inglés, idiomas por campo { es, en, ca }.
//
// main.js sigue trabajando con la forma de antes (el data.json de siempre:
// resaltado, proyectos, about, cv, contacto); toOld() pasa de una a otra, así
// que main.js casi no cambia. Lo usan el navegador (main.js) y el build
// (build/build.mjs): sin DOM ni disco.
// ============================================================================

// "lists": { "work": { "projects": [...] } } → ["speeches", "soleMio", …]
export const slugsOf = (site) =>
    Object.values(site.lists || {}).flatMap(list => list.projects || []);

const LANGS = { es: 'ES', en: 'EN', ca: 'CAT' };

// { es: [...], en: [...] } → { textosES: [...], textosEN: [...] }; un idioma
// vacío no se pone, así main.js cae al español como siempre
const byLang = (prefix, value = {}) => Object.fromEntries(
    Object.entries(LANGS).filter(([k]) => value[k] && value[k].length).map(([k, K]) => [prefix + K, value[k]]));

export function toOld(site, about, projects) {
    return {
        resaltado: site.color,
        proyectos: slugsOf(site).map(slug => [slug, {
            titulo: projects[slug].title,
            // las rutas enteras: main.js ya no prueba 1, 2, 3… ni extensiones
            photos: (projects[slug].photos || []).map(n => `projects/${slug}/img/${n}.webp`),
            ...byLang('textos', projects[slug].text),
        }]),
        about: [{ titulo: about.title, subtitulo: about.subtitle || '', ...byLang('textos', about.text) }],
        cv: (about.cv || []).map(section => ({
            nombreES: section.name?.es, nombreEN: section.name?.en, nombreCAT: section.name?.ca,
            items: (section.items || []).map(item => ({ fecha: item.date, titulo: item.title })),
        })),
        contacto: {
            nombre: [about.title, about.subtitle].filter(Boolean).join(' '),
            email: site.email,
            instagram: '@' + (site.social?.instagram || ''),
        },
    };
}
