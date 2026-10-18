import assert from 'node:assert/strict'
import { expect } from '@playwright/test'

const inicio = page => page.getByRole('button', { name: 'Añadir primera ventana', exact: true })
const aceptar = page => page.locator('#configurador button[type="submit"]')
const borrador = page => page.locator('#configurador').evaluate(form => Object.fromEntries(new FormData(form)))
const llamadas = page => page.evaluate(() => window.qa.calls)
const modo = (page, value) => page.evaluate(v => { window.qa.mode = v }, value)

async function foco(page) {
  return page.evaluate(() => {
    const e = document.activeElement, r = e.getBoundingClientRect(), s = getComputedStyle(e)
    return { tag: e.tagName, name: e.getAttribute('name'), label: e.getAttribute('aria-label'),
      role: e.getAttribute('role'), inside: !!e.closest('#configurador'), visible: r.width > 0 && r.height > 0 &&
        r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
      focusVisible: e.matches(':focus-visible'), outline: parseFloat(s.outlineWidth), outlineStyle: s.outlineStyle }
  })
}

async function preparar(page) {
  await inicio(page).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('dialog', { name: 'Añadir ventana' }).getByRole('button', {
    name: 'VENTANA CORREDERA DE DOS HOJAS [C2]', exact: true,
  }).click()
  await page.locator('input[name="configuracionCerramiento"]').waitFor({ state: 'attached' })
  await page.getByRole('textbox', { name: 'Ubicación', exact: true }).fill('SALA QA')
  await page.getByRole('combobox', { name: 'Serie', exact: true }).selectOption('QA-SERIE')
  await page.locator('[name="cantidad"]').fill('3')
  await page.locator('[name="horasFabricacion"]').fill('1.25')
  await page.locator('[name="horasColocacion"]').fill('2.5')
}

async function enviar(page, numero) {
  await aceptar(page).focus()
  await page.keyboard.press('Enter')
  await expect(aceptar(page)).toBeDisabled()
  await expect.poll(async () => (await llamadas(page)).length).toBe(numero)
  // El gateway retiene la respuesta: comprobar borrador y bloqueo antes de liberarla.
  const pendiente = await borrador(page)
  await page.keyboard.press('Enter')
  assert.equal((await llamadas(page)).length, numero, 'Envío duplicado mientras está pendiente')
  await page.evaluate(() => window.qa.release())
  await expect(aceptar(page)).toHaveText('Aceptar')
  return pendiente
}

async function retorno(page, fallos, etiqueta) {
  await expect(inicio(page)).toBeVisible()
  await expect(page.locator('[name="configuracionCerramiento"]')).toHaveCount(0)
  const after = await foco(page)
  if (!(after.inside && after.label === 'Añadir primera ventana' && after.visible &&
    after.focusVisible && after.outline > 0 && after.outlineStyle !== 'none')) fallos.push(etiqueta)
  return after
}

export async function escenario(page, base, variant, width, rechazo = null) {
  await page.setViewportSize({ width, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${base}/${variant}`)
  await expect(inicio(page)).toBeVisible()
  assert.equal(await page.locator('#documento').evaluate(e => e === document.activeElement), true, 'Robo de foco inicial')
  for (const name of ['Artículos', 'Cerramiento']) {
    const tab = page.getByRole('button', { name, exact: true })
    await tab.click()
    await expect(tab).toBeFocused()
  }
  await preparar(page)
  const original = await borrador(page)
  const fallos = []
  let errorFocus = null, intentos = 0
  if (rechazo) {
    await modo(page, rechazo)
    assert.deepEqual(await enviar(page, ++intentos), original, 'Borrador alterado durante el envío')
    const mensaje = rechazo === 'field' ? 'Serie sintética rechazada' : rechazo === 'throw'
      ? 'No se pudo confirmar el guardado. Vuelve a intentarlo.' : 'Rechazo sintético de línea'
    await expect(page.getByText(mensaje, { exact: true })).toBeVisible()
    assert.deepEqual(await borrador(page), original, 'Borrador perdido tras rechazo')
    errorFocus = await foco(page)
    assert.equal(errorFocus.inside, true)
    assert.equal(rechazo === 'field' ? errorFocus.name === 'serieCodigo' : errorFocus.role === 'alert', true)
  }
  await modo(page, 'success')
  assert.deepEqual(await enviar(page, ++intentos), original, 'Reintento altera el borrador')
  await expect(page.getByRole('status')).toHaveText('Alta sintética aceptada ' + intentos)
  const after = await retorno(page, fallos, rechazo ? 'reintento-' + rechazo : 'alta')
  const requests = await llamadas(page)
  if (rechazo) assert.deepEqual(requests[0], requests[1], 'El reintento cambia solicitud o datos')
  // El foco retornado permite abrir el selector con Enter y salir con Escape.
  if (!fallos.length) {
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Añadir ventana' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(inicio(page)).toBeFocused()
  }
  await preparar(page)
  await enviar(page, ++intentos)
  await expect(page.getByRole('status')).toHaveText('Alta sintética aceptada ' + intentos)
  const second = await retorno(page, fallos, 'segunda-alta')
  const allRequests = await llamadas(page)
  assert.notEqual(allRequests.at(-1).solicitudId, allRequests[0].solicitudId, 'Nueva alta reutiliza identidad confirmada')
  const geometry = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches }))
  assert(geometry.scroll <= width + 1 && geometry.reduced, 'Overflow o preferencia de movimiento')
  if (variant === 'actual' && !rechazo && [1280, 320].includes(width)) {
    await page.screenshot({ path: `output/playwright/p67-alta-foco-20261018/foco-${width}.png`, fullPage: true })
  }
  return { variant, width, rechazo, fallos, after, second, errorFocus, geometry, intentos }
}
