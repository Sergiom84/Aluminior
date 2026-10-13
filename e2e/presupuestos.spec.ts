import { test, expect, type Page } from '@playwright/test'
import postgres from 'postgres'
import { entornoE2e } from './entorno.ts'

const sql = postgres(entornoE2e().destino)
test.afterAll(() => sql.end())

/** Ejecuta el POST completo, consume su respuesta y corta solo la entrega al navegador. */
async function perderRespuesta(page: Page) {
  let descartada = false
  await page.route('**/dashboard/presupuestos**', async route => {
    const req = route.request()
    if (descartada || req.method() !== 'POST' || !req.headers()['next-action']) return route.continue()
    descartada = true
    const respuesta = await route.fetch()
    expect(respuesta.status()).toBe(200)
    await respuesta.body()
    await route.abort('connectionreset')
  })
}

async function alta(page: Page, nombre: string) {
  await page.goto('/dashboard/presupuestos/nuevo')
  await expect(page.getByLabel('Nombre', { exact: true })).toBeFocused()
  await page.getByLabel('Nombre', { exact: true }).fill(nombre)
  await page.getByLabel('Obra', { exact: true }).fill('Recorrido sintético de CI')
  await page.getByLabel('Tarifa', { exact: true }).fill('9')
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
}

async function documento(nombre: string) {
  return sql`select id, numero, revision from presupuestos where nombre_libre = ${nombre} order by numero, revision`
}

test('alta y ambas copias recuperan el mismo documento tras perder respuesta', async ({ page }, info) => {
  const nombre = `QA CI reintentos ${info.project.name} ${Date.now()}`
  await perderRespuesta(page)
  await alta(page, nombre)
  await expect(page.getByRole('button', { name: 'Reintentar', exact: true })).toBeVisible()
  const creados = await documento(nombre)
  expect(creados).toHaveLength(1)
  await page.reload()
  await page.getByRole('button', { name: 'Reintentar', exact: true }).press('Enter')
  await expect(page).toHaveURL(new RegExp(creados[0].id))
  expect(await documento(nombre)).toHaveLength(1)
  await page.unrouteAll({ behavior: 'wait' })

  for (const operacion of ['Nuevo presupuesto', 'Nueva revisión']) {
    await page.goto(`/dashboard/presupuestos?q=${encodeURIComponent(nombre)}`)
    const fila = page.getByRole('row').filter({ has: page.locator(`a[href="/dashboard/presupuestos/${creados[0].id}"]`) })
    await fila.getByRole('button', { name: 'Copiar…', exact: true }).click()
    await perderRespuesta(page)
    await fila.getByRole('button', { name: operacion, exact: true }).click()
    await expect(fila.getByRole('button', { name: 'Reintentar', exact: true })).toBeVisible()
    const antes = await documento(nombre)
    await fila.getByRole('button', { name: 'Reintentar', exact: true }).press('Enter')
    await expect(page).toHaveURL(/\/presupuestos\/[0-9a-f-]{36}$/)
    const despues = await documento(nombre)
    expect(despues).toEqual(antes)
    expect(despues.map(p => p.id)).toContain(page.url().split('/').at(-1))
    await page.unrouteAll({ behavior: 'wait' })
  }
  expect(await documento(nombre)).toHaveLength(3)
})

