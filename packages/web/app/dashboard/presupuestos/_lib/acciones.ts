'use server'

/**
 * Server Actions de presupuestos.
 *
 * Borde de los casos de uso de presupuestos. La valoración de estructuras se
 * delega en `_lib/estructuras`; el cálculo sigue ocurriendo SIEMPRE en servidor.
 */

import { esquemaCabeceraAlta } from './cabecera/esquema'
import { buscarClientesEnCatalogo, type ClienteEncontrado } from './cabecera/buscar-clientes.ts'
import { ErrorOperacionCerramiento } from './cerramientos/error-operativo.ts'
import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { actualizarTotales } from './totales.ts'
import { usuarioActual } from './usuario-actual.ts'
import { registrarFallo } from './errores.ts'
import { esquemaLinea } from './lineas/esquema-linea.ts'
import { crearPresupuestoAlta } from './presupuestos/crear-presupuesto.ts'
import { fechaLocalMadrid } from './fecha-local.ts'
import { prepararAltaCerramiento } from './cerramientos/index.ts'
import { altaLinea } from './lineas/alta-linea.ts'
import { borrarLineaDePresupuesto } from './lineas/borrar-linea.ts'
import { opcionesHerrajeDe as opcionesDeHerrajeOfrecidas, type GrupoOpcionesHerraje } from './estructuras/index.ts'

export type Estado =
  | { ok: true; id: string; mensaje?: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

export type { GrupoOpcionesHerraje, ClienteEncontrado }

export async function buscarClientes(consulta: string): Promise<ClienteEncontrado[]> {
  return buscarClientesEnCatalogo(crearDb(), consulta)
}

/**
 * Opciones de herraje aplicables a una (serie, estructura).
 *
 * Server action fina: la regla vive en `_lib/estructuras/herraje.ts`, junto a la
 * resolución de lo que se persiste, para que ofrecer y guardar no puedan
 * divergir. Aquí sólo se abre la conexión.
 */
export async function opcionesHerrajeDe(
  serieCodigo: string, estructuraCodigo: string,
): Promise<GrupoOpcionesHerraje[] | null> {
  return opcionesDeHerrajeOfrecidas(crearDb(), serieCodigo, estructuraCodigo)
}

export async function crearPresupuesto(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaCabeceraAlta.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  const d = p.data
  const db = crearDb()
  const fecha = fechaLocalMadrid()
  try {
    const creadoPor = await usuarioActual()
    // Parseo, validación, usuario y revalidate se quedan aquí; reservar el
    // número y escribir la cabecera es responsabilidad de
    // `presupuestos/crear-presupuesto.ts` (T.71.4).
    const resultado = await crearPresupuestoAlta(db, {
      serie: 'A',
      fecha,
      clienteCodigo: d.clienteCodigo,
      potencialCodigo: d.potencialCodigo,
      nombreLibre: d.nombreLibre,
      obraTexto: d.obraTexto,
      tarifa: d.tarifa,
      formaPago: d.formaPago,
      observaciones: d.observaciones,
      creadoPor,
    })
    if (!resultado.ok) return { ok: false, errores: {}, mensaje: resultado.errores.join('; ') }

    revalidatePath('/dashboard/presupuestos')
    return { ok: true, id: resultado.id }
  } catch (e) {
    if (e instanceof ErrorOperacionCerramiento) return { ok: false, errores: {}, mensaje: e.message }
    return { ok: false, errores: {}, mensaje: registrarFallo('crearPresupuesto', e) }
  }
}

/**
 * Añade una línea y la valora.
 *
 * ARTICULO   precio directo de la tarifa
 * ESTRUCTURA se calcula el despiece con las medidas y las cotas por defecto,
 *            y se suma el coste de todas las piezas
 */
export async function anyadirLinea(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaLinea.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  if (p.data.tipo === 'CERRAMIENTO') {
    const alta = prepararAltaCerramiento({ ...p.data, configuracionSerializada: p.data.configuracionCerramiento })
    if (!alta.ok) return alta
  }
  try {
    if (!await usuarioActual()) return { ok: false, errores: {}, mensaje: 'Sesión no válida' }
    const resultado = await altaLinea(crearDb(), p.data, datos.getAll('opcionHerraje').map(String))
    if (resultado.ok) revalidatePath(`/dashboard/presupuestos/${p.data.presupuestoId}`)
    return resultado
  } catch (e) {
    if (e instanceof ErrorOperacionCerramiento) return { ok: false, errores: {}, mensaje: e.message }
    return { ok: false, errores: {}, mensaje: registrarFallo('anyadirLinea', e) }
  }
}

export async function borrarLinea(lineaId: string, presupuestoId: string) {
  if (await borrarLineaDePresupuesto(crearDb(), lineaId, presupuestoId)) {
    revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
  }
}

/** Recálculo de totales como acción suelta. La regla vive en `totales.ts`. */
export async function recalcularTotales(presupuestoId: string) {
  await actualizarTotales(crearDb(), presupuestoId)
}
