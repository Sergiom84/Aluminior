import { leerLotes, rutaTabla } from '../csv.ts'
import { opcionHerrajeConFormulas, categoriaHerraje, acristalamientosDeConjunto,
  tablaAcristalamiento } from '../propuestas/editor-linea.ts'

export interface ConexionCatalogo {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}
export interface BaseCatalogo extends ConexionCatalogo {
  transaction<T>(fn: (tx: ConexionCatalogo) => Promise<T>): Promise<T>
}
type Fila = Record<string, unknown>
export interface InformeTabla {
  leidas: number
  preparadas: number
  cargadas: number
  descartadas: Record<string, number>
}
export interface CatalogoEditor {
  opciones: Fila[]
  categorias: Fila[]
  conjuntos: Fila[]
  tablas: Fila[]
  informe: Record<string, InformeTabla>
}
const requeridas: Record<string, string[]> = {
  opciones: ['Conjunto', 'nOpcion', 'fOpcSoloActiva', 'fOpcIncompatible', 'DescrAutoSN'],
  categorias: ['Conjunto', 'Codigo', 'Descripcion', 'OpcExcluyentesSN'],
  conjuntos: ['Codigo', ...['', '2', '3', '4', '5'].flatMap(s => ['TablaHojas' + s, 'TablaFijos' + s])],
  tablas: ['Codigo', 'Descripcion'],
}
const fuentes = [
  ['opciones', 'ConjuntosOpcionesHerraje', opcionHerrajeConFormulas, ['conjunto_codigo', 'opcion_codigo']],
  ['categorias', 'ConjuntosCatOH', categoriaHerraje, ['conjunto_codigo', 'codigo']],
  ['conjuntos', 'Conjuntos', acristalamientosDeConjunto, ['conjunto_codigo', 'opcion']],
  ['tablas', 'TAcristalamiento', tablaAcristalamiento, ['codigo']],
] as const

/** Valida y lee TODO antes de iniciar la transacción; un CSV ausente no vacía tablas. */
export async function leerCatalogoEditor(carpeta: string): Promise<CatalogoEditor> {
  const resultado: CatalogoEditor = { opciones: [], categorias: [], conjuntos: [], tablas: [], informe: {} }
  for (const [clave, tabla, convertir, columnas] of fuentes) {
    const ruta = rutaTabla(carpeta, tabla)
    if (!ruta) throw new Error('Falta CSV requerido: ' + tabla)
    const informe: InformeTabla = { leidas: 0, preparadas: 0, cargadas: 0, descartadas: {} }
    resultado.informe[clave] = informe
    const vistas = new Set<string>()
    for await (const lote of leerLotes(ruta)) {
      for (const fila of lote) {
        if (requeridas[clave].some(c => !(c in fila))) throw new Error('Columnas requeridas ausentes en ' + tabla)
        informe.leidas++
        const convertido = convertir(fila)
        const filas = Array.isArray(convertido) ? convertido : convertido ? [convertido] : []
        if (!filas.length) {
          const motivo = clave === 'conjuntos' && fila.Codigo?.trim() ? 'sin-tablas' : 'clave-vacia'
          informe.descartadas[motivo] = (informe.descartadas[motivo] ?? 0) + 1
        }
        for (const dato of filas) {
          const id = JSON.stringify(columnas.map(c => dato[c]))
          if (vistas.has(id)) throw new Error('Clave duplicada en ' + tabla)
          vistas.add(id)
          resultado[clave].push(dato)
          informe.preparadas++
        }
      }
    }
    if (!resultado[clave].length) throw new Error('Catálogo vacío: ' + tabla)
  }
  return resultado
}

const recarga = [
  ['categorias', 'opciones_herraje_categorias', 'conjunto_codigo text, codigo text, descripcion text, excluyentes boolean'],
  ['conjuntos', 'conjunto_acristalamientos', 'conjunto_codigo text, opcion smallint, tabla_hojas text, tabla_fijos text'],
  ['tablas', 'tablas_acristalamiento', 'codigo text, descripcion text'],
] as const

/** Sólo estas cuatro tablas. Sin TRUNCATE, CASCADE, documentos ni clientes. */
export async function cargarCatalogoEditor(db: BaseCatalogo, catalogo: CatalogoEditor, aplicar = false) {
  const informe = structuredClone(catalogo.informe)
  return db.transaction(async tx => {
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ')
    const protegidas = await tx.query('SELECT (SELECT count(*) FROM presupuestos)::int presupuestos, (SELECT count(*) FROM lineas)::int lineas, (SELECT count(*) FROM clientes)::int clientes')
    const datos = JSON.stringify(catalogo.opciones)
    const tipo = 'conjunto_codigo text, opcion_codigo text, activa_solo_si text, incompatible text, descripcion_auto boolean'
    const coincidencias = await tx.query('SELECT count(*)::int n FROM opciones_herraje o JOIN jsonb_to_recordset($1::jsonb) AS d(' + tipo + ') ON o.conjunto_codigo=d.conjunto_codigo AND o.opcion_codigo=d.opcion_codigo', [datos])
    const actualizables = Number(coincidencias.rows[0].n)
    informe.opciones.descartadas['opcion-no-existente'] = catalogo.opciones.length - actualizables
    if (!aplicar) return { escrito: false, actualizables, informe, protegidas: protegidas.rows[0] }
    if (!actualizables) throw new Error('No coincide ninguna opción existente; carga cancelada')
    await tx.query('UPDATE opciones_herraje o SET activa_solo_si=d.activa_solo_si, incompatible=d.incompatible, descripcion_auto=d.descripcion_auto FROM jsonb_to_recordset($1::jsonb) AS d(' + tipo + ') WHERE o.conjunto_codigo=d.conjunto_codigo AND o.opcion_codigo=d.opcion_codigo', [datos])
    informe.opciones.cargadas = actualizables
    for (const [clave, tabla, columnas] of recarga) {
      if (!catalogo[clave].length) throw new Error('Recarga vacía rechazada')
      await tx.query('DELETE FROM ' + tabla)
      const nombres = columnas.split(', ').map(c => c.split(' ')[0]).join(', ')
      await tx.query('INSERT INTO ' + tabla + ' (' + nombres + ') SELECT ' + nombres + ' FROM jsonb_to_recordset($1::jsonb) AS d(' + columnas + ')', [JSON.stringify(catalogo[clave])])
      informe[clave].cargadas = catalogo[clave].length
    }
    const despues = await tx.query('SELECT (SELECT count(*) FROM presupuestos)::int presupuestos, (SELECT count(*) FROM lineas)::int lineas, (SELECT count(*) FROM clientes)::int clientes')
    if (JSON.stringify(protegidas.rows) !== JSON.stringify(despues.rows)) throw new Error('Recuentos protegidos cambiaron; transacción cancelada')
    return { escrito: true, actualizables, informe, protegidas: despues.rows[0] }
  })
}
