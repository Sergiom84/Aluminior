/**
 * Reduce un GRUPO real a lo que necesita el servicio de valoración: sin documento,
 * fecha, textos ni filas de despiece. Las claves de línea se renumeran.
 */
import { texto, type Caso, type Fila } from '../banco-contraste/datos.ts'

const PADRE = ['nLinea', 'nGrupo', 'EstructuraSN', 'GrupoSN', 'Articulo', 'Acabado', 'Acabado2', 'Cdad', 'Ancho', 'Largo'] as const
const CONFIG = ['nTAcris', 'HorasAdFabr', 'HorasColoc', 'Vidrio2', 'DisEspecificoSN', ...[1, 2, 3, 4].flatMap(i => [`Familia${i}`, `Conjunto${i}`])]
const GEOMETRIA = ['nLinEstr', 'Orden', 'CodEstr', 'Ancho', 'Alto', 'AnchoHueco', 'AltoHueco', 'EsUnionSN', 'UnionVH',
  'UOrdenElem1', 'UOrdenElem2', 'UGrosor', 'ULongitud', 'DisEspecificoSN', 'DisAltoCaj']
const OPCION = ['Conjunto', 'nOpcion', 'SelecSN']
const ACCESORIO = ['FamiliaAcc', 'Accesorio', 'Acabado', 'AltoCajon', 'nModulo',
  'compDtoHuecoSN', 'VueloI', 'VueloD', 'PosGuiaCentral', 'DtoHuecoV']
const OPCION_ACCESORIO = ['CodEstr', 'OPCgrupo', 'OPCnOpcion', 'nModulo', 'GrupoDesactivadoSN']
const VARIABLE = ['Estructura', 'SimboloVariable', 'Valor', 'SubestructuraSN', 'NumeroInstancia']

const elegir = (f: Fila | null | undefined, campos: readonly string[]) =>
  f ? Object.fromEntries(campos.filter(c => f[c] !== undefined).map(c => [c, f[c]])) : null

export function anonimizarGrupo(c: Caso, id: string): Caso {
  const lineas = new Map<string, number>()
  const n = (v: unknown) => { const k = texto(v); if (!k || k === '0') return v; if (!lineas.has(k)) lineas.set(k, lineas.size + 1); return lineas.get(k)! }
  const padre = (p: Fila) => ({ ...elegir(p, PADRE), nDoc: 1, nLinea: n(p.nLinea), ...(p.nGrupo ? { nGrupo: n(p.nGrupo) } : {}) })
  const caso = (e: Caso, id: string): Caso => ({ id, tipo: e.tipo, modelo: e.modelo, fecha: '', tarifa: e.tarifa,
    comision: e.comision ?? null, despunte: e.despunte ?? null, padre: padre(e.padre),
    configuracion: elegir(e.configuracion, CONFIG), opciones: e.opciones.map(o => elegir(o, OPCION)!), piezas: [],
    dimensiones: e.dimensiones, cantidad: e.cantidad, serie: e.serie, vidrio: e.vidrio, familias: e.familias,
    esperado: e.esperado, totalEsperado: null, exclusiones: [...e.exclusiones], accesorios: [], opcionesAccesorio: [],
    variables: (e.variables ?? []).map(v => elegir(v, VARIABLE)!) })
  const grupo = caso(c, id)
  grupo.elementos = (c.elementos ?? []).map((e, i) => caso(e, `${id}-e${i + 1}`))
  grupo.accesorios = (c.accesorios ?? []).map(a => ({
    ...elegir(a, ACCESORIO)!,
    ...(a.nLinEstrGrupo ? { nLinEstrGrupo: n(a.nLinEstrGrupo) } : {}),
  }))
  grupo.opcionesAccesorio = (c.opcionesAccesorio ?? []).map(o => elegir(o, OPCION_ACCESORIO)!)
  grupo.geometria = (c.geometria ?? []).map(g => ({ ...elegir(g, GEOMETRIA), nLinEstr: n(g.nLinEstr) }))
  return grupo
}
