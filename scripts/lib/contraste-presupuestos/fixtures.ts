/**
 * GRUPO reales anonimizados para pruebas: solo estructura, medidas y uniones.
 * Sin documento, cliente, fecha ni precio de la 0015/0016; los precios del caso
 * 3 son de la empresa de pruebas 0017 (comparativa del 01–02/11/2026).
 */
import type { Tablas } from '../banco-contraste/datos.ts'
import { construirContraste } from '../banco-contraste/extraer.ts'

export interface ModuloFixture { codigo: string; hueco: [number, number]; guardada: [number, number]; precio?: number; especifico?: boolean }
export interface UnionFixture { codigo: string; vh: 'V' | 'H'; de: number; a: number; grosor: number; longitud: number; precio?: number }
export interface GrupoFixture { modulos: ModuloFixture[]; uniones: UnionFixture[]; cajon?: number; compacto?: number; precio?: number }

/** Orden 1, 3, 5… para módulos y 2, 4… para uniones, como guarda Productor. */
export function tablasGrupo(f: GrupoFixture): Tablas {
  const lineas: Tablas[string] = [], geo: Tablas[string] = [], cfg: Tablas[string] = []
  let n = 100
  const ordenModulo = (i: number) => 2 * i + 1
  const precioGrupo = f.precio ?? 100
  lineas.push({ nDoc: 1, nLinea: 1, GrupoSN: true, Articulo: 'GRUPO', Cdad: 1, Ancho: 1, Largo: 1, Precio: precioGrupo, ImporteTotal: precioGrupo, Acabado: 'L' })
  cfg.push({ TipoDoc: 'VPRES', nVDoc: 1, nVLinea: 1, HorasAdFabr: 0, HorasColoc: 0, nTAcris: 1 })
  const elemento = (codigo: string, ancho: number, alto: number, precio: number, familias: Record<string, unknown>) => {
    const nLinea = ++n
    lineas.push({ nDoc: 1, nLinea, nGrupo: 1, EstructuraSN: true, Articulo: codigo, Cdad: 1, Ancho: ancho, Largo: alto, Precio: precio, ImporteTotal: precio, Acabado: 'L' })
    lineas.push({ nDoc: 1, nLinea: ++n, nEstr: nLinea, Articulo: `P-${codigo}`, Cdad: 1, LargoCorte: alto, ImporteTotal: precio })
    cfg.push({ TipoDoc: 'VPRES', nVDoc: 1, nVLinea: nLinea, HorasAdFabr: 0, HorasColoc: 0, nTAcris: 1, ...familias })
    return nLinea
  }
  f.modulos.forEach((m, i) => {
    const nLinea = elemento(m.codigo, m.guardada[0], m.guardada[1], m.precio ?? 10, { Familia1: '001', Conjunto1: 'SERIE', Familia2: '050', Conjunto2: 'VIDRIO' })
    geo.push({ nCerr: 7, nLinEstr: nLinea, Orden: ordenModulo(i), CodEstr: m.codigo, Ancho: m.guardada[0], Alto: m.guardada[1],
      AnchoHueco: m.hueco[0], AltoHueco: m.hueco[1], EsUnionSN: false, DisEspecificoSN: !!m.especifico, DisAltoCaj: 0 })
  })
  f.uniones.forEach((u, i) => {
    const nLinea = elemento(u.codigo, 0, u.longitud, u.precio ?? 1, { Familia1: '001', Conjunto1: 'SERIE' })
    geo.push({ nCerr: 7, nLinEstr: nLinea, Orden: 2 * (i + 1), CodEstr: u.codigo, EsUnionSN: true, UnionVH: u.vh,
      UOrdenElem1: ordenModulo(u.de), UOrdenElem2: ordenModulo(u.a), UGrosor: u.grosor, ULongitud: u.longitud, DisEspecificoSN: false })
  })
  if (f.compacto !== undefined) elemento('COM009', 1000, 155, f.compacto, { Familia1: '100', Conjunto1: 'COM009' })
  return { VPresupuestos: [{ Id: 1, Fecha: '2026-10-01T00:00:00.000Z', Tarifa: 1 }], VPresupuestosLin: lineas, VDatosLinEstr: cfg,
    VOpcionesHerraje: [], VDatosLinDetDis: [], VCerramientos: [{ id: 7, TipoDoc: 'VPRES', nDoc: 1, nLinGrupo: 1 }], VCerramientosLin: geo,
    VAccesorios: f.cajon ? [{ TipoDoc: 'VPRES', nDoc: 1, nLinEstr: 1, nModulo: 1, Accesorio: 'COM009', AltoCajon: f.cajon }] : [] }
}
export const grupo = (f: GrupoFixture) => construirContraste(tablasGrupo(f)).casos.find(c => c.tipo === 'GRUPO')!

