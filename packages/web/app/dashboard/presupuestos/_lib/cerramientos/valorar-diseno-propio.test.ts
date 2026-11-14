import { afterEach, expect, it, vi } from 'vitest'
import { generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO, type NodoDiseno } from '@aluminior/core/despiece'
import { actualizarDisenoPropioModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({
  valorarEstructura: vi.fn(async () => ({ ok: false, errores: { catalogo: ['sin catálogo en la prueba'] } })),
}))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: async () => false }))
afterEach(() => vi.clearAllMocks())

const nodosFijoConTravesano: readonly NodoDiseno[] = [
  { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] },
  {
    id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB',
    division: 1, orden: 1, tipoCota: TIPO_COTA.fija, cota: 400, material: 'M', clase: 'V',
  },
  { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
  { id: 3, tipo: TIPO_NODO.vidrio, contenidoEn: 2, vidrio: null },
  { id: 4, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
  { id: 5, tipo: TIPO_NODO.vidrio, contenidoEn: 4, vidrio: 'VCG6' },
]

const nodosCotaVariable: readonly NodoDiseno[] = [
  { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1] },
  {
    id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB',
    division: 1, orden: 1, tipoCota: TIPO_COTA.variable, cota: 500, simbolo: 'FI', material: 'M', clase: 'V',
  },
  { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
  {
    id: 3, tipo: TIPO_NODO.hoja, contenidoEn: 2, tipoHoja: 6,
    clase: 'V', cortes: [1, 1, 1, 1], accesorios: ['MI'],
  },
  { id: 4, tipo: TIPO_NODO.vidrio, contenidoEn: 3, vidrio: null },
  { id: 5, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
  { id: 6, tipo: TIPO_NODO.vidrio, contenidoEn: 5, vidrio: null },
]

const entrada = {
  serieCodigo: 'GMA350', acabadoCodigo: 'L', vidrioCodigo: 'VCG4',
  varianteAcristalamiento: '2' as const, tarifa: 1,
}

it('deriva `plantillaPropia` desde `modulo.disenoPropio` cuando no se inyecta `plantillasPropias`', async () => {
  const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
  const configuracion = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: nodosFijoConTravesano })
  await valorarCerramiento({} as ClienteEscritura, { ...entrada, configuracion })

  const esperada = generarPlantillaDisenoPropio({ nodos: nodosFijoConTravesano })
  expect(esperada.ok).toBe(true)
  if (!esperada.ok) throw new Error(esperada.motivo)
  expect(vi.mocked(valorarEstructura).mock.calls[0]?.[1]?.plantillaPropia).toEqual(esperada.filas)
})

it('transmite las cotas variables de `disenoPropio` al motor de valoración de la estructura', async () => {
  const base = {
    ...crearConfiguracionCerramiento(plantillaDiseno('0')!),
    modulos: [{ id: 'modulo-1', estructuraCodigo: '0', anchoMm: 800, altoMm: 2000 }],
  }
  const configuracion = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: nodosCotaVariable })
  await valorarCerramiento({} as ClienteEscritura, { ...entrada, configuracion })

  expect(vi.mocked(valorarEstructura).mock.calls[0]?.[1]?.cotas).toEqual({ FI: 500 })
})
