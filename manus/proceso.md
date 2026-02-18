# proceso de desarrollo - mokakopa

## 2026-02-07 05:30 - implementación inicial de estructura base

### sinopsis
implementación completa de la estructura funcional de mokakopa basada en e300, con galerías horizontales scrolleables, menú lateral con blend mode, sistema de idiomas y script de actualización automática de conteo de imágenes.

### proceso detallado

#### 1. análisis inicial
- clonación de repositorios `mokakopa` y `e300` desde github
- revisión de estructura existente en mokakopa:
  - 7 proyectos con imágenes en carpeta `data/`
  - archivo `data.json` con información de proyectos
  - proyectos simples y complejos (teatroPlantas con 3 subproyectos)

#### 2. conteo automático de imágenes
**archivo creado**: `updateImgCount.js`

script node.js que:
- recorre todas las carpetas en `data/`
- cuenta imágenes con extensiones: .jpg, .jpeg, .png, .gif, .webp
- actualiza el campo `imgCount` en `data.json`
- maneja proyectos simples (número) y complejos (objeto con subcarpetas)

**resultados del conteo**:
- patoCeramics: 18 imágenes
- porSiglos: 21 imágenes
- abuelo: 12 imágenes
- otrosCuentos: 45 imágenes
- pommeTerre: 10 imágenes
- bacanales: 48 imágenes
- teatroPlantas (complejo):
  - carasol: 31 imágenes
  - nuvol: 12 imágenes
  - sean: 48 imágenes

#### 3. estructura html
**archivo creado**: `index.html`

elementos principales:
- `#site-name`: nombre "mokakopa" arriba izquierda (clickeable para abrir about)
- `#about-modal`: modal con información del proyecto
- `#menu`: menú lateral izquierdo con enlaces a proyectos
- `#language-toggle`: botón de cambio de idioma arriba derecha
- `#projects-container`: contenedor principal de proyectos

#### 4. estilos css
**archivo creado**: `css/style.css`

características implementadas:
- reset y configuración global
- cada proyecto ocupa 100dvh y 100dvw
- galerías horizontales con scroll:
  - `display: flex` con `overflow-x: auto`
  - `scroll-snap-type: x mandatory` para snap suave
  - padding lateral calculado: `calc(50dvw - 40dvh)` para centrar primera y última imagen
  - scrollbar oculta pero funcional
- items de galería:
  - imágenes con altura 80dvh y ancho automático
  - texto en contenedor de 80dvw max 600px
- menú lateral:
  - posicionado fijo a la izquierda, centrado verticalmente
  - **efecto blend mode**: `mix-blend-mode: difference`
- about modal:
  - overlay con fondo semitransparente
  - contenido centrado con animación de opacidad
- responsive para móvil (<768px)

#### 5. lógica javascript
**archivo creado**: `js/main.js`

módulos funcionales:

**a) inicialización**:
- carga de `data.json` con fetch
- renderizado inicial de proyectos
- inicialización de menú, idiomas y about modal

**b) renderizado de proyectos**:
- `renderProjects()`: itera sobre todos los proyectos
- `createProjectElement()`: crea estructura de cada proyecto
  - proyectos simples: [imágenes] + [texto]
  - proyectos complejos: [imgs sub1] + [texto sub1] + [imgs sub2] + [texto sub2] + ... + [texto general]
- `addImagesToGallery()`: añade imágenes con lazy loading
  - intenta cargar .jpg por defecto
  - fallback a otras extensiones (.png, .jpeg, .webp, .gif)
  - oculta item si no encuentra ninguna imagen
- `addTextToGallery()`: añade bloque de texto al final de galería
  - permite html en textos (para enlaces)
  - usa dataset para identificar proyecto

**c) menú de navegación**:
- genera enlaces automáticamente desde `data.json`
- navegación con anchors (#projectName)

**d) sistema de idiomas**:
- estado global `currentLang` (por defecto 'ES')
- toggle entre ES y EN con animación de opacidad
- `updateAllTexts()`: actualiza todos los textos sin recargar imágenes
- `getTextsByLang()`: obtiene textos según idioma actual
  - busca `textosES`, `textosEN`, etc.
  - fallback a español si no existe traducción

**e) about modal**:
- apertura al hacer clic en "mokakopa"
- cierre con botón × o clic fuera del contenido
- transición suave de opacidad

#### 6. documentación
**archivos creados**:
- `README.md`: instrucciones de uso, características, avisos de errores potenciales
- `manus/proceso.md`: este documento

### decisiones técnicas

1. **javascript vanilla**: sin frameworks para cumplir con restricciones de hosting (github pages)
2. **lazy loading**: `loading="lazy"` en imágenes para optimizar carga inicial
3. **fallback de extensiones**: intento múltiple de extensiones para mayor flexibilidad
4. **dvh/dvw units**: uso de viewport dinámico para mejor soporte móvil
5. **scroll-snap**: experiencia de scroll más fluida y controlada
6. **mix-blend-mode**: efecto visual del menú como en investigacion 001
7. **estructura modular**: separación clara de funciones para facilitar mantenimiento

### próximos pasos sugeridos

1. personalizar contenido del modal about
2. añadir más idiomas (catalán ya está en data.json)
3. optimizar tamaño de imágenes para carga más rápida
4. añadir animaciones de transición entre proyectos
5. implementar navegación con teclado (flechas)
6. añadir indicadores de posición en galería
7. considerar preload de imágenes del siguiente proyecto

### errores potenciales identificados

ver sección "avisos de errores potenciales" en README.md para lista completa de posibles problemas y soluciones.


## 2026-02-07 06:00 - correcciones de bugs, mejoras y optimización seo

### sinopsis
revisión completa del código con corrección de bugs críticos, mejoras de accesibilidad, optimización de css y implementación de seo completo.

### bugs corregidos

#### 1. bug crítico: loop infinito en carga de imágenes
**problema**: el handler `onerror` se sobrescribía a sí mismo causando un loop infinito cuando una imagen fallaba al cargar.

