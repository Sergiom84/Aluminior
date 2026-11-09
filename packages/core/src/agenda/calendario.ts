/**
 * Calendario de taller. Las fechas son días civiles de Europe/Madrid, nunca
 * UTC: a última hora de la noche un `toISOString()` cambiaría de día.
 * La semana empieza en lunes.
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const

export const DIAS_CORTOS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] as const
export const MINUTO_INICIO = 7 * 60
export const MINUTO_FIN = 20 * 60
export const PASO_MINUTOS = 30
export const HORA_INICIO = '07:00'
export const HORA_FIN = '20:00'

const MADRID = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function fechaISO(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export function partesFecha(iso: string): { anio: number; mes: number; dia: number } | null {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!coincidencia) return null
  const anio = Number(coincidencia[1])
  const mes = Number(coincidencia[2])
  const dia = Number(coincidencia[3])
  const fecha = new Date(anio, mes - 1, dia)
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null
  return { anio, mes, dia }
}

export function fechaMadrid(instante = new Date()): string {
  const partes = MADRID.formatToParts(instante)
  const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ''
  return `${parte('year')}-${parte('month')}-${parte('day')}`
}

export function sumarDias(iso: string, delta: number): string | null {
  const partes = partesFecha(iso)
  if (!partes || !Number.isInteger(delta)) return null
  const fecha = new Date(partes.anio, partes.mes - 1, partes.dia + delta)
  return fechaISO(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate())
}

export function desplazarMes(anio: number, mes: number, delta: number): { anio: number; mes: number } | null {
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(delta)) return null
  const fecha = new Date(anio, mes - 1 + delta, 1)
  return { anio: fecha.getFullYear(), mes: fecha.getMonth() + 1 }
}

export function diasDelMes(anio: number, mes: number): { fecha: string; enMes: boolean }[] | null {
  if (!Number.isInteger(anio) || anio < 1 || !Number.isInteger(mes) || mes < 1 || mes > 12) return null
  const primero = new Date(anio, mes - 1, 1)
  const ultimo = new Date(anio, mes, 0).getDate()
  const hueco = (primero.getDay() + 6) % 7
  const total = Math.ceil((hueco + ultimo) / 7) * 7
  return Array.from({ length: total }, (_, i) => {
    const fecha = new Date(anio, mes - 1, 1 - hueco + i)
    return {
      fecha: fechaISO(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()),
      enMes: fecha.getMonth() === mes - 1,
    }
  })
}

export function semanaDe(iso: string): string[] | null {
  const partes = partesFecha(iso)
  if (!partes) return null
  const lunes = sumarDias(iso, -((new Date(partes.anio, partes.mes - 1, partes.dia).getDay() + 6) % 7))
  if (!lunes) return null
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  return dias.every((dia) => dia !== null) ? dias : null
}

export function nombreMes(anio: number, mes: number): string | null {
  if (!diasDelMes(anio, mes)) return null
  const nombre = MESES[mes - 1]
  return `${nombre[0].toUpperCase()}${nombre.slice(1)} ${anio}`
}

export function etiquetaDia(iso: string): { corto: string; numero: string } | null {
  const partes = partesFecha(iso)
  if (!partes) return null
  const indice = (new Date(partes.anio, partes.mes - 1, partes.dia).getDay() + 6) % 7
  return { corto: DIAS_CORTOS[indice], numero: String(partes.dia) }
}

export function etiquetaSemana(fechas: readonly string[]): string | null {
  if (fechas.length !== 7) return null
  const inicio = partesFecha(fechas[0])
  const fin = partesFecha(fechas[6])
  if (!inicio || !fin) return null
  const corto = (mes: number) => MESES[mes - 1].slice(0, 3)
  if (inicio.mes === fin.mes && inicio.anio === fin.anio) return `${inicio.dia}–${fin.dia} ${corto(inicio.mes)}`
  return `${inicio.dia} ${corto(inicio.mes)} – ${fin.dia} ${corto(fin.mes)}`
}

export function horaDe(minutos: number): string | null {
  if (!Number.isInteger(minutos) || minutos < 0 || minutos >= 24 * 60) return null
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
}

export function minutosDe(hora: string): number | null {
  const coincidencia = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora)
  if (!coincidencia) return null
  return Number(coincidencia[1]) * 60 + Number(coincidencia[2])
}

export function normalizarHora(valor: string): string | null {
  const coincidencia = /^(\d{1,2}):(\d{2})$/.exec(valor.trim())
  if (!coincidencia) return null
  return horaDe(Number(coincidencia[1]) * 60 + Number(coincidencia[2]))
}

export function franjas(): { inicio: string; fin: string }[] {
  const salida: { inicio: string; fin: string }[] = []
  for (let minuto = MINUTO_INICIO; minuto < MINUTO_FIN; minuto += PASO_MINUTOS) {
    const inicio = horaDe(minuto)
    const fin = horaDe(minuto + PASO_MINUTOS)
    if (inicio && fin) salida.push({ inicio, fin })
  }
  return salida
}

/** Una hora dentro de la jornada; si ya no cabe, media hora. */
export function finSugerido(inicio: string): string | null {
  const minuto = minutosDe(inicio)
  if (minuto === null) return null
  const propuesto = minuto + 60
  return horaDe(propuesto <= MINUTO_FIN ? propuesto : minuto + 30)
}

