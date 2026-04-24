import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

const nav = read('app/components/Navbar.tsx')
const booking = read('app/components/Booking.tsx')
const dock = read('app/components/MusicDock.tsx')
const bg = read('app/components/hero/HeroBackground.tsx')
const scene3d = read('app/components/hero/HeroScene3D.tsx')
const drawings = read('app/components/Dibujos.tsx')
const theme = read('app/lib/design-tokens.ts')
const hero = read('app/components/Hero.tsx')
const nf = read('app/not-found.tsx')

test('nav contiene Inspiración después de Booking y no Dibujos', () => {
  const idxBooking = nav.indexOf("{ label: 'Booking'")
  const idxInspo = nav.indexOf('href="/inspiracion"')
  assert.ok(idxBooking !== -1)
  assert.ok(idxInspo > idxBooking)
  assert.equal(nav.includes("{ label: 'Dibujos'"), false)
})

test('/inspiracion no tiene página propia', () => {
  assert.equal(existsSync(new URL('../app/inspiracion/page.tsx', import.meta.url)), false)
})

test('contacto separado y links correctos', () => {
  assert.match(booking, /hola@marianomtza\.com/)
  assert.match(booking, /\+52 443 426 4931/)
  assert.match(booking, /mailto:\$\{CONTACT\.email\}/)
  assert.match(booking, /https:\/\/wa\.me\/\$\{CONTACT\.phoneClean\}/)
})

test('presupuesto incluye rango desde $2,000 MXN', () => {
  assert.match(booking, /\$2,000–\$5,000 MXN/)
})

test('music prioriza Musical Monday y mantiene embed funcional', () => {
  assert.ok(dock.indexOf('Musical Monday') < dock.indexOf('Sega Bodega'))
  assert.match(dock, /iframe/)
  assert.match(dock, /Apple Music/)
})

test('fondo mantiene 3D real y dinámica R3F', () => {
  assert.match(bg, /HeroScene3D/)
  assert.match(scene3d, /@react-three\/fiber/)
  assert.match(scene3d, /planeGeometry/)
  assert.match(scene3d, /useFrame/)
})

test('museo de dibujos persiste y lista piezas', () => {
  assert.match(drawings, /STORAGE_KEY/)
  assert.match(drawings, /localStorage\.setItem/)
  assert.match(drawings, /museum\.map/)
  assert.match(drawings, /Colgar dibujo/)
})

test('theme dark\/light y acento no invertidos', () => {
  assert.match(theme, /dark:[\s\S]*'--bg': '#070707'/)
  assert.match(theme, /light:[\s\S]*'--bg': '#f9f7f2'/)
})

test('hero mantiene piano hover y focus', () => {
  assert.match(hero, /onMouseEnter=\{\(\) => onFocusNote\(index\)\}/)
  assert.match(hero, /onFocus=\{\(\) => onFocusNote\(index\)\}/)
})

test('404 minijuego incluye canvas, obstáculos, hi-score y restart', () => {
  assert.match(nf, /canvasRef/)
  assert.match(nf, /obstacles/)
  assert.match(nf, /localStorage\.setItem\('mmtza-404-hi'/)
  assert.match(nf, /Space \/ Tap para iniciar/)
})
