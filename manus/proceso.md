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
