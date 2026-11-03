/**
 * Solo CSV locales; no carga .env ni abre MDB. Los posibles valores heredados
 * se investigan y trazan, pero NO se entregan al motor.
 * npx tsx scripts/verificar-cotas-instancia.ts <catálogo> <facturas> [salida]
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { catalogoDesdeCsv, leerCsv, numero } from './lib/catalogo-csv.ts'
import { crearResolvedorCotasInstancia, medidaCota, type FilaCotasCsv } from './lib/cotas-instancia.ts'
import { clasificarHija, diferenciasPiezas } from './lib/contraste-despiece-facturas.ts'

const [origen, facturas, salida] = process.argv.slice(2)
if (!origen || !facturas) throw new Error('Indica carpetas de catálogo y facturas exportadas')
const catalogo = catalogoDesdeCsv(origen)
const resolver = crearResolvedorCotasInstancia(leerCsv(origen, 'VMedidasDA'), leerCsv(origen, 'EstructurasDA'))
const lineas = leerCsv(facturas, 'lineas')
const configuraciones = leerCsv(facturas, 'configuraciones')
const opciones = leerCsv(facturas, 'opciones_herraje')
const albaranes = leerCsv(facturas, 'albaranes')
const lineasAlbaran = leerCsv(facturas, 'lineas_albaran')
const presupuestos = leerCsv(facturas, 'presupuestos')
const lineasPresupuesto = leerCsv(facturas, 'lineas_presupuesto')
const porMetro = (articulo: string) => catalogo.articulo(articulo)?.tipoMetraje === 'ML'
const articulosMO = new Set(catalogo.conceptosManoObra().map(c => c.articulo))
const variablesAusentes = (incidencias: string[]) => [...new Set(incidencias
  .flatMap(i => [...i.matchAll(/Variable "([^"]+)" sin valor/g)].map(m => m[1]!)))].sort()

/** Una cadena única demuestra procedencia, no que una cota no fuese editada después. */
function investigarOrigen(p: FilaCotasCsv) {
  const pasos: { tabla: string; registro: number; clave: Record<string, string | undefined> }[] = []
  const unica = (filas: FilaCotasCsv[], tabla: string, condicion: (f: FilaCotasCsv) => boolean,
    campos: string[]): FilaCotasCsv => {
    const coincidencias = filas.map((f, i) => ({ f, i })).filter(({ f }) => condicion(f))
    if (coincidencias.length !== 1) throw new Error(`${tabla}: origen ausente o ambiguo`)
    const { f, i } = coincidencias[0]!
    pasos.push({ tabla, registro: i + 2, clave: Object.fromEntries(campos.map(c => [c, f[c]])) })
    return f
  }
  try {
    const alb = unica(albaranes, 'albaranes', a => a.Numero === p.nAlbaran, ['Id', 'Numero'])
    const a = unica(lineasAlbaran, 'lineas_albaran', a => a.nDoc === alb.Id && a.nLinea === p.nLinAlb,
      ['nDoc', 'nLinea', 'Articulo', 'TipoDocOrig', 'nDocOrigen', 'nLinOrig'])
    if (a.Articulo !== p.Articulo || a.EstructuraSN !== 'True' || a.TipoDocOrig !== 'VPRES') {
      throw new Error('albarán: estructura o tipo de origen incompatible')
    }
    const pre = unica(presupuestos, 'presupuestos', b => b.Numero === a.nDocOrigen, ['Id', 'Numero'])
    const b = unica(lineasPresupuesto, 'lineas_presupuesto', b => b.nDoc === pre.Id && b.nLinea === a.nLinOrig,
      ['nDoc', 'nLinea', 'Articulo', 'Largo', 'Ancho'])
    if (b.Articulo !== p.Articulo || b.EstructuraSN !== 'True' || ['Largo', 'Ancho'].some(k =>
      medidaCota(b[k]) === null || medidaCota(b[k]) !== medidaCota(p[k]))) {
      throw new Error('presupuesto: estructura o dimensiones de entrada incompatibles')
    }
    const cotas = resolver({ tipoDoc: 'VPRES', documento: b.nDoc!, linea: b.nLinea!, estructura: b.Articulo! })
    return { estado: 'candidato-no-aplicado', pasos, cotas,
      motivo: 'La cadena documental no acredita que la cota se conservara al facturar' }
  } catch (error) {
    return { estado: 'sin-origen-inequivoco', pasos, motivo: (error as Error).message }
  }
}

