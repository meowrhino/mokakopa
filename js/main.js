// ============================================================================
// MAIN.JS - mokakopa
// ============================================================================

let currentLang = 'ES';
let projectsData = null;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        projectsData = await response.json();

        renderProjects();
        initMenu();
        initLanguageSelector();
        initAboutOverlay();
        initScrollSpy();
    } catch (error) {
        console.error('Error al inicializar:', error);
        document.getElementById('projects-container').innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;padding:20px;text-align:center;">
                <h1>error al cargar mokakopa</h1>
                <p>no se pudieron cargar los datos. por favor, recarga la página.</p>
                <p style="color:#666;font-size:14px;margin-top:20px;">error: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================================================
// RENDERIZADO DE PROYECTOS
// ============================================================================
function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    projectsData.proyectos.forEach(([projectName, projectData]) => {
        const projectDiv = createProjectElement(projectName, projectData);
        container.appendChild(projectDiv);
    });
}

function createProjectElement(projectName, projectData) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project';
    projectDiv.id = projectName;

    const gallery = document.createElement('div');
    gallery.className = 'gallery';

    if (projectData.tipo === 'simple') {
        addImagesToGallery(gallery, projectName, projectData.imgCount);
        addTextToGallery(gallery, projectName, projectData);
    } else if (projectData.tipo === 'complejo') {
        projectData.subproyectos.forEach(([subName, subData]) => {
            const subImgCount = projectData.imgCount[subName];
            addImagesToGallery(gallery, `${projectName}/${subName}`, subImgCount);
            const subTextos = getTextsByLang(subData);
            if (subTextos && subTextos.length > 0) {
                addTextToGallery(gallery, subName, subData);
            }
        });
        addTextToGallery(gallery, projectName, projectData);
    }

    projectDiv.appendChild(gallery);

    // Calcular padding-left para centrar la primera imagen una vez cargada
    setupFirstImageCentering(gallery);

    return projectDiv;
}

// ============================================================================
// CENTRADO DINÁMICO DE PRIMERA IMAGEN
// ============================================================================
function setupFirstImageCentering(gallery) {
    const firstImg = gallery.querySelector('.gallery-item img');
    if (!firstImg) return;

    const applyPadding = () => {
        const viewportW = window.innerWidth;
        const imgW = firstImg.offsetWidth;
        // Centrar la imagen: padding = mitad del viewport menos mitad del ancho de la imagen
        const padding = Math.max(20, (viewportW - imgW) / 2);
        gallery.style.paddingLeft = padding + 'px';
        // Para la última imagen/texto, padding derecho generoso
        gallery.style.paddingRight = padding + 'px';
    };

    if (firstImg.complete && firstImg.naturalWidth > 0) {
        applyPadding();
    } else {
        firstImg.addEventListener('load', applyPadding);
    }

    // Recalcular al redimensionar
    window.addEventListener('resize', applyPadding);
}

// ============================================================================
// IMÁGENES
// ============================================================================
function addImagesToGallery(gallery, path, count) {
    for (let i = 1; i <= count; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = `data/${path}/${i}.jpg`;
        img.alt = `${path} ${i}`;
        img.loading = 'lazy';

        const extensions = ['png', 'jpeg', 'webp', 'gif'];
        let extIndex = 0;

        const tryNextExtension = () => {
            if (extIndex < extensions.length) {
                img.onerror = tryNextExtension;
                img.src = `data/${path}/${i}.${extensions[extIndex]}`;
                extIndex++;
            } else {
                img.onerror = null;
                item.style.display = 'none';
            }
        };

        img.onerror = tryNextExtension;

        item.appendChild(img);
        gallery.appendChild(item);
    }
}

// ============================================================================
// TEXTO CON TAMAÑO ADAPTATIVO
// ============================================================================
function addTextToGallery(gallery, projectName, projectData) {
    const textDiv = document.createElement('div');
    textDiv.className = 'gallery-text';
    textDiv.dataset.project = projectName;

    const title = document.createElement('h2');
    title.textContent = projectName;
    textDiv.appendChild(title);

    const textos = getTextsByLang(projectData);

    if (textos && textos.length > 0) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto;
            textDiv.appendChild(p);
        });

        // Ajustar tamaño de fuente según cantidad de texto
        adjustTextSize(textDiv, textos);
    }

    gallery.appendChild(textDiv);
}

