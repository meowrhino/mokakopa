// ============================================================================
// MAIN.JS — mokakopa
// Portfolio de proyectos artísticos de Monica Kopatschek
//
// Arquitectura:
//   - data.json contiene proyectos, textos (ES/EN/CAT), about, cv y contacto
//   - Cada proyecto se renderiza como una sección fullscreen con scroll horizontal
//   - Las imágenes se cargan secuencialmente (1, 2, 3...) hasta que no se
//     encuentre ninguna extensión válida (.webp → .jpg → .png → .jpeg → .gif)
//   - El menú (abajo-izq) usa mix-blend-mode: difference (CSS)
//   - "mokakopa" (arriba-izq) abre el overlay del about
//   - About tiene toggle statement/CV + selector de idioma reutilizable
// ============================================================================

// --- Estado global ---
let currentLang = 'ES';
let projectsData = null;

// Todas las galerías, para recalcular padding en resize
const galleries = [];


// ============================================================================
// INICIALIZACIÓN
// ============================================================================

async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        projectsData = await response.json();

        if (projectsData.resaltado) {
            document.documentElement.style.setProperty('--resaltado', projectsData.resaltado);
        }

        renderProjects();
        initMenu();
        initAboutOverlay();
        initScrollSpy();
        initResizeHandler();
    } catch (error) {
        console.error('Error al inicializar:', error);
        document.getElementById('projects-container').innerHTML =
            '<div style="display:flex;justify-content:center;align-items:center;' +
            'height:100vh;flex-direction:column;padding:20px;text-align:center;">' +
            '<h1>error al cargar mokakopa</h1>' +
            '<p>no se pudieron cargar los datos. recarga la página.</p>' +
            '<p style="color:#666;font-size:14px;margin-top:20px;">error: ' +
            error.message + '</p></div>';
    }
}

document.addEventListener('DOMContentLoaded', init);


// ============================================================================
// RENDERIZADO DE PROYECTOS
// ============================================================================

function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    projectsData.proyectos.forEach(([name, data]) => {
        container.appendChild(createProjectElement(name, data));
    });
}

/**
 * Crea el elemento DOM de un proyecto completo:
 *   <div class="project" id="nombre">
 *     <div class="gallery"> ... items + texto ... </div>
 *   </div>
 */
function createProjectElement(projectName, projectData) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project';
    projectDiv.id = projectName;

    const gallery = document.createElement('div');
    gallery.className = 'gallery';

    // Todos los proyectos son simples: secuencia de imágenes + bloque de texto
    addImagesToGallery(gallery, projectName);
    addTextToGallery(gallery, projectName, projectData);

    projectDiv.appendChild(gallery);

    // Registrar galería para centrado dinámico
    galleries.push(gallery);
    setupFirstImageCentering(gallery);

    return projectDiv;
}


// ============================================================================
// CENTRADO DINÁMICO DE LA PRIMERA IMAGEN
//
// Calcula un padding-left para que la primera imagen de cada galería
// aparezca centrada en el viewport. Como cada imagen tiene dimensiones
// diferentes, se calcula individualmente tras la carga de la imagen.
// ============================================================================

function setupFirstImageCentering(gallery) {
    const firstImg = gallery.querySelector('.gallery-item img');
    if (!firstImg) {
        // Galería sin imágenes (solo texto) — padding mínimo
        gallery.style.paddingLeft = '20px';
        gallery.style.paddingRight = '20px';
        return;
    }

    /**
     * Una vez la primera imagen tiene dimensiones reales,
     * calcula: padding = (viewport_width - img_width) / 2
     * con un mínimo de 20px para no pegar al borde.
     */
    const applyPadding = () => {
        const viewportW = window.innerWidth;
        const imgW = firstImg.offsetWidth;
        if (imgW === 0) return; // aún no tiene dimensiones
        const padding = Math.max(20, Math.floor((viewportW - imgW) / 2));
        gallery.style.paddingLeft = padding + 'px';
        gallery.style.paddingRight = padding + 'px';
    };

    // La imagen puede ya estar cargada (cache) o no
    if (firstImg.complete && firstImg.naturalWidth > 0) {
        applyPadding();
    } else {
        firstImg.addEventListener('load', applyPadding, { once: true });
    }
}

