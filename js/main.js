// ============================================================================
// MAIN.JS — mokakopa
// Portfolio de proyectos artísticos de Monica Kopatschek
//
// Arquitectura:
//   - data.json contiene todos los proyectos, textos (ES/EN/CAT) y about
//   - Cada proyecto se renderiza como una sección fullscreen con scroll horizontal
//   - Las imágenes se prueban en orden: .jpg → .png → .jpeg → .webp → .gif
//   - El menú (abajo-izq) usa mix-blend-mode: difference (CSS)
//   - "mokakopa" (arriba-izq) abre el overlay del about
//   - Debajo de "mokakopa" están los 3 idiomas, el activo en negrita
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

        renderProjects();
        initMenu();
        initLanguageSelector();
        initAboutOverlay();
        initScrollSpy();
        initGlobalScrollbar();
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

    // Aplicar color de fondo si existe
    if (projectData.color) {
        projectDiv.style.backgroundColor = projectData.color;
    }

    const gallery = document.createElement('div');
    gallery.className = 'gallery';

    // Todos los proyectos son simples: secuencia de imágenes + bloque de texto
    addImagesToGallery(gallery, projectName, projectData.imgCount);
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
// Intenta cargar cada imagen como .jpg primero.
// Si falla, prueba .png → .jpeg → .webp → .gif en orden.
// Si ninguna funciona, oculta el item.
// ============================================================================

const IMG_EXTENSIONS = ['jpg', 'png', 'jpeg', 'webp', 'gif'];

function addImagesToGallery(gallery, path, count) {
    for (let i = 1; i <= count; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.alt = path + ' ' + i;
        img.loading = 'lazy';

        // Índice de extensión actual (empieza en 0 = jpg)
        let extIndex = 0;
        img.src = 'data/' + path + '/' + i + '.' + IMG_EXTENSIONS[extIndex];

        // ⭐ Marcar item como loaded cuando la imagen carga exitosamente
        img.onload = function() {
            item.classList.add('loaded');
        };

        img.onerror = function tryNext() {
            extIndex++;
            if (extIndex < IMG_EXTENSIONS.length) {
                img.onerror = tryNext; // reasignar antes de cambiar src
                img.src = 'data/' + path + '/' + i + '.' + IMG_EXTENSIONS[extIndex];
            } else {
                img.onerror = null;
                item.style.display = 'none';
            }
        };

        item.appendChild(img);
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

    // Título del proyecto (usa el campo titulo del JSON)
    const title = document.createElement('h2');
    title.textContent = projectData.titulo || projectName;
    textDiv.appendChild(title);

    // Párrafos de texto en el idioma actual
    const textos = getTextsByLang(projectData);
    if (textos && textos.length > 0) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto; // permite enlaces <a> dentro del texto
            textDiv.appendChild(p);
        });
        adjustTextSize(textDiv, textos);
    }

    gallery.appendChild(textDiv);
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

