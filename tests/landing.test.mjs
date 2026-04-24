import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('lab route removed', () => {
  assert.equal(existsSync(new URL('../app/lab/page.tsx', import.meta.url)), false)
})

test('landing includes dibujos section', () => {
  const page = read('app/page.tsx')
  assert.match(page, /<Dibujos\s*\/>/)
})

test('music dock includes Musical Monday and Sega Bodega', () => {
  const dock = read('app/components/MusicDock.tsx')
  assert.match(dock, /Musical Monday/)
  assert.match(dock, /Sega Bodega/)
})

test('dibujos supports pointer pressure', () => {
  const dibujos = read('app/components/Dibujos.tsx')
  assert.match(dibujos, /pressure/)
  assert.match(dibujos, /onPointerDown/)
})

test('404 has obstacles and restart hint', () => {
  const notFound = read('app/not-found.tsx')
  assert.match(notFound, /obstacles/)
  assert.match(notFound, /reiniciar/i)
})
