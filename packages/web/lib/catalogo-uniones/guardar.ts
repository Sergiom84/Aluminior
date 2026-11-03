import { eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import type { UnionFormulario } from './validar.ts'

const GRUPOS_VACIOS = ['', '', '', ''] as const

export async function guardarUnion(datos: UnionFormulario, nuevo: boolean): Promise<
  { ok: true; codigo: string } | { ok: false; errores: Record<string, string[]> }
> {
  const db = crearDb()
  const perfiles = datos.perfiles.slice(0, datos.cantidad)
  const existentes = await db.select({ codigo: schema.articulos.codigo }).from(schema.articulos)
    .where(inArray(schema.articulos.codigo, perfiles))
  const faltan = perfiles.filter(codigo => !existentes.some(fila => fila.codigo === codigo))
  if (faltan.length) return { ok: false, errores: { perfil1: [`No está en el catálogo: ${faltan.join(', ')}`] } }
  const [yaEstructura] = await db.select({ codigo: schema.estructuras.codigo }).from(schema.estructuras)
    .where(eq(schema.estructuras.codigo, datos.codigo)).limit(1)
  const [yaUnion] = await db.select({ codigo: schema.estructuraUnion.estructuraCodigo }).from(schema.estructuraUnion)
    .where(eq(schema.estructuraUnion.estructuraCodigo, datos.codigo)).limit(1)
  if (nuevo && yaEstructura) return { ok: false, errores: { codigo: ['Ya existe una estructura con ese código'] } }

  await db.transaction(async tx => {
    const estructura = {
      codigo: datos.codigo, descripcion: datos.descripcion, familia: '103', esAccesorio: true,
    }
    if (yaEstructura) await tx.update(schema.estructuras).set({ descripcion: datos.descripcion, familia: '103', esAccesorio: true })
      .where(eq(schema.estructuras.codigo, datos.codigo))
    else await tx.insert(schema.estructuras).values(estructura)

    const meta = {
      estructuraCodigo: datos.codigo,
      grosor: String(datos.grosor), l1: String(datos.l1), l2: String(datos.l2), tipo: datos.tipo,
      manoObraMinutos: String(datos.manoObraMinutos), seriesEspecificas: datos.seriesEspecificas,
      deUsuario: datos.deUsuario, imagen: datos.imagen || null,
    }
    if (yaUnion) await tx.update(schema.estructuraUnion).set(meta).where(eq(schema.estructuraUnion.estructuraCodigo, datos.codigo))
    else await tx.insert(schema.estructuraUnion).values(meta)

    await tx.delete(schema.estructuraUnionSeries).where(eq(schema.estructuraUnionSeries.estructuraCodigo, datos.codigo))
    if (datos.seriesEspecificas && datos.series.length) {
      await tx.insert(schema.estructuraUnionSeries).values(datos.series.map(serieCodigo => ({
        estructuraCodigo: datos.codigo, serieCodigo,
      })))
    }
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
