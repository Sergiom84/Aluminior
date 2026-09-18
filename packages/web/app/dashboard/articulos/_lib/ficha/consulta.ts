/**
 * Datos de la ficha de artículo: cabecera, PVP por acabado y tarifa, costes
 * por proveedor y navegación anterior/siguiente por código.
 */

import { asc, desc, eq, gt, lt, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { siguienteCodigoNumerico } from './metraje.ts'

const FECHA = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid',
})

export interface Opcion { codigo: string; descripcion: string }
export interface OpcionSubfamilia extends Opcion { familiaCodigo: string | null }

export interface FilaPvp { acabado: string; descripcion: string | null; tarifa: number; precio: string }
export interface FilaCoste {
  proveedor: string; nombre: string | null; acabado: string
  descripcion: string | null; coste: string; actualizadoEn: string | null
}

export interface ArticuloFicha {
  codigo: string
  descripcion: string
  familiaCodigo: string | null
  subfamiliaCodigo: string | null
  tipoMetraje: string
  metrajeMinimo: string | null
  metrajeMultiploLargo: string | null
  metrajeMultiploAncho: string | null
  pesoMl: string | null
  grosorPesoVidrio: string | null
  tamJunquilloGoma: string | null
  proveedorHabitual: string | null
  apareceEnHojaDespiece: boolean
  apareceEnHojaCorte: boolean
  controlaStock: boolean
}

export interface CatalogosFicha { familias: Opcion[]; subfamilias: OpcionSubfamilia[]; proveedores: Opcion[] }

export async function cargarCatalogosFicha(): Promise<CatalogosFicha> {
  const db = crearDb()
  const [familias, subfamilias, proveedores] = await Promise.all([
    db.select({ codigo: schema.familias.codigo, descripcion: schema.familias.descripcion })
      .from(schema.familias).orderBy(asc(schema.familias.codigo)),
    db.select({
      codigo: schema.subfamilias.codigo, descripcion: schema.subfamilias.descripcion,
      familiaCodigo: schema.subfamilias.familiaCodigo,
    }).from(schema.subfamilias).orderBy(asc(schema.subfamilias.codigo)),
    db.select({ codigo: schema.proveedores.codigo, descripcion: schema.proveedores.nombre })
      .from(schema.proveedores).orderBy(asc(schema.proveedores.codigo)),
  ])
  return { familias, subfamilias, proveedores }
}

export async function cargarFichaArticulo(codigo: string) {
  const db = crearDb()
  const [articulo] = await db.select().from(schema.articulos)
    .where(eq(schema.articulos.codigo, codigo)).limit(1)
  if (!articulo) return null

  const [pvp, costes, [anterior], [siguiente]] = await Promise.all([
    db.select({
      acabado: schema.articulosPvp.acabadoCodigo, descripcion: schema.acabados.descripcion,
      tarifa: schema.articulosPvp.tarifa, precio: schema.articulosPvp.precio,
    }).from(schema.articulosPvp)
      .leftJoin(schema.acabados, eq(schema.acabados.codigo, schema.articulosPvp.acabadoCodigo))
      .where(eq(schema.articulosPvp.articuloCodigo, codigo))
      .orderBy(asc(schema.articulosPvp.acabadoCodigo), asc(schema.articulosPvp.tarifa)),
    db.select({
      proveedor: schema.articulosCoste.proveedorCodigo, nombre: schema.proveedores.nombre,
      acabado: schema.articulosCoste.acabadoCodigo, descripcion: schema.acabados.descripcion,
      coste: schema.articulosCoste.coste, actualizadoEn: schema.articulosCoste.actualizadoEn,
    }).from(schema.articulosCoste)
      .leftJoin(schema.proveedores, eq(schema.proveedores.codigo, schema.articulosCoste.proveedorCodigo))
      .leftJoin(schema.acabados, eq(schema.acabados.codigo, schema.articulosCoste.acabadoCodigo))
      .where(eq(schema.articulosCoste.articuloCodigo, codigo))
      .orderBy(asc(schema.articulosCoste.proveedorCodigo), asc(schema.articulosCoste.acabadoCodigo)),
    db.select({ codigo: schema.articulos.codigo }).from(schema.articulos)
      .where(lt(schema.articulos.codigo, codigo)).orderBy(desc(schema.articulos.codigo)).limit(1),
    db.select({ codigo: schema.articulos.codigo }).from(schema.articulos)
      .where(gt(schema.articulos.codigo, codigo)).orderBy(asc(schema.articulos.codigo)).limit(1),
  ])

  return {
    articulo: articulo satisfies ArticuloFicha,
    pvp: pvp satisfies FilaPvp[],
    costes: costes.map((c) => ({
      ...c, actualizadoEn: c.actualizadoEn ? FECHA.format(c.actualizadoEn) : null,
    })) satisfies FilaCoste[],
    anterior: anterior?.codigo ?? null,
    siguiente: siguiente?.codigo ?? null,
  }
}

export async function existeArticulo(codigo: string): Promise<boolean> {
  const db = crearDb()
  const r = await db.select({ c: schema.articulos.codigo }).from(schema.articulos)
    .where(eq(schema.articulos.codigo, codigo)).limit(1)
  return r.length > 0
}

export async function calcularSiguienteCodigo(): Promise<string> {
  const db = crearDb()
  const [fila] = await db.select({
    mayor: sql<string | null>`MAX(${schema.articulos.codigo}::numeric)`,
  }).from(schema.articulos).where(sql`${schema.articulos.codigo} ~ '^[0-9]{1,15}$'`)
  return siguienteCodigoNumerico(fila?.mayor ?? null)
}
