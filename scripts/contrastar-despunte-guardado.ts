/** E1 histórico separado del banco: solo copia verificable y salida privada. */
import { execFileSync } from 'node:child_process'
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { parseArgs } from 'node:util'
import { leerFuenteDespunte } from './lib/despunte-guardado/fuente.ts'
import { contrastarDespunteGuardado } from './lib/despunte-guardado/contrastar.ts'

const { values } = parseArgs({ options: { mdb: { type: 'string' }, sha256: { type: 'string' },
  salida: { type: 'string', default: 'output/e1-despunte' },
  'manifiesto-banco': { type: 'string', default: 'export_datos/banco-contraste/manifiesto.json' } } })
if (!values.mdb || !values.sha256) throw new Error('Se exige --mdb EMP0016/Anterior.mdb --sha256 <huella>')
const salida = resolve(values.salida!), rel = relative(resolve('output'), salida)
if (rel === '' || isAbsolute(rel) || rel.startsWith(`..${sep}`) || rel === '..')
  throw new Error('La salida debe ser una subcarpeta privada dentro de output/')
execFileSync('git', ['check-ignore', '--quiet', salida])
const rutaBanco = resolve(values['manifiesto-banco']!), bancoBytes = readFileSync(rutaBanco)
const banco = JSON.parse(bancoBytes.toString('utf8')) as { sha256: string }
const fuente = leerFuenteDespunte(values.mdb, values.sha256)
const contraste = contrastarDespunteGuardado(fuente.tablas)
if (!bancoBytes.equals(readFileSync(rutaBanco))) throw new Error('El manifiesto del banco cambió durante el análisis')
const procedencia = { ...fuente.manifiesto, bancoSha256: banco.sha256,
  mismaFuenteQueBanco: banco.sha256 === fuente.manifiesto.sha256,
  limite: 'Contraste histórico de costes guardados; no demuestra reparto, recálculo, redondeo original ni persistencia. No modifica ni reejecuta el banco.' }
mkdirSync(salida, { recursive: true })
const relReal = relative(realpathSync('output'), realpathSync(salida))
if (isAbsolute(relReal) || relReal.startsWith(`..${sep}`) || relReal === '..')
  throw new Error('La salida privada resuelve fuera de output/')
for (const n of ['manifiesto', 'tablas', 'contraste'])
  if (lstatSync(join(salida, `${n}.json`), { throwIfNoEntry: false })?.isSymbolicLink())
    throw new Error('Un archivo de salida es un enlace; no se sobrescribe')
for (const [n, v] of Object.entries({ manifiesto: procedencia, tablas: fuente.tablas, contraste }))
  writeFileSync(join(salida, `${n}.json`), JSON.stringify(v, null, 2))
console.log(JSON.stringify({ sha256: procedencia.sha256, mismaFuenteQueBanco: procedencia.mismaFuenteQueBanco,
  ...contraste.resumen }, null, 2))
