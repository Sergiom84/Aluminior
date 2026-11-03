import { eq, inArray, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { UNIONES_VISUALES } from '@aluminior/core/estructuras'
import type { UnionFormulario } from './validar.ts'
import type { ImagenSubida } from './subir.ts'

const GRUPOS_VACIOS = ['', '', '', ''] as const

type Db = Pick<ReturnType<typeof crearDb>, 'select' | 'execute' | 'transaction'>
export type ResultadoGuardarUnion = { ok: true; codigo: string } | { ok: false; errores: Record<string, string[]> }

/**
 * Estado previo de la unión. La receta solo se reescribe si es nueva, ya era del
 * operador o no tiene filas: la receta importada de Productor no se sustituye.
 */
export async function estadoUnion(db: Pick<Db, 'select'>, codigo: string) {
  const [estructura] = await db.select({ codigo: schema.estructuras.codigo }).from(schema.estructuras)
    .where(eq(schema.estructuras.codigo, codigo)).limit(1)
  const [union] = await db.select({ deUsuario: schema.estructuraUnion.deUsuario }).from(schema.estructuraUnion)
    .where(eq(schema.estructuraUnion.estructuraCodigo, codigo)).limit(1)
  const [receta] = await db.select({ linea: schema.estructuraPlantillaCatalogo.lineaOrigen })
    .from(schema.estructuraPlantillaCatalogo)
    .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, codigo)).limit(1)
  const esUnion = Boolean(union) || UNIONES_VISUALES.some(visual => visual.codigo === codigo)
  return {
    existeEstructura: Boolean(estructura),
    existeUnion: Boolean(union),
    esUnion,
    recetaProtegida: Boolean(receta) && !union?.deUsuario,
  }
}

export async function guardarUnion(
  datos: UnionFormulario, nuevo: boolean, subida: ImagenSubida | null = null, db: Db = crearDb(),
): Promise<ResultadoGuardarUnion> {
  if (subida) {
    const [{ existe }] = await db.execute<{ existe: boolean }>(sql`
      SELECT to_regclass('public.dibujo_catalogo') IS NOT NULL AS existe`) as unknown as [{ existe: boolean }]
    if (!existe) return { ok: false, errores: { imagen: ['Migración 0035 pendiente'] } }
  }
  const previo = await estadoUnion(db, datos.codigo)
  if (nuevo && previo.existeEstructura) return { ok: false, errores: { codigo: ['Ya existe una estructura con ese código'] } }
  if (!nuevo && !previo.esUnion) return { ok: false, errores: { codigo: ['No es una unión'] } }

  const escribirReceta = nuevo || !previo.recetaProtegida
  const perfiles = datos.perfiles.slice(0, datos.cantidad)
  if (escribirReceta) {
    const vacios = perfiles.flatMap((perfil, indice) => perfil ? [] : [indice + 1])
    if (vacios.length) return { ok: false, errores: Object.fromEntries(vacios.map(n => [`perfil${n}`, ['Perfil obligatorio']])) }
    const existentes = await db.select({ codigo: schema.articulos.codigo }).from(schema.articulos)
      .where(inArray(schema.articulos.codigo, perfiles))
    const faltan = perfiles.filter(codigo => !existentes.some(fila => fila.codigo === codigo))
    if (faltan.length) return { ok: false, errores: { perfil1: [`No está en el catálogo: ${faltan.join(', ')}`] } }
  }

  const imagen = subida?.nombre ?? (datos.imagen || null)
  await db.transaction(async tx => {
    if (subida) {
      await tx.insert(schema.dibujoCatalogo).values({
        nombre: subida.nombre, tipo: subida.tipo, bytes: subida.contenido.length, contenido: subida.contenido,
      })
    }
    if (previo.existeEstructura) {
      await tx.update(schema.estructuras).set({ descripcion: datos.descripcion, familia: '103', esAccesorio: true })
        .where(eq(schema.estructuras.codigo, datos.codigo))
    } else {
      await tx.insert(schema.estructuras).values({
        codigo: datos.codigo, descripcion: datos.descripcion, familia: '103', esAccesorio: true,
      })
    }

    const meta = {
      estructuraCodigo: datos.codigo,
      grosor: String(datos.grosor), l1: String(datos.l1), l2: String(datos.l2), tipo: datos.tipo,
      seriesEspecificas: datos.seriesEspecificas, deUsuario: datos.deUsuario, imagen,
      // Con receta de Productor, la mano de obra sigue siendo la de su fila MO.
      ...(escribirReceta ? { manoObraMinutos: String(datos.manoObraMinutos) } : {}),
    }
    if (previo.existeUnion) {
      await tx.update(schema.estructuraUnion).set(meta).where(eq(schema.estructuraUnion.estructuraCodigo, datos.codigo))
    } else {
      await tx.insert(schema.estructuraUnion).values({ manoObraMinutos: String(datos.manoObraMinutos), ...meta })
    }

    await tx.delete(schema.estructuraUnionSeries).where(eq(schema.estructuraUnionSeries.estructuraCodigo, datos.codigo))
    if (datos.seriesEspecificas && datos.series.length) {
      await tx.insert(schema.estructuraUnionSeries).values(datos.series.map(serieCodigo => ({
        estructuraCodigo: datos.codigo, serieCodigo,
      })))
    }
    if (!escribirReceta) return

    await tx.delete(schema.estructuraPlantillaCatalogo)
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, datos.codigo))
    await tx.insert(schema.estructuraPlantillaCatalogo).values([
      ...perfiles.map((articulo, indice) => ({
        estructuraCodigo: datos.codigo, lineaOrigen: indice + 1, idPieza: 0, articulo,
        funcion: `UNION${indice + 1}`, cantidad: '1', formulaLargo: 'L', hoja: 0,
        gruposAdicionales: [...GRUPOS_VACIOS],
      })),
      {
        estructuraCodigo: datos.codigo, lineaOrigen: perfiles.length + 1, idPieza: 0, articulo: 'MO',
        funcion: 'MO', cantidad: String(datos.manoObraMinutos), hoja: 0, gruposAdicionales: [...GRUPOS_VACIOS],
      },
    ])
  })
  return { ok: true, codigo: datos.codigo }
}
