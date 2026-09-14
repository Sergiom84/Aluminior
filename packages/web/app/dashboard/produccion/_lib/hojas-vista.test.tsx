import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { prepararProduccion } from './preparar-produccion'
import { fixtureProduccion } from './produccion.fixture'
import { parametrosProduccion } from './parametros'
import { HojaProduccionVista } from '../_components/hoja-produccion'
import { HojaCorteVista } from '../_components/hoja-corte'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'

it('hoja visible incluye juntas ML no barra, vidrios y accesorios con cantidades totales', () => {
  const r = prepararProduccion(fixtureProduccion(), parametrosProduccion({}))
  expect(r.produccion!.consumos.filter(c => c.clase === 'CONSUMO_ML')).toHaveLength(8)
  for (const codigo of ['QA-J04-E', 'QA-J04-I']) expect(r.produccion!.consumos
    .filter(c => c.articuloCodigo === codigo).reduce((n, c) => n + Number(c.cantidad), 0)).toBe(14)
  const html = renderToStaticMarkup(<HojaProduccionVista resultado={r} />)
  for (const codigo of ['QA-J04-E', 'QA-J04-I', 'QA-J04-V', 'QA-J04-T']) expect(html).toContain(codigo)
  expect(html).toContain('Consumo lineal')
  expect(html).toContain('cantidades totales de línea')
  const cortes = renderToStaticMarkup(<HojaCorteVista resultado={r} />)
  expect(cortes).not.toContain('QA-J04-E')
  expect(cortes).toContain('Desconocido')
  expect(cortes).toContain('pieza 0')
})

it('longitud decimal guardada se conserva en plan y hoja visible sin redondear a entero', () => {
  const datos = fixtureProduccion()
  const s = datos.lineas[0].resultado as ResultadoCerramientoV1
  s.origenes[0].piezas[0].largoCorteMm = '1200.25'
  datos.lineas[0].piezas = datos.lineas[0].piezas.map(p => p.origenId === 'm1' && p.origenOrdinal === 0 ? { ...p, largoCorteMm: '1200.25' } : p)
  const r = prepararProduccion(datos, parametrosProduccion({}))
  expect(r.estado).toBe('CON_INCIDENCIAS')
  expect(r.planes.flatMap(g => g.plan.barras.flatMap(b => b.cortes)).filter(c => c.longitud === 1200.25)).toHaveLength(4)
  expect(renderToStaticMarkup(<HojaCorteVista resultado={r} />)).toContain('1200,25 mm')
})
