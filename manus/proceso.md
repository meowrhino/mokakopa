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