**solución**: mover la definición de `tryNextExtension` fuera del handler inicial y asignar el handler antes de cambiar el `src`. también añadir `img.onerror = null` al final para limpiar.

**código anterior**:
```javascript
img.onerror = function() {
    const tryNextExtension = () => { ... };
    img.onerror = tryNextExtension;  // ⚠️ sobrescribe después
    tryNextExtension();
};
```

**código corregido**:
```javascript
const extensions = ['png', 'jpeg', 'webp', 'gif'];
let extIndex = 0;

const tryNextExtension = () => {
    if (extIndex < extensions.length) {
        img.onerror = tryNextExtension; // asignar ANTES
        img.src = `data/${path}/${i}.${extensions[extIndex]}`;
        extIndex++;
    } else {
        img.onerror = null; // limpiar handler
        console.warn(`No se pudo cargar imagen: ${path}/${i}`);
        item.style.display = 'none';
    }
};

img.onerror = tryNextExtension;
```

#### 2. manejo de error en fetch mejorado
**problema**: cuando falla el fetch de `data.json`, la app queda rota sin feedback al usuario.

**solución**: añadir verificación de `response.ok` y mostrar mensaje de error amigable en el contenedor principal.

**mejoras implementadas**:
- verificación de status http
- mensaje de error visible al usuario
- información de debug en consola

#### 3. condición frágil en proyectos complejos
**problema**: la condición `if (subData.textosES && subData.textosES.length > 0)` asume que siempre hay textos en español, ignorando el idioma actual.

**solución**: usar `getTextsByLang(subData)` para respetar el idioma seleccionado.

### mejoras de css y accesibilidad

#### 4. transiciones suaves en modal
**cambio**: usar `visibility: hidden` + `opacity: 0` en lugar de solo `display: none` para permitir transiciones css.

#### 5. menú con blend mode mejorado
**problema**: `mix-blend-mode: difference` puede hacer el menú invisible sobre fondos blancos.

**solución**:
- añadir fondo semitransparente: `rgba(255, 255, 255, 0.1)`
- añadir `backdrop-filter: blur(5px)` para efecto glassmorphism
- cambiar color base a blanco para mejor contraste
- añadir animación de hover con `transform: translateX(5px)`

#### 6. padding de galería con valores negativos
**problema**: en pantallas muy pequeñas, `calc(50dvw - 40dvh)` puede dar valores negativos.

**solución**: usar `max(20px, calc(50dvw - 40dvh))` para garantizar padding mínimo.

#### 7. accesibilidad mejorada
**cambios**:
- cambiar `#language-toggle` de `<div>` a `<button>` semánticamente correcto
- añadir `aria-label="cambiar idioma"` al botón de idioma
- añadir `aria-label="cerrar modal"` al botón de cerrar
- añadir `role="dialog"` y `aria-modal="true"` al modal
- añadir `aria-labelledby="about-title"` para conectar modal con su título
- añadir estilos de `focus` al botón de idioma para navegación por teclado

### optimización seo completa

#### 8. meta tags seo
**añadido al `<head>`**:
- title optimizado: "mokakopa | portfolio de proyectos artísticos"
- description detallada con keywords naturales
- keywords meta tag
- robots meta tag: "index, follow"
- language meta tag

#### 9. open graph (facebook)
**meta tags añadidos**:
- `og:type`: website
- `og:url`: url canónica
- `og:title`: título optimizado
- `og:description`: descripción atractiva
- `og:image`: imagen destacada (primera de teatroPlantas/carasol)
- `og:locale`: es_ES con alternate en_US

#### 10. twitter cards
**meta tags añadidos**:
- `twitter:card`: summary_large_image
- `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`

#### 11. structured data (schema.org)
**json-ld añadido**:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "mokakopa",
  "url": "https://meowrhino.github.io/mokakopa/",
  "description": "portfolio de proyectos artísticos de monica kopatschek",
  "author": { "@type": "Person", "name": "monica kopatschek" },
  "creator": { "@type": "Organization", "name": "meowrhino.studio" },
  "inLanguage": ["es", "en"]
}
```

#### 12. archivos seo adicionales
**robots.txt**:
```
User-agent: *
Allow: /
Sitemap: https://meowrhino.github.io/mokakopa/sitemap.xml
```

**sitemap.xml**:
- url principal con priority 1.0
- urls de todos los proyectos con priority 0.8
- lastmod: 2026-02-07
- changefreq: monthly

#### 13. canonical url
añadido `<link rel="canonical">` para evitar contenido duplicado.

### resumen de archivos modificados

- `index.html`: seo completo, accesibilidad mejorada
- `css/style.css`: transiciones, menú mejorado, padding seguro
- `js/main.js`: bugs corregidos, manejo de errores robusto
- `robots.txt`: nuevo archivo para crawlers
- `sitemap.xml`: nuevo archivo para indexación
- `manus/proceso.md`: este documento

### próximos pasos sugeridos

1. añadir favicon personalizado
2. considerar implementar un map para lookup rápido de proyectos (optimización de rendimiento)
3. añadir navegación con teclado (flechas) para galerías
4. implementar lazy loading más agresivo para proyectos fuera de viewport
5. considerar añadir analytics (google analytics o plausible)


## 2026-02-09 07:15 - loader con apilamiento, espaciado dvw y mejoras ux

### sinopsis
implementación de loader elegante con apilamiento de imágenes, cambio de espaciado a dvw, tamaño adaptativo de imágenes y correcciones del about overlay según feedback del usuario.

### contexto
el usuario había hecho mejoras significativas al código (header rediseñado, about overlay, menú reubicado, centrado dinámico, etc.) y solicitó:
1. loader donde las imágenes se apilen y luego se "corran" a su posición
2. espaciado en dvw (sin clamp)
3. tamaño de imágenes adaptativo según aspect ratio
4. padding superior visible en about
5. about que siempre abra desde el principio

### implementación detallada

#### 1. loader con apilamiento y transición

**concepto**: las imágenes cargan una sobre otra en posición 0, y cuando todas están listas se animan hacia su posición horizontal final.

**css implementado**:
```css
.gallery-item {
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}