/**
 * Un solo listener de resize global que recalcula el padding
 * de todas las galerías, en vez de N listeners individuales.
 */
function initResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            galleries.forEach(gallery => {
                const firstImg = gallery.querySelector('.gallery-item img');
                if (!firstImg || firstImg.offsetWidth === 0) return;
                const viewportW = window.innerWidth;
                const imgW = firstImg.offsetWidth;
                const padding = Math.max(20, Math.floor((viewportW - imgW) / 2));
                gallery.style.paddingLeft = padding + 'px';
                gallery.style.paddingRight = padding + 'px';
            });
        }, 150); // debounce 150ms
    });
}



// ============================================================================
// CARGA DE IMÁGENES
//
// Carga secuencial: empieza por 1.webp, si existe pasa a 2.webp, etc.
// Para cada número, prueba extensiones en orden: .webp → .jpg → .png → .jpeg → .gif
// Cuando un número falla en todas las extensiones, para (no busca más).
// ============================================================================

const IMG_EXTENSIONS = ['webp', 'jpg', 'png', 'jpeg', 'gif'];

function addImagesToGallery(gallery, path) {
    loadNextImage(gallery, path, 1);
}

function loadNextImage(gallery, path, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    img.alt = path + ' ' + index;

    let extIndex = 0;
    img.src = 'data/' + path + '/' + index + '.' + IMG_EXTENSIONS[extIndex];

    img.onload = function() {
        item.classList.add('loaded');
        // Imagen encontrada, intentar la siguiente
        loadNextImage(gallery, path, index + 1);
    };

    img.onerror = function tryNext() {
        extIndex++;
        if (extIndex < IMG_EXTENSIONS.length) {
            img.onerror = tryNext;
            img.src = 'data/' + path + '/' + index + '.' + IMG_EXTENSIONS[extIndex];
        } else {
            // Ninguna extensión funcionó, parar aquí
            img.onerror = null;
            item.remove();
        }
    };

    item.appendChild(img);

    // Insertar antes del bloque de texto para que las imágenes
    // siempre queden antes del texto, independientemente del orden de carga
    const textBlock = gallery.querySelector('.gallery-text');
    if (textBlock) {
        gallery.insertBefore(item, textBlock);
    } else {
        gallery.appendChild(item);
    }
}


// ============================================================================
// BLOQUE DE TEXTO CON TAMAÑO ADAPTATIVO
//
// El tamaño de fuente se gradúa según la cantidad de texto visible
// (sin contar tags HTML) para que textos largos no rompan el layout
// y textos cortos no se vean demasiado pequeños.
// ============================================================================

function addTextToGallery(gallery, projectName, projectData) {
    const textDiv = document.createElement('div');
    textDiv.className = 'gallery-text';
    textDiv.dataset.project = projectName;

    // Scroll wrapper (80dvh con gradientes fade)
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'gallery-text-scroll';

    // Título del proyecto
    const title = document.createElement('h2');
    title.textContent = projectData.titulo || projectName;
    scrollWrapper.appendChild(title);

    // Párrafos de texto en el idioma actual
    const textos = getTextsByLang(projectData);
    if (textos && textos.length > 0) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto;
            scrollWrapper.appendChild(p);
        });
        adjustTextSize(scrollWrapper, textos);
    }

    textDiv.appendChild(scrollWrapper);

    // Gradientes: detectar scroll arriba/abajo
    initScrollGradients(scrollWrapper);

    // Selector de idioma (fuera del scroll wrapper)
    const langDiv = document.createElement('div');
    langDiv.className = 'lang-switch';
    textDiv.appendChild(langDiv);
    createLangSwitch(langDiv);

    gallery.appendChild(textDiv);
}

