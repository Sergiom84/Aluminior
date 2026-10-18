export async function anyadirLinea(_estado, datos) {
  const qa = window.qa
  qa.calls.push(Object.fromEntries(datos))
  const modo = qa.mode
  await new Promise(resolve => { qa.release = resolve })
  if (modo === 'throw') throw new Error('Respuesta sintética perdida')
  if (modo === 'field') return { ok: false, errores: { serieCodigo: ['Serie sintética rechazada'] } }
  if (modo === 'general') return { ok: false, errores: {}, mensaje: 'Rechazo sintético de línea' }
  return { ok: true, mensaje: 'Alta sintética aceptada ' + qa.calls.length }
}
export async function opcionesHerrajeDe() { return [] }
export async function opcionesAcristalamientoLinea() { return [] }
export async function buscarVidrios() { return [] }
export async function cambiarPreferenciaMedidas() { throw new Error('Persistencia fuera del contrato') }
