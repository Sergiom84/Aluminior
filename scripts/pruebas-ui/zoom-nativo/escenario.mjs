import { expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { medirZoom, capturarNativo } from './navegador.mjs'

const inicio = page => page.getByRole('button', { name: 'Añadir primera ventana', exact: true })
const aceptar = page => page.locator('#configurador button[type="submit"]')
const borrador = page => page.locator('#configurador').evaluate(e => Object.fromEntries(new FormData(e)))

async function enfocado(page) {
  const data = await page.evaluate(() => {
    const e = document.activeElement, r = e.getBoundingClientRect(), s = getComputedStyle(e)
    return { tag: e.tagName, name: e.getAttribute('name'), label: e.getAttribute('aria-label'),
      role: e.getAttribute('role'), text: e.textContent.trim().slice(0, 100),
      focusVisible: e.matches(':focus-visible'), outline: parseFloat(s.outlineWidth),
      outlineStyle: s.outlineStyle, visible: r.width > 0 && r.height > 0 && r.top >= -1 &&
        r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1 }
  })
  assert(data.focusVisible && data.outline > 0 && data.outlineStyle !== 'none' && data.visible,
    'Foco no visible o fuera de viewport: ' + JSON.stringify(data))
  return data
}

async function captura(page, out, name) {
  const geometry = await medirZoom(page)
  assert(geometry.scroll <= geometry.client + 1, 'Overflow de página en ' + name)
  const png = await capturarNativo(page, resolve(out, name + '.png'))
  return { ...geometry, png }
}

export async function escenario(page, out, width, mode) {
  const name = `${width}-${mode}`
  await expect(inicio(page)).toBeVisible()
  await inicio(page).focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Añadir ventana' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.evaluate(e => e.contains(document.activeElement))).toBe(true)
  // Recorre cada control interior en ambos sentidos, sin incluir la barra de Chrome.
  const modalKeys = []
  const controls = await dialog.locator('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]').filter({ visible: true }).elementHandles()
  assert(controls.length > 1, 'Catálogo sin controles')
  const initial = await enfocado(page)
  await controls[0].focus()
  for (let i = 0; i < controls.length; i++) {
    modalKeys.push(await enfocado(page))
    assert(await controls[i].evaluate(e => document.activeElement === e), 'Orden de Tab inesperado')
    assert(await dialog.evaluate(e => e.contains(document.activeElement)),
      'Tab salió del selector')
    if (i < controls.length - 1) await page.keyboard.press('Tab')
  }
  const backwards = []
  for (let i = controls.length - 2; i >= 0; i--) {
    await page.keyboard.press('Shift+Tab')
    backwards.push(await enfocado(page))
    assert(await controls[i].evaluate(e => document.activeElement === e), 'Orden de Shift+Tab inesperado')
  }
  await captura(page, out, name + '-selector')
  const c2 = dialog.getByRole('button', { name: 'VENTANA CORREDERA DE DOS HOJAS [C2]', exact: true })
  await c2.focus()
  await page.keyboard.press('Enter')
  await page.locator('[name="configuracionCerramiento"]').waitFor({ state: 'attached' })
  await page.getByRole('textbox', { name: 'Ubicación', exact: true }).fill('SALA QA')
  await page.getByRole('combobox', { name: 'Serie', exact: true }).selectOption('QA-SERIE')
  await page.locator('[name="cantidad"]').fill('3')
  await page.locator('[name="horasFabricacion"]').fill('1.25')
  await page.locator('[name="horasColocacion"]').fill('2.5')
  const original = await borrador(page)
  const labels = await page.locator('label[for="referencia"]').evaluate(label => {
    const fields = label.parentElement.parentElement
    return [...fields.querySelectorAll('label')].map(e => {
      const range = document.createRange()
      range.selectNodeContents(e)
      const parent = e.parentElement.getBoundingClientRect()
      const rects = [...range.getClientRects()].map(r => ({ left: r.left, right: r.right }))
      return { text: e.textContent, rects, parent: { left: parent.left, right: parent.right },
        contained: rects.every(r => r.left >= parent.left - 1 && r.right <= parent.right + 1) }
    })
  })
  assert(labels.length > 0, 'No se inspeccionaron etiquetas reales')
  const config = await captura(page, out, name + '-configurador')
  await page.evaluate(mode => { window.qa.mode = mode }, mode)
  await aceptar(page).focus()
  await page.keyboard.press('Enter')
  await expect(aceptar(page)).toBeDisabled()
  assert.deepEqual(await borrador(page), original)
  await expect.poll(() => page.evaluate(() => window.qa.calls.length)).toBe(1)
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => window.qa.calls.length), 1)
  await captura(page, out, name + '-pendiente')
  await page.evaluate(() => window.qa.release())
  await expect(aceptar(page)).toHaveText('Aceptar')
  let rejection = null
  if (mode !== 'success') {
    const message = mode === 'field' ? 'Serie sintética rechazada' : mode === 'general'
      ? 'Rechazo sintético de línea' : 'No se pudo confirmar el guardado. Vuelve a intentarlo.'
    await expect(page.getByText(message, { exact: true })).toBeVisible()
    rejection = await enfocado(page)
    assert(mode === 'field' ? rejection.name === 'serieCodigo' : rejection.role === 'alert')
    assert.deepEqual(await borrador(page), original)
    await captura(page, out, name + '-rechazo')
    await page.keyboard.press('Tab')
    const next = await enfocado(page)
    await page.keyboard.press('Shift+Tab')
    const previous = await enfocado(page)
    await page.evaluate(() => { window.qa.mode = 'success' })
    await aceptar(page).focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => page.evaluate(() => window.qa.calls.length)).toBe(2)
    assert.deepEqual(await page.evaluate(() => window.qa.calls[0]), await page.evaluate(() => window.qa.calls[1]))
    await page.evaluate(() => window.qa.release())
    await expect(aceptar(page)).toHaveText('Aceptar')
    rejection = { focus: rejection, next, previous }
  }
  await expect(page.getByRole('status')).toHaveText('Alta sintética aceptada ' + (mode === 'success' ? 1 : 2))
  await expect(inicio(page)).toBeFocused()
  const accepted = await enfocado(page)
  await captura(page, out, name + '-aceptado')
  await page.keyboard.press('Enter')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(inicio(page)).toBeFocused()
  const escaped = await enfocado(page)
  return { width, mode, config, labels, initial, modalKeys, backwards, rejection, accepted, escaped }
}