/**
 * Añade listeners de scroll para mostrar/ocultar gradientes fade
 * cuando hay contenido arriba o abajo del scroll wrapper.
 */
function initScrollGradients(scrollEl) {
    const update = () => {
        const top = scrollEl.scrollTop;
        const bottom = scrollEl.scrollHeight - scrollEl.clientHeight - top;
        scrollEl.classList.toggle('can-scroll-up', top > 5);
        scrollEl.classList.toggle('can-scroll-down', bottom > 5);
    };

    scrollEl.addEventListener('scroll', update);

    // Comprobar estado inicial tras renderizado
    requestAnimationFrame(update);
}

/**
 * Gradúa el font-size del bloque de texto según la cantidad
 * de caracteres visibles (sin HTML tags).
 *
 * Rangos:
 *   < 200 chars  → 16px
 *   < 500 chars  → 15px
 *   < 1000 chars → 14px
 *   < 2000 chars → 13px
 *   ≥ 2000 chars → 12px
 */
function adjustTextSize(textDiv, textos) {
    // Extraer solo texto visible, sin tags HTML
    const totalChars = textos.reduce((sum, t) => {
        return sum + t.replace(/<[^>]*>/g, '').length;
    }, 0);

    let fontSize;
    if (totalChars < 200)       fontSize = 16;
    else if (totalChars < 500)  fontSize = 15;
    else if (totalChars < 1000) fontSize = 14;
    else if (totalChars < 2000) fontSize = 13;
    else                        fontSize = 12;

    textDiv.style.fontSize = fontSize + 'px';
}

/**
 * Devuelve el array de textos del idioma actual.
 * Fallback a español si el idioma seleccionado no tiene textos.
 */
function getTextsByLang(projectData) {
    return projectData['textos' + currentLang] || projectData.textosES || [];
}


// ============================================================================
// MENÚ DE NAVEGACIÓN (abajo izquierda)
//
// Lista de títulos de proyecto como links ancla (#proyecto).
// El proyecto visible se resalta con clase .active (scroll spy).
// ============================================================================

function setActiveProject(projectName) {
    document.querySelectorAll('#menu > a, #menu-active > a').forEach(a => {
        a.classList.toggle('active', a.dataset.project === projectName);
    });
}

function initMenu() {
    const menu = document.getElementById('menu');
    const menuActive = document.getElementById('menu-active');
    menu.innerHTML = '';
    menuActive.innerHTML = '';

    projectsData.proyectos.forEach(([projectName, projectData]) => {
        const titulo = projectData.titulo || projectName;

        const link = document.createElement('a');
        link.href = '#' + projectName;
        link.textContent = titulo;
        link.dataset.project = projectName;
        menu.appendChild(link);

        // Clon para la capa sin blend mode
        const linkActive = document.createElement('a');
        linkActive.href = '#' + projectName;
        linkActive.textContent = titulo;
        linkActive.dataset.project = projectName;
        menuActive.appendChild(linkActive);
    });

    // Click en proyecto activo → scroll a su bloque de texto
    [menu, menuActive].forEach(nav => {
        nav.addEventListener('click', e => {
            const a = e.target.closest('a');
            if (!a) return;
            if (a.classList.contains('active')) {
                e.preventDefault();
                const textBlock = document.querySelector(`.gallery-text[data-project="${a.dataset.project}"]`);
                if (textBlock) textBlock.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            }
        });
    });
}


// ============================================================================
// SCROLL SPY
//
// Observa qué proyecto está visible en el viewport y resalta
// su entrada en el menú con la clase .active.
// ============================================================================

function initScrollSpy() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveProject(entry.target.id);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.project').forEach(el => observer.observe(el));
}


// ============================================================================
// SELECTOR DE IDIOMA REUTILIZABLE (ES / EN / CAT)
//
// Componente que se puede instanciar en cualquier contenedor.
// Todas las instancias comparten el estado global currentLang.
// Al cambiar idioma en una instancia, se sincronizan todas.
// ============================================================================

/**
 * Crea un selector de idioma (ES/EN/CAT) dentro del contenedor dado.
 * Devuelve el contenedor para encadenamiento.
 */
