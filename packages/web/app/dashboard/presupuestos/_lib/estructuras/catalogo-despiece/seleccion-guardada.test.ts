import { expect, it } from 'vitest'
import { seleccionGuardada } from './valorar-con-catalogo.ts'

const visible = (conjunto: string, opcion: string, porDefecto = true) =>
  ({ conjunto, opcion, oculta: false, porDefecto, descripcion: `${conjunto}-${opcion}` })
const oculta = (conjunto: string, opcion: string, porDefecto = true) =>
  ({ conjunto, opcion, oculta: true, porDefecto, descripcion: `${conjunto}-${opcion}` })

const opciones = [
  visible('HU529', '1'), visible('HU529', '2'), oculta('HU529', '901'),
  visible('HU532', '1'), visible('HU532', '2'), oculta('HU532', '901'),
]

it('sin selección del formulario no fuerza nada', () => {
  expect(seleccionGuardada(['HU529'], undefined, opciones)).toEqual([])
})

it('lo no marcado de un conjunto presente en el formulario queda desmarcado', () => {
  const r = seleccionGuardada(['HU529'], ['HU529|1'], opciones)
  expect(r).toContainEqual({ conjunto: 'HU529', opcion: '1', marcada: true })
  expect(r).toContainEqual({ conjunto: 'HU529', opcion: '2', marcada: false })
  expect(r).toContainEqual({ conjunto: 'HU529', opcion: '901', marcada: true })
})

it('una selección vacía deja desmarcado todo lo visible', () => {
  const r = seleccionGuardada(['HU529', 'HU532'], [], opciones)
  expect(r.filter(s => s.marcada && !opciones.find(o => o.conjunto === s.conjunto && o.opcion === s.opcion)!.oculta)).toEqual([])
  expect(r.filter(s => s.conjunto === 'HU532')).toHaveLength(3)
})

// 260472: el GRUPO 1OFI+2OFI+1OFI lleva dos conjuntos de herraje; la pestaña solo
// ofrecía HU529 y HU532 quedaba entero desmarcado (−73,23 € frente a Productor).
it('un conjunto ausente de la selección toma el catálogo, no queda vacío', () => {
  const r = seleccionGuardada(['HU529', 'HU532'], ['HU529|1', 'HU529|2'], opciones)
  expect(r.filter(s => s.conjunto === 'HU532')).toEqual([])
  expect(r.filter(s => s.conjunto === 'HU529')).toHaveLength(3)
})
