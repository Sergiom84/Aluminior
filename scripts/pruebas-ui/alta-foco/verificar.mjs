import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { abrirHarness } from './harness.mjs'
import { escenario } from './escenarios.mjs'

const out = resolve('output/playwright/p67-alta-foco-20261018')
mkdirSync(out, { recursive: true })
const controlRef = process.argv[2] ?? 'd0e4b29bb506e3741397af81f5dec286dd1fb03e'
const harness = await abrirHarness(out, controlRef)
let browser
const rows = [], errores = [], requestsBlocked = []
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.on('pageerror', e => errores.push(String(e)))
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === harness.base && route.request().method() === 'GET') return route.continue()
    requestsBlocked.push(route.request().url())
    return route.abort()
  })
  for (const rechazo of [null, 'field', 'general', 'throw']) {
    rows.push(await escenario(page, harness.base, 'control', 1280, rechazo))
  }
  for (const width of [1280, 768, 375, 320]) {
    for (const rechazo of [null, 'field', 'general', 'throw']) {
      rows.push(await escenario(page, harness.base, 'actual', width, rechazo))
    }
  }
  assert(rows.filter(r => r.variant === 'control').every(r => r.fallos.length === 2), 'Control no discrimina ambas altas')
  assert(rows.filter(r => r.variant === 'actual').every(r => r.fallos.length === 0), 'Retorno de foco incorrecto')
  assert.deepEqual(errores, [])
  assert.deepEqual(requestsBlocked, [])
  console.log(JSON.stringify({ passed: true, scenarios: rows.length,
    controlFailures: rows.filter(r => r.variant === 'control').reduce((n, r) => n + r.fallos.length, 0),
    actualScenarios: rows.filter(r => r.variant === 'actual').length, widths: [1280, 768, 375, 320] }))
} finally {
  writeFileSync(resolve(out, 'navegador.json'), JSON.stringify({ controlRef, changed: harness.changed, rows, errores, requestsBlocked }, null, 2))
  await browser?.close()
  await harness.close()
}
