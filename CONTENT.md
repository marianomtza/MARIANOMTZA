# Editing Guide — marianomtza-web

Guía rápida de qué archivo editar para cambiar cualquier cosa de la web.

---

## 1. Contacto, social, APIs (un solo lugar)

**Archivo:** `index.html` → bloque `window.SITE_CONFIG` (línea ~58)

```js
window.SITE_CONFIG = {
  formspreeId: "YOUR_FORMSPREE_ID",      // ← pega el ID de Formspree (xxxxxxxx)
  googleMapsApiKey: "",                   // ← key de Google Maps Places
  email: "hola@marianomtza.com",
  whatsapp: "+52 443 426 4931",
  city: "Ciudad de México · MX",
  instagram: "https://instagram.com/marianomtza",
  spotifyUrl: "",
  soundcloudUrl: "",
  raUrl: ""
};
```

Cambia algo aquí y se actualiza nav, footer, booking — todo.

---

## 2. Nav (logo + links)

**Archivo:** `components/Nav.jsx`

- Logo: `Mariano Martínez` — buscar `nav-logo`
- Links: `Eventos`, `Roster`, `Contacto`, `Booking` — bloque `nav-links`

---

## 3. Hero (título, eyebrow, roles, descripción, CTAs)

**Archivo:** `components/Hero.jsx`

- **Eyebrow** (`→ Ciudad de México`): variable `hero-eyebrow`
- **Título** (`MARIANOMTZA`): constante `TITLE`. Cambiar el string cambia el texto y las letras del piano (10 letras = 10 notas C major).
- **Roles rotativos:** array `ROLES` — pares `{ role, tag }`. Agrega/quita lo que quieras.
- **Descripción:** dentro de `<p className="hero-desc">…</p>`.
- **CTAs:** "Booking" y "Eventos" — los `<a>` con `className="btn primary"` y `btn ghost`.

---

## 4. Piano hover en el nombre

**Archivo:** `components/audio.jsx`

- Escala: `window.PIANO_SCALE` al final del archivo. Por defecto C mayor diatónica (C4 → E5).
- Para cambiar a otra escala: edita las frecuencias.
- Sonido del piano: función `note()` — ajusta `partials`, `vol`, lowpass.

---

## 5. Stats

**Archivo:** `components/Stats.jsx`

Edita el array `ITEMS`. Cada item: `{ n, label, sub? }`.

---

## 6. Eventos — Noches Memorables

**Archivo:** `components/Events.jsx`

Edita el array `LIST`. Cada item: `{ idx, name, meta, href }`.
Los links abren en nueva pestaña.

---

## 7. Marquees (colectivos arriba, marcas abajo)

**Archivo:** `app.jsx`

- `COLLECTIVES` — array de colectivos con IG. Cada item `{ name, href }`.
- `BRANDS` — marcas con las que has colaborado. Solo `{ name }` (sin link).

Para agregar un link a una marca, cambia a `{ name: "Spotify", href: "https://..." }`.

---

## 8. Roster (10 artistas + modal)

**Archivo:** `components/Roster.jsx`

Edita el array `ROSTER`. Cada artista:

```js
{ n: "01", name: "3DELINCUENTES",
  spotify: "https://open.spotify.com/artist/...",
  apple:   "https://music.apple.com/artist/...",
  ig:      "https://instagram.com/...",
  photo:   "/uploads/3delincuentes.jpg" }
```

- **`null` = botón deshabilitado** (placeholder).
- **`photo: null`** muestra iniciales sobre gradiente.
- Para fotos: pon el archivo en `/uploads/` y referencia con `/uploads/nombre.jpg`.

---

## 9. Booking form

**Archivo:** `components/Contact.jsx`

- Toggle `Servicio | Artista` ya implementado.
- Lista de artistas en el `<select name="artist">` — sincronízala con el roster.
- Tipos de servicio en `<select name="service">`.
- Tipos de evento en `<select name="eventType">`.
- Form se envía a Formspree (`SITE_CONFIG.formspreeId`).
- Google Maps autocomplete se activa solo si `SITE_CONFIG.googleMapsApiKey` tiene valor.

---

## 10. Setup Formspree (3 minutos)

1. Cuenta en [formspree.io](https://formspree.io/) (free tier: 50 envíos/mes).
2. New form → copia el ID de la URL (`https://formspree.io/f/xxxxxxxx` → `xxxxxxxx`).
3. Pega en `SITE_CONFIG.formspreeId`.
4. Confirma email cuando llegue.

---

## 11. Setup Google Maps Places (booking autocomplete)

1. [Google Cloud Console](https://console.cloud.google.com/) → New project.
2. APIs & Services → Library → habilita **Places API** (legacy) **y** **Maps JavaScript API**.
3. Credentials → Create API key.
4. Restringe la key:
   - **HTTP referrers**: `marianomtza.com/*`, `*.vercel.app/*`, `localhost:*/*`
   - **APIs**: solo Places y Maps JS.
5. Pega la key en `SITE_CONFIG.googleMapsApiKey`.

Costo: $200/mes de crédito gratis de Google. Con tráfico normal no pagarás nada.

---

## 12. Colores / acento

**Archivo:** `index.html` — `:root` CSS o `window.TWEAK_DEFAULTS`.

- `--accent`, `--accent-soft`, `--accent-deep` controlan todo el morado.
- El panel Tweaks (esquina inferior derecha) deja probar live.

---

## 13. SEO

**Archivo:** `index.html` — bloque `<head>`.

- Title, description, OG tags, Twitter cards, canonical, JSON-LD Person schema.
- OG image: `public/og-image.svg` (fuente) → se rasteriza a `og-image.png`.
- Sitemap: `public/sitemap.xml`.
- Robots: `public/robots.txt`.

---

## 14. Build & Deploy

```bash
# Local dev (sin build, abre directo)
npm run dev          # → http://localhost:3000

# Build de producción → /dist
npm install          # primera vez
npm run build

# Deploy
git push             # Vercel hace deploy automático
```

`vercel.json` ya tiene cache headers (1 año para assets, no-cache para HTML) y security headers.

---

## 15. Estructura de archivos

```
marianomtza-web/
├── index.html          ← entry, SEO, SITE_CONFIG, CSS
├── app.jsx             ← root: orden de secciones, marquees data
├── build.mjs           ← build script
├── package.json
├── vercel.json
├── components/
│   ├── audio.jsx       ← Web Audio + piano notes
│   ├── Cursor.jsx
│   ├── Loader.jsx
│   ├── Nav.jsx
│   ├── Hero.jsx        ← título piano, roles rotation
│   ├── Band.jsx        ← marquees (acepta items como string o {name, href})
│   ├── Stats.jsx       ← 7+ / 55+ / 2000 / 10+
│   ├── Events.jsx      ← Noches Memorables
│   ├── Roster.jsx      ← 10 artistas + modal
│   ├── Contact.jsx     ← Booking form (Servicio/Artista toggle)
│   ├── Footer.jsx
│   └── Tweaks.jsx
├── public/             ← favicon, og-image, robots, sitemap (copiados a / en build)
├── uploads/            ← fotos de artistas, etc.
└── styles.css          ← (legacy, opcional — todo el CSS está inline en index.html)
```
