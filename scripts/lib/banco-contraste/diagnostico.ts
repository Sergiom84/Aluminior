/** Vistas agregadas; la asignación por línea queda en el JSON privado. */
import type { Medicion } from './datos.ts'

export function diagnosticoBanco(mediciones: readonly Medicion[]) {
  const intervalos = ['≤1 %', '>1–5 %', '>5–10 %', '>10 %', 'base cero']
  const distribucion = intervalos.map(intervalo => ({ intervalo, lineas: 0 }))
  for (const m of mediciones.filter(m => m.estado === 'distinto')) {
    const base = Math.abs(Math.round(m.esperado * 100))
    const diferencia = Math.abs(Math.round(m.obtenido! * 100) - Math.round(m.esperado * 100))
    const indice = !base ? 4 : diferencia <= base * .01 ? 0 : diferencia <= base * .05 ? 1 : diferencia <= base * .1 ? 2 : 3
    distribucion[indice]!.lineas++
  }
  const bloqueos = mediciones.filter(m => ['2O', '1O'].includes(m.modelo)).map(m => ({
    id: m.id, modelo: m.modelo, estado: m.estado,
    causa: m.estado === 'distinto' ? 'sin bloqueo: valorado distinto' : m.estado === 'igual' || m.estado === 'cercano'
      ? 'sin bloqueo: valorado' : m.causas[0] ?? 'sin diagnóstico',
  }))
  const agregados = new Map<string, { modelo: string; causa: string; lineas: number }>()
  for (const b of bloqueos) {
    const key = `${b.modelo}|${b.causa}`, a = agregados.get(key) ?? { modelo: b.modelo, causa: b.causa, lineas: 0 }
    a.lineas++; agregados.set(key, a)
  }
  return { distribucion, bloqueos, principales: [...agregados.values()] }
}

/**
 * Diferencia por identidad en los dos sentidos, sin abortar.
 *
 * `comprobarNoRegresion` solo ve igualdades perdidas, así que calla cuando una
 * unidad no gana ninguna: ese silencio se confunde con una confirmación. El
 * control negativo necesita el delta completo, incluidos los importes que
 * cambian sin cambiar de estado.
 */
export function delta(anteriores: readonly Medicion[], actuales: readonly Medicion[]) {
  const antes = new Map(anteriores.map(m => [m.id, m]))
  const ahora = new Map(actuales.map(m => [m.id, m]))
  const estado = (m: Medicion | undefined) => m ? m.estado : 'ausente'
  const cambios: { id: string; antes: string; ahora: string }[] = []
  const importes: { id: string; antes: number | null; ahora: number | null }[] = []
  for (const id of [...new Set([...antes.keys(), ...ahora.keys()])].sort()) {
    const a = antes.get(id), b = ahora.get(id)
    if (estado(a) !== estado(b)) { cambios.push({ id, antes: estado(a), ahora: estado(b) }); continue }
    const ia = a?.obtenido ?? null, ib = b?.obtenido ?? null
    if (ia !== ib) importes.push({ id, antes: ia, ahora: ib })
  }
  return {
    igualdadesGanadas: cambios.filter(c => c.ahora === 'igual').map(c => c.id),
    igualdadesPerdidas: cambios.filter(c => c.antes === 'igual').map(c => c.id),
    cambiosDeEstado: cambios,
    importesCambiados: importes,
    sinCambio: cambios.length === 0 && importes.length === 0,
  }
}

/** Igualdades protegidas por identidad, también si cambia la elegibilidad. */
export function comprobarNoRegresion(anteriores: readonly Medicion[], actuales: readonly Medicion[]) {
  const iguales = new Set(actuales.filter(m => m.estado === 'igual').map(m => m.id))
  const perdidas = anteriores.filter(m => m.estado === 'igual' && !iguales.has(m.id)).map(m => m.id)
  if (perdidas.length) throw new Error(`Regresión: ${perdidas.length} líneas antes iguales; identidades: ${perdidas.join(', ')}`)
}