function createLangSwitch(container) {
    container.innerHTML = '';
    ['ES', 'EN', 'CAT'].forEach(lang => {
        const span = document.createElement('span');
        span.textContent = lang;
        span.dataset.lang = lang;
        if (lang === currentLang) span.classList.add('active');
        container.appendChild(span);
    });

    container.addEventListener('click', e => {
        const span = e.target.closest('span[data-lang]');
        if (!span) return;

        const newLang = span.dataset.lang;
        if (newLang === currentLang) return;

        currentLang = newLang;

        // Sincronizar todas las instancias de .lang-switch
        syncAllLangSwitches();

        // Actualizar textos de galerías
        updateAllTexts();

        // Si el about está abierto, actualizar el contenido visible
        const overlay = document.getElementById('about-overlay');
        if (!overlay.classList.contains('hidden')) {
            renderAboutView();
        }
    });

    return container;
}

/**
 * Sincroniza el estado .active de todas las instancias .lang-switch.
 */
function syncAllLangSwitches() {
    document.querySelectorAll('.lang-switch span[data-lang]').forEach(s => {
        s.classList.toggle('active', s.dataset.lang === currentLang);
    });
}


// ============================================================================
// ACTUALIZACIÓN DE TEXTOS (al cambiar idioma)
//
// Recorre todos los bloques .gallery-text, busca sus datos
// en projectsData y reemplaza los párrafos con el idioma actual.
// ============================================================================

function updateAllTexts() {
    document.querySelectorAll('.gallery-text').forEach(textDiv => {
        const projectName = textDiv.dataset.project;
        const projectData = findProjectData(projectName);

        if (!projectData) return;

        // Operar dentro del scroll wrapper
        const scrollWrapper = textDiv.querySelector('.gallery-text-scroll');
        if (!scrollWrapper) return;

        // Preservar título, reemplazar solo los párrafos
        const title = scrollWrapper.querySelector('h2');
        scrollWrapper.innerHTML = '';
        scrollWrapper.appendChild(title);

        const textos = getTextsByLang(projectData);
        if (textos && textos.length > 0) {
            textos.forEach(texto => {
                const p = document.createElement('p');
                p.innerHTML = texto;
                scrollWrapper.appendChild(p);
            });
            adjustTextSize(scrollWrapper, textos);
        }

        // Resetear scroll y actualizar gradientes
        scrollWrapper.scrollTop = 0;
        requestAnimationFrame(() => {
            const top = scrollWrapper.scrollTop;
            const bottom = scrollWrapper.scrollHeight - scrollWrapper.clientHeight - top;
            scrollWrapper.classList.toggle('can-scroll-up', top > 5);
            scrollWrapper.classList.toggle('can-scroll-down', bottom > 5);
        });
    });

    // Sincronizar estado de todos los lang switches
    syncAllLangSwitches();
}

/**
 * Busca los datos de un proyecto por nombre.
 */
function findProjectData(name) {
    for (const [projName, projData] of projectsData.proyectos) {
        if (projName === name) return projData;
    }
    return null;
}


// ============================================================================
// ABOUT OVERLAY
//
// Al hacer click en "mokakopa" se abre un velo blanco semitransparente
// con statement/CV toggle, selector de idioma, contacto y footer.
// Se cierra con: botón ×, click fuera del contenido, o tecla Escape.
// ============================================================================

// Vista activa del about: 'statement' o 'cv'
let currentAboutView = 'statement';

