import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { abrirHarness } from './harness.mjs'
import { abrirNavegador, medirZoom, comprobarZoom } from './navegador.mjs'
import { escenario } from './escenario.mjs'

// Cada ejecución tiene su propio directorio: nunca sustituye evidencia anterior.
const out = resolve('output/playwright', 'p67-zoom-nativo-' + new Date().toISOString().replaceAll(/[:.]/g, '-'))
mkdirSync(out, { recursive: true })
const evidence = { out, rows: [], baselines: [], errors: [], blocked: [] }
evidence.controlRef = process.argv[2] ?? null
let harness, browser
try {
  harness = await abrirHarness(out, evidence.controlRef)
  browser = await abrirNavegador(out)
  const { page, context } = browser
  page.on('pageerror', e => evidence.errors.push(String(e)))
  await page.route('**/*', route => {
    const r = route.request()
    if (new URL(r.url()).origin === harness.base && r.method() === 'GET') return route.continue()
    evidence.blocked.push({ url: r.url(), method: r.method() })
    return route.abort()
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(harness.base + '/referencia-dialogo')
  evidence.nativeDialogReference = []
  for (let i = 0; i < 4; i++) {
    evidence.nativeDialogReference.push(await page.evaluate(() => ({
      tag: document.activeElement.tagName, text: document.activeElement.textContent,
      documentHasFocus: document.hasFocus(), inside: !!document.activeElement.closest('dialog'),
    })))
    await page.keyboard.press('Tab')
  }
  assert.deepEqual(evidence.nativeDialogReference.map(r => [r.tag, r.documentHasFocus, r.inside]),
    [['BUTTON', true, true], ['BUTTON', true, true], ['BODY', false, false], ['BUTTON', true, true]])
  for (const width of [1280, 768, 640]) {
    await browser.resize(width)
    await browser.zoom(1)
    await page.goto(harness.base)
    const baseline = await medirZoom(page)
    await browser.zoom(2)
    await page.reload()
    const zoomed = await medirZoom(page)
    comprobarZoom(baseline, zoomed)
    evidence.baselines.push({ width, baseline, zoomed })
    for (const mode of ['success', 'field', 'general', 'throw']) {
      await page.goto(harness.base)
      evidence.rows.push(await escenario(page, out, width, mode))
    }
  }
  assert.equal(evidence.rows.length, 12)
  evidence.labelFailures = evidence.rows.filter(r => r.labels.some(l => !l.contained)).length
  assert.equal(evidence.labelFailures, 0, 'Escenarios con etiquetas fuera de su campo')
  assert.deepEqual(evidence.errors, [])
  assert.deepEqual(evidence.blocked, [])
  assert(harness.requests.length > 0 && harness.requests.every(r => r.method === 'GET'))
  evidence.passed = true
  evidence.version = context.browser().version()
  console.log(JSON.stringify({ passed: true, scenarios: evidence.rows.length, out }))
} catch (error) {
  evidence.failure = String(error.stack)
  process.exitCode = 1
  console.error(error)
} finally {
  await browser?.context.close()
  await harness?.close()
  evidence.requests = harness?.requests
  evidence.closed = true
  writeFileSync(resolve(out, 'navegador.json'), JSON.stringify(evidence, null, 2))
}
