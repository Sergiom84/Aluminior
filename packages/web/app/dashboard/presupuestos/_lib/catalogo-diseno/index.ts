import { isNotNull } from 'drizzle-orm'
import { schema, type crearDb } from '@aluminior/db'
import {
  registrarCatalogoDiseno, registrarEstructurasSinDibujo, type EstructuraSinDibujo, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { construirCatalogoDiseno, estructurasSinDibujoDeCatalogo } from './construir.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'select'>

/** El catálogo cambia solo al reimportar: basta refrescarlo cada pocos minutos. */
const VIGENCIA_MS = 5 * 60 * 1000
interface CatalogoLeido {
  plantillas: PlantillaDiseno[]
  sinDibujo: EstructuraSinDibujo[]
}

let cache: { leido: number; datos: Promise<CatalogoLeido> } | null = null

async function leer(db: Db): Promise<CatalogoLeido> {
  const [estructuras, nodos] = await Promise.all([
    db.select({
      codigo: schema.estructuras.codigo,
      descripcion: schema.estructuras.descripcion,
      familia: schema.estructuras.familia,
      disAnchoMm: schema.estructuras.disAnchoMm,
      disAltoMm: schema.estructuras.disAltoMm,
    }).from(schema.estructuras).where(isNotNull(schema.estructuras.disAnchoMm)),
    db.select().from(schema.estructuraDisenoNodos),
  ])
  return {
    plantillas: construirCatalogoDiseno(estructuras, nodos),
    sinDibujo: estructurasSinDibujoDeCatalogo(estructuras, nodos),
  }
}

/** Una base sin la migración 0022 no rompe el presupuesto: quedan las verificadas. */
async function leerSinRomper(db: Db): Promise<CatalogoLeido> {
  try {
    return await leer(db)
  } catch (error) {
    console.warn('Catálogo de diseño no disponible; se usan las plantillas verificadas.',
      error instanceof Error ? error.message : error)
    return { plantillas: [], sinDibujo: [] }
  }
}

/**
 * Lee (con caché) las plantillas del catálogo importado y las registra para
 * que validación, dibujo y PDF las reconozcan. Si la base aún no tiene los
 * campos de diseño, el catálogo queda en las plantillas verificadas.
 */
async function catalogo(db: Db): Promise<CatalogoLeido> {
  if (!cache || Date.now() - cache.leido > VIGENCIA_MS) {
    cache = { leido: Date.now(), datos: leerSinRomper(db) }
  }
  return cache.datos
}

export async function asegurarCatalogoDiseno(db: Db): Promise<PlantillaDiseno[]> {
  const leido = await catalogo(db)
  registrarCatalogoDiseno(leido.plantillas)
  registrarEstructurasSinDibujo(leido.sinDibujo)
  return leido.plantillas
}

export async function leerEstructurasSinDibujo(db: Db): Promise<EstructuraSinDibujo[]> {
  return (await catalogo(db)).sinDibujo
}

export { construirCatalogoDiseno, estructurasSinDibujoDeCatalogo } from './construir.ts'
export { necesitaCatalogoDiseno } from './necesita.ts'
