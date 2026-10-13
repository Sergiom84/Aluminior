import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import postgres from 'postgres'
import { entornoE2e } from './entorno.ts'

const sql = postgres(entornoE2e().destino)
const prefijo = `QATEC-${randomUUID().slice(0, 8)}`
const codigoAlfa = `${prefijo}-A`
const codigoBeta = `${prefijo}-B`

test.beforeAll(async () => {
  await sql`insert into clientes (codigo, nombre, activo) values
    (${codigoAlfa}, ${`QA teclado Alfa ${prefijo}`}, true),
    (${codigoBeta}, ${`QA teclado Beta ${prefijo}`}, true)`
})
test.afterAll(async () => {
  try { await sql`delete from clientes where codigo in (${codigoAlfa}, ${codigoBeta})` }
  finally { await sql.end() }
})

test('reintentar cliente con Tab y Enter devuelve foco y permite elegir el código canónico', async ({ page }) => {
  let falloPendiente = true
  await page.route('**/dashboard/presupuestos/nuevo', async route => {
    const req = route.request()
    if (falloPendiente && req.method() === 'POST' && req.headers()['next-action'] && req.postData()?.includes(prefijo)) {
      falloPendiente = false
      return route.abort('connectionreset')
    }
    return route.continue()
  })
  await page.goto('/dashboard/presupuestos/nuevo')
  const cliente = page.getByRole('combobox', { name: 'Cliente', exact: true })
  await cliente.fill(prefijo)
  await expect(page.getByRole('alert').filter({ hasText: 'No se pudo consultar el catálogo de clientes.' }))
    .toHaveText('No se pudo consultar el catálogo de clientes.')
  await cliente.press('Tab')
  const reintentar = page.getByRole('button', { name: 'Reintentar búsqueda', exact: true })
  await expect(reintentar).toBeFocused()
  await reintentar.press('Enter')
  await expect(cliente).toBeFocused()
  await expect(cliente).toHaveValue(prefijo)
  await expect(page.locator('input[name="clienteCodigo"]')).toHaveValue('')
  const opciones = page.getByRole('listbox', { name: 'Clientes' }).getByRole('option')
  await expect(opciones).toHaveCount(2)
  await cliente.press('ArrowDown')
  await expect(opciones.filter({ hasText: codigoBeta })).toHaveAttribute('aria-selected', 'true')
  await cliente.press('Enter')
  await expect(cliente).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('input[name="clienteCodigo"]')).toHaveValue(codigoBeta)
  await expect(cliente).toBeFocused()
  await page.unrouteAll({ behavior: 'wait' })
})

test('Enter con una consulta retenida no selecciona al cliente anterior ni crea un documento', async ({ page }, info) => {
  const nombre = `QA CI carrera cliente ${info.project.name} ${randomUUID()}`
  await page.goto('/dashboard/presupuestos/nuevo')
  await page.getByLabel('Nombre', { exact: true }).fill(nombre)
  const cliente = page.getByRole('combobox', { name: 'Cliente', exact: true })
  await cliente.fill(codigoAlfa)
  await expect(page.getByRole('option').filter({ hasText: codigoAlfa })).toBeVisible()

  let liberar!: () => void
  let capturar!: () => void
  const puerta = new Promise<void>(resolve => { liberar = resolve })
  const capturada = new Promise<void>(resolve => { capturar = resolve })
  await page.route('**/dashboard/presupuestos/nuevo', async route => {
    const req = route.request()
    if (req.method() === 'POST' && req.headers()['next-action'] && req.postData()?.includes(codigoBeta)) {
      capturar()
      await puerta
    }
    return route.continue()
  })
  try {
    await cliente.fill(codigoBeta)
    await capturada
    await cliente.press('Enter')
    await expect(cliente).toHaveValue(codigoBeta)
    await expect(cliente).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('input[name="clienteCodigo"]')).toHaveValue('')
    await expect(page).toHaveURL(/\/dashboard\/presupuestos\/nuevo$/)
    expect(await sql`select id from presupuestos where nombre_libre = ${nombre}`).toHaveLength(0)
  } finally { liberar() }

  await expect(page.getByRole('option').filter({ hasText: codigoBeta })).toBeVisible()
  await cliente.press('Enter')
  await expect(page.locator('input[name="clienteCodigo"]')).toHaveValue(codigoBeta)
  await page.unrouteAll({ behavior: 'wait' })
})
