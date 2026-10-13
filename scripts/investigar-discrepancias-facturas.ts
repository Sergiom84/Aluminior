/**
 * Reproduce las discrepancias de un contraste previo sin ajustar el motor al
 * oráculo. Solo lectura CSV, sin .env ni bases. Consola: agregados.
 * Uso: npx tsx scripts/investigar-discrepancias-facturas.ts <catálogo> <facturas> <detalle base> <salida en output/>
 * Las filas históricas completas aportan observaciones, nunca entradas del motor.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { despiezarLineaCatalogo } from '../packages/core/src/despiece/linea-catalogo/despiezar.ts'
import { catalogoDesdeCsv, leerCsv, numero } from './lib/catalogo-csv.ts'
import { clasificarHija, diferenciasPiezas, importeConPreciosFactura, type HijaFactura } from './lib/contraste-despiece-facturas.ts'
import { diagnosticarEconomia, diagnosticarGeometria, medidasPresupuestoOrigen } from './lib/diagnostico-discrepancias.ts'
import { crearResolvedorCotasInstancia } from './lib/cotas-instancia.ts'

const [origen, facturas, base, salida] = process.argv.slice(2)
if (!origen || !facturas || !base || !salida) throw new Error('Indica catálogo, facturas, detalle base y salida')
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destino = resolve(salida)
const rutaRelativa = relative(join(raiz, 'output'), destino)
if (!rutaRelativa || rutaRelativa.startsWith('..') || rutaRelativa.startsWith(sep)) throw new Error('Usa una subcarpeta de output/')
execFileSync('git', ['check-ignore', '--quiet', destino], { cwd: raiz })
const seleccion = (JSON.parse(readFileSync(base, 'utf8')) as { documento: string; linea: string; estado: string }[])
  .filter(d => ['piezas-exactas-importe', 'diferente'].includes(d.estado))
if (!seleccion.length) throw new Error('El detalle base no contiene discrepancias')
const catalogo = catalogoDesdeCsv(origen)
const resolverCotas = crearResolvedorCotasInstancia(leerCsv(origen, 'VMedidasDA'), leerCsv(origen, 'EstructurasDA'))
const lineas = leerCsv(facturas, 'lineas')
const configuraciones = leerCsv(facturas, 'configuraciones')
const opciones = leerCsv(facturas, 'opciones_herraje')
const completas = new Map(leerCsv(origen, 'VFacturasLin').map(f => [`${f.nDoc}|${f.nLinea}`, f]))
const albaranes = leerCsv(facturas, 'albaranes')
const lineasAlb = leerCsv(facturas, 'lineas_albaran')
const presupuestos = leerCsv(facturas, 'presupuestos')
const lineasPre = leerCsv(facturas, 'lineas_presupuesto')
const porMetro = (articulo: string) => catalogo.articulo(articulo)?.tipoMetraje === 'ML'
const centimos = (n: number) => Math.round(n * 100)
const contar = (valores: string[]) => Object.fromEntries([...new Set(valores)].sort().map(k => [k, valores.filter(v => v === k).length]))
const detalle = seleccion.map(d => {
  const padres = lineas.filter(p => p.EstructuraSN === 'True' && p.nDoc === d.documento && p.nLinea === d.linea)
  const configs = configuraciones.filter(c => c.nVDoc === d.documento && c.nVLinea === d.linea)
  if (padres.length !== 1 || configs.length !== 1 || configs[0]!.DisEspecificoSN === 'True') throw new Error('Entrada de contraste ausente, ambigua o específica')
  const p = padres[0]!, c = configs[0]!
  const cotas = resolverCotas({ tipoDoc: 'VFAC', documento: p.nDoc!, linea: p.nLinea!, estructura: p.Articulo! })
  const entrada = {
    estructura: p.Articulo!.trim(), serie: c.Conjunto1!.trim(), anchoMm: numero(p.Ancho), altoMm: numero(p.Largo),
    vidrio: c.Conjunto2?.trim() || null, acabado: p.Acabado!.trim(), acabadoAccesorios: 'UNI',
    opcionesGuardadas: opciones.filter(o => o.nDoc === p.nDoc && o.nLinEstr === p.nLinea)
      .map(o => ({ conjunto: o.Conjunto!.trim(), opcion: String(numero(o.nOpcion)), marcada: o.SelecSN === 'True' })),
    minutosFabricacionAdicionales: numero(c.HorasAdFabr) * 60,
    cotas: cotas.cotas,
  }
  const resultado = despiezarLineaCatalogo(catalogo, entrada)
  if (cotas.incidencias.length) { resultado.importe = null; resultado.incidencias.push(...cotas.incidencias) }
  const motor = resultado.filas.filter(f => f.importe !== 0 || f.metraje === null)
  const originales = lineas.filter(h => h.nDoc === p.nDoc && h.nEstr === p.nLinea && h.nLinea !== p.nLinea)
  const hijas = originales.map((h): HijaFactura => ({ articulo: h.Articulo!.trim(), funcion: h.Funcion?.trim() ?? '',
    cantidad: numero(h.Cdad), largoMm: numero(h.LargoCorte), anchoMm: numero(h.AnchoCorte), importe: numero(h.ImporteTotal), precio: numero(h.Precio) }))
  const material = hijas.filter(h => clasificarHija(h, catalogo.articulo(h.articulo)?.tipoMetraje ?? null) === 'material')
  const oraculo = Math.round(material.reduce((s, h) => s + h.importe, 0) * 100) / 100
  const diferencias = diferenciasPiezas(motor, material, porMetro)
  const conPrecios = importeConPreciosFactura(motor, material, porMetro)
  const estado = resultado.importe === null ? 'bloqueada' : diferencias.length ? 'diferente'
    : centimos(resultado.importe) === centimos(oraculo) ? 'exacta'
      : conPrecios !== null && centimos(conPrecios) === centimos(oraculo) ? 'piezas-exactas-tarifa' : 'piezas-exactas-importe'
  const economia = diagnosticarEconomia(motor, material, porMetro, catalogo.tarifa)
  const geometria = diagnosticarGeometria(motor, material, porMetro)
  // La copia CSV completa es anterior. Se identifica cada fila y comprueba que
  // coincidan sus campos compartidos; su metraje se conserva solo como evidencia.
  const corroboracion = originales.flatMap((h, i) => {
    if (!material.includes(hijas[i]!)) return []
    const f = completas.get(`${h.nDoc}|${h.nLinea}`)
    if (!f || f.Articulo?.trim() !== h.Articulo?.trim() || numero(f.Cdad) !== numero(h.Cdad)
      || centimos(numero(f.ImporteTotal)) !== centimos(numero(h.ImporteTotal))
      || Math.abs(numero(f.Precio) - numero(h.Precio)) > 1e-8
      || Math.abs(numero(f.LargoCorte) - numero(h.LargoCorte)) > 0.001
      || Math.abs(numero(f.AnchoCorte) - numero(h.AnchoCorte)) > 0.001) return []
    return [{ articulo: f.Articulo, linea: f.nLinea, metraje: numero(f.Metraje),
      largoConMultiplo: numero(f.LargoConMultiplo), anchoConMultiplo: numero(f.AnchoConMultiplo),
      multiploLargoCm: numero(f.MultiploLargoAplicado), multiploAnchoCm: numero(f.MultiploAnchoAplicado),
      metrajeManual: f.MetrajeManualSN, precio: numero(f.Precio), importe: numero(f.ImporteTotal) }]
  })
  const medidasOrigen = medidasPresupuestoOrigen(p, albaranes, lineasAlb, presupuestos, lineasPre)
  const origenPresupuesto = medidasOrigen ? { ...medidasOrigen,
    medidasCoincidentes: medidasOrigen.anchoMm === entrada.anchoMm && medidasOrigen.altoMm === entrada.altoMm } : null
  return { documento: d.documento, linea: d.linea, familia: `${entrada.serie}|${entrada.estructura}`, estadoBase: d.estado,
    estado, importe: resultado.importe, oraculo, importeConPreciosFactura: conPrecios, diferencias,
    incidencias: resultado.incidencias, cotas: cotas.cotas, estadoCotas: cotas.estado, economia, geometria, corroboracion, origenPresupuesto }
})
const economicas = detalle.filter(d => d.estadoBase === 'piezas-exactas-importe')
const geometricas = detalle.filter(d => d.estadoBase === 'diferente')
const resumen = {
  seleccion: detalle.length, estadosBase: contar(detalle.map(d => d.estadoBase)), estadosActuales: contar(detalle.map(d => d.estado)),
  economicas: contar(economicas.map(d => [...new Set(d.economia.filas.map(f => f.causa))].sort().join(' + '))),
  geometricas: contar(geometricas.map(d => d.geometria.causa)),
  geometriaPendienteConMedidasOrigenIguales: geometricas.filter(d => d.geometria.causa === 'geometria-pendiente' && d.origenPresupuesto?.medidasCoincidentes).length,
  advertencia: 'Categorías diagnósticas; no son correcciones del motor ni prueba automática de diferencia de tarifa.',
}
const fuentes = [base, ...['lineas', 'configuraciones', 'opciones_herraje', 'albaranes', 'lineas_albaran', 'presupuestos', 'lineas_presupuesto'].map(n => join(facturas, `${n}.csv`)),
  ...['VFacturasLin', 'Articulos', 'ArticulosPVP', 'ArticulosIncrPrecio', 'ConjuntosDescuentos', 'EstructurasArticulos', 'VMedidasDA', 'EstructurasDA'].map(n => join(origen, `${n}.csv`))]
mkdirSync(destino, { recursive: true })
writeFileSync(join(destino, 'detalle.json'), JSON.stringify(detalle, null, 2))
writeFileSync(join(destino, 'resumen.json'), JSON.stringify(resumen, null, 2))
writeFileSync(join(destino, 'fuentes.json'), JSON.stringify(fuentes.map(archivo => ({ archivo, sha256: createHash('sha256').update(readFileSync(archivo)).digest('hex') })), null, 2))
console.log(JSON.stringify(resumen, null, 2))
