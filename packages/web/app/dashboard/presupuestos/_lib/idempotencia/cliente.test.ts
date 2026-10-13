import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { obtenerOperacion, confirmarOperacion, guardarSolicitudAlta, recuperarSolicitudAlta, limpiarSolicitudAlta } from './cliente.ts'

beforeEach(() => {
  const valores = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => valores.get(k) ?? null,
    setItem: (k: string, v: string) => valores.set(k, v),
    removeItem: (k: string) => valores.delete(k),
  })
})
afterEach(() => vi.unstubAllGlobals())
it('conserva clave en reintento/remontaje y la cambia después de confirmar', () => {
  const clave = obtenerOperacion('alta')
  expect(obtenerOperacion('alta')).toBe(clave)
  confirmarOperacion('alta')
  expect(obtenerOperacion('alta')).not.toBe(clave)
})
it('aísla alta, origen y estrategia de copia', () => {
  expect(new Set(['alta', 'copia:a:NUEVO', 'copia:a:REVISION', 'copia:b:NUEVO'].map(obtenerOperacion)).size).toBe(4)
})
it('sin almacenamiento aborta antes de disponer de una clave enviable', () => {
  vi.stubGlobal('sessionStorage', { getItem() { throw new Error('bloqueado') } })
  expect(() => obtenerOperacion('alta')).toThrow('bloqueado')
})

it('conserva los campos de la solicitud incierta hasta confirmar o recibir validación', () => {
  const datos = new FormData()
  datos.set('nombreLibre', 'QA A3')
  datos.set('tarifa', '2')
  guardarSolicitudAlta(datos)
  expect(Array.from(recuperarSolicitudAlta()!.entries())).toEqual(Array.from(datos.entries()))
  limpiarSolicitudAlta()
  expect(recuperarSolicitudAlta()).toBeNull()
})
