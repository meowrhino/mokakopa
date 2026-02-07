// ============================================================================
// MAIN.JS - mokakopa
// ============================================================================

// Estado global de la aplicación
let currentLang = 'ES';
let projectsData = null;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
async function init() {
    console.log('Inicializando mokakopa...');
    
    try {
        // Cargar datos de proyectos
        const response = await fetch('data.json');
        projectsData = await response.json();
        console.log('Datos cargados:', projectsData);
        
        // Renderizar proyectos
        renderProjects();
        
        // Inicializar menú
        initMenu();
        
        // Inicializar botón de idioma
        initLanguageToggle();
        
        // Inicializar about modal
        initAboutModal();
        
        console.log('✓ Inicialización completa');
    } catch (error) {
        console.error('Error al inicializar:', error);
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
        // Proyecto simple: imágenes + texto
        addImagesToGallery(gallery, projectName, projectData.imgCount);
        addTextToGallery(gallery, projectName, projectData);
    } else if (projectData.tipo === 'complejo') {
        // Proyecto complejo: [imgs sub1] [texto sub1] [imgs sub2] [texto sub2] ... [texto general]
        projectData.subproyectos.forEach(([subName, subData]) => {
            const subImgCount = projectData.imgCount[subName];
            addImagesToGallery(gallery, `${projectName}/${subName}`, subImgCount);
            // Texto del subproyecto (si existe)
            if (subData.textosES && subData.textosES.length > 0) {
                addTextToGallery(gallery, subName, subData);
            }
        });
        // Texto general al final
        addTextToGallery(gallery, projectName, projectData);
    }
    
    projectDiv.appendChild(gallery);
    return projectDiv;
}

function addImagesToGallery(gallery, path, count) {
    for (let i = 1; i <= count; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = `data/${path}/${i}.jpg`;
        img.alt = `${path} ${i}`;
        img.loading = 'lazy';
        
        // Manejo de errores de carga
        img.onerror = function() {
            // Intentar con otras extensiones
            const extensions = ['png', 'jpeg', 'webp', 'gif'];
            let extIndex = 0;
            
            const tryNextExtension = () => {
                if (extIndex < extensions.length) {
                    img.src = `data/${path}/${i}.${extensions[extIndex]}`;
                    extIndex++;
                } else {
                    console.warn(`No se pudo cargar imagen: ${path}/${i}`);
                    item.style.display = 'none';
                }
            };
            
            img.onerror = tryNextExtension;
            tryNextExtension();
        };
        
        item.appendChild(img);
        gallery.appendChild(item);
    }
}

function addTextToGallery(gallery, projectName, projectData) {
    const textDiv = document.createElement('div');
    textDiv.className = 'gallery-text';
    textDiv.dataset.project = projectName;
    
    // Título
    const title = document.createElement('h2');
    title.textContent = projectName;
    textDiv.appendChild(title);
    
    // Obtener textos según idioma actual
    const textos = getTextsByLang(projectData);
    
    if (textos && textos.length > 0) {
        textos.forEach(texto => {
            const p = document.createElement('p');
            p.innerHTML = texto; // Permite enlaces HTML
            textDiv.appendChild(p);
        });
    }
    
    gallery.appendChild(textDiv);
}

function getTextsByLang(projectData) {
    const langKey = `textos${currentLang}`;
    return projectData[langKey] || projectData.textosES || [];
}

// ============================================================================
// MENÚ DE NAVEGACIÓN
// ============================================================================
function initMenu() {
    const menu = document.getElementById('menu');
    menu.innerHTML = '';
    
    projectsData.proyectos.forEach(([projectName, projectData]) => {
        const link = document.createElement('a');
        link.href = `#${projectName}`;
        link.textContent = projectName;
        menu.appendChild(link);
    });
}

// ============================================================================
// CAMBIO DE IDIOMA
// ============================================================================
function initLanguageToggle() {
    const toggle = document.getElementById('language-toggle');
    
    toggle.addEventListener('click', () => {
        // Alternar entre ES y EN
        currentLang = currentLang === 'ES' ? 'EN' : 'ES';
        
        // Animación simple de cambio
        toggle.style.opacity = '0';
        setTimeout(() => {
            toggle.textContent = currentLang;
            toggle.style.opacity = '1';
        }, 150);
        
        // Actualizar textos de todos los proyectos
        updateAllTexts();
    });
}

function updateAllTexts() {
    const allTexts = document.querySelectorAll('.gallery-text');
    
    allTexts.forEach(textDiv => {
        const projectName = textDiv.dataset.project;
        
        // Buscar datos del proyecto
        let projectData = null;
        
        // Buscar en proyectos principales
        for (const [name, data] of projectsData.proyectos) {
            if (name === projectName) {
                projectData = data;
                break;
            }
            // Buscar en subproyectos
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
            // Limpiar contenido excepto el título
            const title = textDiv.querySelector('h2');
            textDiv.innerHTML = '';
            textDiv.appendChild(title);
            
            // Añadir textos actualizados
            const textos = getTextsByLang(projectData);
            if (textos && textos.length > 0) {
                textos.forEach(texto => {
                    const p = document.createElement('p');
                    p.innerHTML = texto;
                    textDiv.appendChild(p);
                });
            }
        }
    });
}

// ============================================================================
// ABOUT MODAL
// ============================================================================
function initAboutModal() {
    const siteName = document.getElementById('site-name');
    const modal = document.getElementById('about-modal');
    const closeBtn = document.getElementById('close-about');
    
    siteName.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// ============================================================================
// INICIAR APLICACIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', init);
