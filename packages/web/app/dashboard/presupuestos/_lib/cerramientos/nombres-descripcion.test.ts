import { describe, expect, it } from 'vitest'
import { schema } from '@aluminior/db'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { leerNombresDescripcion } from './nombres-descripcion.ts'

function textos(valor: unknown, vistos = new Set<unknown>()): string {
  if (valor == null || typeof valor === 'function' || typeof valor === 'symbol') return ''
  if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') return String(valor)
  if (typeof valor !== 'object' || vistos.has(valor)) return ''
  vistos.add(valor)
  const partes = Array.isArray(valor) ? valor : Object.values(valor)
  return partes.map((parte) => textos(parte, vistos)).join(' ')
}

function configuracionSeis(): ConfiguracionCerramiento {
  return {
    version: 3,
    repartoUniones: 'PIEZAS',
    uniones: [],
    modulos: [1, 2, 3, 4, 5, 6].map((n) => ({
      id: `m${n}`,
      estructuraCodigo: n % 2 === 0 ? 'QA-EST-A' : 'qa-est-b',
      anchoMm: 1000 + n,
      altoMm: 800,
      materiales: { vidrioCodigo: `QA-VID-${n}` },
      ...(n === 1 ? { compacto: { estructuraCodigo: 'QA-COMP', altoCajonMm: 155 } } : {}),
    })),
  }
}

describe('lector de nombres de la descripción', () => {
  it('hace una consulta por tabla aunque haya seis elementos', async () => {
    const consultas: { tabla: string; condicion: string }[] = []
    const cliente = {
      select: () => ({
        from: (tabla: unknown) => ({
          where: (condicion: { queryChunks?: readonly unknown[] }) => {
            const nombre = tabla === schema.estructuras ? 'estructuras'
              : tabla === schema.acabados ? 'acabados'
                : tabla === schema.articulos ? 'articulos'
                  : 'otra'
            consultas.push({ tabla: nombre, condicion: textos(condicion) })
            if (nombre === 'estructuras') {
              return Promise.resolve([
                { codigo: 'QA-EST-A', descripcion: ' QA elemento A ' },
                { codigo: 'QA-EST-B', descripcion: 'QA elemento B' },
                { codigo: 'QA-COMP', descripcion: 'QA compacto' },
              ])
            }
            if (nombre === 'acabados') return Promise.resolve([{ codigo: 'qa-l', descripcion: 'QA blanco' }])
            return Promise.resolve([1, 2, 3, 4, 5, 6].map((n) => ({
              codigo: `QA-VID-${n}`, descripcion: `QA vidrio ${n}`,
            })))
          },
        }),
      }),
    } as unknown as ClienteEscritura

    const nombres = await leerNombresDescripcion(cliente, {
      configuracion: configuracionSeis(),
      serieCodigo: ' QA-SERIE ',
      vidrioCodigo: 'QA-VID-GENERAL',
      acabadoCodigo: 'QA-L',
    })

    expect(consultas.map((consulta) => consulta.tabla)).toEqual(['estructuras', 'acabados', 'articulos'])
    expect(consultas).toHaveLength(3)
    const estructuras = consultas[0].condicion
    expect(estructuras).toContain('QA-EST-A')
    expect(estructuras).toContain('QA-EST-B')
    expect(estructuras).toContain('QA-COMP')
    const articulos = consultas[2].condicion
    for (const n of [1, 2, 3, 4, 5, 6]) expect(articulos).toContain(`QA-VID-${n}`)
    expect(nombres.estructuras.get('QA-EST-A')).toBe('QA elemento A')
    expect(nombres.acabados.get('QA-L')).toBe('QA blanco')
    expect(nombres.articulos.get('QA-VID-6')).toBe('QA vidrio 6')
    expect(nombres.serieCodigo).toBe('QA-SERIE')
  })
})