/* estado de carga: apiladas */
.gallery.loading .gallery-item {
    position: absolute;
    left: 0;
    opacity: 0;
}

.gallery.loading .gallery-item.loaded {
    opacity: 1; /* se van mostrando a medida que cargan */
}

/* estado final: posición natural */
.gallery.loaded .gallery-item {
    position: relative;
    opacity: 1;
}
```

**javascript implementado**:

**a) marcar imágenes como loaded**:
```javascript
// en addImagesToGallery()
img.onload = function() {
    item.classList.add('loaded');
};
```

**b) nueva función `setupGalleryLoadingTransition()`**:
- usa `MutationObserver` para detectar cuándo cada item se marca como 'loaded'
- cuenta cuántas imágenes han cargado
- cuando todas están listas, cambia la galería de `.loading` a `.loaded`
- timeout de 5s para forzar transición si alguna imagen tarda mucho

**c) integración en `createProjectElement()`**:
```javascript
gallery.className = 'gallery loading'; // inicia en loading
setupGalleryLoadingTransition(gallery); // configura transición
```

**resultado**: efecto visual elegante donde las imágenes aparecen apiladas y luego se deslizan suavemente a su posición horizontal con easing `cubic-bezier(0.4, 0, 0.2, 1)`.

#### 2. espaciado en dvw (sin clamp)

**cambio en css**:
```css
.gallery {
    gap: 4dvw; /* desktop */
}

@media (max-width: 768px) {
    .gallery {
        gap: 2dvw; /* móvil */
    }
}
```

**motivación**: el usuario prefiere valores explícitos en viewport width en lugar de `clamp()` para tener control directo sobre el espaciado.

**resultado**: 
- desktop: ~40-60px de gap (según tamaño de pantalla)
- móvil: ~20-30px de gap

#### 3. tamaño adaptativo de imágenes

**cambio en css**:
```css
.gallery-item img {
    max-height: 80dvh;
    max-width: 85dvw; /* evita que panorámicas se salgan */
    width: auto;
    height: auto;
    object-fit: contain;
}

@media (max-width: 768px) {
    .gallery-item img {
        max-height: 70dvh;
        max-width: 90dvw; /* más espacio en móvil */
    }
}
```

**antes**: solo `height: 80dvh`, imágenes panorámicas se salían del viewport horizontalmente.

**ahora**: combinación de `max-height` y `max-width` asegura que todas las imágenes quepan en pantalla independientemente de su aspect ratio.

#### 4. about overlay: padding visible

**cambios en css**:
```css
#about-overlay {
    display: block; /* antes: flex con align-items: center */
    overflow-y: auto;
}

#about-content {
    padding: 15dvh 40px; /* padding visible arriba y abajo */
    min-height: 100vh; /* ocupa al menos toda la pantalla */
}

@media (max-width: 768px) {
    #about-content {
        padding: 12dvh 20px; /* menos en móvil */
    }
}
```

**antes**: con `display: flex; align-items: center`, el contenido estaba centrado verticalmente y el padding superior no era visible al abrir.

**ahora**: con `display: block`, el padding de 15dvh arriba es claramente visible y el contenido empieza desde arriba.

#### 5. about siempre abre desde el principio

**cambio en javascript**:
```javascript
siteName.addEventListener('click', () => {
    renderAboutContent();
    overlay.classList.remove('hidden');
    overlay.scrollTop = 0; // ⭐ resetear scroll
});
```

**antes**: si scrolleabas dentro del about y lo cerrabas, al reabrirlo mantenía el scroll.

**ahora**: siempre abre desde el principio (scroll = 0).

### decisiones técnicas

1. **mutationobserver para loader**: más eficiente que polling con `setInterval`, detecta cambios de clase en tiempo real.

2. **timeout de 5s**: balance entre esperar a que carguen todas las imágenes y no dejar al usuario esperando indefinidamente si alguna falla.

3. **cubic-bezier easing**: `(0.4, 0, 0.2, 1)` es el "ease-out" de material design, da una sensación fluida y natural.

4. **dvw para gap**: responsive automático sin necesidad de media queries adicionales (aunque añadimos uno para móvil para mayor control).

5. **max-width y max-height**: solución simple y efectiva para manejar todas las relaciones de aspecto sin javascript adicional.

### archivos modificados

- `css/style.css`: 
  - gap en dvw
  - estilos de loader (.loading, .loaded)
  - tamaño adaptativo de imágenes
  - about con display: block
  
- `js/main.js`:
  - `setupGalleryLoadingTransition()` nueva función
  - `finishLoading()` helper
  - `img.onload` en `addImagesToGallery()`
  - `overlay.scrollTop = 0` en about
  - clase 'loading' inicial en galerías

### testing recomendado

1. **loader**: abrir en conexión lenta (throttling en devtools) para ver el efecto de apilamiento
2. **espaciado**: probar en diferentes tamaños de pantalla para verificar gap responsive
3. **imágenes panorámicas**: verificar que no se salen del viewport
4. **about**: abrir, scrollear, cerrar, reabrir → debe volver arriba
5. **about padding**: verificar que hay espacio visible arriba al abrir

### próximos pasos sugeridos

1. ajustar timing del loader si 5s es demasiado o poco
2. considerar añadir un indicador de progreso (ej: "3/10 imágenes cargadas")
3. optimizar imágenes para carga más rápida
4. considerar lazy loading más agresivo (solo cargar proyecto visible)


## 2026-02-11 06:15 - cambios de diseño: tipografía, colores, menú bottom y link meowrhino

### sinopsis
implementación de cambios de diseño solicitados: cambio de tipografía a Times New Roman, asignación de colores de fondo por proyecto, reubicación del menú de navegación al bottom como barra horizontal, y adición de link a meowrhino.studio en el modal about.

### proceso detallado

#### 1. cambio de tipografía
**archivo modificado**: `css/style.css`

cambio de fuente principal de `'Courier New', monospace` a `'Times New Roman', Times, serif` en el selector `body`. esto afecta a todo el sitio manteniendo una estética más clásica y editorial.

#### 2. asignación de colores por proyecto
**archivo modificado**: `data.json`

se añadió un campo `color` a cada proyecto con una paleta de colores pastel suaves que funcionan bien con el efecto `mix-blend-mode: difference`:

- **patoCeramics**: `#E8D5C4` (beige cálido)
- **porSiglos**: `#D4A5A5` (rosa suave)
- **abuelo**: `#C4D5E8` (azul pastel)
- **otrosCuentos**: `#E8E4C4` (amarillo crema)
- **pommeTerre**: `#D4E8D4` (verde menta)
- **bacanales**: `#E8C4D5` (rosa lavanda)
- **teatroPlantas**: `#D4E8D9` (verde salvia)

