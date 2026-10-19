import { test } from 'node:test'
import assert from 'node:assert/strict'
import { configuracionGrupo } from './geometria.ts'
import type { Caso } from './datos.ts'

// Filas sintéticas con la forma de VCerramientosLin y de las líneas de elemento.
const geo = (Orden: number, nLinEstr: number, CodEstr: string, extra = {}) =>
  ({ nCerr: 1, Orden, nLinEstr, CodEstr, EsUnionSN: false, ...extra })

const elemento = (nLinea: number, modelo: string, serie: string, alto: number, ancho: number): Caso =>
  ({ modelo, serie, dimensiones: { ancho, alto }, padre: { nDoc: 1, nLinea, nGrupo: 100 } }) as unknown as Caso

/** Dos módulos GMA350 unidos por un GMU038 cuya serie es GMC400. */
const caso = (serieUnion: string | null): Caso => ({
  padre: { nDoc: 1, nLinea: 100 },
  geometria: [
    geo(1, 11, 'C2'),
    geo(2, 12, 'C2'),
    geo(3, 13, 'GMU038', { EsUnionSN: true, UOrdenElem1: 1, UOrdenElem2: 2, UnionVH: 'V', UGrosor: 60, ULongitud: 2440 }),
  ],
  elementos: [
    elemento(11, 'C2', 'GMA350', 2440, 1200),
    elemento(12, 'C2', 'GMA350', 2440, 1200),
    { ...elemento(13, 'GMU038', serieUnion as string, 2440, 0), serie: serieUnion },
  ],
}) as unknown as Caso

test('la unión conserva su serie aunque no sea la del primer módulo', () => {
  const { configuracion, motivos } = configuracionGrupo(caso('GMC400'))
  assert.deepEqual(motivos, [])
  assert.equal(configuracion?.uniones.length, 1)
  assert.deepEqual(configuracion?.uniones[0]!.materiales, { serieCodigo: 'GMC400' })
  assert.deepEqual(configuracion?.modulos.map(m => m.materiales?.serieCodigo), ['GMA350', 'GMA350'])
})

test('sin serie en la línea de unión no se inventa ninguna', () => {
  const { configuracion } = configuracionGrupo(caso(null))
  assert.equal(Object.hasOwn(configuracion!.uniones[0]!, 'materiales'), false)
})