test('medidas fraccionarias: guardar, reabrir y emitir PDF', async ({ page }, info) => {
  const nombre = `QA CI decimales ${info.project.name} ${Date.now()}`
  await alta(page, nombre)
  await expect(page).toHaveURL(/\/presupuestos\/[0-9a-f-]{36}(#configurador)?$/)
  const id = new URL(page.url()).pathname.split('/').at(-1)!
  await page.getByRole('option', { name: 'FIJOS ABATIBLES', exact: true }).click()
  await page.getByRole('button', { name: /\[0\]$/ }).click()
  await page.getByRole('button', { name: 'Colocar 0', exact: true }).press('Enter')
  await page.getByLabel('Ancho elemento', { exact: true }).fill('970.25')
  await page.getByLabel('Alto elemento', { exact: true }).fill('439.5')
  await page.getByRole('button', { name: 'Actualizar elemento', exact: true }).press('Enter')
  await page.getByRole('button', { name: 'Aceptar', exact: true }).click()
  await expect(page.getByRole('cell', { name: '439.5', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('cell', { name: '970.25', exact: true })).toBeVisible()
  const [linea] = await sql`select id, ancho_mm, alto_mm, precio_unitario from lineas where presupuesto_id = ${id}`
  expect(linea).toMatchObject({ ancho_mm: 970.25, alto_mm: 439.5, precio_unitario: null })
  await page.getByRole('button', { name: 'Editar', exact: true }).click()
  await expect(page.getByLabel('Alto elemento', { exact: true })).toHaveValue('439.5')
  await page.getByLabel('Alto elemento', { exact: true }).fill('1999.5')
  await page.getByRole('button', { name: 'Actualizar elemento', exact: true }).press('Enter')
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
  await expect(page.getByRole('cell', { name: '1999.5', exact: true })).toBeVisible()
  await page.reload()
  const filas = await sql`select id, ancho_mm, alto_mm from lineas where presupuesto_id = ${id}`
  expect(filas).toHaveLength(1)
  expect(filas[0]).toMatchObject({ id: linea.id, ancho_mm: 970.25, alto_mm: 1999.5 })
  const pdf = await page.request.get(`/dashboard/presupuestos/${id}/pdf`)
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()['content-type']).toContain('application/pdf')
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('medidas-decimales.png'), fullPage: true })
})

test('el catálogo bloquea guardar durante latencia y permite reintentar un fallo', async ({ page }, info) => {
  await alta(page, `QA CI catálogo ${info.project.name} ${Date.now()}`)
  await expect(page).toHaveURL(/\/presupuestos\/[0-9a-f-]{36}(#configurador)?$/)
  await page.getByRole('button', { name: 'Estructuras', exact: true }).click()
  await page.getByRole('button', { name: 'FIJOS ABATIBLES', exact: true }).click()
  await page.getByRole('button', { name: /\[0\]$/ }).click()
  let soltar!: () => void
  let capturar!: () => void
  const puerta = new Promise<void>(resolve => { soltar = resolve })
  const capturada = new Promise<void>(resolve => { capturar = resolve })
  let accionFallida: string | undefined
  await page.route('**/dashboard/presupuestos**', async route => {
    const req = route.request()
    const accion = req.headers()['next-action']
    if (req.method() !== 'POST' || !accion || !req.postData()?.includes('QA-J04-S')) return route.continue()
    accionFallida ??= accion
    if (accion !== accionFallida) return route.continue()
    capturar()
    await puerta
    await route.abort('connectionreset')
  })
  try {
    await page.getByLabel('Perfiles', { exact: true }).selectOption('QA-J04-S')
    await capturada
    await expect(page.getByRole('button', { name: 'Aceptar', exact: true })).toBeDisabled()
  } finally { soltar() }
  await expect(page.getByText('No se pudieron cargar las opciones.', { exact: false })).toBeVisible()
  await page.unrouteAll({ behavior: 'wait' })
  let reintentado = false
  for (const nombre of ['Opc.Herraje', 'Acristalamiento']) {
    await page.getByRole('tab', { name: nombre, exact: true }).click()
    const retry = page.getByRole('button', { name: 'Reintentar', exact: true })
    if (await retry.isVisible()) { await retry.press('Enter'); reintentado = true }
  }
  expect(reintentado).toBe(true)
  await expect(page.getByRole('button', { name: 'Aceptar', exact: true })).toBeEnabled()
  await page.getByRole('tab', { name: 'Estructura', exact: true }).click()
  await page.getByLabel('Ancho (mm)', { exact: true }).fill('970.25')
  await page.getByLabel('Alto (mm)', { exact: true }).fill('439.5')
  await page.getByRole('button', { name: 'Aceptar', exact: true }).press('Enter')
  await expect(page.getByRole('cell', { name: '439.5', exact: true })).toBeVisible()
})
