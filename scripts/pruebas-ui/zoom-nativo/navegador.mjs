import { chromium, expect } from '@playwright/test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import assert from 'node:assert/strict'

export async function abrirNavegador(out) {
  const profile = mkdtempSync(join(tmpdir(), 'aluminior-zoom-'))
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chrome', headless: false, viewport: null,
    args: ['--window-size=1280,1000', '--force-device-scale-factor=1'],
  })
  try {
    const settings = context.pages()[0]
    await settings.goto('chrome://settings/appearance')
    await settings.locator('#zoomLevel').selectOption('1')
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    const { windowId } = await cdp.send('Browser.getWindowForTarget')
    const resize = width => cdp.send('Browser.setWindowBounds', {
      windowId, bounds: { windowState: 'normal', width, height: 1000 },
    })
    const zoom = async value => {
      await settings.bringToFront()
      await settings.locator('#zoomLevel').selectOption(String(value))
      await expect(settings.locator('#zoomLevel')).toHaveValue(String(value))
      const selected = await settings.locator('#zoomLevel').evaluate(e => ({
        value: e.value, text: e.selectedOptions[0].textContent.trim(),
      }))
      if (value === 2) {
        assert.equal(selected.text, '200%')
        await settings.locator('#zoomLevel').scrollIntoViewIfNeeded()
        await capturarNativo(settings, resolve(out, 'ajuste-200.png'))
        writeFileSync(resolve(out, 'ajuste-200.json'), JSON.stringify(selected, null, 2))
      }
      await page.bringToFront()
      return selected
    }
    return { context, page, resize, zoom, profile }
  } catch (error) { await context.close(); throw error }
}

export async function medirZoom(page) {
  return page.evaluate(() => ({
    inner: innerWidth, outer: outerWidth, height: innerHeight, dpr: devicePixelRatio,
    scale: visualViewport.scale, css: getComputedStyle(document.documentElement).zoom,
    client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }))
}

export function comprobarZoom(base, actual) {
  assert(Math.abs(actual.inner * 2 - base.inner) <= 2, 'No se redujo a la mitad el viewport CSS')
  assert(Math.abs(actual.dpr / base.dpr - 2) < 0.01, 'DPR no refleja zoom nativo 200%')
  assert.equal(actual.outer, base.outer, 'Cambió el ancho de ventana entre mediciones')
  assert.equal(actual.scale, 1, 'No se admite pinch zoom')
  assert.equal(actual.css, '1', 'No se admite zoom CSS')
  assert(actual.scroll <= actual.client + 1, 'Overflow horizontal de página')
  assert(actual.reduced, 'Falta movimiento reducido')
}

// Sin clip: Playwright recorta con dimensiones CSS y Chrome aplica zoom nativo.
// CDP captura la superficie física completa; se contrasta su cabecera PNG.
export async function capturarNativo(page, path) {
  const session = await page.context().newCDPSession(page)
  try {
    const { data } = await session.send('Page.captureScreenshot', {
      format: 'png', fromSurface: true, captureBeyondViewport: false,
    })
    const png = Buffer.from(data, 'base64')
    const metrics = await medirZoom(page)
    const dimensions = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
    assert(Math.abs(dimensions.width - metrics.inner * metrics.dpr) <= 2,
      'Captura recortada horizontalmente: ' + JSON.stringify({ dimensions, metrics }))
    assert(Math.abs(dimensions.height - metrics.height * metrics.dpr) <= 2,
      'Captura recortada verticalmente')
    assert(png.length > 5000, 'Captura vacía o sin contenido suficiente')
    writeFileSync(path, png)
    return { ...dimensions, bytes: png.length }
  } finally { await session.detach() }
}
