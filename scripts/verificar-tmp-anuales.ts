/** Reejecuta el motor puro de MO; no amplía la cobertura del compositor ni valora líneas. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { catalogoDesdeCsv, leerCsv } from './lib/catalogo-csv.ts'
import { medidaCota } from './lib/cotas-instancia.ts'
import { minutosFabricacion } from '../packages/core/src/despiece/mano-obra-fabricacion.ts'
import { clavesTipoHoja } from '../packages/core/src/despiece/asociaciones/index.ts'
import { multiplicarDecimal } from '../packages/core/src/precios/decimal.ts'

type Fila = Record<string, string>
const raiz = resolve('output/auditoria-anuales'), salida = resolve('output/fase-8/lote4-03v')
const manifestPath = join(raiz, 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '')) as { id: string; sha256: string }[]
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const n = (v: string | undefined) => { const numero = medidaCota(v); assert.notEqual(numero, null); return numero! }
const grupo = (filas: Fila[], clave: (f: Fila) => string) => {
  const m = new Map<string, Fila[]>()
  for (const f of filas) { const k = clave(f); m.set(k, [...(m.get(k) ?? []), f]) }
  return m
}
const fijos = new Set(['03H', '03V', '06', 'CF', 'CFT', 'FC'])
const resultado = []
for (const id of ['EMP0016-aluminio', 'EMP0015-aluminio']) {
  const ruta = join(raiz, id), copia = join(ruta, 'copia.mdb')
  const origen = manifest.filter(m => m.id === id)
  assert.equal(origen.length, 1); assert.equal(hash(copia), origen[0]!.sha256.toLowerCase())
  const fuentes = new Map<string, string>()
  const archivos = readdirSync(ruta).filter(nombre => nombre.endsWith('.csv'))
  assert.ok(archivos.length > 0, 'El barrido debe encontrar los CSV consumidos también por el adaptador')
  for (const nombre of archivos) { const file = join(ruta, nombre); fuentes.set(file, hash(file)) }
  const leer = (tabla: string) => { const file = join(ruta, `${tabla}.csv`); assert.equal(hash(file), fuentes.get(file)); return leerCsv(ruta, tabla) }
  const configs = grupo(leer('VDatosLinEstr'), r => `${r.TipoDoc}|${r.nVDoc}|${r.nVLinea}`)
  const originales = grupo(leer('VConceptosMO'), r => `${r.TipoDoc}|${r.nDoc}|${r.nLin}`)
  const plantillas = leer('EstructurasArticulos').filter(p => !p.TipoDoc?.trim())
  const conceptos = leer('MOConceptos')
  const relacionados = new Set(plantillas.filter(p => p.DisComponente === '16' || p.DisGrupo === 'TMP').map(p => p.Estructura))
  const catalogo = catalogoDesdeCsv(ruta)
  const casos = []
  for (const [tabla, tipo] of Object.entries({ VPresupuestosLin: 'VPRES', VAlbaranesLin: 'VALB', VFacturasLin: 'VFAC' })) {
    const filas = leer(tabla), hijas = grupo(filas.filter(f => f.EstructuraSN !== 'True'), f => `${f.nDoc}|${f.nEstr}`)
    for (const p of filas.filter(f => f.EstructuraSN === 'True' && relacionados.has(f.Articulo))) {
      const cc = configs.get(`${tipo}|${p.nDoc}|${p.nLinea}`) ?? []
      if (cc.length !== 1 || cc[0]!.DisEspecificoSN !== 'False' || fijos.has(p.Articulo!) && p.Articulo !== '03V') continue
      const c = cc[0]!, plantilla = catalogo.plantilla(p.Articulo!), serie = catalogo.serie(c.Conjunto1!)
      assert.ok(serie)
      const r = minutosFabricacion({
        contextoTmp: { tipoPerfiles: serie.tipoPerfiles, familia: serie.familia, serie: serie.codigo },
        elementos: plantilla.map(f => ({ modulo: f.funcion === 'infMOmof' ? f.disVidrio : null,
          articuloPlantilla: f.articulo, componente: f.componente, grupo: f.grupo, cantidad: f.cantidad })),
        conceptos: catalogo.conceptosManoObra(),
        conceptosApertura: [...new Set(plantilla.map(f => clavesTipoHoja(catalogo.nombreTipoHoja(f.tipoHoja!))?.manoObra)
          .filter((x): x is string => !!x))].map(k => serie.manoObra[k]).filter((x): x is string => !!x),
      })
      const horas = c.HorasAdFabr?.replace(',', '.')
      assert.notEqual(medidaCota(horas), null)
      const ajuste = Number(multiplicarDecimal(horas!, '60', horas!.split('.')[1]?.length ?? 0))
      const sort = (v: number[]) => v.filter(x => x > 0).sort((a, b) => a - b)
      const actuales = sort(r.lineas.map(l => l.minutos).concat(ajuste))
      const esperados = sort((hijas.get(`${p.nDoc}|${p.nLinea}`) ?? []).filter(h => h.Articulo === 'MO').map(h => n(h.Cdad)))
      const conceptosMO = originales.get(`${tipo}|${p.nDoc}|${p.nLinea}`) ?? []
      const categoria = serie.tipoPerfiles === 'A' ? '00001' : '00002'
      const tmp = conceptos.filter(k => k.Categoria === categoria && (k.ComponenteAsoc === '16' || k.GrupoAsoc === 'TMP'))
      assert.equal(tmp.length, 1)
      const filasTmp = conceptosMO.filter(k => k.Concepto === tmp[0]!.Codigo)
      const motorTmp = r.lineas.filter(l => l.concepto === tmp[0]!.Codigo)
      const conceptoCoincide = filasTmp.length === 1 && motorTmp.length === 1 && n(filasTmp[0]!.Cantidad) === motorTmp[0]!.minutos
      casos.push({ tabla, documento: p.nDoc, linea: p.nLinea, estructura: p.Articulo, serie: serie.codigo,
        tipoPerfiles: serie.tipoPerfiles, conceptosOriginales: conceptosMO, motor: r, ajuste,
        actuales, esperados, conceptoCoincide, coincide: !r.incidencias.length && conceptoCoincide && JSON.stringify(actuales) === JSON.stringify(esperados) })
    }
  }
  for (const [file, sha256] of fuentes) assert.equal(hash(file), sha256)
  assert.equal(hash(copia), origen[0]!.sha256.toLowerCase())
  const controles = casos.filter(c => c.estructura !== '03V'), fijos03v = casos.filter(c => c.estructura === '03V')
  const resumen = { id, controles: controles.length, controlesCoincidentes: controles.filter(c => c.coincide).length,
    casos03v: fijos03v.length, casos03vCoincidentes: fijos03v.filter(c => c.coincide).length,
    fallos: casos.filter(c => !c.coincide).map(c => ({ estructura: c.estructura, serie: c.serie, incidencias: c.motor.incidencias })) }
  resultado.push({ origen, fuentes: Object.fromEntries(fuentes), casos, resumen })
  console.log(JSON.stringify(resumen))
}
mkdirSync(salida, { recursive: true })
writeFileSync(join(salida, 'controles-motor.json'), JSON.stringify({ manifestSha256: hash(manifestPath), resultado }, null, 2))
assert.deepEqual(resultado.map(r => [r.resumen.controles, r.resumen.controlesCoincidentes, r.resumen.casos03v, r.resumen.casos03vCoincidentes]),
  [[79, 79, 0, 0], [90, 90, 3, 3]])