function initMenu() {
    const menu = document.getElementById('menu');
    menu.innerHTML = '';

    projectsData.proyectos.forEach(([projectName, projectData]) => {
        const link = document.createElement('a');
        link.href = '#' + projectName;
        link.textContent = projectData.titulo || projectName;
        link.dataset.project = projectName;
        
        // Asignar color de fondo del proyecto
        if (projectData.color) {
            link.style.color = projectData.color;
        }
        
        menu.appendChild(link);
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
                const activeId = entry.target.id;
                document.querySelectorAll('#menu > a').forEach(a => {
                    a.classList.toggle('active', a.dataset.project === activeId);
                });
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.project').forEach(el => observer.observe(el));
}


// ============================================================================
// SELECTOR DE IDIOMA (ES / EN / CAT)
//
// Los 3 idiomas aparecen debajo de "mokakopa" en el header.
// El idioma activo se muestra en negrita (clase .active).
// Al cambiar de idioma se actualizan todos los textos visibles
// y el about si está abierto.
// ============================================================================

function initLanguageSelector() {
    const selector = document.getElementById('language-selector');

    selector.addEventListener('click', e => {
        const span = e.target.closest('span[data-lang]');
        if (!span) return;

        const newLang = span.dataset.lang;
        if (newLang === currentLang) return;

        currentLang = newLang;

        // Actualizar negrita en el selector
        selector.querySelectorAll('span').forEach(s => {
            s.classList.toggle('active', s.dataset.lang === currentLang);
        });

        // Actualizar textos de todas las galerías
        updateAllTexts();

        // Si el about está abierto, actualizar también
        const overlay = document.getElementById('about-overlay');
        if (!overlay.classList.contains('hidden')) {
            renderAboutContent();
        }
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

        // Preservar el título, reemplazar solo los párrafos
        const title = textDiv.querySelector('h2');
        textDiv.innerHTML = '';
        textDiv.appendChild(title);

        const textos = getTextsByLang(projectData);
        if (textos && textos.length > 0) {
            textos.forEach(texto => {
                const p = document.createElement('p');
                p.innerHTML = texto;
                textDiv.appendChild(p);
            });
            adjustTextSize(textDiv, textos);
        }
    });
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
// con el texto del about en el idioma actual.
// Se cierra con: botón ×, click fuera del contenido, o tecla Escape.
// ============================================================================

function initAboutOverlay() {
    const siteName = document.getElementById('site-name');
    const overlay = document.getElementById('about-overlay');
    const closeBtn = document.getElementById('close-about');

    // Abrir
    siteName.addEventListener('click', () => {
        renderAboutContent();
        overlay.classList.remove('hidden');
        overlay.scrollTop = 0; // ⭐ resetear scroll al principio
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
}

/**
 * Renderiza el contenido del about con el idioma actual.
 * Mantiene el <h2> y .about-subtitle, reemplaza los párrafos.
 */
function renderAboutContent() {
    const aboutData = projectsData.about[0];
    const content = document.getElementById('about-content');

    // Título y subtítulo
    content.querySelector('#about-title').textContent = aboutData.titulo;
    content.querySelector('.about-subtitle').textContent = aboutData.subtitulo;

    // Limpiar párrafos y footer anteriores (preservar título y subtítulo)
    content.querySelectorAll('p:not(.about-subtitle)').forEach(p => p.remove());
    content.querySelectorAll('.about-footer').forEach(f => f.remove());

    // Añadir párrafos del idioma actual
    const textos = getTextsByLang(aboutData);
    if (textos) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto;
            content.appendChild(p);
        });
    }

    // Añadir link pequeño al final
    const footer = document.createElement('div');
    footer.className = 'about-footer';
    footer.innerHTML = '<a href="https://meowrhino.studio" target="_blank" rel="noopener noreferrer">web:meowrhino</a>';
    content.appendChild(footer);
}


// ============================================================================
// BARRA DE NAVEGACIÓN GLOBAL
//
// Una única barra fija en el bottom center que se actualiza dinámicamente
// según el proyecto activo. Permite navegar entre las imágenes del proyecto
// actual mediante drag o click.
// ============================================================================

function initGlobalScrollbar() {
    const track = document.getElementById('global-scrollbar-track');
    const thumb = document.getElementById('global-scrollbar-thumb');
    
    let currentGallery = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartLeft = 0;

    // Función para actualizar el thumb según el scroll de la galería activa
    const updateThumb = () => {
        if (!currentGallery) {
            track.style.display = 'none';
            return;
        }

        const scrollW = currentGallery.scrollWidth;
        const clientW = currentGallery.clientWidth;
        
        if (scrollW <= clientW) {
            // Todo el contenido cabe en pantalla, ocultar scrollbar
            track.style.display = 'none';
            return;
        }
        
        track.style.display = '';
        
        // Ratio: cuánto del contenido total es visible
        const ratio = clientW / scrollW;
        const thumbWidth = Math.max(30, ratio * track.offsetWidth);
        thumb.style.width = thumbWidth + 'px';
        
        // Posición del thumb dentro del track
        const maxScroll = scrollW - clientW;
        const maxThumbLeft = track.offsetWidth - thumbWidth;
        const pct = maxScroll > 0 ? currentGallery.scrollLeft / maxScroll : 0;
        thumb.style.left = (pct * maxThumbLeft) + 'px';
    };

    // Observar qué proyecto está visible y actualizar la galería activa
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const projectDiv = entry.target;
                const gallery = projectDiv.querySelector('.gallery');
                
                // Remover listener del anterior
                if (currentGallery) {
                    currentGallery.removeEventListener('scroll', updateThumb);
                }
                
                // Actualizar galería activa
                currentGallery = gallery;
                
                // Añadir listener al nuevo
                if (currentGallery) {
                    currentGallery.addEventListener('scroll', updateThumb);
                    updateThumb();
                }
            }
        });
    }, { threshold: 0.5 });

    // Observar todos los proyectos
    document.querySelectorAll('.project').forEach(el => observer.observe(el));

    // Recalcular al resize
    window.addEventListener('resize', updateThumb);

    // --- Drag del thumb ---
    thumb.addEventListener('mousedown', e => {
        if (!currentGallery) return;
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartLeft = parseFloat(thumb.style.left) || 0;
        thumb.classList.add('dragging');
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging || !currentGallery) return;
        const dx = e.clientX - dragStartX;
        const thumbWidth = thumb.offsetWidth;
        const maxThumbLeft = track.offsetWidth - thumbWidth;
        const newLeft = Math.max(0, Math.min(maxThumbLeft, dragStartLeft + dx));
        const pct = maxThumbLeft > 0 ? newLeft / maxThumbLeft : 0;
        currentGallery.scrollLeft = pct * (currentGallery.scrollWidth - currentGallery.clientWidth);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            thumb.classList.remove('dragging');
        }
    });

    // --- Click en el track (fuera del thumb) para saltar ---
    track.addEventListener('click', e => {
        if (!currentGallery || e.target === thumb) return;
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;
        currentGallery.scrollLeft = pct * (currentGallery.scrollWidth - currentGallery.clientWidth);
    });

    // --- Touch support ---
    thumb.addEventListener('touchstart', e => {
        if (!currentGallery) return;
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartLeft = parseFloat(thumb.style.left) || 0;
        thumb.classList.add('dragging');
    }, { passive: true });

    window.addEventListener('touchmove', e => {
        if (!isDragging || !currentGallery) return;
        const dx = e.touches[0].clientX - dragStartX;
        const thumbWidth = thumb.offsetWidth;
        const maxThumbLeft = track.offsetWidth - thumbWidth;
        const newLeft = Math.max(0, Math.min(maxThumbLeft, dragStartLeft + dx));
        const pct = maxThumbLeft > 0 ? newLeft / maxThumbLeft : 0;
        currentGallery.scrollLeft = pct * (currentGallery.scrollWidth - currentGallery.clientWidth);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            thumb.classList.remove('dragging');
        }
    });
}
