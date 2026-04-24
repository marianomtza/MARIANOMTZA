import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

const nav = read('app/components/Navbar.tsx')
const booking = read('app/components/Booking.tsx')
const dock = read('app/components/MusicDock.tsx')
const bg = read('app/components/hero/HeroBackground.tsx')
const drawings = read('app/components/Dibujos.tsx')
const theme = read('app/lib/design-tokens.ts')

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

test('music prioriza Musical Monday y mantiene arquitectura de mixes', () => {
  assert.ok(dock.indexOf('Musical Monday') < dock.indexOf('Sega Bodega'))
  assert.match(dock, /const MIXES: Mix\[]/)
})

test('fondo mantiene 3D real y no placeholder plano', () => {
  assert.match(bg, /HeroScene3D/)
  assert.match(read('app/components/hero/HeroScene3D.tsx'), /@react-three\/fiber/)
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
  assert.match(theme, /dark:[\s\S]*'--accent': '#a78bfa'/)
})