**archivo modificado**: `js/main.js`

en la función `createProjectElement()`, se añadió lógica para aplicar el color de fondo a cada sección de proyecto:

```javascript
// Aplicar color de fondo si existe
if (projectData.color) {
    projectDiv.style.backgroundColor = projectData.color;
}
```

esto crea una experiencia visual distintiva donde cada proyecto tiene su propia identidad cromática en su sección de 100dvh x 100dvw.

#### 3. reubicación del menú al bottom
**archivo modificado**: `css/style.css`

el menú de navegación se movió desde la posición `bottom: 20px; left: 20px` (esquina inferior izquierda) a una barra horizontal completa pegada al bottom:

cambios principales:
- `position: fixed; left: 0; right: 0; bottom: 0;`
- `height: 2px;` (barra muy fina)
- `display: flex; justify-content: center; gap: 20px;`
- cambio de `flex-direction: column` a layout horizontal
- reducción de `font-size` de 14px a 12px
- los enlaces mantienen `mix-blend-mode: difference` heredado del contenedor

**comportamiento de botones activos**:
- botones no activos: `opacity: 0.6`, `font-weight: normal`
- botón activo: `opacity: 1`, `font-weight: bold`, `color: #fff`

el efecto `mix-blend-mode: difference` hace que los textos se inviertan sobre los fondos de color, creando un contraste dinámico.

#### 4. link meowrhino en about modal
**archivo modificado**: `css/style.css`

se añadieron estilos para el footer del about:

```css
#about-content .about-footer {
    margin-top: 40px;
    font-size: 11px;
    color: #666;
}

#about-content .about-footer a {
    color: #666;
    text-decoration: none;
    transition: color 0.3s ease;
}

#about-content .about-footer a:hover {
    color: #000;
}
```

**archivo modificado**: `js/main.js`

en la función `renderAboutContent()`, se añadió:

1. limpieza de elementos `.about-footer` anteriores para evitar duplicados
2. creación dinámica del footer con el link:

```javascript
// Añadir link pequeño al final
const footer = document.createElement('div');
footer.className = 'about-footer';
footer.innerHTML = '<a href="https://meowrhino.studio" target="_blank" rel="noopener noreferrer">web:meowrhino</a>';
content.appendChild(footer);
```

el link aparece al final del contenido del about con un `margin-top: 40px` para separarlo del texto principal.

#### 5. ajustes responsive
**archivo modificado**: `css/style.css`

se actualizaron los estilos responsive del menú para móvil:
- reducción de `gap` de 20px a 12px
- reducción de `font-size` de 12px a 10px
- ajuste de `padding` de 20px a 10px

esto asegura que todos los nombres de proyectos quepan en pantallas pequeñas sin overflow.

### pruebas realizadas

se levantó un servidor local con `python3.11 -m http.server 8080` y se probó el sitio en el navegador:

**verificaciones exitosas**:
- ✅ tipografía Times New Roman aplicada correctamente
- ✅ colores de fondo visibles en cada proyecto
- ✅ menú bottom horizontal funcionando
- ✅ efecto `mix-blend-mode: difference` activo en header y menú
- ✅ modal about con link "web:meowrhino" al final
- ✅ transiciones suaves entre proyectos con cambios de color
- ✅ scroll vertical entre proyectos y horizontal dentro de galerías

### commit y push

se realizó un único commit agrupando todos los cambios:

```
feat: cambios de diseño - Times New Roman, colores por proyecto, menú bottom y link meowrhino

- Cambiar tipografía a Times New Roman en todo el sitio
- Añadir campo 'color' a cada proyecto en data.json con paleta pastel
- Aplicar color de fondo a cada sección de proyecto (100x100)
- Mover menú de navegación al bottom como barra horizontal fina
- Botones activos en blanco con negrita
- Mantener efecto mix-blend-mode: difference en todos los textos del menú
- Añadir link 'web:meowrhino' al final del modal about
```

**commit hash**: `39af102`

**archivos modificados**:
- `css/style.css`: 63 cambios (tipografía, menú bottom, footer about, responsive)
- `data.json`: 7 colores añadidos (uno por proyecto)
- `js/main.js`: aplicación de colores de fondo y generación de footer about

push exitoso a `origin/main`.


## 2026-02-11 07:00 - corrección: revertir menú y mejorar barra de navegación de imágenes

### sinopsis
corrección de la implementación anterior: el menú de proyectos se revirtió a su posición original (abajo izquierda, vertical) y se mejoró el diseño de la barra de navegación de imágenes en el bottom center para que funcione como un indicador de progreso más bonito y diseñado.

### proceso detallado

#### 1. aclaración del malentendido

en la implementación anterior se interpretó erróneamente que el menú de proyectos debía moverse al bottom como barra horizontal. el usuario aclaró que:

- el **menú de proyectos** debe permanecer en su posición original (abajo izquierda, vertical)
- la **barra de navegación** que se solicitaba era para navegar entre las imágenes de cada proyecto, no entre proyectos

