'use server'

import { crearDb } from '@aluminior/db'
import { fechaLocalMadrid } from '../_lib/fecha-local.ts'
import { siguienteNumeroPrevisto } from '../_lib/numeracion/siguiente.ts'
import { usuarioActual } from '../_lib/usuario-actual.ts'

export async function siguienteNumeroPresupuesto(): Promise<number | null> {
  if (!(await usuarioActual())) return null
  return siguienteNumeroPrevisto(crearDb(), fechaLocalMadrid())
}
