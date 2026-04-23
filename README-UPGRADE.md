# MARIANOMTZA v3 - UPGRADED (Hero + Roster + Booking)

## ✅ Cambios realizados (22 Abril 2026)

### 1. Hero — Dock Effect + Tone.js (nuevo)
- Efecto dock real con `useMotionValue` + `useTransform` + `useSpring`
- Audio con Tone.js + debounce de 80ms
- 11 notas mapeadas a las letras de "MARIANOMTZA"
- Rotación de roles suave

### 2. Roster — Grid Asimétrico + Modal con layoutId
- Tarjetas de diferentes tamaños (large/medium/small)
- Hover sutil
- Modal que se expande desde la tarjeta (Framer Motion layoutId)
- Botón BOOK que autofill el formulario

### 3. Booking — Toggle + Autofill
- Toggle animado Artista / Servicio
- Autocompletado automático desde el Roster
- Formulario limpio y de alta conversión
- Validación básica + estado de envío

---

## Cómo usar estos archivos

1. Reemplaza los archivos en tu proyecto actual:
   - `src/components/Hero.jsx`
   - `src/components/Roster.jsx`
   - `src/components/Booking.jsx`
   - `src/contexts/BookingContext.jsx`
   - `src/data/roster.ts`
   - `src/components/index.jsx`

2. Asegúrate de tener instaladas estas dependencias:
   ```bash
   npm install framer-motion tone
   ```

3. (Opcional) Agrega el endpoint de API en `/api/booking` usando Resend + Zod.

---

**Archivos incluidos en este zip:**
- Hero.jsx (dock effect + audio)
- Roster.jsx (asimétrico + modal)
- Booking.jsx (toggle + autofill)
- BookingContext.jsx
- roster.ts
- package.json (referencia)

Listo para producción. 🚀
