# Guía de la web

> **Regla de oro: solo se tocan `data/` y `projects/`.** Lo demás es el código.

## Qué hay

```
data/site.json             el nombre, el dominio, el color, el contacto y qué proyectos salen, en qué orden
data/about.json            el about: el nombre, el statement y el CV
projects/<nombre>/         un proyecto, una carpeta:
  project.json               su título y sus textos
  img/                       sus fotos: 1.webp, 2.webp…
```

El **nombre de la carpeta** es también el del enlace del menú (`#speeches`): letras sin
acentos ni `ñ`, números y guiones, sin espacios. Mejor no cambiarlo una vez publicado.

## La primera vez: preparar VS Code

Solo se hace una vez.

1. En VS Code: **Archivo → Nueva ventana** y, en la bienvenida, **Clonar repositorio Git…** →
   **Clonar desde GitHub**. Entra con tu cuenta, elige tu repositorio y una carpeta.
2. Al abrirla, VS Code propone instalar **Live Server** (abajo a la derecha): **Instalar**.
3. Abajo a la derecha sale **Go Live**: es la vista previa.

**VS Code te ayuda con los campos**: si pasas el ratón por encima de uno (`"title"`, `"photos"`…)
te dice qué es, y si escribes uno mal o pones algo que no toca, lo subraya en rojo. Para ver
qué campos puedes poner, dentro de las llaves pulsa **Ctrl+Espacio**. Lo sabe por la primera
línea de cada JSON (`"$schema": …`): **no la borres**.

## Añadir un proyecto, paso a paso

1. **Copia una carpeta** de `projects/` y ponle el nombre nuevo: `projects/stars/` → `projects/luna/`.
2. **Las fotos**: pásalas por [imgToWeb](https://meowrhino.github.io/imgToWeb/), **en Chrome o
   Firefox** (Safari no sabe hacer `.webp`), calidad 85 %. Ordénalas arrastrando: salen
   numeradas (`1.webp`, `2.webp`…) en ese orden. Borra las de la carpeta copiada y pon estas en `img/`.
3. **Los textos**: abre `project.json` y cambia el título, los textos y la lista de fotos.
4. **En la web**: en `data/site.json`, añade el nombre de la carpeta a la lista, en el sitio
   donde quieras que salga: `"projects": ["speeches", "luna", "soleMio"]`.
5. **Go Live** para verlo, y después **Subir los cambios**.

Para **quitar** un proyecto de la web, quítalo de la lista de `data/site.json`: la carpeta se
puede quedar.

## Los campos de un proyecto (`project.json`)

```json
{
  "title": "speeches for the future",
  "text": {
    "es": ["Primer párrafo…", "Segundo párrafo…"],
    "en": ["First paragraph…", "Second paragraph…"],
    "ca": ["Primer paràgraf…", "Segon paràgraf…"]
  },
  "photos": ["1", "2", "3", "4", "5"]
}
```

| campo | qué hace |
|---|---|
| `title` | el título: sale en el menú y encima del texto |
| `text` | el texto, una lista de párrafos por idioma. Dentro se puede poner `<em>cursiva</em>`, `<strong>negrita</strong>` o `<a href='https://…'>un enlace</a>` (con comillas simples). Si falta un idioma, sale el español |
| `photos` | las fotos de `img/`, por el número y sin `.webp`, en el orden en que salen: `["1", "2", "3"]` |

## El about (`data/about.json`)

`title` (el nombre), `subtitle` (lo de debajo; puede ir vacío, `""`), `text` (el statement,
como el de un proyecto) y `cv`: una lista de secciones, cada una con su nombre en los tres
idiomas y sus líneas:

```json
{ "name": { "es": "Exposiciones", "en": "Exhibitions", "ca": "Exposicions" },
  "items": [ { "date": "2024", "title": "Nombre de la expo, sala, ciudad" } ] }
```

El correo, el instagram y el color de resaltado están en `data/site.json`.

## Verlo antes de subirlo

**Go Live** abajo a la derecha de VS Code. Se abre la web en el navegador y se refresca sola
cada vez que guardas. Si hay algo que no se publicaría (una coma, un campo mal escrito), sale
en pantalla en lugar de la web, y dice dónde.

## Subir los cambios

1. Pestaña **Control de código fuente** (las tres bolitas unidas, a la izquierda).
2. Escribe qué has hecho (`proyecto nuevo: luna`) y **Confirmar** (*Commit*). Si pregunta si
   quieres añadir todos los cambios: **Sí**.
3. **Sincronizar cambios** (*Sync*).
4. En un par de minutos está en la web. En GitHub, al lado del último cambio sale una bolita:
   amarilla es que se está publicando, verde que ya está, roja que algo no cuadra.

**Antes de empezar a tocar**, dale también a **Sincronizar**, para bajar lo que haya cambiado.

## Qué sale en Google y al compartir

| dónde | de dónde sale |
|---|---|
| el título | `title` de `data/site.json` |
| el texto de debajo, en Google | el principio del statement (`data/about.json` → `text`) |
| la imagen al compartir el enlace | la primera foto del primer proyecto de la lista |

Hay una dirección por idioma: la web en español, `/en/` y `/ca/`.

## Si sale en rojo

La web no se rompe: se queda como estaba hasta que se arregla. Pincha la bolita roja, luego
**Details**, y lee el último mensaje, que dice el fichero y qué pasa:

- **"no es un JSON válido, línea 12"** → casi siempre **una coma**: que falta entre dos cosas,
  o que sobra después de la última. O unas comillas sin cerrar.
- **"\"fotos\" no es un campo de aquí (¿mal escrito?). Los que hay: title, text, photos"** →
  un campo mal escrito: cópialo de la lista que sale en el mensaje.
- **"\"photos\" dice \"6\", y no hay ningún img/6.webp"** → en `photos` hay una foto que no está en `img/`.
- **"\"lists\" dice \"luna\", y no hay ningún projects/luna/project.json"** → el nombre de
  la lista y el de la carpeta no son iguales.

Las líneas con ⚠ no paran nada: solo avisan de algo que quizá no es como querías.