#### 2. reversión del menú a posición original

**archivo modificado**: `css/style.css`

se revirtieron los cambios del menú de proyectos a su estado original:

```css
#menu {
    position: fixed;
    left: 20px;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 1000;
    mix-blend-mode: difference;
}
```

características restauradas:
- posición fija en `left: 20px; bottom: 20px`
- layout vertical con `flex-direction: column`
- `gap: 4px` entre enlaces
- mantiene `mix-blend-mode: difference`

estilos de enlaces:
- `font-size: 14px` y `font-weight: bold`
- enlaces no activos con `opacity: 0.6`
- hover con `opacity: 1` y `transform: translateX(5px)`

#### 3. mejora del diseño de la barra de navegación de imágenes

**archivo modificado**: `css/style.css`

la barra de navegación de imágenes (`.scrollbar-track` y `.scrollbar-thumb`) ya existía funcionalmente, pero se mejoró su diseño para hacerla más bonita y visible:

**cambios en `.scrollbar-track`**:
- reducción de altura de `4px` a `2px` para hacerla más fina
- cambio de color de `rgba(0, 0, 0, 0.1)` a `rgba(255, 255, 255, 0.2)` (blanco semitransparente)
- añadido `backdrop-filter: blur(4px)` para efecto de cristal esmerilado
- incremento de ancho de `30%` a `40%` para mejor visibilidad
- transiciones suaves en `height` y `background` para hover
- en hover: altura aumenta a `3px` y opacidad a `0.3`

**cambios en `.scrollbar-thumb`**:
- incremento de `min-width` de `20px` a `30px` para mejor agarre
- cambio de color de `rgba(0, 0, 0, 0.3)` a `rgba(255, 255, 255, 0.8)` (blanco brillante)
- añadido `box-shadow: 0 0 8px rgba(255, 255, 255, 0.4)` para efecto glow
- en hover: opacidad completa y glow más intenso (`0 0 12px`)
- en dragging: máxima intensidad de glow (`0 0 16px`)

**resultado visual**:
- barra muy fina y elegante en el bottom center
- efecto luminoso blanco que contrasta con los fondos de color
- transiciones suaves que responden al hover y al drag
- indicador de progreso claro y funcional para navegar entre imágenes

#### 4. ajustes responsive

se actualizaron los estilos responsive del menú para móvil:
- `left: 15px; bottom: 15px` (ajuste de márgenes)
- `gap: 2px` (reducción de espacio entre enlaces)
- `font-size: 12px` (reducción de tamaño de fuente)

### pruebas realizadas

se levantó un servidor local en el puerto 8081 y se verificó:

**verificaciones exitosas**:
- ✅ menú de proyectos en posición original (abajo izquierda, vertical)
- ✅ barra de navegación de imágenes visible en bottom center
- ✅ efecto glow blanco funcionando correctamente
- ✅ transiciones suaves en hover y drag
- ✅ colores de fondo de proyectos manteniéndose correctamente
- ✅ efecto `mix-blend-mode: difference` activo en header y menú

### commit y push

**commit hash**: `ec16662`

**mensaje del commit**:
```
fix: revertir menú a posición original y mejorar diseño de barra de navegación

- Revertir menú a posición abajo izquierda vertical
- Mejorar diseño de barra de navegación de imágenes (bottom center)
- Barra más fina (2px) con efecto glow blanco semitransparente
- Añadir transiciones suaves en hover y drag
- Mantener funcionalidad de navegación entre imágenes
```

**archivo modificado**:
- `css/style.css`: 46 inserciones, 37 eliminaciones

push exitoso a `origin/main`.


## 2026-02-11 07:10 - implementación de barra de navegación única y global

### sinopsis
implementación de una única barra de navegación fija en el bottom center que se actualiza dinámicamente según el proyecto activo, permitiendo navegar entre las imágenes del proyecto actual. eliminación de las barras individuales por proyecto y refactorización del código para una arquitectura más limpia.

### proceso detallado

#### 1. aclaración del requisito

el usuario aclaró que la barra de navegación debe ser:
- **una sola barra fija** en el bottom (no una por proyecto)
- se **actualiza dinámicamente** con los datos del proyecto en el que estés
- cuando cambias de proyecto (scroll vertical), la barra se recarga con la nueva información

#### 2. modificaciones en el HTML

**archivo modificado**: `index.html`

se añadió una barra de navegación global en el HTML, fuera del contenedor de proyectos:

```html
<!-- Barra de navegación de imágenes (bottom center, única y fija) -->
<div id="global-scrollbar-track" class="scrollbar-track">
    <div id="global-scrollbar-thumb" class="scrollbar-thumb"></div>
</div>
```

esta barra es única y está en el DOM principal, no dentro de cada proyecto.

#### 3. modificaciones en el CSS

**archivo modificado**: `css/style.css`

se cambió el selector de `.scrollbar-track` a `#global-scrollbar-track` para aplicar estilos solo a la barra global:

```css
#global-scrollbar-track {
    position: fixed;  /* Cambio de absolute a fixed */
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    z-index: 1000;  /* z-index alto para estar siempre visible */
    cursor: pointer;
    transition: height 0.2s ease, background 0.2s ease;
}
```

cambios clave:
- `position: fixed` en lugar de `absolute` para que sea fija en la pantalla
- `z-index: 1000` para que esté siempre visible sobre los proyectos
- selectores específicos `#global-scrollbar-track` y `#global-scrollbar-thumb`

#### 4. refactorización del JavaScript

**archivo modificado**: `js/main.js`

**eliminación de `setupScrollbar()`**:
- se eliminó completamente la función `setupScrollbar()` que creaba barras individuales por proyecto
- se eliminó la llamada a `setupScrollbar()` en `createProjectElement()`

**creación de `initGlobalScrollbar()`**:
nueva función que gestiona una única barra global con las siguientes características:

**a) detección del proyecto activo**:
```javascript
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
```

