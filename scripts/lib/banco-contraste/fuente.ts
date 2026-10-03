/** Lector de la copia MDB con proyección explícita y huella antes/después. */
import { createRequire } from 'node:module'
import { readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { basename, resolve } from 'node:path'
import type { Tablas, Fila } from './datos.ts'
const CAMPOS: Record<string, string> = {
  VPresupuestos: 'Id Tarifa Fecha Estado Subtotal BaseImponible ImporteTotal DescuentoPorc DescuentoPPporc TarDinPrecioBase TarDinIncrementoBase',
  VPresupuestosLin: 'nLinea nDoc nOrden nEstr nGrupo nLinAsoc EstructuraSN GrupoSN Articulo Acabado Acabado2 Cdad Ancho Largo Precio Subtotal ImporteTotal Coste CosteMetrajeTotal CosteDtoPorc RespetarPrecioSN PVPManualSN PrecioVentaOriginal Tarifa TarifaManualSN DescuentoPorc Descuento2Porc DescuentoManualSN MetrajeManualSN NoComputarVentaSN LargoCorte AnchoCorte CantidadCorte TipoCorte AnguloI AnguloD Funcion Metraje TipoMetraje',
  VDatosLinEstr: 'TipoDoc nVDoc nVLinea nLinId Familia1 Familia2 Familia3 Familia4 Conjunto1 Conjunto2 Conjunto3 Conjunto4 HorasAdFabr HorasColoc TipoColoc nTAcris DisEspecificoSN Vidrio2 DisHerraje',
  VOpcionesHerraje: 'TipoDoc nDoc nLinEstr Conjunto nOpcion SelecSN',
  VDatosLinDetDis: 'TipoDoc nVDoc nVLinea nVLinEstr Componente CV Grupo DisTipoHoja DisId DisIdIt DisIdRefLargo DisIdRefAncho',
  VCerramientos: 'id Codigo TipoDoc nDoc nLinGrupo Ancho Alto CodTapajuntas TapajuntasSup TapajuntasInf TapajuntasIzq TapajuntasDer',
  VCerramientosLin: 'nLinea nCerr nLinEstr Orden nModulo CodEstr x y Ancho Alto EsUnionSN UnionVH UOrdenElem1 UOrdenElem2 UGrosor ULongitud ULongitUsr DisEspecificoSN',
  ArticulosPVP: 'Articulo Acabado Tarifa PVP UltimaAct FechaHoraAct',
  Articulos: 'Codigo Familia TipoMetraje DAfabrSN DAVid1 DAVid2',
  VAccesorios: 'TipoDoc nDoc nLinEstr nModulo nLinEstrGrupo FamiliaAcc Accesorio Acabado AltoCajon CerrCodGuiaI CerrCodGuiaD DtoHuecoH DtoHuecoV VueloI VueloD GuiaCentralSN PosGuiaCentral compDtoHuecoSN compDtoTapH compDtoTapV CompAccAcaLamas CompAccAcaGuias CompAccAcaAcc CerrAltoManual',
  VOpciones: 'TipoDoc nDoc CodEstr nLinEstr OPCgrupo OPCnOpcion nModulo SubestructuraSN GrupoDesactivadoSN',
}
interface TablaMdb { getColumnNames(): string[]; getData(o: { columns: readonly string[] }): Fila[] }
interface LectorMdb { getTable(n: string): TablaMdb }
export const hash = (b: Buffer) => createHash('sha256').update(b).digest('hex')
export function leerFuente(mdb: string, herramientas = 'export_datos/herramientas') {
  if (basename(mdb).toLowerCase() !== 'anterior.mdb') throw new Error('Se exige la copia Anterior.mdb; nunca la base activa')
  const require = createRequire(resolve(herramientas, 'package.json'))
  const Reader = require('mdb-reader').default as new (b: Buffer) => LectorMdb
  const b = readFileSync(mdb), antes = hash(b), lector = new Reader(b)
  const tablas: Tablas = {}, esquema: Record<string, string[]> = {}, recuentos: Record<string, number> = {}
  for (const [n, campos] of Object.entries(CAMPOS)) {
    const t = lector.getTable(n), cols = t.getColumnNames()
    esquema[n] = cols
    tablas[n] = t.getData({ columns: campos.split(' ').filter(c => cols.includes(c)) }).map(f =>
      Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])))
    recuentos[n] = tablas[n]!.length
  }
  if (hash(readFileSync(mdb)) !== antes) throw new Error('La copia cambió durante la lectura')
  return { tablas, manifiesto: { version: 1, fuente: resolve(mdb), sha256: antes,
    bytes: statSync(mdb).size, extraido: new Date().toISOString(), recuentos, esquema,
    proyeccion: CAMPOS, metodo: 'mdb-reader; getData(columns); solo lectura' } }
}
