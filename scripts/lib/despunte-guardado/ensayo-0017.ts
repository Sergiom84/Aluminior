/** Frontera distinta del corpus histórico: copia privada del ensayo autorizado. */
import { createRequire } from 'node:module'
import { readFileSync, realpathSync } from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { hash } from '../banco-contraste/fuente.ts'
import type { Fila } from '../banco-contraste/datos.ts'

interface Procedencia {
  empresa: string; fuente: string; copia: string; sha256: string
  sha256Antes: string; sha256Despues: string; bytes: number
}
const CAMPOS = {
  VPresupuestos: ['Id', 'Numero', 'Revision', 'Tarifa', 'Subtotal', 'BaseImponible', 'IVA',
    'ImporteTotal', 'Despunte', 'DespunteBase', 'DespuntePorc'],
  VPresupuestosLin: ['nLinea', 'nDoc', 'nOrden', 'nEstr', 'nGrupo', 'GrupoSN',
    'EstructuraSN', 'Articulo', 'Acabado', 'AcaTonalidad', 'Cdad', 'Largo', 'Ancho',
    'Metraje', 'CantidadCorte', 'LargoCorte', 'AnchoCorte', 'Coste', 'GastosIndirectos',
    'GastosIndSN', 'PrecioVentaOriginal', 'Precio', 'Subtotal', 'ImporteTotal',
    'VentaTotal', 'DescuentoPorc', 'Descuento2Porc', 'PVPManualSN', 'NoComputarVentaSN'],
  VDespunteDetalle: ['nLinea', 'TipoDoc', 'nDoc', 'Tipo_Perfiles_Barras', 'Articulo',
    'Acabado', 'AcaTonalidad', 'LargoBarra', 'CantidadBarras', 'MetrajeBarras',
    'CosteBarras', 'CostePerfiles', 'AnchoPanel'],
  Articulos: ['Codigo', 'Familia', 'Subfamilia', 'margenesArtSN', 'PrecioFormulaSN', 'PrecioFormula'],
  Familias: ['Codigo', 'Margen1', 'CalculoPVP', 'MargenTipoArtSN', 'TipoMargenCV', 'RestarDtoSN'],
  ArticulosMargenEspecial: ['Articulo', 'Tarifa', 'margen', 'BloqueoPVPsn'],
  VMargenBenef: ['TipoDoc', 'nDoc', 'Familia', 'Margen'],
} as const
interface Tabla { getColumnNames(): string[]; getData(o: { columns: readonly string[] }): Fila[] }
interface Reader { getTable(nombre: string): Tabla }

export function verificarProcedenciaEnsayo(p: Procedencia, copiaResuelta: string, raizPrivada: string) {
  const dentro = relative(raizPrivada, copiaResuelta)
  if (!dentro || dentro === '..' || dentro.startsWith('..' + sep) || isAbsolute(dentro))
    throw new Error('La copia debe estar dentro de output/e1-despunte')
  if (p.empresa !== '0017' || basename(dirname(copiaResuelta)).toUpperCase() !== 'EMP0017' ||
    !/^ensayo-e1-.+\.mdb$/i.test(basename(copiaResuelta)) || resolve(p.copia) !== copiaResuelta)
    throw new Error('Exige copia de ensayo explícita de EMP0017; no base activa ni Anterior')
  if (basename(dirname(p.fuente)).toUpperCase() !== 'EMP0017' || basename(p.fuente).toLowerCase() !== 'aluminio.mdb')
    throw new Error('Procedencia de empresa incorrecta')
  if (!/^[a-f0-9]{64}$/.test(p.sha256) || p.sha256 !== p.sha256Antes || p.sha256 !== p.sha256Despues)
    throw new Error('Falta estabilidad de la fuente antes/después de copiar')
  if (!Number.isSafeInteger(p.bytes) || p.bytes <= 0) throw new Error('Tamaño de copia inválido')
}

export function leerEnsayo0017(manifiesto: string, numero: number, revision: number,
  raizPrivada = resolve('output/e1-despunte'), herramientas = 'export_datos/herramientas') {
  if (!Number.isSafeInteger(numero) || !Number.isSafeInteger(revision) || numero <= 0 || revision < 0)
    throw new Error('Se exige documento y revisión explícitos')
  const p = JSON.parse(readFileSync(manifiesto, 'utf8')) as Procedencia
  const copia = realpathSync(p.copia)
  verificarProcedenciaEnsayo(p, copia, realpathSync(raizPrivada))
  // Nunca abre la fuente activa: solo compara bytes y huella de la copia privada.
  const bytes = readFileSync(copia)
  if (bytes.length !== p.bytes || hash(bytes) !== p.sha256) throw new Error('Copia distinta del manifiesto')
  const require = createRequire(resolve(herramientas, 'package.json'))
  const MdbReader = require('mdb-reader').default as new (b: Buffer) => Reader
  const reader = new MdbReader(bytes)
  function proyectar(nombre: keyof typeof CAMPOS) {
    const tabla = reader.getTable(nombre), campos = CAMPOS[nombre]
    const ausentes = campos.filter(c => !tabla.getColumnNames().includes(c))
    if (ausentes.length) throw new Error(`${nombre}: columnas ausentes ${ausentes.join(', ')}`)
    return tabla.getData({ columns: campos })
  }
  // Access guarda Numero/Revision como texto; comparar representación exacta, sin coerción de nulos.
  const cabeceras = proyectar('VPresupuestos').filter(f =>
    String(f.Numero) === String(numero) && String(f.Revision) === String(revision))
  if (cabeceras.length !== 1) throw new Error('Documento de ensayo ausente o ambiguo')
  const cabecera = cabeceras[0]
  if (cabecera.Id == null) throw new Error('Documento sin identidad interna')
  const lineas = proyectar('VPresupuestosLin').filter(f => f.nDoc === cabecera.Id)
  const detalle = proyectar('VDespunteDetalle').filter(f => f.TipoDoc === 'VPRES' && f.nDoc === cabecera.Id)
  const articulo = proyectar('Articulos').filter(f => f.Codigo === 'GID')
  const familias = articulo.map(f => f.Familia)
  // Conserva configuración, no interpreta un campo ausente como margen cero.
  const configuracionGID = { articulo,
    familia: proyectar('Familias').filter(f => familias.includes(f.Codigo)),
    especial: proyectar('ArticulosMargenEspecial').filter(f => f.Articulo === 'GID'),
    documento: proyectar('VMargenBenef').filter(f => f.TipoDoc === 'VPRES' &&
      f.nDoc === cabecera.Id && familias.includes(f.Familia)) }
  if (hash(readFileSync(copia)) !== p.sha256) throw new Error('Copia modificada durante la lectura')
  return { procedencia: p, proyeccion: CAMPOS, cabecera, lineas, detalle, configuracionGID }
}