const casos = []
let evaluadas = 0
for (const p of lineas.filter(p => p.EstructuraSN === 'True')) {
  const c = configuraciones.find(c => c.nVDoc === p.nDoc && c.nVLinea === p.nLinea)
  const serie = c?.Conjunto1?.trim()
  if (!serie || !catalogo.serie(serie) || c!.DisEspecificoSN === 'True') continue
  evaluadas++
  const entrada = {
    estructura: p.Articulo!.trim(), serie, anchoMm: numero(p.Ancho), altoMm: numero(p.Largo),
    vidrio: c!.Conjunto2?.trim() || null, acabado: p.Acabado!.trim(), acabadoAccesorios: 'UNI',
    opcionesGuardadas: opciones.filter(o => o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
      .map(o => ({ conjunto: o.Conjunto!.trim(), opcion: String(numero(o.nOpcion)), marcada: o.SelecSN === 'True' })),
    minutosFabricacionAdicionales: numero(c!.HorasAdFabr) * 60,
  }
  const antes = despiezarLineaCatalogo(catalogo, entrada)
  const faltaban = variablesAusentes(antes.incidencias)
  if (!faltaban.length) continue
  const cotas = resolver({ tipoDoc: 'VFAC', documento: p.nDoc!, linea: p.nLinea!, estructura: p.Articulo! })
  const despues = despiezarLineaCatalogo(catalogo, { ...entrada, cotas: cotas.cotas })
  const hijas = lineas.filter(h => h.nDoc === p.nDoc && h.nEstr === p.nLinea && h.nLinea !== p.nLinea)
    .map(h => ({ articulo: h.Articulo!.trim(), funcion: h.Funcion?.trim() ?? '', cantidad: numero(h.Cdad),
      largoMm: numero(h.LargoCorte), anchoMm: numero(h.AnchoCorte), importe: numero(h.ImporteTotal), precio: numero(h.Precio) }))
    .filter(h => !articulosMO.has(h.articulo) && clasificarHija(h, catalogo.articulo(h.articulo)?.tipoMetraje ?? null) === 'material')
  const filas = despues.filas.filter(f => f.origen !== 'mano-obra' && (f.importe !== 0 || f.metraje === null))
  const diferenciasMaterial = diferenciasPiezas(filas, hijas, porMetro)
  casos.push({ identidad: { tipoDoc: 'VFAC', documento: p.nDoc, linea: p.nLinea, estructura: p.Articulo },
    familia: `${serie}|${p.Articulo}`, faltaban, faltan: variablesAusentes(despues.incidencias), cotas,
    origenDocumental: investigarOrigen(p), filasMaterial: filas.length, diferenciasMaterial,
    importe: despues.importe, incidencias: [...despues.incidencias, ...cotas.incidencias] })
}
if (!evaluadas || !casos.length) throw new Error('No se encontró ninguna línea que requiriese cotas')
if (casos.some(c => c.cotas.estado === 'invalida')) throw new Error('Hay cotas directas inválidas; revisar detalle')
const directas = casos.filter(c => c.cotas.estado === 'valida')
if (!directas.length || directas.some(c => c.faltan.length)) throw new Error('Las entradas directas no resuelven todas sus variables')
const resumen = {
  evaluadas, conVariablesAusentes: casos.length, conEntradaDirecta: directas.length,
  sinEntradaDirecta: casos.length - directas.length,
  candidatosPresupuestoNoAplicados: casos.filter(c => c.cotas.estado === 'sin-entrada'
    && c.origenDocumental.estado === 'candidato-no-aplicado' && c.origenDocumental.cotas?.estado === 'valida').length,
  directasConMaterialCoincidente: directas.filter(c => !c.diferenciasMaterial.length).length,
  directasConImporteCalculable: directas.filter(c => c.importe !== null).length,
  directasConMaterialPendiente: directas.filter(c => c.diferenciasMaterial.length).length,
  filasMaterialDirectas: directas.reduce((s, c) => s + c.filasMaterial, 0),
}
const fuentes = [
  ...['VMedidasDA', 'EstructurasDA', 'EstructurasArticulos', 'ConjuntosDescuentos'].map(n => join(origen, `${n}.csv`)),
  ...['lineas', 'configuraciones', 'opciones_herraje', 'albaranes', 'lineas_albaran', 'presupuestos', 'lineas_presupuesto']
    .map(n => join(facturas, `${n}.csv`)),
].map(ruta => ({ ruta, sha256: createHash('sha256').update(readFileSync(ruta)).digest('hex') }))
console.log(JSON.stringify(resumen, null, 2))
if (salida) {
  mkdirSync(salida, { recursive: true })
  writeFileSync(join(salida, 'cotas-instancia.json'), JSON.stringify({ resumen, fuentes, casos }, null, 2))
}
