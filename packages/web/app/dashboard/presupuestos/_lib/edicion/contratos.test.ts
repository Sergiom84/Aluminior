import { expect, it } from 'vitest'
import { esquemaCabeceraAlta, esquemaCabeceraEdicion } from '../cabecera/esquema'
import { esquemaEdicionArticulo } from '../articulos/edicion/esquema'
import { camposEdicion } from './estado'

const presupuestoId = '00000000-0000-4000-8000-000000000001'
const lineaId = '00000000-0000-4000-8000-000000000002'
it('alta y edición conservan los mismos límites y prioridad excluyente', () => {
  for (const esquema of [esquemaCabeceraAlta, esquemaCabeceraEdicion]) {
    const base = esquema === esquemaCabeceraAlta ? {} : { presupuestoId }
    expect(esquema.safeParse({ ...base, nombreLibre: 'Ático', observaciones: 'Uno\nDos' }).success).toBe(true)
    expect(esquema.safeParse(base).success).toBe(false)
    expect(esquema.safeParse({ ...base, clienteCodigo: 'C', potencialCodigo: 'P' }).success).toBe(false)
    for (const [campo, maximo] of [['nombreLibre', 200], ['obraTexto', 200], ['formaPago', 60], ['observaciones', 4000]] as const) {
      expect(esquema.safeParse({ ...base, nombreLibre: 'Nombre', [campo]: 'x'.repeat(maximo) }).success).toBe(true)
      expect(esquema.safeParse({ ...base, nombreLibre: 'Nombre', [campo]: 'x'.repeat(maximo + 1) }).success).toBe(false)
    }
  }
})
it.each(['precioUnitario', 'total', 'descuento', 'tipo', 'codigo', 'acabadoCodigo', 'tarifa'])(
  'edición artículo rechaza campo ajeno %s', campo => {
    expect(esquemaEdicionArticulo.safeParse({ presupuestoId, lineaId, cantidad: '3', [campo]: '1' }).success).toBe(false)
  })
it.each(['tarifa', 'estado', 'fecha', 'numero', 'revision', 'serie', 'creadoPor', 'tipoIva'])(
  'edición cabecera rechaza campo protegido %s', campo => {
    expect(esquemaCabeceraEdicion.safeParse({ presupuestoId, nombreLibre: 'Libre', [campo]: '1' }).success).toBe(false)
  })
it.each(['', undefined, '0', '-1', '1.001', '1,5', '1e2', '100000000'])(
  'rechaza cantidad no admitida %s', cantidad => {
    expect(esquemaEdicionArticulo.safeParse({ presupuestoId, lineaId, cantidad }).success).toBe(false)
  })
it('conserva límites de referencia y transporte sin eliminar campos manipulados', () => {
  expect(esquemaEdicionArticulo.safeParse({ presupuestoId, lineaId, cantidad: '1.15', referencia: 'x'.repeat(60) }).success).toBe(true)
  expect(esquemaEdicionArticulo.safeParse({ presupuestoId, lineaId, cantidad: '1', referencia: 'x'.repeat(61) }).success).toBe(false)
  const datos = new FormData(); datos.set('$ACTION_ID_TEST', 'interno'); datos.set('total', '100')
  expect(camposEdicion(datos)).toEqual({ total: '100' })
})
