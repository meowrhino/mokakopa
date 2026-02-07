# mokakopa

portfolio de proyectos artísticos por meowrhino.studio

## estructura del proyecto

```
mokakopa/
├── index.html          # página principal con seo completo
├── data.json           # datos de proyectos (actualizado automáticamente)
├── updateImgCount.js   # script para actualizar conteo de imágenes
├── robots.txt          # configuración para crawlers
├── sitemap.xml         # mapa del sitio para seo
├── css/
│   └── style.css       # estilos principales mejorados
├── js/
│   └── main.js         # lógica principal (bugs corregidos)
└── data/               # carpetas de proyectos con imágenes
    ├── patoCeramics/
    ├── porSiglos/
    ├── abuelo/
    ├── otrosCuentos/
    ├── pommeTerre/
    ├── bacanales/
    └── teatroPlantas/
        ├── carasol/
        ├── nuvol/
        └── sean/
```

## características implementadas

- ✅ cada proyecto ocupa 100dvh y 100dvw
- ✅ galerías horizontales scrolleables con padding para centrar primera y última imagen
- ✅ texto al final de cada galería
- ✅ proyectos complejos con estructura: [imgs sub1] [texto sub1] [imgs sub2] [texto sub2] ... [texto general]
- ✅ menú lateral izquierdo con efecto `mix-blend-mode: difference` y glassmorphism
- ✅ nombre "mokakopa" arriba izquierda que abre modal about
- ✅ botón de idioma arriba derecha (ES/EN) con animación
- ✅ conteo automático de imágenes por proyecto
- ✅ **seo completo**: meta tags, open graph, twitter cards, schema.org
- ✅ **accesibilidad mejorada**: aria labels, roles, navegación por teclado
- ✅ **bugs corregidos**: carga de imágenes, manejo de errores, transiciones

## uso del script updateImgCount.js

para actualizar automáticamente el conteo de imágenes en `data.json`:

```bash
node updateImgCount.js
```

este script:
- cuenta todas las imágenes (.jpg, .jpeg, .png, .gif, .webp) en cada carpeta de proyecto
- actualiza el campo `imgCount` en `data.json`
- maneja proyectos simples y complejos (con subcarpetas)

## avisos de errores potenciales

### 1. extensiones de imagen
**problema**: el código intenta cargar imágenes con extensión `.jpg` por defecto y luego prueba otras extensiones si falla.

**solución**: asegúrate de que las imágenes estén numeradas correctamente (1.jpg, 2.jpg, etc.) o que tengan extensiones compatibles (.png, .jpeg, .webp, .gif).

**código relevante**: `js/main.js` líneas 90-110

### 2. nombres de proyectos en data.json
**problema**: los nombres de proyectos deben coincidir exactamente con los nombres de las carpetas en `data/`.

**solución**: verifica que no haya espacios, mayúsculas inconsistentes o caracteres especiales.

### 3. proyectos complejos
**problema**: para proyectos complejos, el campo `subproyectos` debe estar presente y el campo `imgCount` debe ser un objeto con las subcarpetas.

**ejemplo correcto**:
```json
{
  "tipo": "complejo",
  "imgCount": {
    "carasol": 31,
    "nuvol": 12,
    "sean": 48
  },
  "subproyectos": [
    ["nuvol", {...}],
    ["carasol", {...}],
    ["sean", {...}]
  ]
}
```

### 4. textos con html
**problema**: los textos en `data.json` pueden contener html (como enlaces `<a>`), pero deben estar correctamente escapados en el json.

**solución**: usa comillas dobles para atributos html y asegúrate de que el json sea válido.

### 5. scroll horizontal en móvil
**problema**: en dispositivos móviles, el scroll horizontal puede no funcionar intuitivamente.

**solución**: el css ya incluye ajustes responsive, pero puedes necesitar ajustar el padding en `.gallery` para diferentes tamaños de pantalla.

### 6. carga de imágenes
**problema**: si hay muchas imágenes, la carga inicial puede ser lenta.

**solución**: el código usa `loading="lazy"` para carga diferida de imágenes. considera optimizar el tamaño de las imágenes antes de subirlas.

### 7. about modal vacío
**problema**: el contenido del modal "about" está vacío por defecto.

**solución**: edita el contenido en `index.html` línea 16-19 o actualízalo dinámicamente en `js/main.js`.

## personalización

### cambiar el contenido del about
edita `index.html`:
```html
<div id="about-content">
    <button id="close-about">×</button>
    <h2>sobre mokakopa</h2>
    <p>tu contenido aquí...</p>
</div>
```

### añadir más idiomas
1. añade campos `textosCAT`, `textosFR`, etc. en `data.json`
2. modifica `initLanguageToggle()` en `js/main.js` para incluir más opciones
3. actualiza `getTextsByLang()` para manejar el nuevo idioma

### ajustar padding de galerías
edita `css/style.css` línea 125-130:
```css
.gallery {
    padding-left: calc(50dvw - 40dvh);  /* ajusta este valor */
    padding-right: calc(50dvw - 40dvh); /* ajusta este valor */
}
```

## tecnologías usadas

- html5
- css3 (con dvh/dvw units)
- javascript vanilla (es6+)
- sin frameworks ni librerías externas

## hosting

compatible con github pages y cualquier hosting estático.

---

desarrollado por **meowrhino.studio**
