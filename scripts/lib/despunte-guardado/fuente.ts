/** Investigación E1: solo copia EMP0016/Anterior.mdb y proyección técnica. */
import { createRequire } from 'node:module'
import { readFileSync, realpathSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { hash } from '../banco-contraste/fuente.ts'
import type { Fila, Tablas } from '../banco-contraste/datos.ts'

const CAMPOS = {
  VPresupuestos: ['Id', 'Despunte', 'DespunteBase', 'DespuntePorc'],
  VDespunteDetalle: ['nLinea', 'TipoDoc', 'nDoc', 'Tipo_Perfiles_Barras', 'Articulo',
    'Acabado', 'AcaTonalidad', 'LargoBarra', 'CantidadBarras', 'MetrajeBarras',
    'CosteBarras', 'CostePerfiles', 'AnchoPanel'],
} as const
interface TablaMdb { getColumnNames(): string[]; getData(o: { columns: readonly string[] }): Fila[] }
interface LectorMdb { getTable(n: string): TablaMdb }

export function verificarCopiaDespunte(ruta: string, huella: string) {
  if (basename(ruta).toLowerCase() !== 'anterior.mdb' ||
    basename(dirname(ruta)).toUpperCase() !== 'EMP0016')
    throw new Error('E1 histórico exige EMP0016/Anterior.mdb; no admite base activa ni copia de 0017')
  if (!/^[a-f0-9]{64}$/.test(huella)) throw new Error('Falta SHA-256 explícito de la copia')
}

export function leerFuenteDespunte(mdb: string, huella: string, herramientas = 'export_datos/herramientas') {
  // Resolver enlaces evita que un alias Anterior.mdb oculte una base activa.
  const ruta = realpathSync(mdb)
  verificarCopiaDespunte(ruta, huella)
  const b = readFileSync(ruta)
  if (hash(b) !== huella) throw new Error('SHA-256 de la copia no corresponde al solicitado')
  const require = createRequire(resolve(herramientas, 'package.json'))
  const Reader = require('mdb-reader').default as new (b: Buffer) => LectorMdb
  const lector = new Reader(b), tablas: Tablas = {}, esquema: Record<string, string[]> = {}
  for (const [nombre, campos] of Object.entries(CAMPOS)) {
    const tabla = lector.getTable(nombre), columnas = tabla.getColumnNames()
    const ausentes = campos.filter(c => !columnas.includes(c))
    if (ausentes.length) throw new Error(`${nombre}: columnas ausentes ${ausentes.join(', ')}`)
    esquema[nombre] = columnas
    tablas[nombre] = tabla.getData({ columns: campos })
  }
  if (hash(readFileSync(ruta)) !== huella) throw new Error('La copia cambió durante la lectura')
  return { tablas, manifiesto: { version: 1, fuente: ruta, sha256: huella, bytes: b.length,
    extraido: new Date().toISOString(), proyeccion: CAMPOS, esquema,
    recuentos: Object.fromEntries(Object.entries(tablas).map(([n, fs]) => [n, fs.length])),
    metodo: 'mdb-reader; getData(columns); solo lectura; sin catálogo ni datos personales' } }
}