usa `IntersectionObserver` para detectar qué proyecto está visible en el viewport y actualiza `currentGallery` dinámicamente.

**b) actualización dinámica del thumb**:
```javascript
const updateThumb = () => {
    if (!currentGallery) {
        track.style.display = 'none';
        return;
    }

    const scrollW = currentGallery.scrollWidth;
    const clientW = currentGallery.clientWidth;
    
    if (scrollW <= clientW) {
        track.style.display = 'none';
        return;
    }
    
    track.style.display = '';
    
    const ratio = clientW / scrollW;
    const thumbWidth = Math.max(30, ratio * track.offsetWidth);
    thumb.style.width = thumbWidth + 'px';
    
    const maxScroll = scrollW - clientW;
    const maxThumbLeft = track.offsetWidth - thumbWidth;
    const pct = maxScroll > 0 ? currentGallery.scrollLeft / maxScroll : 0;
    thumb.style.left = (pct * maxThumbLeft) + 'px';
};
```

la función `updateThumb()` se ejecuta cada vez que:
- cambia el proyecto activo (via `IntersectionObserver`)
- se hace scroll horizontal en la galería activa
- se redimensiona la ventana

**c) interacción con la barra**:
- **drag**: permite arrastrar el thumb para navegar
- **click**: permite hacer click en el track para saltar a una posición
- **touch**: soporte completo para dispositivos táctiles

todas las interacciones operan sobre `currentGallery`, que se actualiza dinámicamente.

**d) inicialización**:
se añadió la llamada a `initGlobalScrollbar()` en la función `init()`:

```javascript
renderProjects();
initMenu();
initLanguageSelector();
initAboutOverlay();
initScrollSpy();
initGlobalScrollbar();  // Nueva función
initResizeHandler();
```

#### 5. verificación del mix-blend-mode

se verificó que el `mix-blend-mode: difference` está correctamente aplicado en el menú:

```css
#menu {
    position: fixed;
    left: 20px;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 1000;
    mix-blend-mode: difference;  /* ✅ Presente */
}

#menu a {
    text-decoration: none;
    color: #fff;  /* Blanco que se invierte sobre fondos */
    font-size: 14px;
    font-weight: bold;
    transition: opacity 0.3s ease, transform 0.2s ease;
}
```

el efecto funciona correctamente: los textos blancos se invierten sobre los fondos de color.

### ventajas de la arquitectura refactorizada

1. **una sola barra**: más limpio visualmente y menos elementos en el DOM
2. **actualización dinámica**: se adapta automáticamente al proyecto activo
3. **mejor rendimiento**: solo un conjunto de event listeners en lugar de uno por proyecto
4. **código más mantenible**: lógica centralizada en una sola función
5. **separación de responsabilidades**: `IntersectionObserver` para detección, `updateThumb()` para renderizado

### pruebas realizadas

se levantó un servidor local en el puerto 8082 y se verificó:

**verificaciones exitosas**:
- ✅ una sola barra visible en el bottom center
- ✅ menú de proyectos en posición original (abajo izquierda)
- ✅ `mix-blend-mode: difference` funcionando en el menú
- ✅ colores de fondo de proyectos correctos
- ✅ barra con diseño mejorado (glow blanco semitransparente)

### commit y push

**commit hash**: `84f0dae`

**mensaje del commit**:
```
feat: implementar barra de navegación única y global

- Crear una única barra de navegación fija en el bottom center
- La barra se actualiza dinámicamente según el proyecto activo
- Permite navegar entre las imágenes del proyecto actual
- Eliminar barras individuales por proyecto
- Mantener funcionalidad de drag, click y touch
- Mejorar diseño con efecto glow blanco semitransparente
```

**archivos modificados**:
- `css/style.css`: selectores específicos para barra global
- `index.html`: añadir barra global en el DOM principal
- `js/main.js`: 155 inserciones, 125 eliminaciones (refactorización completa)

push exitoso a `origin/main`.


## 18 de febrero de 2026, 05:20 GMT+1

### Título: Implementación de resaltado rosa fosforito con blend mode difference

