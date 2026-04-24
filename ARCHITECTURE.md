# Arquitectura actual (producción)

## Rutas
- `/` landing principal (Hero, barras rotativas, roster, eventos, booking, footer).
- `/inspiracion` ruta editorial con galería y museo persistente de dibujos.
- `not-found` mini juego 404 renderizado por App Router.
- API routes: `/api/booking` y `/api/drawings`.

## Capas
- `app/components/*`: secciones de UI y sistema (tema, sonido, easter egg).
- `app/components/hero/*`: background y escena 3D del Hero.
- `app/components/inspiracion/*`: galería y módulo de dibujos.
- `app/hooks/*`: interacción (piano, konami, canvas, scroll).
- `app/lib/*`: utilidades de validación, rate limit, fetch con retry, supabase.

## Integraciones
- Supabase opcional: si faltan variables, API de drawings responde fallback y el cliente persiste en localStorage.
- Tone.js solo se importa en cliente y bajo interacción.

## Reglas de estabilidad
- Sin rewrite global en Vercel: App Router resuelve `/inspiracion` y 404 reales.
- `requestAnimationFrame` en HeroScene3D y 404 con cleanup al desmontar.
- Validación robusta y límites de payload en endpoints POST.
