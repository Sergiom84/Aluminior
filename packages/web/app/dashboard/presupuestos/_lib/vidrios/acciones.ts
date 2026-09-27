'use server'

import { crearDb } from '@aluminior/db'
import { usuarioActual } from '../usuario-actual.ts'
import { buscarVidriosCatalogo } from './buscar.ts'

export async function buscarVidrios(consulta: string) {
  if (typeof consulta !== 'string' || !await usuarioActual()) throw new Error('Sesión no válida')
  return buscarVidriosCatalogo(crearDb(), consulta)
}