export function tramoVisible(inicio: string, fin: string): { desde: number; hasta: number } | null {
  const a = minutosDe(inicio)
  const b = minutosDe(fin)
  if (a === null || b === null || b <= a) return null
  const desde = Math.max(a, MINUTO_INICIO)
  const hasta = Math.min(b, MINUTO_FIN)
  return hasta > desde ? { desde, hasta } : null
}

export function porcentajeTramo(tramo: { desde: number; hasta: number }): { top: number; alto: number } {
  const total = MINUTO_FIN - MINUTO_INICIO
  return {
    top: ((tramo.desde - MINUTO_INICIO) / total) * 100,
    alto: ((tramo.hasta - tramo.desde) / total) * 100,
  }
}

export function seleccionAgenda(
  hoy: string,
  dia?: string,
  mes?: string,
): { dia: string; mes: string } | null {
  if (!partesFecha(hoy)) return null
  const diaOk = dia && partesFecha(dia) ? dia : hoy
  const pedido = mes?.match(/^(\d{4})-(\d{2})$/)
  const mesOk = pedido && diasDelMes(Number(pedido[1]), Number(pedido[2])) ? mes! : diaOk.slice(0, 7)
  return { dia: diaOk, mes: mesOk }
}

export function rangoVisible(dia: string, mes: string): { desde: string; hasta: string } | null {
  const semana = semanaDe(dia)
  const pedido = mes.match(/^(\d{4})-(\d{2})$/)
  const rejilla = pedido ? diasDelMes(Number(pedido[1]), Number(pedido[2])) : null
  if (!semana || !rejilla) return null
  const fechas = [...semana, ...rejilla.map((celda) => celda.fecha)].sort()
  return { desde: fechas[0], hasta: fechas[fechas.length - 1] }
}

export interface Tramo {
  horaInicio: string
  horaFin: string
}

/** Reparte trabajos solapados en columnas. Los extremos que se tocan no solapan. */
export function columnasSolape<T extends Tramo>(
  eventos: readonly T[],
): { item: T; columna: number; total: number }[] {
  const ordenados = eventos.flatMap((item, indice) => {
    const inicio = minutosDe(item.horaInicio)
    const fin = minutosDe(item.horaFin)
    return inicio === null || fin === null || fin <= inicio ? [] : [{ item, indice, inicio, fin }]
  }).sort((a, b) => a.inicio - b.inicio || a.fin - b.fin || a.indice - b.indice)

  const puestos = new Map<number, { columna: number; total: number }>()
  let cursor = 0
  while (cursor < ordenados.length) {
    let finGrupo = ordenados[cursor].fin
    let siguiente = cursor + 1
    const grupo = [ordenados[cursor]]
    while (siguiente < ordenados.length && ordenados[siguiente].inicio < finGrupo) {
      finGrupo = Math.max(finGrupo, ordenados[siguiente].fin)
      grupo.push(ordenados[siguiente])
      siguiente += 1
    }
    const ocupadas: number[] = []
    const asignadas: { indice: number; columna: number }[] = []
    for (const evento of grupo) {
      let columna = ocupadas.findIndex((fin) => fin <= evento.inicio)
      if (columna === -1) {
        columna = ocupadas.length
        ocupadas.push(evento.fin)
      } else ocupadas[columna] = evento.fin
      asignadas.push({ indice: evento.indice, columna })
    }
    for (const asignada of asignadas) {
      puestos.set(asignada.indice, { columna: asignada.columna, total: ocupadas.length })
    }
    cursor = siguiente
  }
  return ordenados.map((evento) => ({ item: evento.item, ...puestos.get(evento.indice)! }))
}