/** Caso 3 de la comparativa (0017): 2O, fijo invisible de 400, 2O; uniones GMU038 de 60. */
export const CASO_3: GrupoFixture = { precio: 1031.1, modulos: [
  { codigo: '2O', hueco: [1200, 1200], guardada: [1160, 1200], precio: 511.43 },
  { codigo: '0', hueco: [400, 400], guardada: [360, 400], precio: 0, especifico: true },
  { codigo: '2O', hueco: [1200, 1200], guardada: [1160, 1200], precio: 511.43 },
], uniones: [
  { codigo: 'GMU038', vh: 'V', de: 0, a: 1, grosor: 60, longitud: 400, precio: 4.12 },
  { codigo: 'GMU038', vh: 'V', de: 1, a: 2, grosor: 60, longitud: 400, precio: 4.12 },
] }
/** 0016: fijo, GMU038, fijo, GMU038 y columna de dos C2 unidas con U; la unión de 2440 recorta las dos C2. */
export const UNION_LARGA: GrupoFixture = { modulos: [
  { codigo: '0', hueco: [1000, 2440], guardada: [970, 2440] },
  { codigo: '0', hueco: [700, 2440], guardada: [640, 2440] },
  { codigo: 'C2', hueco: [1000, 440], guardada: [970, 439.5] },
  { codigo: 'C2', hueco: [1000, 2000], guardada: [970, 1999.5] },
], uniones: [
  { codigo: 'GMU038', vh: 'V', de: 0, a: 1, grosor: 60, longitud: 2440 },
  { codigo: 'GMU038', vh: 'V', de: 1, a: 2, grosor: 60, longitud: 2440 },
  { codigo: 'U', vh: 'H', de: 2, a: 3, grosor: 1, longitud: 1000 },
] }
/** 0016: abatible con diseño específico, GMU039 de 40 y fijo; reparto 20/20. */
export const MITAD_Y_MITAD: GrupoFixture = { modulos: [
  { codigo: '1I', hueco: [500, 2650], guardada: [480, 2650], especifico: true },
  { codigo: '0', hueco: [500, 2650], guardada: [480, 2650] },
], uniones: [{ codigo: 'GMU039', vh: 'V', de: 0, a: 1, grosor: 40, longitud: 2600 }] }
/** 0016: dos 2O con PSU001 y compacto de 155 que Productor resta al alto. */
export const CON_COMPACTO: GrupoFixture = { cajon: 155, compacto: 81.45, modulos: [
  { codigo: '2O', hueco: [1100, 1255], guardada: [1099, 1100] },
  { codigo: '2O', hueco: [1100, 1255], guardada: [1099, 1100] },
], uniones: [{ codigo: 'PSU001', vh: 'V', de: 0, a: 1, grosor: 2, longitud: 1255 }] }
/** 0016: tres fijos con PSU001 ajustados por Productor a un total con decimales. */
export const AJUSTE_DECIMAL: GrupoFixture = { modulos: [
  { codigo: '0', hueco: [1400, 400], guardada: [1399.3, 399.5] },
  { codigo: '0', hueco: [1600, 400], guardada: [1599.3, 399.5] },
], uniones: [{ codigo: 'PSU001', vh: 'V', de: 0, a: 1, grosor: 2, longitud: 400 }] }
