import type { ContextoPrecioPreparado } from './tipos.ts'

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/
const PATRON_PRECIO = /^\+?\d+(?:\.\d+)?$/

const registro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor)

const textoNoVacio = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0

function fechaValida(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !PATRON_FECHA.test(valor)) return false
  const fecha = new Date(`${valor}T00:00:00Z`)
  return !Number.isNaN(fecha.valueOf()) && fecha.toISOString().slice(0, 10) === valor
}

function precioValido(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !PATRON_PRECIO.test(valor)) return false
  const numero = Number(valor)
  return Number.isFinite(numero) && numero >= 0
}

export function validarContextoPrecio(contexto: ContextoPrecioPreparado): string[] {
  if (!registro(contexto)) return ['contextoPrecio inválido']
  const errores: string[] = []
  if (!textoNoVacio(contexto.tarifaId)) errores.push('contextoPrecio.tarifaId inválida')
  if (!textoNoVacio(contexto.acabadoAplicado)) errores.push('contextoPrecio.acabadoAplicado inválido')
  if (contexto.modo !== 'despiece') errores.push('contextoPrecio.modo no soportado')

  if (!registro(contexto.vigencia)) errores.push('contextoPrecio.vigencia ausente')
  else {
    const { desde, hasta } = contexto.vigencia
    if (!fechaValida(contexto.fechaReferencia) || !fechaValida(desde)
      || (hasta !== null && !fechaValida(hasta))) errores.push('contextoPrecio contiene fechas inválidas')
    else if (contexto.fechaReferencia < desde
      || (hasta !== null && contexto.fechaReferencia > hasta)) {
      errores.push('la tarifa no es vigente en fechaReferencia')
    }
  }

  if (!Array.isArray(contexto.filasPvp)) {
    errores.push('contextoPrecio.filasPvp debe ser una tabla explícita')
    return errores
  }
  for (const [indice, fila] of contexto.filasPvp.entries()) {
    const prefijo = `contextoPrecio.filasPvp[${indice}]`
    if (!registro(fila)) {
      errores.push(`${prefijo} inválida`)
      continue
    }
    if (!textoNoVacio(fila.articuloCodigo)) errores.push(`${prefijo}.articuloCodigo inválido`)
    if (fila.tarifaId !== contexto.tarifaId) errores.push(`${prefijo} pertenece a otra tarifa`)
    if (typeof fila.acabadoCodigo !== 'string') errores.push(`${prefijo}.acabadoCodigo inválido`)
    if (!precioValido(fila.precio)) errores.push(`${prefijo}.precio inválido`)
  }
  return errores
}