function adjustTextSize(textDiv, textos) {
    // Calcular cantidad total de caracteres
    const totalChars = textos.reduce((sum, t) => sum + t.length, 0);

    // Graduar tamaño: textos cortos más grandes, textos largos más pequeños
    let fontSize;
    if (totalChars < 200) {
        fontSize = 16;
    } else if (totalChars < 500) {
        fontSize = 15;
    } else if (totalChars < 1000) {
        fontSize = 14;
    } else if (totalChars < 2000) {
        fontSize = 13;
    } else {
        fontSize = 12;
    }

    textDiv.style.fontSize = fontSize + 'px';
}

function getTextsByLang(projectData) {
    const langKey = `textos${currentLang}`;
    return projectData[langKey] || projectData.textosES || [];
}

// ============================================================================
// MENÚ DE NAVEGACIÓN (ABAJO IZQUIERDA)
// ============================================================================
function initMenu() {
    const menu = document.getElementById('menu');
    menu.innerHTML = '';

    projectsData.proyectos.forEach(([projectName, projectData]) => {
        const link = document.createElement('a');
        link.href = `#${projectName}`;
        link.textContent = projectName;
        link.dataset.project = projectName;
        menu.appendChild(link);

        // Si tiene subproyectos, mostrarlos indentados
        if (projectData.tipo === 'complejo' && projectData.subproyectos) {
            const submenu = document.createElement('div');
            submenu.className = 'submenu';
            projectData.subproyectos.forEach(([subName]) => {
                const subLink = document.createElement('a');
                subLink.href = `#${projectName}`;
                subLink.textContent = subName;
                submenu.appendChild(subLink);
            });
            menu.appendChild(submenu);
        }
    });
}

// ============================================================================
// SCROLL SPY - resaltar proyecto actual en el menú
// ============================================================================
function initScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('#menu a').forEach(a => {
                    a.classList.toggle('active', a.dataset.project === id);
                });
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.project').forEach(p => observer.observe(p));
}

// ============================================================================
// SELECTOR DE IDIOMA (ES / EN / CAT debajo de mokakopa)
// ============================================================================
function initLanguageSelector() {
    const selector = document.getElementById('language-selector');

    selector.addEventListener('click', (e) => {
        const span = e.target.closest('span[data-lang]');
        if (!span) return;

        const newLang = span.dataset.lang;
        if (newLang === currentLang) return;

        currentLang = newLang;

        // Actualizar clases activas
        selector.querySelectorAll('span').forEach(s => {
            s.classList.toggle('active', s.dataset.lang === currentLang);
        });

        // Actualizar textos
        updateAllTexts();

        // Actualizar about si está abierto
        const overlay = document.getElementById('about-overlay');
        if (!overlay.classList.contains('hidden')) {
            renderAboutContent();
        }
    });
}

// ============================================================================
// ACTUALIZAR TEXTOS
// ============================================================================
function updateAllTexts() {
    const allTexts = document.querySelectorAll('.gallery-text');

    allTexts.forEach(textDiv => {
        const projectName = textDiv.dataset.project;
        let projectData = null;

        for (const [name, data] of projectsData.proyectos) {
            if (name === projectName) {
                projectData = data;
                break;
            }
            if (data.subproyectos) {
                for (const [subName, subData] of data.subproyectos) {
                    if (subName === projectName) {
                        projectData = subData;
                        break;
                    }
                }
            }
        }

        if (projectData) {
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
        }
    });
}

// ============================================================================
// ABOUT OVERLAY
// ============================================================================
function initAboutOverlay() {
    const siteName = document.getElementById('site-name');
    const overlay = document.getElementById('about-overlay');
    const closeBtn = document.getElementById('close-about');

    siteName.addEventListener('click', () => {
        renderAboutContent();
        overlay.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            overlay.classList.add('hidden');
        }
    });
}

function renderAboutContent() {
    const aboutData = projectsData.about[0];
    const content = document.getElementById('about-content');

    const title = content.querySelector('#about-title');
    const subtitle = content.querySelector('.about-subtitle');

    title.textContent = aboutData.titulo;
    subtitle.textContent = aboutData.subtitulo;

    // Limpiar párrafos anteriores (mantener título y subtítulo)
    const existingPs = content.querySelectorAll('p:not(.about-subtitle)');
    existingPs.forEach(p => p.remove());

    const textos = getTextsByLang(aboutData);
    if (textos) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto;
            content.appendChild(p);
        });
    }
}

// ============================================================================
// INICIAR
// ============================================================================
document.addEventListener('DOMContentLoaded', init);
