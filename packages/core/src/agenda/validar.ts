import { minutosDe, normalizarHora, partesFecha } from './calendario.ts'

export const LIMITE_TITULO = 200
export const LIMITE_TEXTO = 4000
export const LIMITE_OBSERVACIONES = 4000

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type Errores = Record<string, string[]>
export type Fallo = { ok: false; errores: Errores }

export interface EventoValido {
  id: string | null
  titulo: string
  dia: string
  horaInicio: string
  horaFin: string
  observaciones: string | null
}

export interface NotaValida {
  id: string | null
  texto: string
  observaciones: string | null
  urgencia: number
  /** Día al que se refiere la tarea; vacío si no tiene fecha. */
  dia: string | null
}

function anotar(errores: Errores, campo: string, mensaje: string) {
  errores[campo] ??= []
  errores[campo].push(mensaje)
}

export function validarId(id: string | undefined): string | null {
  const limpio = id?.trim() ?? ''
  return UUID.test(limpio) ? limpio : null
}

export function validarEvento(entrada: {
  id?: string
  titulo?: string
  dia?: string
  horaInicio?: string
  horaFin?: string
  observaciones?: string
}): { ok: true; valor: EventoValido } | Fallo {
  const errores: Errores = {}
  const titulo = entrada.titulo?.trim() ?? ''
  if (!titulo) anotar(errores, 'titulo', 'El título es obligatorio')
  else if ([...titulo].length > LIMITE_TITULO) anotar(errores, 'titulo', 'El título es demasiado largo')

  const dia = entrada.dia?.trim() ?? ''
  if (!partesFecha(dia)) anotar(errores, 'dia', 'La fecha no es válida')

  const horaInicio = normalizarHora(entrada.horaInicio ?? '')
  const horaFin = normalizarHora(entrada.horaFin ?? '')
  if (!horaInicio) anotar(errores, 'horaInicio', 'La hora de inicio no es válida')
  if (!horaFin) anotar(errores, 'horaFin', 'La hora de fin no es válida')
  if (horaInicio && horaFin && minutosDe(horaFin)! <= minutosDe(horaInicio)!) {
    anotar(errores, 'horaFin', 'La hora de fin tiene que ser posterior')
  }

  const observaciones = entrada.observaciones?.trim() ?? ''
  if ([...observaciones].length > LIMITE_OBSERVACIONES) {
    anotar(errores, 'observaciones', 'Las observaciones son demasiado largas')
  }

  const id = entrada.id?.trim() ?? ''
  if (id && !UUID.test(id)) anotar(errores, 'id', 'Identificador no válido')
  if (Object.keys(errores).length) return { ok: false, errores }
  return {
    ok: true,
    valor: {
      id: id || null,
      titulo,
      dia,
      horaInicio: horaInicio!,
      horaFin: horaFin!,
      observaciones: observaciones || null,
    },
  }
}

export function validarNota(entrada: {
  id?: string
  texto?: string
  observaciones?: string
  urgencia?: string | number
  dia?: string
}): { ok: true; valor: NotaValida } | Fallo {
  const errores: Errores = {}
  const texto = entrada.texto?.trim() ?? ''
  if (!texto) anotar(errores, 'texto', 'El texto es obligatorio')
  else if ([...texto].length > LIMITE_TEXTO) anotar(errores, 'texto', 'El texto es demasiado largo')

  const observaciones = entrada.observaciones?.trim() ?? ''
  if ([...observaciones].length > LIMITE_OBSERVACIONES) {
    anotar(errores, 'observaciones', 'Las observaciones son demasiado largas')
  }

  const urgencia = Number(entrada.urgencia)
  if (!Number.isInteger(urgencia) || urgencia < 1 || urgencia > 5) {
    anotar(errores, 'urgencia', 'La urgencia va de 1 a 5')
  }

  const dia = entrada.dia?.trim() ?? ''
  if (dia && !partesFecha(dia)) anotar(errores, 'dia', 'La fecha no es válida')

  const id = entrada.id?.trim() ?? ''
  if (id && !UUID.test(id)) anotar(errores, 'id', 'Identificador no válido')
  if (Object.keys(errores).length) return { ok: false, errores }
  return {
    ok: true,
    valor: { id: id || null, texto, observaciones: observaciones || null, urgencia, dia: dia || null },
  }
}
