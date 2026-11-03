/**
 * Carga las uniones de familia 103 y deja intactas las creadas por el operador.
 * No toca la tabla `estructuras`: el motor la tiene protegida.
 */
import type { Sql } from 'postgres'
import { bool, ent, leerLotes, num, rutaTabla, txt } from '../csv.ts'

const TABLAS_CON_RECETA = new Set(['estructura_plantilla_catalogo', 'estructura_parametros_despiece'])

export async function codigosUnionUsuario(tx: Sql): Promise<Set<string>> {
  const [{ existe }] = await tx<{ existe: boolean }[]>`
    SELECT to_regclass('public.estructura_union') IS NOT NULL AS existe`
  if (!existe) return new Set()
  const filas = await tx<{ estructura_codigo: string }[]>`
    SELECT estructura_codigo FROM estructura_union WHERE de_usuario`
  return new Set(filas.map(fila => fila.estructura_codigo))
}

export async function vaciarDespieceSalvoUsuario(tx: Sql, tablas: readonly string[], conservar: ReadonlySet<string>) {
  const lista = [...conservar]
  for (const tabla of tablas) {
    if (lista.length > 0 && TABLAS_CON_RECETA.has(tabla)) {
      await tx`DELETE FROM ${tx(tabla)} WHERE NOT (estructura_codigo = ANY(${lista}))`
    } else {
      await tx`DELETE FROM ${tx(tabla)}`
    }
  }
}

/** Sustituye las uniones de catálogo. Las de usuario no se insertan ni se actualizan. */
export async function sincronizarUnionesCatalogo(
  tx: Sql,
  origen: string,
  estructuras: ReadonlySet<string>,
  conservar: ReadonlySet<string>,
) {
  const [{ existe }] = await tx<{ existe: boolean }[]>`
    SELECT to_regclass('public.estructura_union') IS NOT NULL AS existe`
  if (!existe) return
  const ruta = rutaTabla(origen, 'Estructuras')
  if (!ruta) return
  const minutos = await minutosManoObra(origen)
  for await (const lote of leerLotes(ruta, 500)) {
    for (const fila of lote) {
      if (txt(fila.Familia) !== '103') continue
      const codigo = txt(fila.Codigo)
      if (!codigo || conservar.has(codigo) || !estructuras.has(codigo)) continue
      const tipo = ent(fila.UnionTipo) ?? 0
      await tx`
        INSERT INTO estructura_union
          (estructura_codigo, grosor, l1, l2, tipo, mano_obra_minutos, series_especificas, de_usuario, imagen)
        VALUES (
          ${codigo}, ${num(fila.UnionGrosor) ?? '0'}, ${num(fila.UnionL1) ?? '0'}, ${num(fila.UnionL2) ?? '0'},
          ${tipo}, ${minutos.get(codigo) ?? '0'}, ${bool(fila.AsocASeriesSN)},
          ${bool(fila.UsuarioSN)}, null)
        ON CONFLICT (estructura_codigo) DO UPDATE SET
          grosor = EXCLUDED.grosor, l1 = EXCLUDED.l1, l2 = EXCLUDED.l2, tipo = EXCLUDED.tipo,
          mano_obra_minutos = EXCLUDED.mano_obra_minutos, series_especificas = EXCLUDED.series_especificas,
          de_usuario = EXCLUDED.de_usuario
        WHERE NOT estructura_union.de_usuario`
    }
  }
}

async function minutosManoObra(origen: string) {
  const minutos = new Map<string, string>()
  const ruta = rutaTabla(origen, 'EstructurasArticulos')
  if (!ruta) return minutos
  for await (const lote of leerLotes(ruta, 500)) {
    for (const fila of lote) {
      if (txt(fila.TipoDoc)) continue
      const codigo = txt(fila.Estructura)
      if (!codigo || (txt(fila.Articulo) !== 'MO' && txt(fila.Funcion) !== 'MO')) continue
      minutos.set(codigo, num(fila.Cantidad) ?? '0')
    }
  }
  return minutos
}
