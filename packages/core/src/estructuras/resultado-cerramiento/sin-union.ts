import { compararDecimal } from '../../precios/decimal.ts'
import { decimal } from './campos.ts'
import type { ResultadoOrigenCerramiento } from './tipos.ts'

const REGLA = 'SIN_UNION_U'

/** U = SIN UNION: no es una receta material desconocida ni un perfil gratis. */
export function esOrigenSinUnion(v: ResultadoOrigenCerramiento): boolean {
  return v.origen.tipo === 'UNION' && v.codigo === 'U' && v.reglaMaterial === REGLA &&
    v.vidrioCodigo === null && v.venta.completo && v.coste.completo &&
    v.venta.importe !== null && compararDecimal(v.venta.importe, '0') === 0 &&
    v.coste.importe !== null && compararDecimal(v.coste.importe, '0') === 0 &&
    [v.piezas, v.partidasValoracion, v.acristalamiento, v.opcionesHerraje, v.diagnosticos]
      .every(filas => filas.length === 0)
}

/** Solo un catálogo resuelto, con filas explícitas de cantidad cero, acredita U. */
export function resolverOrigenSinUnion(origen: ResultadoOrigenCerramiento, prueba: {
  completo: boolean; precio: number | null; cantidades: readonly string[]
}): ResultadoOrigenCerramiento | null {
  if (origen.origen.tipo !== 'UNION' || origen.codigo !== 'U' || origen.diagnosticos.length ||
    !prueba.completo || prueba.precio !== 0 || !prueba.cantidades.length ||
    !prueba.cantidades.every(c => decimal(c, 10, 3) && compararDecimal(c, '0') === 0)) return null
  return { ...origen, reglaMaterial: REGLA, vidrioCodigo: null,
    venta: { completo: true, importe: '0.00' }, coste: { completo: true, importe: '0.0000' },
    piezas: [], partidasValoracion: [], acristalamiento: [], opcionesHerraje: [] }
}
