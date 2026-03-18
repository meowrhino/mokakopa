# mokakopa

portfolio de proyectos artísticos por meowrhino.studio

## estructura del proyecto

```
mokakopa/
├── index.html          # página principal con seo completo
├── data.json           # datos de proyectos, textos, about, cv, contacto
├── robots.txt          # configuración para crawlers
├── sitemap.xml         # mapa del sitio para seo
├── css/
│   └── style.css       # estilos principales
├── js/
│   └── main.js         # lógica principal
└── data/               # carpetas de proyectos con imágenes
    ├── patoCeramics/
    ├── viscerales/
    ├── porSiglos/
    ├── abuelo/
    ├── otrosCuentos/
    ├── pommeTerre/
    ├── teatroPlantas/
    └── bacanales/
```

## cómo funcionan las imágenes

las imágenes se cargan **automáticamente** sin necesidad de configurar nada en data.json. el código:

1. empieza buscando `1.webp` en la carpeta del proyecto
2. si existe, pasa a `2.webp`, luego `3.webp`, etc.
3. cuando un número no existe, para (no sigue buscando)
4. si una imagen no es `.webp`, prueba `.jpg` → `.png` → `.jpeg` → `.gif`

**para añadir imágenes**: simplemente mete archivos numerados (1.webp, 2.webp, 3.webp...) en la carpeta del proyecto dentro de `data/`.

## cómo añadir un proyecto nuevo

1. crea una carpeta en `data/` con el nombre del proyecto (sin espacios)
2. mete las imágenes numeradas (1.webp, 2.webp...)
3. añade la entrada en `data.json` con textos en ES/EN/CAT

## personalización

### cambiar color de resaltado
edita `resaltado` en `data.json` (valor hex, ej: `"#FF69B4"`)

### añadir más idiomas
1. añade campos `textosFR`, `textosDE`, etc. en `data.json`
2. añade el idioma al array en `createLangSwitch()` en `js/main.js`

## tecnologías

- html5, css3 (dvh/dvw), javascript vanilla (es6+)
- sin frameworks ni librerías externas

## hosting

compatible con github pages y cualquier hosting estático.

---

desarrollado por **meowrhino.studio**
