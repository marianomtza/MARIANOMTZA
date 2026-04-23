# MARIANO MTZA — Web v3.0

Portfolio oficial de Mariano Martínez, productor de eventos y curador de experiencias sonoras en Ciudad de México.

## ✨ Características

- **Hero interactivo** con dock musical (letras que se magnifican + notas de piano con Tone.js)
- **Roster de artistas** con grid asimétrico y modal elegante
- **Formulario de reserva** completamente en español, con autofill desde el roster y celebración con confetti
- **Navegación móvil** con menú hamburguesa animado
- **Scroll suave** con Lenis
- **Diseño coherente** negro + morado, sin ruido visual, sin emojis
- **100% en español** (excepto "Booking" si aplica)
- Optimizado para performance y escalabilidad

## 🚀 Deploy en Vercel (recomendado)

1. Sube el proyecto a GitHub
2. Importa en Vercel
3. `npm install && npm run build` (automático)
4. Listo. El sitio es estático y funciona inmediatamente.

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
```

## 📦 Estructura

```
src/
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Roster.tsx
│   └── Booking.tsx
├── contexts/
│   └── BookingContext.tsx
├── data/
│   └── roster.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🔧 Personalización

- Cambia colores en `tailwind.config.js` (accent = morado principal)
- Edita artistas en `src/data/roster.ts`
- Para backend real de reservas: integra @supabase/supabase-js (el SQL está listo en /supabase si lo necesitas)

## 📝 Notas

Este proyecto fue **reconstruido desde cero** para cumplir con los más altos estándares de calidad, coherencia y UX. Sin parches, sin código inconsistente, sin mezclas de idiomas.

Listo para producción. 

**Construido con:** React + TypeScript + Vite + Tailwind + Framer Motion + Tone.js + Lenis
