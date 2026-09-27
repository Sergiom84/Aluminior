import { expect, it } from 'vitest'
import type { FilaPlantillaCatalogo } from '@aluminior/core/despiece'
import { configuracionVidrioCatalogo } from './configuracion-vidrio.ts'

const cristal = (tipoHoja: string): FilaPlantillaCatalogo => ({ id: 1,
  articulo: 'VIDRIO-SINTETICO', componente: '1', funcion: null, cantidad: 1,
  posicionTrabajo: null, tipoHoja, mano: null, hoja: 1, disVidrio: null,
  referenciaLargo: null, referenciaAncho: null, formulaLargo: 'L', formulaAncho: 'A',
  formulaReferenciaLargo: null, formulaReferenciaAncho: null, grupo: 'C',
  grupoIzquierdo: null, grupoDerecho: null, grupoSuperior: null, grupoInferior: null,
  gruposAdicionales: [], perfilAdicional: null,
})
it('seis vidrios fijos comparten una configuración y mantienen el material de entrada', () => {
  const paños = Array.from({ length: 6 }, (_, i) => ({ ...cristal('-1'), id: i + 1 }))
  expect(configuracionVidrioCatalogo(paños, 'V-SINTETICO', '2'))
    .toEqual([{ slot: 1, variante: '2', vidrioHojas: null, vidrioFijos: 'V-SINTETICO' }])
  expect(paños).toHaveLength(6)
  expect(paños.map(p => p.id)).toEqual([1, 2, 3, 4, 5, 6])
})
it('una configuración puede contener vidrio de hojas y fijos sin multiplicar slots', () => {
  expect(configuracionVidrioCatalogo([cristal('10'), cristal('-1')], 'V-SINTETICO', '1'))
    .toEqual([{ slot: 1, variante: '1', vidrioHojas: 'V-SINTETICO', vidrioFijos: 'V-SINTETICO' }])
  expect(configuracionVidrioCatalogo([], null, '1')).toEqual([])
})
