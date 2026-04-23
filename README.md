# MARIANO MTZA — Web v3.0

Portfolio oficial de Mariano Martínez, productor de eventos y curador de experiencias sonoras en Ciudad de México.

## ✨ Características

- **Hero interactivo** con dock musical (letras que se magnifican)
- **Roster de artistas** con grid asimétrico y modal elegante
- **Formulario de reserva** completamente en español, con autofill desde el roster y celebración con confetti
- **Navegación móvil** con menú hamburguesa animado
- **Scroll suave** con Lenis
- **Diseño coherente** negro + morado, sin ruido visual
- Optimizado para performance y escalabilidad

## 🚀 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa en Vercel
3. Build command: `npm run build`
4. Output: gestionado por Next.js

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
```

## 🔐 Variables de entorno (producción)

Configura Supabase para persistencia de dibujos y solicitudes:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Luego ejecuta el esquema base en tu proyecto de Supabase: `supabase/schema.sql`.

## 📦 Estructura (runtime actual)

```
app/
├── components/
├── contexts/
├── hooks/
├── lib/
├── api/
├── layout.tsx
└── page.tsx
```

## 🔧 Personalización

- Cambia colores en `tailwind.config.js` (accent = morado principal)
- Edita artistas en `app/lib/roster.ts`
- Configura variables para servicios externos en `.env` según corresponda

## 📝 Stack actual

**Next.js + TypeScript + Tailwind + Framer Motion + Tone.js + Lenis**