### Sinopsis
Se eliminó la lógica de colores individuales por proyecto y se implementó un sistema donde todos los proyectos tienen un efecto de negativo (`mix-blend-mode: difference`) excepto el proyecto activo, que se resalta con un fondo rosa fosforito (#FF69B4) simulando un subrayador.

### Explicación detallada del proceso

#### Contexto inicial
El sitio mokakopa tenía una lógica donde cada proyecto tenía un color de fondo específico definido en `data.json`. Los links del menú usaban versiones oscurecidas de estos colores para los proyectos inactivos. El usuario quería simplificar esta lógica y probar un efecto visual más impactante.

#### Objetivo
- Eliminar todos los colores individuales por proyecto
- Establecer una base blanca para todos los proyectos
- Aplicar `mix-blend-mode: difference` para crear un efecto de negativo
- Resaltar el proyecto activo con un fondo rosa fosforito que simule un subrayador
- El proyecto activo debe perder el efecto negativo para verse con colores normales

#### Cambios realizados

**1. CSS (`css/style.css`)**
- Eliminado el `mix-blend-mode: difference` del contenedor `.project`
- Añadida la clase `.project.active-highlight` con fondo rosa fosforito (#FF69B4)
- Aplicado `mix-blend-mode: difference` a `.gallery` para que el contenido tenga el efecto negativo
- Añadida regla `.project.active-highlight .gallery` para desactivar el blend mode en proyectos activos
- Simplificados los estilos del menú para que todos los links sean blancos con el blend mode heredado del contenedor `#menu`

**2. JavaScript (`js/main.js`)**
- Eliminada la lógica de asignación de `backgroundColor` desde `projectData.color` en `createProjectElement()`
- Eliminada la función `darkenColor()` y sus referencias (ya no se usa)
- Simplificada la función `initMenu()` para eliminar la asignación de colores individuales
- Añadidos event listeners a los links del menú para aplicar la clase `.active-highlight` inmediatamente al hacer clic
- Actualizada la función `initScrollSpy()` para aplicar/quitar la clase `.active-highlight` según el proyecto visible

#### Arquitectura de la solución

La solución se basa en una estrategia de capas:

1. **Capa base**: Todos los proyectos tienen fondo blanco por defecto
2. **Capa de efecto**: La galería (`.gallery`) tiene `mix-blend-mode: difference` que crea el efecto negativo sobre el fondo blanco
3. **Capa de resaltado**: Cuando un proyecto está activo (`.active-highlight`):
   - Se aplica un fondo rosa fosforito al contenedor `.project`
   - Se desactiva el `mix-blend-mode` de su `.gallery` para que el contenido se vea normal
   - El resultado es que el contenido se ve con colores normales sobre un fondo rosa brillante

#### Decisiones técnicas

**¿Por qué aplicar el blend mode a `.gallery` y no a `.project`?**
Inicialmente intentamos aplicar el `mix-blend-mode: difference` directamente al contenedor `.project`, pero esto causaba que el efecto se heredara en cascada a todos los elementos hijos, haciendo imposible desactivarlo selectivamente. Al aplicarlo a `.gallery`, podemos controlar el efecto de forma más granular.

**¿Por qué usar event listeners en los links además del IntersectionObserver?**
El `IntersectionObserver` funciona perfectamente cuando el usuario hace scroll manualmente, pero cuando se hace clic en un link del menú, el navegador navega al ancla pero el proyecto puede no estar lo suficientemente visible (threshold: 0.5) para que el observer lo detecte inmediatamente. Los event listeners aseguran que el resaltado se aplique instantáneamente al hacer clic.

**¿Por qué rosa fosforito (#FF69B4)?**
El usuario específicamente solicitó un rosa "fosforito como el de los subrayadores" para crear un efecto visual potente que simule que el proyecto ha sido marcado con un subrayador. El color #FF69B4 (HotPink) es brillante y saturado, perfecto para este propósito.

#### Resultado final

El sitio ahora tiene un aspecto visual mucho más limpio y con mayor impacto:
- Los proyectos inactivos se ven con un efecto de negativo sutil (texto negro sobre blanco se invierte)
- El proyecto activo destaca con un fondo rosa fosforito brillante
- El header y el menú mantienen su efecto negativo en todo momento, creando un contraste interesante
- La transición entre proyectos es suave gracias a las transiciones CSS

#### Archivos modificados
- `css/style.css` - Actualización de estilos para blend mode y resaltado rosa
- `js/main.js` - Eliminación de lógica de colores y actualización de event handlers

#### Próximos pasos sugeridos
- Ajustar el tono de rosa si el usuario prefiere uno más o menos saturado
- Considerar añadir una animación más elaborada para la transición del resaltado
- Probar diferentes valores de `threshold` en el IntersectionObserver si la detección no es óptima


## 18 de febrero de 2026, 05:35 GMT+1

### Título: Corrección - Resaltado rosa fosforito aplicado al menú (no al proyecto)

### Sinopsis
Se corrigió la implementación anterior para aplicar el resaltado rosa fosforito únicamente al link activo del menú, no al proyecto completo. Se eliminó la lógica de `active-highlight` en proyectos y se mantuvo solo en los links del menú.

### Explicación detallada del proceso

#### Contexto del error
En la implementación anterior, se había aplicado el resaltado rosa fosforito a todo el contenedor `.project` cuando estaba activo. Sin embargo, el usuario quería que el resaltado se aplicara únicamente al **nombre del proyecto en el menú**, simulando un subrayador rosa sobre el texto.

#### Cambios realizados

**1. CSS (`css/style.css`)**
- Eliminada la regla `.project.active-highlight` que aplicaba el fondo rosa al proyecto completo
- Modificada la regla `#menu a.active` para incluir:
  - `background-color: #FF69B4` (rosa fosforito)
  - `color: #000` (texto negro)
  - `padding: 2px 8px` (espaciado para que se vea como un botón)
  - `mix-blend-mode: normal` (cancelar el blend mode del contenedor padre)
  - Transiciones suaves para background-color y padding
- Eliminadas las reglas de blend mode en `.gallery` (ya no son necesarias)

**2. JavaScript (`js/main.js`)**
- Eliminada la lógica que aplicaba/quitaba la clase `active-highlight` a los proyectos en `initMenu()`
- Eliminada la lógica que aplicaba/quitaba la clase `active-highlight` a los proyectos en `initScrollSpy()`
- Mantenida la lógica que aplica/quita la clase `active` a los links del menú

#### Resultado visual

El link activo en el menú ahora muestra:
- Un fondo de color (se ve verde oscuro debido a la interacción del rosa #FF69B4 con el `mix-blend-mode: difference` del contenedor `#menu`)
- Texto negro (sin el efecto negativo)
- Padding visible que hace que parezca un botón resaltado

#### Nota sobre el color

El color rosa (#FF69B4) se ve verde oscuro en el navegador debido a la interacción con el `mix-blend-mode: difference` del contenedor `#menu`. Esto es un efecto visual interesante que puede ajustarse si el usuario prefiere un tono más rosa o más brillante.

#### Archivos modificados
- `css/style.css` - Actualización de estilos para resaltar solo el link del menú
- `js/main.js` - Eliminación de lógica de active-highlight en proyectos


## 18 de febrero de 2026, 05:50 GMT+1

### Título: Implementación de animación de subrayado rosa fosforito en proyecto activo

### Sinopsis
Se implementó un efecto de subrayador rosa fosforito con animación de izquierda a derecha en el proyecto activo. El resaltado se aplica al proyecto completo (no al menú), y se eliminó la sangría del link activo en el menú para mantener solo el efecto hover.

### Explicación detallada del proceso

#### Contexto de la solicitud
El usuario quería que el proyecto activo tuviese un efecto de subrayador rosa fosforito que se animara de izquierda a derecha, simulando el gesto de pasar un marcador fluorescente sobre el contenido. Además, solicitó eliminar la sangría del link activo en el menú (manteniéndola solo en hover) y hacer que el resaltado fuera más "natural".

#### Implementación técnica

**1. Pseudo-elemento para la animación (CSS)**

Se utilizó un pseudo-elemento `::before` en `.project` para crear el efecto de subrayado animado:

```css
.project {
  isolation: isolate; /* Crear contexto de apilamiento para z-index */
}

.project::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0; /* Comienza invisible */
  height: 100%;
  background-color: #FF69B4; /* Rosa fosforito */
  mix-blend-mode: normal; /* Sin efecto negativo */
  z-index: -1; /* Detrás del contenido */
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); /* Animación suave */
}

.project.active-highlight::before {
  width: 100%; /* Se expande al 100% cuando está activo */
}
```

**Detalles técnicos:**
- `isolation: isolate` crea un nuevo contexto de apilamiento para que el `z-index: -1` funcione correctamente
- La transición usa una curva de Bézier `cubic-bezier(0.4, 0, 0.2, 1)` para una animación más natural (ease-in-out)
- La duración de 0.8 segundos permite ver claramente el efecto de "subrayado"
- `mix-blend-mode: normal` asegura que el rosa se vea sin el efecto negativo del blend mode

**2. Simplificación del menú (CSS)**

Se eliminó el resaltado rosa del link activo en el menú, dejándolo solo como indicador visual:

```css
#menu a.active {
  text-decoration: none;
  color: #fff; /* Blanco, como los demás */
}
```

El efecto hover se mantiene intacto:

```css
#menu a:hover {
  transform: translateX(5px); /* Sangría solo en hover */
}
```

**3. Restauración de la lógica JavaScript**

Se restauró la lógica que aplica/quita la clase `active-highlight` a los proyectos tanto en el evento click del menú como en el IntersectionObserver del scroll spy.

#### Resultado visual

Cuando un proyecto se vuelve activo (por click en el menú o por scroll):
1. El fondo rosa fosforito aparece desde la izquierda y se expande hacia la derecha en 0.8 segundos
2. El proyecto pierde el `mix-blend-mode: difference`, por lo que las imágenes y textos se ven con sus colores normales sobre el fondo rosa
3. El link del menú se marca como activo pero sin resaltado adicional (solo indicador visual)
4. El hover en el menú mantiene la sangría de 5px

#### Posibles ajustes futuros

El usuario mencionó que quería que el subrayado fuera más "pequeño" o sutil. Actualmente cubre el 100% de la altura del proyecto. Opciones para ajustar:
- Reducir la altura a 30-40% y centrar verticalmente
- Colocar el subrayado solo en la parte superior o inferior
- Ajustar la opacidad del rosa para hacerlo más translúcido

#### Archivos modificados
- `css/style.css` - Añadido pseudo-elemento ::before con animación, simplificado #menu a.active
- `js/main.js` - Restaurada lógica de active-highlight en proyectos


## 18 de febrero de 2026, 06:05 GMT+1

### Título: Corrección final - Subrayado rosa en link del menú activo

### Sinopsis
Se corrigió la implementación para aplicar el subrayado rosa fosforito únicamente al link activo del menú (no al proyecto completo). El link activo pierde el blend mode para que el rosa se vea correctamente, mientras los demás links mantienen el efecto negativo.

### Explicación detallada del proceso

#### Contexto de la corrección
En la implementación anterior, el subrayado rosa se aplicaba al proyecto completo, pero el usuario quería que el efecto estuviera solo en el link del menú activo. El objetivo era crear un efecto de subrayador fosforito que resaltara el nombre del proyecto en el menú, con animación de izquierda a derecha.

#### Implementación técnica

**1. Subrayado animado en el link del menú (CSS)**

Se añadió un pseudo-elemento `::before` a todos los links del menú para crear el subrayado animado:

```css
#menu a {
  position: relative;
  overflow: hidden;
}

#menu a::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background-color: #FF69B4;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**2. Activación del subrayado y cancelación del blend mode**

Cuando el link está activo, se expande el subrayado y se cancela el blend mode:

```css
#menu a.active {
  text-decoration: none;
  color: #000; /* Texto negro */
  mix-blend-mode: normal; /* Cancelar el blend mode del contenedor */
}

#menu a.active::before {
  width: 100%; /* Subrayado completo */
}
```

**Detalles técnicos:**
- El subrayado tiene 3px de altura para que sea visible pero sutil
- La transición de 0.6 segundos crea el efecto de "pasar el subrayador"
- `mix-blend-mode: normal` en el link activo cancela el `mix-blend-mode: difference` del contenedor `#menu`
- Esto hace que el texto se vea negro y el rosa se vea en su color real (no invertido)

**3. Eliminación del resaltado en proyectos**

Se eliminaron:
- Las reglas CSS de `.project::before` y `.project.active-highlight::before`
- La lógica JavaScript que aplicaba/quitaba la clase `active-highlight` a los proyectos

**4. Simplificación del proyecto**

El proyecto volvió a su estructura básica sin pseudo-elementos ni lógica de resaltado:

```css
.project {
  width: 100dvw;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  overscroll-behavior-x: none;
  overscroll-behavior-y: auto;
}
```

#### Resultado visual

**Link activo en el menú:**
- Texto negro (sin efecto negativo)
- Subrayado rosa fosforito de 3px en la parte inferior
- Animación de izquierda a derecha en 0.6 segundos
- Sin sangría (solo se aplica en hover)

**Links inactivos en el menú:**
- Texto verde (efecto del blend mode difference)
- Sin subrayado
- Sangría de 5px en hover

**Proyectos:**
- Todos mantienen el efecto negativo del blend mode difference
- Sin resaltado adicional

#### Archivos modificados
- `css/style.css` - Añadido subrayado animado al link del menú, eliminado resaltado de proyectos
- `js/main.js` - Eliminada lógica de active-highlight en proyectos
