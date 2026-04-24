import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const exists = (p) => fs.existsSync(path.join(process.cwd(), p))

const hero = read('app/components/Hero.tsx')
assert(hero.includes('onFocus={() => onTrigger(index)}'), 'Hero letters should trigger note on focus')
assert(hero.includes('usePianoDock'), 'Hero must wire piano hook')

const music = read('app/components/MusicDock.tsx')
assert(music.includes('Musical Monday'), 'MusicDock should include Musical Monday')
assert(music.includes('<iframe'), 'MusicDock should provide playable embed')

const tokens = read('app/lib/design-tokens.ts')
assert(tokens.includes("dark"), 'Theme tokens should include dark theme')
assert(tokens.includes("light"), 'Theme tokens should include light theme')

const booking = read('app/components/Booking.tsx')
assert(booking.includes('mailto:'), 'Booking email must use mailto')
assert(booking.includes('https://wa.me/'), 'Booking phone must use WhatsApp link')
for (const item of ['$2,000–$5,000 MXN', '$5,000–$10,000 MXN', '$10,000–$25,000 MXN', '$25,000–$50,000 MXN', '$50,000+ MXN']) {
  assert(booking.includes(item), `Missing budget option ${item}`)
}

const nav = read('app/components/Navbar.tsx')
assert(nav.includes("{ label: 'Booking', id: 'reserva' }"), 'Booking should exist in nav')
assert(nav.includes('href="/inspiracion"'), 'Nav should point to /inspiracion')
assert(!nav.includes('Dibujos'), 'Nav must not include Dibujos')
assert(!nav.includes('/lab'), 'Nav must not link /lab')

assert(!exists('app/lab/page.tsx'), 'No /lab route file should exist')
assert(!exists('app/inspiracion/page.tsx'), 'No real /inspiracion route file should exist')

const dibujos = read('app/components/Dibujos.tsx')
assert(dibujos.includes('localStorage'), 'Dibujos must persist locally')
assert(dibujos.includes('Colgar dibujo'), 'Dibujos must expose Colgar dibujo action')

const notFound = read('app/not-found.tsx')
assert(notFound.includes('requestAnimationFrame'), '404 minigame should run animation loop')
assert(notFound.includes('localStorage.getItem'), '404 minigame should load hi-score')

const egg = read('app/components/system/EasterEgg.tsx')
assert(egg.includes('useKonamiCode'), 'Konami trigger must be wired')
assert(egg.includes('Afterhours'), 'Konami celebration content should render')

console.log('All requirement checks passed.')