function initAboutOverlay() {
    const siteName = document.getElementById('site-name');
    const overlay = document.getElementById('about-overlay');
    const closeBtn = document.getElementById('close-about');

    // Abrir
    siteName.addEventListener('click', () => {
        renderAboutContent();
        overlay.classList.remove('hidden');
        overlay.scrollTop = 0;
    });

    // Cerrar con botón ×
    closeBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    // Cerrar al hacer click fuera del contenido
    overlay.addEventListener('click', e => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            overlay.classList.add('hidden');
        }
    });

    // Toggle statement / CV
    const aboutSwitch = document.getElementById('about-switch');
    aboutSwitch.addEventListener('click', e => {
        const span = e.target.closest('span[data-view]');
        if (!span) return;

        const newView = span.dataset.view;
        if (newView === currentAboutView) return;

        currentAboutView = newView;

        // Actualizar estado activo del switch
        aboutSwitch.querySelectorAll('span').forEach(s => {
            s.classList.toggle('active', s.dataset.view === currentAboutView);
        });

        // Re-renderizar solo el contenido de texto
        renderAboutView();
    });

    // Crear selector de idioma en el about
    const langContainer = document.querySelector('#about-content .lang-switch');
    createLangSwitch(langContainer);
}

/**
 * Renderiza el about completo (título, subtítulo, contenido, contacto, footer).
 * Se llama al abrir el overlay.
 */
function renderAboutContent() {
    const aboutData = projectsData.about[0];

    // Título y subtítulo
    document.getElementById('about-title').textContent = aboutData.titulo;
    document.querySelector('.about-subtitle').textContent = aboutData.subtitulo;

    // Renderizar vista activa (statement o CV)
    renderAboutView();

    // Contacto
    renderContact();

    // Footer
    const footer = document.querySelector('#about-content .about-footer');
    footer.innerHTML = '<a href="https://meowrhino.studio" target="_blank" rel="noopener noreferrer">web:meowrhino</a>';

    // Sincronizar lang switch
    syncAllLangSwitches();
}

/**
 * Renderiza solo el contenido dinámico (statement o CV) según la vista activa.
 * Se llama al cambiar toggle o idioma. Transición smooth con fade.
 */
function renderAboutView() {
    const textDiv = document.getElementById('about-text');

    // Fade out, reemplazar contenido, fade in
    textDiv.style.opacity = '0';
    setTimeout(() => {
        textDiv.innerHTML = '';
        if (currentAboutView === 'statement') {
            renderStatement(textDiv);
        } else {
            renderCV(textDiv);
        }
        textDiv.style.opacity = '1';
    }, 300);
}

/**
 * Renderiza los párrafos del statement en el idioma actual.
 */
function renderStatement(container) {
    const aboutData = projectsData.about[0];
    const textos = getTextsByLang(aboutData);

    if (textos) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto;
            container.appendChild(p);
        });
    }
}

/**
 * Renderiza las secciones del CV desde data.json.
 */
function renderCV(container) {
    const cvData = projectsData.cv;
    if (!cvData) return;

    cvData.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'cv-section';

        // Título de la sección en el idioma actual
        const h3 = document.createElement('h3');
        h3.textContent = section['nombre' + currentLang] || section.nombreES;
        sectionDiv.appendChild(h3);

        // Lista de items
        const ul = document.createElement('ul');
        section.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = '<span class="cv-fecha">' + item.fecha + '</span> ' + item.titulo;
            ul.appendChild(li);
        });
        sectionDiv.appendChild(ul);

        container.appendChild(sectionDiv);
    });
}

/**
 * Renderiza la sección de contacto desde data.json.
 */
function renderContact() {
    const contacto = projectsData.contacto;
    if (!contacto) return;

    const contactDiv = document.getElementById('about-contact');
    contactDiv.innerHTML = '';

    const nombre = document.createElement('div');
    nombre.textContent = contacto.nombre;
    contactDiv.appendChild(nombre);

    const email = document.createElement('div');
    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:' + contacto.email;
    emailLink.textContent = contacto.email;
    email.appendChild(emailLink);
    contactDiv.appendChild(email);

    const ig = document.createElement('div');
    const igLink = document.createElement('a');
    igLink.href = 'https://www.instagram.com/' + contacto.instagram.replace('@', '');
    igLink.target = '_blank';
    igLink.rel = 'noopener noreferrer';
    igLink.textContent = contacto.instagram + ' (IG)';
    ig.appendChild(igLink);
    contactDiv.appendChild(ig);
}
