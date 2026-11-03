import { asc, eq, inArray, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { UNIONES_VISUALES, fusionarCatalogoUniones, type UnionVisual } from '@aluminior/core/estructuras'
import { listarDibujos, nombreDibujoValido } from './dibujos.ts'

export interface CatalogoUniones {
  tabla: boolean
  uniones: UnionVisual[]
}

export async function leerCatalogoUniones(): Promise<CatalogoUniones> {
  const db = crearDb()
  const [{ existe }] = await db.execute<{ existe: boolean }>(sql`
    SELECT to_regclass('public.estructura_union') IS NOT NULL AS existe`) as unknown as [{ existe: boolean }]
  if (!existe) return { tabla: false, uniones: [...UNIONES_VISUALES] }

  const metadatos = await db.select().from(schema.estructuraUnion).orderBy(asc(schema.estructuraUnion.estructuraCodigo))
  if (metadatos.length === 0) return { tabla: true, uniones: [...UNIONES_VISUALES] }
  const codigos = metadatos.map(fila => fila.estructuraCodigo)
  const [estructuras, series] = await Promise.all([
    db.select({ codigo: schema.estructuras.codigo, descripcion: schema.estructuras.descripcion })
      .from(schema.estructuras).where(inArray(schema.estructuras.codigo, codigos)),
    db.select().from(schema.estructuraUnionSeries).where(inArray(schema.estructuraUnionSeries.estructuraCodigo, codigos)),
  ])
  const descripcion = new Map(estructuras.map(fila => [fila.codigo, fila.descripcion]))
  const porSerie = new Map<string, string[]>()
  for (const fila of series) {
    const lista = porSerie.get(fila.estructuraCodigo) ?? []
    lista.push(fila.serieCodigo)
    porSerie.set(fila.estructuraCodigo, lista)
  }
  const cargadas: UnionVisual[] = metadatos.map(fila => ({
    codigo: fila.estructuraCodigo,
    descripcion: descripcion.get(fila.estructuraCodigo) ?? fila.estructuraCodigo,
    grosorMm: Number(fila.grosor),
    unionTipo: fila.tipo as UnionVisual['unionTipo'],
    l1Mm: Number(fila.l1),
    l2Mm: Number(fila.l2),
    seriesEspecificas: fila.seriesEspecificas,
    series: porSerie.get(fila.estructuraCodigo) ?? [],
    imagen: fila.imagen,
    deUsuario: fila.deUsuario,
  }))
  return { tabla: true, uniones: fusionarCatalogoUniones(cargadas) }
}

export async function leerFichaUnion(codigo: string) {
  const db = crearDb()
  const [union] = await db.select().from(schema.estructuraUnion)
    .where(eq(schema.estructuraUnion.estructuraCodigo, codigo)).limit(1)
  if (!union) return null
  const [estructura] = await db.select({ descripcion: schema.estructuras.descripcion }).from(schema.estructuras)
    .where(eq(schema.estructuras.codigo, codigo)).limit(1)
  const [series, receta] = await Promise.all([
    db.select({ serie: schema.estructuraUnionSeries.serieCodigo }).from(schema.estructuraUnionSeries)
      .where(eq(schema.estructuraUnionSeries.estructuraCodigo, codigo)),
    db.select({
      articulo: schema.estructuraPlantillaCatalogo.articulo,
      funcion: schema.estructuraPlantillaCatalogo.funcion,
      cantidad: schema.estructuraPlantillaCatalogo.cantidad,
      linea: schema.estructuraPlantillaCatalogo.lineaOrigen,
    }).from(schema.estructuraPlantillaCatalogo)
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, codigo))
      .orderBy(asc(schema.estructuraPlantillaCatalogo.lineaOrigen)),
  ])
  const perfiles = receta.filter(fila => fila.funcion?.startsWith('UNION')).map(fila => fila.articulo)
  return { union, descripcion: estructura?.descripcion ?? codigo, series: series.map(fila => fila.serie), perfiles }
}

async function tablaDibujos(db: ReturnType<typeof crearDb>) {
  const [{ existe }] = await db.execute<{ existe: boolean }>(sql`
    SELECT to_regclass('public.dibujo_catalogo') IS NOT NULL AS existe`) as unknown as [{ existe: boolean }]
  return Boolean(existe)
}

export async function imagenesDisponibles() {
  const locales = listarDibujos()
  const db = crearDb()
  if (!await tablaDibujos(db)) return locales
  const filas = await db.select({ nombre: schema.dibujoCatalogo.nombre }).from(schema.dibujoCatalogo)
  return [...new Set([...locales, ...filas.map(fila => fila.nombre)])].sort((a, b) => a.localeCompare(b, 'es'))
}

export async function leerDibujo(nombre: string) {
  if (!nombreDibujoValido(nombre)) return null
  const db = crearDb()
  if (!await tablaDibujos(db)) return null
  const [fila] = await db.select({
    tipo: schema.dibujoCatalogo.tipo,
    contenido: schema.dibujoCatalogo.contenido,
  }).from(schema.dibujoCatalogo).where(eq(schema.dibujoCatalogo.nombre, nombre)).limit(1)
  if (!fila) return null
  const contenido = Buffer.isBuffer(fila.contenido) ? fila.contenido : Buffer.from(fila.contenido)
  return { tipo: fila.tipo, contenido }
}

export async function precioPerfil(codigo: string) {
  if (!codigo) return null
  const db = crearDb()
  const filas = await db.select({
    precio: schema.articulosPvp.precio,
    acabado: schema.articulosPvp.acabadoCodigo,
  }).from(schema.articulosPvp).where(sql`${schema.articulosPvp.articuloCodigo} = ${codigo} AND ${schema.articulosPvp.tarifa} = 1`).limit(30)
  const elegida = filas.find(fila => fila.acabado === 'L') ?? filas[0]
  if (!elegida) return null
  return { eurosPorMetro: elegida.precio, acabado: elegida.acabado }
}
