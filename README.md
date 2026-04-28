# Lorem Fistrum

Generador web de texto tipo lorem ipsum con estilo "chiquitizado", construido con React + Vite.

## Objetivo

Este proyecto permite generar parrafos de texto aleatorio combinando vocabulario lorem clasico con expresiones de humor. Incluye:

- Configuracion de numero de parrafos y frases por parrafo.
- Selector de nivel de "chiquitizacion" (suave, medio, extremo).
- Copia al portapapeles del resultado en texto plano.
- Persistencia de preferencias en almacenamiento local.

## Stack tecnico

- React 18
- Vite 5
- Node.js test runner (`node:test`)

## Estructura del proyecto

```text
.
|- generator.js
|- index.html
|- src/
|  |- App.jsx
|  |- main.jsx
|  |- styles.css
|- __tests__/
|  |- generator.test.mjs
|- package.json
|- vite.config.js
```

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalacion

```bash
npm install
```

## Ejecucion en desarrollo

```bash
npm run dev
```

La app se sirve con Vite y recarga cambios automaticamente.

## Build de produccion

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.

## Previsualizacion de build

```bash
npm run preview
```

## Tests

```bash
npm test
```

La suite valida la logica del generador (`generator.js`) sin dependencias de DOM.

## Comportamiento del generador

La clase `LoremFistrumGenerator` expone:

- `generate(paragraphCount, sentencesPerParagraph)`: devuelve una estructura de parrafos -> frases -> tokens.
- `toPlainText(data)`: transforma la estructura generada en texto listo para copiar.

Parametros principales:

- `chiquitoRatio`: porcentaje aproximado de tokens de estilo "chiquito".
- `phraseProbability`: probabilidad de insertar frases completas.

## UI y accesibilidad

- Controles numericos con limites y botones de incremento/decremento.
- Region de salida con `aria-live` para comunicar nuevo contenido.
- Boton de copia con feedback de estado (ok/error).

## Persistencia

Se guardan en `localStorage`:

- numero de parrafos
- frases por parrafo
- nivel de chiquitizacion

Clave usada: `lorem-fistrum-prefs`.

## Scripts disponibles

- `npm run dev`: arranca entorno local.
- `npm run build`: empaqueta para produccion.
- `npm run preview`: previsualiza build local.
- `npm test`: ejecuta pruebas unitarias de generacion.

## Notas

- La logica principal esta aislada en `generator.js` para facilitar pruebas.
- La aplicacion usa fallback de copiado cuando la API de `navigator.clipboard` no esta disponible.
