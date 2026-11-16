/**
 * Respaldo de conjuntos cuando `herraje_conjuntos` no tiene fila.
 *
 * La clave no es un importe: sale del catálogo de despiece de `aluminior_real_test`.
 * `1PCMA` tiene tipo de hoja `4` (`t1HPCD` → `1HPC` → `HU536`). `1PMA` tiene `58`
 * (`t1HAPD` → `1HAP` → `HU528`). Ninguna de las dos tiene fila en `herraje_conjuntos`.
 */
import { describe, expect, it } from 'vitest'
import type { ClienteEscritura } from '../cliente-db.ts'
import { opcionesHerrajeDe, resolverOpcionesHerraje } from './herraje.ts'

const HERRAJES_ELEGANT = { '1HPC': 'HU536', '1HAP': 'HU528' }

function clienteCatalogo(pasos: {
  parametros: Record<string, string> | null
  hojas: { tipoHoja: string; lineaOrigen: number }[]
  tipos: { id: string; tipo: string }[]
  opciones: { conjuntoCodigo: string; opcionCodigo: string; descripcion: string; porDefecto: boolean; oculta: boolean; categoria: string | null }[]
}) {
  const respuestas: unknown[][] = [
    [],
    pasos.parametros ? [{ herrajes: pasos.parametros }] : [],
    pasos.hojas,
    pasos.tipos,
    pasos.opciones,
    [],
  ]
  let n = 0
  const resultado = (valores: unknown[]) => {
    const promesa = Promise.resolve(valores)
    return { limit: () => promesa, then: promesa.then.bind(promesa), catch: promesa.catch.bind(promesa), finally: promesa.finally.bind(promesa) }
  }
  const cliente = {
    select: () => {
      const valores = respuestas[n++] ?? []
      return { from: () => ({ where: () => resultado(valores) }) }
    },
  } as unknown as ClienteEscritura
  return cliente
}

const visible = (conjuntoCodigo: string, opcionCodigo: string) => ({
  conjuntoCodigo, opcionCodigo, descripcion: `OPCIÓN ${opcionCodigo}`, porDefecto: false, oculta: false, categoria: null,
})

describe('respaldo de catálogo sin fila en herraje_conjuntos', () => {
  it('ofrece ELEGANTPVC y HU536 para 1PCMA', async () => {
    const cliente = clienteCatalogo({
      parametros: HERRAJES_ELEGANT,
      hojas: [{ tipoHoja: '0', lineaOrigen: 2 }, { tipoHoja: '4', lineaOrigen: 1 }],
      tipos: [{ id: '4', tipo: 't1HPCD' }],
      opciones: [visible('HU536', '2'), visible('ELEGANTPVC', '1')],
    })
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '1PCMA')
    expect(grupos?.map(g => g.conjuntoCodigo)).toEqual(['ELEGANTPVC', 'HU536'])
  })

  it('ofrece ELEGANTPVC y HU528 para 1PMA', async () => {
    const cliente = clienteCatalogo({
      parametros: HERRAJES_ELEGANT,
      hojas: [{ tipoHoja: '58', lineaOrigen: 1 }],
      tipos: [{ id: '58', tipo: 't1HAPD' }],
      opciones: [visible('ELEGANTPVC', '1'), visible('HU528', '3')],
    })
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '1PMA')
    expect(grupos?.map(g => g.conjuntoCodigo)).toEqual(['ELEGANTPVC', 'HU528'])
  })

  it('persiste el default oculto del conjunto de catálogo', async () => {
    const cliente = clienteCatalogo({
      parametros: HERRAJES_ELEGANT,
      hojas: [{ tipoHoja: '4', lineaOrigen: 1 }],
      tipos: [{ id: '4', tipo: 't1HPCD' }],
      opciones: [{ conjuntoCodigo: 'HU536', opcionCodigo: '9', descripcion: 'CIERRE DE HOJA', porDefecto: true, oculta: true, categoria: null }],
    })
    expect(await resolverOpcionesHerraje(cliente, {
      serieCodigo: 'ELEGANTPVC', estructuraCodigo: '1PCMA', elegidas: [],
    })).toEqual([{ categoria: 'HU536', opcionCodigo: '9', descripcion: 'CIERRE DE HOJA' }])
  })

  it('no inventa conjuntos si la plantilla solo tiene marco', async () => {
    const cliente = clienteCatalogo({
      parametros: HERRAJES_ELEGANT,
      hojas: [{ tipoHoja: '0', lineaOrigen: 1 }],
      tipos: [],
      opciones: [visible('ELEGANTPVC', '1')],
    })
    expect(await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '1PCMA')).toBeNull()
  })
})
