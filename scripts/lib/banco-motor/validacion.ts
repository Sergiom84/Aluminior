import { variablesDe } from '@aluminior/core/despiece'
import type { EntradaDiagnosticoMotor } from './tipos.ts'

const PATRON_NUMERO = /^[+-]?\d+(?:\.\d+)?$/

const textoNoVacio = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0

const registro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor)

function numeroNormalizado(valor: unknown): number | null {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null
  if (typeof valor !== 'string' || !PATRON_NUMERO.test(valor.trim())) return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

function jsonValido(valor: unknown): boolean {
  if (valor === null || typeof valor === 'string' || typeof valor === 'boolean') return true
  if (typeof valor === 'number') return Number.isFinite(valor)
  if (Array.isArray(valor)) return valor.every(jsonValido)
  if (registro(valor)) return Object.values(valor).every(jsonValido)
  return false
}

function validarAjustes(entrada: EntradaDiagnosticoMotor, errores: string[]): void {
  const ajustes = entrada.configuracion.ajustes
  if (!registro(ajustes)) {
    errores.push('configuracion.ajustes ausente')
    return
  }
  for (const campo of ['horasFabricacion', 'horasInstalacion', 'precioManual'] as const) {
    if (!(campo in ajustes)) {
      errores.push(`configuracion.ajustes.${campo} ausente`)
      continue
    }
    const valor = ajustes[campo]
    if (valor !== null && (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0)) {
      errores.push(`configuracion.ajustes.${campo} debe ser null o finito no negativo`)
    }
    if (campo === 'precioManual' && typeof valor === 'number') {
      errores.push('configuracion.ajustes.precioManual no está soportado aunque sea cero')
    } else if (typeof valor === 'number' && valor > 0) {
      errores.push(`configuracion.ajustes.${campo} no está soportado`)
    }
  }
}

function validarDeclaraciones(entrada: EntradaDiagnosticoMotor, errores: string[]): void {
  const declaraciones = entrada.declaraciones
  if (!registro(declaraciones)) {
    errores.push('declaraciones ausentes')
    return
  }
  const campos = [
    'disenoEspecificoNoReconstruido',
    'herrajeDesconocido',
    'vidrioOSuperficieRequerido',
    'ajustesManualesPresentes',
  ] as const
  for (const campo of campos) {
    const valor = declaraciones[campo]
    if (typeof valor !== 'boolean') errores.push(`declaraciones.${campo} debe declararse`)
    else if (valor) errores.push(`declaraciones.${campo} bloquea esta versión`)
  }
}

function validarPlantilla(entrada: EntradaDiagnosticoMotor, errores: string[]): void {
  const { plantilla } = entrada.contextoMaterial
  if (!Array.isArray(plantilla) || plantilla.length === 0) {
    errores.push('contextoMaterial.plantilla debe contener componentes')
    return
  }
  for (const [indice, componente] of plantilla.entries()) {
    const prefijo = `contextoMaterial.plantilla[${indice}]`
    if (!registro(componente)) {
      errores.push(`${prefijo} inválido`)
      continue
    }
    if (!textoNoVacio(componente.articuloCodigo)) errores.push(`${prefijo}.articuloCodigo inválido`)
    for (const campo of ['formulaLargo', 'tipoCorte', 'funcion'] as const) {
      if (!(campo in componente)
        || (componente[campo] !== null && typeof componente[campo] !== 'string')) {
        errores.push(`${prefijo}.${campo} debe declararse como string o null`)
      }
    }
    if (typeof componente.formulaLargo === 'string') {
      if (!componente.formulaLargo.trim()) errores.push(`${prefijo}.formulaLargo no puede ser vacía`)
      else {
        try { variablesDe(componente.formulaLargo) }
        catch { errores.push(`${prefijo}.formulaLargo contiene sintaxis no reconocida`) }
      }
    }
    const cantidad = numeroNormalizado(componente.cantidad)
    if (cantidad === null || cantidad <= 0) errores.push(`${prefijo}.cantidad debe ser explícita, finita y positiva`)
    for (const campo of ['anguloIzquierdo', 'anguloDerecho'] as const) {
      const valor = componente[campo]
      if (valor !== null && numeroNormalizado(valor) === null) errores.push(`${prefijo}.${campo} inválido`)
    }
    for (const campo of ['medidaMinima', 'medidaMaxima'] as const) {
      const valor = componente[campo]
      const numero = valor === null ? 0 : numeroNormalizado(valor)
      if (numero === null || numero < 0) errores.push(`${prefijo}.${campo} inválida`)
      else if (numero > 0) errores.push(`${prefijo}.${campo} activa un rango no soportado`)
    }
  }
}

function validarArticulos(entrada: EntradaDiagnosticoMotor, errores: string[]): void {
  const { articulos, plantilla } = entrada.contextoMaterial
  if (!Array.isArray(articulos)) {
    errores.push('contextoMaterial.articulos debe ser una tabla explícita')
    return
  }
  const codigos = new Set<string>()
  for (const [indice, articulo] of articulos.entries()) {
    const prefijo = `contextoMaterial.articulos[${indice}]`
    if (!registro(articulo)) {
      errores.push(`${prefijo} inválido`)
      continue
    }
    if (!textoNoVacio(articulo.codigo)) errores.push(`${prefijo}.codigo inválido`)
    else {
      if (codigos.has(articulo.codigo)) errores.push(`${prefijo}.codigo ambiguo: ${articulo.codigo}`)
      codigos.add(articulo.codigo)
    }
    if (articulo.tipoMetraje !== 'ML' && articulo.tipoMetraje !== 'UD') {
      errores.push(`${prefijo}.tipoMetraje no soportado`)
    }
    for (const campo of ['metrajeMinimo', 'metrajeMultiploLargo'] as const) {
      const valor = articulo[campo]
      if (valor !== null && (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0)) {
        errores.push(`${prefijo}.${campo} debe ser null o finito no negativo`)
      }
    }
  }
  if (!Array.isArray(plantilla)) return
  for (const componente of plantilla) {
    if (registro(componente) && textoNoVacio(componente.articuloCodigo)
      && !codigos.has(componente.articuloCodigo)) {
      errores.push(`falta metadato material para ${componente.articuloCodigo}`)
    }
  }
}

function validarRebajes(entrada: EntradaDiagnosticoMotor, errores: string[]): void {
  if (!Array.isArray(entrada.contextoMaterial.rebajes)) {
    errores.push('contextoMaterial.rebajes debe ser una tabla explícita')
    return
  }
  const claves = new Set<string>()
  for (const [indice, regla] of entrada.contextoMaterial.rebajes.entries()) {
    const prefijo = `contextoMaterial.rebajes[${indice}]`
    if (!registro(regla)) {
      errores.push(`${prefijo} inválido`)
      continue
    }
    if (![regla.articuloCodigo, regla.funcion, regla.formula, regla.serie].every(textoNoVacio)) {
      errores.push(`${prefijo} contiene una clave vacía`)
    }
    const clave = [regla.articuloCodigo, regla.funcion, regla.formula, regla.serie].join('|')
    if (claves.has(clave)) errores.push(`${prefijo} duplica la clave ${clave}`)
    claves.add(clave)
    if (typeof regla.mm !== 'number' || !Number.isFinite(regla.mm) || regla.mm < 0) errores.push(`${prefijo}.mm inválido`)
    const muestras = regla.muestras
    const totalMuestras = regla.totalMuestras
    if (typeof muestras !== 'number' || typeof totalMuestras !== 'number'
      || !Number.isInteger(muestras) || !Number.isInteger(totalMuestras)
      || muestras < 0 || totalMuestras <= 0 || muestras > totalMuestras) {
      errores.push(`${prefijo} tiene muestras inválidas`)
    }
  }
}

export function validarEntrada(entrada: EntradaDiagnosticoMotor): string[] {
  const errores: string[] = []
  if (!registro(entrada)) return ['entrada ausente o inválida']
  if (!registro(entrada.configuracion) || !registro(entrada.contextoMaterial)) {
    return ['configuracion o contextoMaterial ausente']
  }
  const { configuracion, contextoMaterial } = entrada
  if (!textoNoVacio(configuracion.codigo)) errores.push('configuracion.codigo inválido')
  if (!Array.isArray(configuracion.series) || configuracion.series.length !== 4) errores.push('configuracion.series debe conservar cuatro posiciones')
  else if (configuracion.series.some((serie) => serie !== null && !textoNoVacio(serie))) errores.push('configuracion.series contiene una posición inválida')
  if (!Array.isArray(configuracion.acabados) || configuracion.acabados.length !== 2) errores.push('configuracion.acabados debe conservar dos posiciones')
  else if (configuracion.acabados.some((acabado) => acabado !== null && !textoNoVacio(acabado))) errores.push('configuracion.acabados contiene una posición inválida')
  if (!registro(configuracion.medidasMm)
    || !Number.isFinite(configuracion.medidasMm.ancho) || configuracion.medidasMm.ancho <= 0
    || !Number.isFinite(configuracion.medidasMm.alto) || configuracion.medidasMm.alto <= 0) {
    errores.push('configuracion.medidasMm debe ser finita y positiva')
  }
  if (!Number.isFinite(configuracion.cantidadComercial) || configuracion.cantidadComercial <= 0) errores.push('configuracion.cantidadComercial debe ser finita y positiva')
  if (!('opciones' in configuracion) || !jsonValido(configuracion.opciones)) errores.push('configuracion.opciones ausente o no finita')
  if (!('acristalamiento' in configuracion) || !jsonValido(configuracion.acristalamiento)) errores.push('configuracion.acristalamiento ausente o no finito')
  validarAjustes(entrada, errores)
  validarDeclaraciones(entrada, errores)

  if (contextoMaterial.alcance !== 'materiales-parciales') errores.push('contextoMaterial.alcance inválido')
  if (!textoNoVacio(contextoMaterial.serieResuelta)) errores.push('contextoMaterial.serieResuelta inválida')
  if (!Array.isArray(contextoMaterial.procedencias) || contextoMaterial.procedencias.length === 0
    || contextoMaterial.procedencias.some((p) => !textoNoVacio(p))) errores.push('contextoMaterial.procedencias debe contener referencias no vacías')
  if (!registro(contextoMaterial.cotas)) errores.push('contextoMaterial.cotas debe declararse explícitamente')
  else {
    const simbolos = new Set<string>()
    for (const [simbolo, valor] of Object.entries(contextoMaterial.cotas)) {
      const normalizado = simbolo.toUpperCase()
      if (normalizado === 'A' || normalizado === 'L') errores.push(`la cota ${simbolo} no puede redefinirse`)
      if (simbolos.has(normalizado)) errores.push(`la cota ${simbolo} duplica una clave al normalizar`)
      simbolos.add(normalizado)
      if (!textoNoVacio(simbolo) || typeof valor !== 'number' || !Number.isFinite(valor)) errores.push(`cota ${simbolo || '(vacía)'} inválida`)
    }
  }
  validarPlantilla(entrada, errores)
  validarArticulos(entrada, errores)
  validarRebajes(entrada, errores)
  return errores
}
